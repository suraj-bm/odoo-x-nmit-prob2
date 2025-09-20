# master/forms.py
from django import forms
from .models import Product, ProductCategory, Tax, ChartOfAccounts
class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = [
            'name', 'sku', 'description', 'category', 'hsn_code', 'unit_of_measure',
            'sales_price', 'purchase_price', 'sales_tax', 'purchase_tax',
            'current_stock', 'minimum_stock', 'is_active'
        ]
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3}),
            'unit_of_measure': forms.TextInput(attrs={'placeholder': 'pcs, kg, liters'}),
            'sales_price': forms.NumberInput(attrs={'step': '0.01'}),
            'purchase_price': forms.NumberInput(attrs={'step': '0.01'}),
            'current_stock': forms.NumberInput(attrs={'step': '0.01'}),
            'minimum_stock': forms.NumberInput(attrs={'step': '0.01'}),
        }
