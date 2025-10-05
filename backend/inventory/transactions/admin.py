from django.contrib import admin
from .models import (
    PurchaseOrder, PurchaseOrderItem,
    SalesOrder, SalesOrderItem,
    Transaction
)

# ----------------------------
# PurchaseOrder Admin
# ----------------------------
class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 1

@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'vendor', 'order_date', 'expected_date', 'status', 'total_amount', 'paid', 'payment_method')
    inlines = [PurchaseOrderItemInline]
    list_filter = ('status', 'order_date', 'expected_date', 'paid', 'payment_method')
    search_fields = ('vendor__name',)


# ----------------------------
# SalesOrder Admin
# ----------------------------
class SalesOrderItemInline(admin.TabularInline):
    model = SalesOrderItem
    extra = 1

@admin.register(SalesOrder)
class SalesOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'order_date', 'status')
    inlines = [SalesOrderItemInline]
    list_filter = ('status', 'order_date')
    search_fields = ('customer__name',)


# ----------------------------
# Transaction Admin
# ----------------------------
@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'transaction_type', 'related_object_display', 'date', 'amount')
    list_filter = ('transaction_type', 'date')
    search_fields = ('transaction_type',)

    def related_object_display(self, obj):
        return str(obj.related_object)  # Shows the linked PurchaseOrder or SalesOrder

    related_object_display.short_description = 'Related Object'
