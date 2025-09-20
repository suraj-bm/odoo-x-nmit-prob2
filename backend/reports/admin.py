from django.contrib import admin
from .models import StockLedger, LedgerEntries


@admin.register(StockLedger)
class StockLedgerAdmin(admin.ModelAdmin):
    list_display = ['product', 'transaction_type', 'quantity', 'unit_price', 'total_value', 'balance_quantity', 'transaction_date', 'created_at']
    list_filter = ['transaction_type', 'transaction_date', 'product__category', 'created_at']
    search_fields = ['product__name', 'product__sku', 'reference_number', 'notes']
    ordering = ['-transaction_date', '-created_at']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Product Information', {
            'fields': ('product', 'transaction_type', 'quantity', 'unit_price', 'total_value')
        }),
        ('Balance Information', {
            'fields': ('balance_quantity', 'balance_value')
        }),
        ('Transaction References', {
            'fields': ('purchase_order', 'sales_order', 'reference_number')
        }),
        ('Additional Information', {
            'fields': ('transaction_date', 'notes', 'created_at')
        }),
    )


@admin.register(LedgerEntries)
class LedgerEntriesAdmin(admin.ModelAdmin):
    list_display = ['account', 'entry_type', 'amount', 'description', 'transaction_date', 'created_at']
    list_filter = ['entry_type', 'account__account_type', 'transaction_date', 'created_at']
    search_fields = ['account__name', 'account__code', 'description', 'reference_number']
    ordering = ['-transaction_date', '-created_at']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Account Information', {
            'fields': ('account', 'entry_type', 'amount', 'description')
        }),
        ('Transaction References', {
            'fields': ('purchase_order', 'sales_order', 'payment', 'reference_number')
        }),
        ('Additional Information', {
            'fields': ('transaction_date', 'created_at')
        }),
    )