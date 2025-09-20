from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Sum, Q, F
from django.utils import timezone
from datetime import datetime, timedelta
from .models import StockLedger, LedgerEntries
from .serializers import (
    StockLedgerSerializer, LedgerEntriesSerializer,
    BalanceSheetSerializer, ProfitLossSerializer, StockReportSerializer
)
from master.models import Product, ChartOfAccounts


class StockLedgerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockLedger.objects.all()
    serializer_class = StockLedgerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['product', 'transaction_type', 'transaction_date']
    search_fields = ['product__name', 'product__sku', 'reference_number', 'notes']
    ordering_fields = ['transaction_date', 'product__name', 'quantity', 'total_value']
    ordering = ['-transaction_date', '-created_at']


class LedgerEntriesViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LedgerEntries.objects.all()
    serializer_class = LedgerEntriesSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['account', 'entry_type', 'transaction_date']
    search_fields = ['account__name', 'account__code', 'description', 'reference_number']
    ordering_fields = ['transaction_date', 'account__name', 'amount']
    ordering = ['-transaction_date', '-created_at']


class ReportsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def balance_sheet(self, request):
        """Generate Balance Sheet report"""
        # Get all accounts with their balances
        accounts = ChartOfAccounts.objects.filter(is_active=True)
        balance_data = []
        
        for account in accounts:
            # Calculate debit and credit totals
            debit_total = LedgerEntries.objects.filter(
                account=account,
                entry_type='debit'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            credit_total = LedgerEntries.objects.filter(
                account=account,
                entry_type='credit'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            # Calculate net balance
            if account.account_type in ['asset', 'expense']:
                net_balance = debit_total - credit_total
            else:  # liability, equity, income
                net_balance = credit_total - debit_total
            
            balance_data.append({
                'account_name': account.name,
                'account_code': account.code,
                'account_type': account.account_type,
                'parent_category': account.parent_category,
                'debit_balance': debit_total,
                'credit_balance': credit_total,
                'net_balance': net_balance
            })
        
        serializer = BalanceSheetSerializer(balance_data, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def profit_loss(self, request):
        """Generate Profit & Loss report"""
        # Get income and expense accounts
        income_accounts = ChartOfAccounts.objects.filter(
            account_type='income',
            is_active=True
        )
        expense_accounts = ChartOfAccounts.objects.filter(
            account_type='expense',
            is_active=True
        )
        
        profit_loss_data = []
        
        # Process income accounts
        for account in income_accounts:
            total_amount = LedgerEntries.objects.filter(
                account=account,
                entry_type='credit'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            profit_loss_data.append({
                'account_name': account.name,
                'account_code': account.code,
                'account_type': account.account_type,
                'parent_category': account.parent_category,
                'amount': total_amount
            })
        
        # Process expense accounts
        for account in expense_accounts:
            total_amount = LedgerEntries.objects.filter(
                account=account,
                entry_type='debit'
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            profit_loss_data.append({
                'account_name': account.name,
                'account_code': account.code,
                'account_type': account.account_type,
                'parent_category': account.parent_category,
                'amount': total_amount
            })
        
        serializer = ProfitLossSerializer(profit_loss_data, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stock_report(self, request):
        """Generate Stock report"""
        products = Product.objects.filter(is_active=True)
        stock_data = []
        
        for product in products:
            # Calculate total value
            total_value = product.current_stock * product.purchase_price
            
            # Check if low stock
            is_low_stock = product.current_stock <= product.minimum_stock
            
            stock_data.append({
                'product_name': product.name,
                'product_sku': product.sku,
                'current_stock': product.current_stock,
                'unit_price': product.purchase_price,
                'total_value': total_value,
                'minimum_stock': product.minimum_stock,
                'is_low_stock': is_low_stock
            })
        
        serializer = StockReportSerializer(stock_data, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def low_stock_products(self, request):
        """Get products with low stock"""
        products = Product.objects.filter(
            is_active=True,
            current_stock__lte=F('minimum_stock')
        )
        stock_data = []
        
        for product in products:
            total_value = product.current_stock * product.purchase_price
            is_low_stock = product.current_stock <= product.minimum_stock
            
            stock_data.append({
                'product_name': product.name,
                'product_sku': product.sku,
                'current_stock': product.current_stock,
                'unit_price': product.purchase_price,
                'total_value': total_value,
                'minimum_stock': product.minimum_stock,
                'is_low_stock': is_low_stock
            })
        
        serializer = StockReportSerializer(stock_data, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def out_of_stock_products(self, request):
        """Get out of stock products"""
        products = Product.objects.filter(
            is_active=True,
            current_stock=0
        )
        stock_data = []
        
        for product in products:
            total_value = 0  # No value for out of stock
            is_low_stock = True  # Out of stock is definitely low stock
            
            stock_data.append({
                'product_name': product.name,
                'product_sku': product.sku,
                'current_stock': product.current_stock,
                'unit_price': product.purchase_price,
                'total_value': total_value,
                'minimum_stock': product.minimum_stock,
                'is_low_stock': is_low_stock
            })
        
        serializer = StockReportSerializer(stock_data, many=True)
        return Response(serializer.data)