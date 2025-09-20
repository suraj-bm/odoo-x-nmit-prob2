from rest_framework import serializers
from .models import Contact, Product, ProductCategory, Tax, ChartOfAccounts


class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = '__all__'


class TaxSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tax
        fields = '__all__'


class ChartOfAccountsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChartOfAccounts
        fields = '__all__'


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    sales_tax_name = serializers.CharField(source='sales_tax.name', read_only=True)
    purchase_tax_name = serializers.CharField(source='purchase_tax.name', read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'current_stock']


class ProductListSerializer(serializers.ModelSerializer):
    """Simplified serializer for product lists"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'sku', 'category_name', 'sales_price', 'purchase_price', 'current_stock', 'is_active']


class ProductDetailSerializer(ProductSerializer):
    """Detailed serializer for product details with related data"""
    category = ProductCategorySerializer(read_only=True)
    sales_tax = TaxSerializer(read_only=True)
    purchase_tax = TaxSerializer(read_only=True)
