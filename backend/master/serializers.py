from rest_framework import serializers
from .models import Contact, Product, ProductCategory, Tax, ChartOfAccounts

from .models import ProductCategory, Tax, ChartOfAccounts, Contact
from .models import Product
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
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



from .models import Product, ProductCategory

class ProductSerializer(serializers.ModelSerializer):
    new_category = serializers.CharField(write_only=True, required=False)  # For "Other"

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'sku', 'category', 'new_category',
            'sales_price', 'purchase_price', 'current_stock',
            'minimum_stock', 'unit_of_measure', 'is_active'
        ]

    def create(self, validated_data):
        new_category_name = validated_data.pop('new_category', None)

        # If user provided a new category, create it
        if new_category_name:
            category_obj, created = ProductCategory.objects.get_or_create(name=new_category_name)
            validated_data['category'] = category_obj

        return Product.objects.create(**validated_data)



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
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'sku', 'category_name', 'sales_price', 'purchase_price',
            'current_stock', 'minimum_stock', 'unit_of_measure', 'is_active'
        ]
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_product_api(request):
    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    else:
        print(serializer.errors)  # <-- Check which fields are missing
    return Response(serializer.errors, status=400)
from rest_framework import serializers
from .models import ChartOfAccounts

class ChartOfAccountsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChartOfAccounts
        fields = '__all__'
