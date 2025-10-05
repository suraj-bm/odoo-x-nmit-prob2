from django.contrib import admin
from .models import Contact, Product, Tax, ChartOfAccounts

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'email', 'mobile', 'city', 'state')
    search_fields = ('name', 'email', 'mobile')
    list_filter = ('type', 'city', 'state')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'sales_price', 'purchase_price', 'sale_tax_percent', 'purchase_tax_percent', 'hsn_code', 'category')
    search_fields = ('name', 'hsn_code', 'category')
    list_filter = ('type', 'category')


@admin.register(Tax)
class TaxAdmin(admin.ModelAdmin):
    list_display = ('name', 'computation_method', 'value', 'applicable_on')
    search_fields = ('name',)
    list_filter = ('computation_method', 'applicable_on')


@admin.register(ChartOfAccounts)
class ChartOfAccountsAdmin(admin.ModelAdmin):
    list_display = ('name', 'account_type')
    search_fields = ('name',)
    list_filter = ('account_type',)
