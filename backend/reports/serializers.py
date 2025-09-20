from rest_framework import serializers
from .models import StockLedger, LedgerEntries


class StockLedgerSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    po_number = serializers.CharField(source='purchase_order.po_number', read_only=True)
    so_number = serializers.CharField(source='sales_order.so_number', read_only=True)
    
    class Meta:
        model = StockLedger
        fields = '__all__'
        read_only_fields = ['created_at']


class LedgerEntriesSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    account_code = serializers.CharField(source='account.code', read_only=True)
    po_number = serializers.CharField(source='purchase_order.po_number', read_only=True)
    so_number = serializers.CharField(source='sales_order.so_number', read_only=True)
    payment_number = serializers.CharField(source='payment.payment_number', read_only=True)
    
    class Meta:
        model = LedgerEntries
        fields = '__all__'
        read_only_fields = ['created_at']


class BalanceSheetSerializer(serializers.Serializer):
    """Serializer for Balance Sheet report"""
    account_name = serializers.CharField()
    account_code = serializers.CharField()
    account_type = serializers.CharField()
    parent_category = serializers.CharField()
    debit_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    credit_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_balance = serializers.DecimalField(max_digits=15, decimal_places=2)


class ProfitLossSerializer(serializers.Serializer):
    """Serializer for Profit & Loss report"""
    account_name = serializers.CharField()
    account_code = serializers.CharField()
    account_type = serializers.CharField()
    parent_category = serializers.CharField()
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)


class StockReportSerializer(serializers.Serializer):
    """Serializer for Stock report"""
    product_name = serializers.CharField()
    product_sku = serializers.CharField()
    current_stock = serializers.DecimalField(max_digits=15, decimal_places=2)
    unit_price = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    minimum_stock = serializers.DecimalField(max_digits=15, decimal_places=2)
    is_low_stock = serializers.BooleanField()

class RealTimePOSerializer(serializers.Serializer):
    po_number = serializers.CharField()
    supplier = serializers.CharField()
    order_date = serializers.DateField()
    expected_date = serializers.DateField(allow_null=True)
    status = serializers.CharField()
    total_quantity = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_value = serializers.DecimalField(max_digits=15, decimal_places=2)