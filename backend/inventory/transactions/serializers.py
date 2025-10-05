from rest_framework import serializers
from .models import PurchaseOrder, PurchaseOrderItem, SalesOrder, SalesOrderItem, Transaction

# ----------------------------
# Purchase Serializers
# ----------------------------
class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    total = serializers.ReadOnlyField()

    class Meta:
        model = PurchaseOrderItem
        exclude = ['purchase_order']

class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True)
    total_amount = serializers.ReadOnlyField()  # frontend doesn’t need to send it

    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'vendor', 'order_date', 'expected_date', 'status',
            'items', 'total_amount', 'paid', 'paid_amount', 'payment_method'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        purchase_order = PurchaseOrder.objects.create(**validated_data)

        total = 0
        for item_data in items_data:
            item = PurchaseOrderItem.objects.create(purchase_order=purchase_order, **item_data)
            total += item.total

        purchase_order.total_amount = round(total, 2)
        purchase_order.save()
        return purchase_order

# ----------------------------
# Sales Serializers
# ----------------------------
class SalesOrderItemSerializer(serializers.ModelSerializer):
    total = serializers.ReadOnlyField()

    class Meta:
        model = SalesOrderItem
        exclude = ['sales_order']

class SalesOrderSerializer(serializers.ModelSerializer):
    items = SalesOrderItemSerializer(many=True)
    total_amount = serializers.SerializerMethodField()  # ✅ Add this

    class Meta:
        model = SalesOrder
        fields = ['id', 'customer', 'order_date', 'status', 'items', 'total_amount']  # ✅ Include field

    def get_total_amount(self, obj):
        return sum([
            item.quantity * float(item.unit_price) * (1 + float(item.tax_percent) / 100)
            for item in obj.items.all()
        ])

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        sales_order = SalesOrder.objects.create(**validated_data)

        total_amount = 0
        for item_data in items_data:
            item = SalesOrderItem.objects.create(sales_order=sales_order, **item_data)
            total_amount += item.quantity * float(item.unit_price) * (1 + float(item.tax_percent)/100)

        # ✅ Auto-create Transaction entry
        Transaction.objects.create(
            transaction_type='sales_order',
            related_object=sales_order,
            amount=total_amount
        )

        return sales_order


# ----------------------------
# Transaction Serializer
# ----------------------------
class TransactionSerializer(serializers.ModelSerializer):
    related_name = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = '__all__'  # keeps all original fields
        # optionally: fields = ['id', 'transaction_type', 'date', 'amount', 'related_name', ...]

    def get_related_name(self, obj):
        if obj.related_object:
            # Customize as needed for PurchaseOrder / SalesOrder
            return str(obj.related_object)
        return None