from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from master.models import Contact, Product, Tax
from users.models import User


class SalesOrder(models.Model):
    """
    Sales orders linked to customers
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('partially_delivered', 'Partially Delivered'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    so_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(
        Contact,
        on_delete=models.CASCADE,
        related_name='sales_orders',
        limit_choices_to={'contact_type': 'customer'}
    )
    so_date = models.DateField()
    expected_delivery_date = models.DateField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft'
    )
    subtotal = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    tax_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    total_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_sales_orders'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'transactions_sales_order'
        verbose_name = 'Sales Order'
        verbose_name_plural = 'Sales Orders'
        ordering = ['-so_date', '-created_at']
    
    def __str__(self):
        return f"SO-{self.so_number} - {self.customer.name}"
    
    def calculate_totals(self):
        """Calculate subtotal, tax, and total amounts"""
        items = self.sales_order_items.all()
        self.subtotal = sum(item.line_total for item in items)
        self.tax_amount = sum(item.tax_amount for item in items)
        self.total_amount = self.subtotal + self.tax_amount
        self.save(update_fields=['subtotal', 'tax_amount', 'total_amount'])


class SalesOrderItem(models.Model):
    """
    Individual items in sales orders
    """
    sales_order = models.ForeignKey(
        SalesOrder,
        on_delete=models.CASCADE,
        related_name='sales_order_items'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='sales_order_items'
    )
    quantity = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    unit_price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    tax = models.ForeignKey(
        Tax,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sales_order_items'
    )
    tax_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    line_total = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'transactions_sales_order_item'
        verbose_name = 'Sales Order Item'
        verbose_name_plural = 'Sales Order Items'
        unique_together = ['sales_order', 'product']
    
    def __str__(self):
        return f"{self.sales_order.so_number} - {self.product.name}"
    
    def save(self, *args, **kwargs):
        # Calculate line total and tax
        self.line_total = self.quantity * self.unit_price
        if self.tax:
            self.tax_amount = self.tax.calculate_tax(self.line_total)
        super().save(*args, **kwargs)


class CustomerInvoice(models.Model):
    """
    Customer invoices linked to sales orders
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    ]
    
    invoice_number = models.CharField(max_length=50, unique=True)
    sales_order = models.ForeignKey(
        SalesOrder,
        on_delete=models.CASCADE,
        related_name='customer_invoices',
        null=True,
        blank=True
    )
    customer = models.ForeignKey(
        Contact,
        on_delete=models.CASCADE,
        related_name='customer_invoices',
        limit_choices_to={'contact_type': 'customer'}
    )
    invoice_date = models.DateField()
    due_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft'
    )
    subtotal = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    tax_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    total_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    paid_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    balance_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_customer_invoices'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'transactions_customer_invoice'
        verbose_name = 'Customer Invoice'
        verbose_name_plural = 'Customer Invoices'
        ordering = ['-invoice_date', '-created_at']
    
    def __str__(self):
        return f"Invoice-{self.invoice_number} - {self.customer.name}"
    
    def calculate_balance(self):
        """Calculate remaining balance"""
        self.balance_amount = self.total_amount - self.paid_amount
        self.save(update_fields=['balance_amount'])
