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
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum
from django.utils import timezone
from users.models import User
from .models import PurchaseOrder, VendorBill
from datetime import datetime

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_kpi(request):
    """Return KPI values for the dashboard"""
    total_revenue = PurchaseOrder.objects.aggregate(total=Sum('total_amount'))['total'] or 0
    total_expenses = VendorBill.objects.aggregate(total=Sum('total_amount'))['total'] or 0
    net_profit = total_revenue - total_expenses

    current_month = datetime.now().month
    new_customers = User.objects.filter(date_joined__month=current_month).count()

    return Response({
        'totalRevenue': total_revenue,
        'totalExpenses': total_expenses,
        'netProfit': net_profit,
        'newCustomers': new_customers,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def revenue_expense_chart(request):
    """Return revenue vs expenses data grouped by month"""
    data = []
    for month in range(1, 13):
        revenue = PurchaseOrder.objects.filter(po_date__month=month).aggregate(total=Sum('total_amount'))['total'] or 0
        expenses = VendorBill.objects.filter(invoice_date__month=month).aggregate(total=Sum('total_amount'))['total'] or 0
        data.append({
            'name': datetime(2025, month, 1).strftime('%b'),  # Month abbreviation
            'revenue': revenue,
            'expenses': expenses
        })
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_transactions(request):
    """Return latest 5 transactions from purchase orders and vendor bills"""
    po_list = PurchaseOrder.objects.order_by('-po_date')[:5]
    bills_list = VendorBill.objects.order_by('-invoice_date')[:5]

    transactions = []

    for po in po_list:
        transactions.append({
            'id': po.po_number,
            'type': 'Purchase Order',
            'amount': po.total_amount,
            'status': po.status,
            'date': po.po_date
        })

    for bill in bills_list:
        transactions.append({
            'id': bill.bill_number,
            'type': 'Vendor Bill',
            'amount': bill.total_amount,
            'status': bill.status,
            'date': bill.invoice_date
        })

    # Sort by date descending and take top 5
    transactions = sorted(transactions, key=lambda x: x['date'], reverse=True)[:5]
    return Response(transactions)
