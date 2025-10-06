from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils import timezone
from master.models import Contact, Product

# ----------------------------
# Purchase Models
# ----------------------------
PAYMENT_CHOICES = [
    ('cash', 'Cash'),
    ('credit_card', 'Credit Card'),
    ('bank_transfer', 'Bank Transfer'),
]

class PurchaseOrder(models.Model):
    vendor = models.ForeignKey(
        Contact, limit_choices_to={'type__in': ['vendor', 'both']}, on_delete=models.CASCADE
    )
    order_date = models.DateField(default=timezone.now)
    expected_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, default='draft')  # draft, confirmed, received
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid = models.BooleanField(default=False)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_CHOICES, default='cash')

    def calculate_total(self):
        total = sum([item.total for item in self.items.all()])
        self.total_amount = total
        return total

    def __str__(self):
        return f"PO-{self.id} ({self.vendor.name})"


class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(
        PurchaseOrder, related_name='items', on_delete=models.CASCADE
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    @property
    def total(self):
        return self.quantity * self.unit_price * (1 + self.tax_percent / 100)

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


# ----------------------------
# Sales Models
# ----------------------------
class SalesOrder(models.Model):
    customer = models.ForeignKey(
        Contact, limit_choices_to={'type__in': ['customer', 'both']}, on_delete=models.CASCADE
    )
    order_date = models.DateField(default=timezone.now)
    status = models.CharField(max_length=20, default='draft')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def calculate_total(self):
        total = sum([item.total for item in self.items.all()])
        self.total_amount = total
        return total

    def __str__(self):
        return f"SO-{self.id} ({self.customer.name})"




class SalesOrderItem(models.Model):
    sales_order = models.ForeignKey(
        SalesOrder, related_name='items', on_delete=models.CASCADE
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    tax_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    @property
    def total(self):
        return self.quantity * self.unit_price * (1 + self.tax_percent / 100)

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


# ----------------------------
# Transaction Model
# ----------------------------
class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('purchase_order', 'Purchase Order'),
        ('vendor_bill', 'Vendor Bill'),
        ('sales_order', 'Sales Order'),
        ('customer_invoice', 'Customer Invoice'),
    ]

    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    
    # GenericForeignKey to link any object
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    related_object = GenericForeignKey('content_type', 'object_id')

    date = models.DateField(default=timezone.now)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} on {self.date}"
