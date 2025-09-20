from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from users.models import User


class Payment(models.Model):
    """
    Payments linked to vendor bills or customer invoices
    """
    PAYMENT_TYPE_CHOICES = [
        ('vendor_payment', 'Vendor Payment'),
        ('customer_payment', 'Customer Payment'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
        ('cheque', 'Cheque'),
        ('credit_card', 'Credit Card'),
        ('upi', 'UPI'),
        ('other', 'Other'),
    ]
    
    payment_number = models.CharField(max_length=50, unique=True)
    payment_type = models.CharField(
        max_length=20,
        choices=PAYMENT_TYPE_CHOICES
    )
    vendor_bill = models.ForeignKey(
        'VendorBill',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='payments'
    )
    customer_invoice = models.ForeignKey(
        'CustomerInvoice',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='payments'
    )
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default='bank_transfer'
    )
    payment_date = models.DateField()
    reference_number = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_payments'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'transactions_payment'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        ordering = ['-payment_date', '-created_at']
    
    def __str__(self):
        if self.vendor_bill:
            return f"Payment-{self.payment_number} - {self.vendor_bill.vendor.name}"
        else:
            return f"Payment-{self.payment_number} - {self.customer_invoice.customer.name}"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        if not self.vendor_bill and not self.customer_invoice:
            raise ValidationError("Either vendor_bill or customer_invoice must be specified")
        if self.vendor_bill and self.customer_invoice:
            raise ValidationError("Cannot specify both vendor_bill and customer_invoice")
