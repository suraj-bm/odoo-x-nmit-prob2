from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from .models import PurchaseOrder, PurchaseOrderItem, VendorBill
from .sales_models import SalesOrder, SalesOrderItem, CustomerInvoice
from .payment_models import Payment
from .serializers import (
    PurchaseOrderSerializer, PurchaseOrderCreateSerializer, PurchaseOrderItemSerializer,
    VendorBillSerializer, SalesOrderSerializer, SalesOrderCreateSerializer, SalesOrderItemSerializer,
    CustomerInvoiceSerializer, PaymentSerializer
)


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['vendor', 'status', 'po_date']
    search_fields = ['po_number', 'vendor__name', 'notes']
    ordering_fields = ['po_number', 'po_date', 'total_amount', 'created_at']
    ordering = ['-po_date', '-created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PurchaseOrderCreateSerializer
        return PurchaseOrderSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm a purchase order"""
        po = self.get_object()
        if po.status != 'draft':
            return Response(
                {'error': 'Only draft purchase orders can be confirmed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        po.status = 'confirmed'
        po.save()
        
        # The signal will handle stock ledger creation
        serializer = self.get_serializer(po)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a purchase order"""
        po = self.get_object()
        if po.status in ['cancelled', 'received']:
            return Response(
                {'error': 'Cannot cancel this purchase order'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        po.status = 'cancelled'
        po.save()
        
        serializer = self.get_serializer(po)
        return Response(serializer.data)


class PurchaseOrderItemViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrderItem.objects.all()
    serializer_class = PurchaseOrderItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['purchase_order', 'product']
    search_fields = ['product__name', 'product__sku']
    ordering_fields = ['product__name', 'quantity', 'unit_price', 'line_total']
    ordering = ['product__name']


class VendorBillViewSet(viewsets.ModelViewSet):
    queryset = VendorBill.objects.all()
    serializer_class = VendorBillSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['vendor', 'status', 'invoice_date', 'due_date']
    search_fields = ['bill_number', 'vendor__name', 'notes']
    ordering_fields = ['bill_number', 'invoice_date', 'due_date', 'total_amount', 'created_at']
    ordering = ['-invoice_date', '-created_at']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark a vendor bill as paid"""
        bill = self.get_object()
        if bill.status == 'paid':
            return Response(
                {'error': 'Bill is already paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        bill.status = 'paid'
        bill.paid_amount = bill.total_amount
        bill.balance_amount = 0
        bill.save()
        
        serializer = self.get_serializer(bill)
        return Response(serializer.data)


class SalesOrderViewSet(viewsets.ModelViewSet):
    queryset = SalesOrder.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['customer', 'status', 'so_date']
    search_fields = ['so_number', 'customer__name', 'notes']
    ordering_fields = ['so_number', 'so_date', 'total_amount', 'created_at']
    ordering = ['-so_date', '-created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SalesOrderCreateSerializer
        return SalesOrderSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm a sales order"""
        so = self.get_object()
        if so.status != 'draft':
            return Response(
                {'error': 'Only draft sales orders can be confirmed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        so.status = 'confirmed'
        so.save()
        
        # The signal will handle stock ledger creation
        serializer = self.get_serializer(so)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a sales order"""
        so = self.get_object()
        if so.status in ['cancelled', 'delivered']:
            return Response(
                {'error': 'Cannot cancel this sales order'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        so.status = 'cancelled'
        so.save()
        
        serializer = self.get_serializer(so)
        return Response(serializer.data)


class SalesOrderItemViewSet(viewsets.ModelViewSet):
    queryset = SalesOrderItem.objects.all()
    serializer_class = SalesOrderItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['sales_order', 'product']
    search_fields = ['product__name', 'product__sku']
    ordering_fields = ['product__name', 'quantity', 'unit_price', 'line_total']
    ordering = ['product__name']


class CustomerInvoiceViewSet(viewsets.ModelViewSet):
    queryset = CustomerInvoice.objects.all()
    serializer_class = CustomerInvoiceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['customer', 'status', 'invoice_date', 'due_date']
    search_fields = ['invoice_number', 'customer__name', 'notes']
    ordering_fields = ['invoice_number', 'invoice_date', 'due_date', 'total_amount', 'created_at']
    ordering = ['-invoice_date', '-created_at']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark a customer invoice as paid"""
        invoice = self.get_object()
        if invoice.status == 'paid':
            return Response(
                {'error': 'Invoice is already paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        invoice.status = 'paid'
        invoice.paid_amount = invoice.total_amount
        invoice.balance_amount = 0
        invoice.save()
        
        serializer = self.get_serializer(invoice)
        return Response(serializer.data)


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['payment_type', 'payment_method', 'payment_date']
    search_fields = ['payment_number', 'reference_number', 'notes']
    ordering_fields = ['payment_number', 'payment_date', 'amount', 'created_at']
    ordering = ['-payment_date', '-created_at']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)