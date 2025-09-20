from django.contrib import admin
from .models import Contact, Product, ProductCategory, Tax, ChartOfAccounts


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_type', 'email', 'phone', 'city', 'is_active', 'created_at']
    list_filter = ['contact_type', 'is_active', 'city', 'state', 'created_at']
    search_fields = ['name', 'email', 'phone', 'city', 'state']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(Tax)
class TaxAdmin(admin.ModelAdmin):
    list_display = ['name', 'tax_type', 'rate', 'applicable_on', 'is_active', 'created_at']
    list_filter = ['tax_type', 'applicable_on', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(ChartOfAccounts)
class ChartOfAccountsAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'account_type', 'parent_category', 'is_active', 'created_at']
    list_filter = ['account_type', 'parent_category', 'is_active', 'created_at']
    search_fields = ['name', 'code', 'description']
    ordering = ['code', 'name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'sku', 'category', 'sales_price', 'purchase_price', 'current_stock', 'is_active', 'created_at']
    list_filter = ['category', 'is_active', 'sales_tax', 'purchase_tax', 'created_at']
    search_fields = ['name', 'sku', 'description', 'hsn_code']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at', 'current_stock']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'sku', 'description', 'category', 'hsn_code', 'unit_of_measure')
        }),
        ('Pricing', {
            'fields': ('sales_price', 'purchase_price')
        }),
        ('Tax Configuration', {
            'fields': ('sales_tax', 'purchase_tax')
        }),
        ('Inventory', {
            'fields': ('current_stock', 'minimum_stock')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )