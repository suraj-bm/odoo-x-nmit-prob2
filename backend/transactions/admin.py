from django.contrib import admin
from .models import PurchaseOrder, PurchaseOrderItem, VendorBill
from .sales_models import SalesOrder, SalesOrderItem, CustomerInvoice
from .payment_models import Payment


class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 0
    readonly_fields = ['line_total', 'tax_amount']


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ['po_number', 'vendor', 'po_date', 'status', 'total_amount', 'created_by', 'created_at']
    list_filter = ['status', 'po_date', 'vendor', 'created_at']
    search_fields = ['po_number', 'vendor__name', 'notes']
    ordering = ['-po_date', '-created_at']
    readonly_fields = ['created_at', 'updated_at', 'subtotal', 'tax_amount', 'total_amount']
    inlines = [PurchaseOrderItemInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('po_number', 'vendor', 'po_date', 'expected_delivery_date', 'status')
        }),
        ('Amounts', {
            'fields': ('subtotal', 'tax_amount', 'total_amount')
        }),
        ('Additional Information', {
            'fields': ('notes', 'created_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PurchaseOrderItem)
class PurchaseOrderItemAdmin(admin.ModelAdmin):
    list_display = ['purchase_order', 'product', 'quantity', 'unit_price', 'line_total', 'tax_amount']
    list_filter = ['purchase_order__vendor', 'product__category', 'created_at']
    search_fields = ['purchase_order__po_number', 'product__name', 'product__sku']
    ordering = ['purchase_order', 'product']
    readonly_fields = ['created_at', 'updated_at', 'line_total', 'tax_amount']


class SalesOrderItemInline(admin.TabularInline):
    model = SalesOrderItem
    extra = 0
    readonly_fields = ['line_total', 'tax_amount']


@admin.register(SalesOrder)
class SalesOrderAdmin(admin.ModelAdmin):
    list_display = ['so_number', 'customer', 'so_date', 'status', 'total_amount', 'created_by', 'created_at']
    list_filter = ['status', 'so_date', 'customer', 'created_at']
    search_fields = ['so_number', 'customer__name', 'notes']
    ordering = ['-so_date', '-created_at']
    readonly_fields = ['created_at', 'updated_at', 'subtotal', 'tax_amount', 'total_amount']
    inlines = [SalesOrderItemInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('so_number', 'customer', 'so_date', 'expected_delivery_date', 'status')
        }),
        ('Amounts', {
            'fields': ('subtotal', 'tax_amount', 'total_amount')
        }),
        ('Additional Information', {
            'fields': ('notes', 'created_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SalesOrderItem)
class SalesOrderItemAdmin(admin.ModelAdmin):
    list_display = ['sales_order', 'product', 'quantity', 'unit_price', 'line_total', 'tax_amount']
    list_filter = ['sales_order__customer', 'product__category', 'created_at']
    search_fields = ['sales_order__so_number', 'product__name', 'product__sku']
    ordering = ['sales_order', 'product']
    readonly_fields = ['created_at', 'updated_at', 'line_total', 'tax_amount']


@admin.register(VendorBill)
class VendorBillAdmin(admin.ModelAdmin):
    list_display = ['bill_number', 'vendor', 'invoice_date', 'due_date', 'status', 'total_amount', 'balance_amount', 'created_by', 'created_at']
    list_filter = ['status', 'invoice_date', 'due_date', 'vendor', 'created_at']
    search_fields = ['bill_number', 'vendor__name', 'notes']
    ordering = ['-invoice_date', '-created_at']
    readonly_fields = ['created_at', 'updated_at', 'subtotal', 'tax_amount', 'total_amount', 'balance_amount']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('bill_number', 'purchase_order', 'vendor', 'invoice_date', 'due_date', 'status')
        }),
        ('Amounts', {
            'fields': ('subtotal', 'tax_amount', 'total_amount', 'paid_amount', 'balance_amount')
        }),
        ('Additional Information', {
            'fields': ('notes', 'created_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CustomerInvoice)
class CustomerInvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'customer', 'invoice_date', 'due_date', 'status', 'total_amount', 'balance_amount', 'created_by', 'created_at']
    list_filter = ['status', 'invoice_date', 'due_date', 'customer', 'created_at']
    search_fields = ['invoice_number', 'customer__name', 'notes']
    ordering = ['-invoice_date', '-created_at']
    readonly_fields = ['created_at', 'updated_at', 'subtotal', 'tax_amount', 'total_amount', 'balance_amount']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('invoice_number', 'sales_order', 'customer', 'invoice_date', 'due_date', 'status')
        }),
        ('Amounts', {
            'fields': ('subtotal', 'tax_amount', 'total_amount', 'paid_amount', 'balance_amount')
        }),
        ('Additional Information', {
            'fields': ('notes', 'created_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['payment_number', 'payment_type', 'amount', 'payment_method', 'payment_date', 'created_by', 'created_at']
    list_filter = ['payment_type', 'payment_method', 'payment_date', 'created_at']
    search_fields = ['payment_number', 'reference_number', 'notes']
    ordering = ['-payment_date', '-created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('payment_number', 'payment_type', 'payment_method', 'payment_date')
        }),
        ('Transaction References', {
            'fields': ('vendor_bill', 'customer_invoice')
        }),
        ('Amount & Reference', {
            'fields': ('amount', 'reference_number')
        }),
        ('Additional Information', {
            'fields': ('notes', 'created_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )