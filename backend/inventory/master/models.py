from django.db import models

# Create your models here.
# master/models.py
from django.db import models

class Contact(models.Model):
    CUSTOMER = 'customer'
    VENDOR = 'vendor'
    BOTH = 'both'
    TYPE_CHOICES = [
        (CUSTOMER, 'Customer'),
        (VENDOR, 'Vendor'),
        (BOTH, 'Both'),
    ]

    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    email = models.EmailField(blank=True, null=True)
    mobile = models.CharField(max_length=15, blank=True, null=True)
    city = models.CharField(max_length=50, blank=True, null=True)
    state = models.CharField(max_length=50, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    profile_image = models.ImageField(upload_to='contacts/', blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.type})"



class Product(models.Model):
    GOODS = 'goods'
    SERVICE = 'service'
    TYPE_CHOICES = [
        (GOODS, 'Goods'),
        (SERVICE, 'Service')
    ]

    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    sales_price = models.DecimalField(max_digits=10, decimal_places=2)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_tax_percent = models.DecimalField(max_digits=5, decimal_places=2)
    purchase_tax_percent = models.DecimalField(max_digits=5, decimal_places=2)
    hsn_code = models.CharField(max_length=20, blank=True, null=True)
    category = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.name



class Tax(models.Model):
    PERCENTAGE = 'percentage'
    FIXED = 'fixed'
    METHOD_CHOICES = [
        (PERCENTAGE, 'Percentage'),
        (FIXED, 'Fixed Value'),
    ]

    SALES = 'sales'
    PURCHASE = 'purchase'
    APPLICABLE_CHOICES = [
        (SALES, 'Sales'),
        (PURCHASE, 'Purchase')
    ]

    name = models.CharField(max_length=50)
    computation_method = models.CharField(max_length=10, choices=METHOD_CHOICES)
    value = models.DecimalField(max_digits=5, decimal_places=2)  # % or fixed
    applicable_on = models.CharField(max_length=10, choices=APPLICABLE_CHOICES)

    def __str__(self):
        return f"{self.name} ({self.value}%)"



class ChartOfAccounts(models.Model):
    ASSET = 'asset'
    LIABILITY = 'liability'
    INCOME = 'income'
    EXPENSE = 'expense'
    EQUITY = 'equity'

    TYPE_CHOICES = [
        (ASSET, 'Asset'),
        (LIABILITY, 'Liability'),
        (INCOME, 'Income'),
        (EXPENSE, 'Expense'),
        (EQUITY, 'Equity'),
    ]

    name = models.CharField(max_length=100)
    account_type = models.CharField(max_length=20, choices=TYPE_CHOICES)

    def __str__(self):
        return f"{self.name} ({self.account_type})"
