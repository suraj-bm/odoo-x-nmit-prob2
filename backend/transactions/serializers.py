from rest_framework import serializers
from decimal import Decimal
from .models import PurchaseOrder, PurchaseOrderItem, VendorBill
from .sales_models import SalesOrder, SalesOrderItem, CustomerInvoice
from .payment_models import Payment
from master.serializers import ContactSerializer, ProductSerializer, TaxSerializer
from users.serializers import UserSerializer


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    tax_name = serializers.CharField(source='tax.name', read_only=True)
    
    class Meta:
        model = PurchaseOrderItem
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'line_total', 'tax_amount']
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value
    
    def validate_unit_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Unit price cannot be negative")
        return value


class PurchaseOrderSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = PurchaseOrder
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'subtotal', 'tax_amount', 'total_amount']
    
    def validate_po_date(self, value):
        from django.utils import timezone
        if value > timezone.now().date():
            raise serializers.ValidationError("PO date cannot be in the future")
        return value


class PurchaseOrderCreateSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True)
    
    class Meta:
        model = PurchaseOrder
        fields = ['vendor', 'po_date', 'expected_delivery_date', 'notes', 'items']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        purchase_order = PurchaseOrder.objects.create(**validated_data)
        
        for item_data in items_data:
            PurchaseOrderItem.objects.create(purchase_order=purchase_order, **item_data)
        
        purchase_order.calculate_totals()
        return purchase_order


class VendorBillSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    po_number = serializers.CharField(source='purchase_order.po_number', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = VendorBill
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'subtotal', 'tax_amount', 'total_amount', 'balance_amount']


class SalesOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    tax_name = serializers.CharField(source='tax.name', read_only=True)
    
    class Meta:
        model = SalesOrderItem
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'line_total', 'tax_amount']
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value
    
    def validate_unit_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Unit price cannot be negative")
        return value


class SalesOrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    items = SalesOrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = SalesOrder
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'subtotal', 'tax_amount', 'total_amount']
    
    def validate_so_date(self, value):
        from django.utils import timezone
        if value > timezone.now().date():
            raise serializers.ValidationError("SO date cannot be in the future")
        return value


class SalesOrderCreateSerializer(serializers.ModelSerializer):
    items = SalesOrderItemSerializer(many=True)
    
    class Meta:
        model = SalesOrder
        fields = ['customer', 'so_date', 'expected_delivery_date', 'notes', 'items']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        sales_order = SalesOrder.objects.create(**validated_data)
        
        for item_data in items_data:
            SalesOrderItem.objects.create(sales_order=sales_order, **item_data)
        
        sales_order.calculate_totals()
        return sales_order


class CustomerInvoiceSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    so_number = serializers.CharField(source='sales_order.so_number', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = CustomerInvoice
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'subtotal', 'tax_amount', 'total_amount', 'balance_amount']


class PaymentSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor_bill.vendor.name', read_only=True)
    customer_name = serializers.CharField(source='customer_invoice.customer.name', read_only=True)
    bill_number = serializers.CharField(source='vendor_bill.bill_number', read_only=True)
    invoice_number = serializers.CharField(source='customer_invoice.invoice_number', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, data):
        if not data.get('vendor_bill') and not data.get('customer_invoice'):
            raise serializers.ValidationError("Either vendor_bill or customer_invoice must be specified")
        if data.get('vendor_bill') and data.get('customer_invoice'):
            raise serializers.ValidationError("Cannot specify both vendor_bill and customer_invoice")
        return data
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be greater than 0")
        return value
