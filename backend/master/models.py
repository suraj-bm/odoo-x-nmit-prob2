from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal


class Contact(models.Model):
    """
    Master data for customers, vendors, or both
    """
    CONTACT_TYPE_CHOICES = [
        ('customer', 'Customer'),
        ('vendor', 'Vendor'),
        ('both', 'Both'),
    ]
    
    name = models.CharField(max_length=255, unique=True)
    contact_type = models.CharField(
        max_length=10,
        choices=CONTACT_TYPE_CHOICES,
        default='customer'
    )
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    gst_number = models.CharField(max_length=15, blank=True, null=True, unique=True)
    pan_number = models.CharField(max_length=10, blank=True, null=True, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'master_contact'
        verbose_name = 'Contact'
        verbose_name_plural = 'Contacts'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_contact_type_display()})"


class ProductCategory(models.Model):
    """
    Product categories for better organization
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'master_product_category'
        verbose_name = 'Product Category'
        verbose_name_plural = 'Product Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Product(models.Model):
    """
    Master data for products with sales/purchase prices and tax references
    """
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(
        ProductCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products'
    )
    hsn_code = models.CharField(max_length=10, blank=True, null=True)
    unit_of_measure = models.CharField(max_length=20, default='pcs')
    
    # Pricing
    sales_price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Selling price per unit"
    )
    purchase_price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Purchase price per unit"
    )
    
    # Tax references
    sales_tax = models.ForeignKey(
        'Tax',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sales_products',
        help_text="Tax applicable on sales"
    )
    purchase_tax = models.ForeignKey(
        'Tax',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='purchase_products',
        help_text="Tax applicable on purchases"
    )
    
    # Inventory
    current_stock = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    minimum_stock = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'master_product'
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.sku})"


class Tax(models.Model):
    """
    Tax master data with percentage or fixed amount
    """
    TAX_TYPE_CHOICES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ]
    
    APPLICABLE_ON_CHOICES = [
        ('sales', 'Sales Only'),
        ('purchase', 'Purchase Only'),
        ('both', 'Both Sales & Purchase'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    tax_type = models.CharField(
        max_length=10,
        choices=TAX_TYPE_CHOICES,
        default='percentage'
    )
    rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text="Tax rate (percentage or fixed amount)"
    )
    applicable_on = models.CharField(
        max_length=10,
        choices=APPLICABLE_ON_CHOICES,
        default='both'
    )
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'master_tax'
        verbose_name = 'Tax'
        verbose_name_plural = 'Taxes'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.rate}%)"
    
    def calculate_tax(self, amount):
        """Calculate tax amount based on type and rate"""
        if self.tax_type == 'percentage':
            return (amount * self.rate) / 100
        else:
            return self.rate


class ChartOfAccounts(models.Model):
    """
    Chart of Accounts for accounting entries
    """
    ACCOUNT_TYPE_CHOICES = [
        ('asset', 'Asset'),
        ('liability', 'Liability'),
        ('equity', 'Equity'),
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]
    
    PARENT_CHOICES = [
        ('current_assets', 'Current Assets'),
        ('fixed_assets', 'Fixed Assets'),
        ('current_liabilities', 'Current Liabilities'),
        ('long_term_liabilities', 'Long Term Liabilities'),
        ('equity', 'Equity'),
        ('revenue', 'Revenue'),
        ('cost_of_goods_sold', 'Cost of Goods Sold'),
        ('operating_expenses', 'Operating Expenses'),
        ('other_income', 'Other Income'),
        ('other_expenses', 'Other Expenses'),
    ]
    
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=20, unique=True)
    account_type = models.CharField(
        max_length=20,
        choices=ACCOUNT_TYPE_CHOICES
    )
    parent_category = models.CharField(
        max_length=30,
        choices=PARENT_CHOICES
    )
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'master_chart_of_accounts'
        verbose_name = 'Chart of Account'
        verbose_name_plural = 'Chart of Accounts'
        ordering = ['code', 'name']
    
    def __str__(self):
        return f"{self.code} - {self.name}"