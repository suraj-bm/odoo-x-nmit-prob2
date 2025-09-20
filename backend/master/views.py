from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db import models
from django.utils import timezone
from .models import Contact, Product, ProductCategory, Tax, ChartOfAccounts
from .serializers import (
    ContactSerializer, ProductSerializer, ProductListSerializer, ProductDetailSerializer,
    ProductCategorySerializer, TaxSerializer, ChartOfAccountsSerializer
)


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['contact_type', 'is_active']
    search_fields = ['name', 'email', 'phone', 'city', 'state']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['name']
    
    @action(detail=False, methods=['get'])
    def customers(self, request):
        """Get only customers"""
        customers = self.queryset.filter(contact_type='customer')
        serializer = self.get_serializer(customers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def vendors(self, request):
        """Get only vendors"""
        vendors = self.queryset.filter(contact_type='vendor')
        serializer = self.get_serializer(vendors, many=True)
        return Response(serializer.data)


class ProductCategoryViewSet(viewsets.ModelViewSet):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class TaxViewSet(viewsets.ModelViewSet):
    queryset = Tax.objects.all()
    serializer_class = TaxSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['tax_type', 'applicable_on', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'rate', 'created_at']
    ordering = ['name']


class ChartOfAccountsViewSet(viewsets.ModelViewSet):
    queryset = ChartOfAccounts.objects.all()
    serializer_class = ChartOfAccountsSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['account_type', 'parent_category', 'is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['code', 'name', 'created_at']
    ordering = ['code', 'name']


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'is_active', 'sales_tax', 'purchase_tax']
    search_fields = ['name', 'sku', 'description', 'hsn_code']
    ordering_fields = ['name', 'sku', 'sales_price', 'purchase_price', 'current_stock', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        elif self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductSerializer
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get products with low stock"""
        low_stock_products = self.queryset.filter(
            current_stock__lte=models.F('minimum_stock')
        )
        serializer = self.get_serializer(low_stock_products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def out_of_stock(self, request):
        """Get out of stock products"""
        out_of_stock_products = self.queryset.filter(current_stock=0)
        serializer = self.get_serializer(out_of_stock_products, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def adjust_stock(self, request, pk=None):
        """Adjust product stock"""
        product = self.get_object()
        adjustment_type = request.data.get('adjustment_type')
        quantity = request.data.get('quantity')
        
        if adjustment_type not in ['increase', 'decrease']:
            return Response(
                {'error': 'adjustment_type must be "increase" or "decrease"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not quantity or quantity <= 0:
            return Response(
                {'error': 'quantity must be a positive number'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if adjustment_type == 'increase':
            product.current_stock += quantity
        else:
            if product.current_stock < quantity:
                return Response(
                    {'error': 'Insufficient stock for adjustment'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            product.current_stock -= quantity
        
        product.save()
        
        # Create stock ledger entry
        from reports.models import StockLedger
        StockLedger.objects.create(
            product=product,
            transaction_type='adjustment',
            quantity=quantity if adjustment_type == 'increase' else -quantity,
            unit_price=product.purchase_price,
            total_value=quantity * product.purchase_price,
            balance_quantity=product.current_stock,
            balance_value=product.current_stock * product.purchase_price,
            reference_number=f"ADJ-{product.id}",
            transaction_date=timezone.now().date(),
            notes=f"Stock adjustment - {adjustment_type}"
        )
        
        serializer = self.get_serializer(product)
        return Response(serializer.data)