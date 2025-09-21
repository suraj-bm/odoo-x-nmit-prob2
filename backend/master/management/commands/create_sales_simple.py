from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models.signals import post_save
from decimal import Decimal
from master.models import Contact, Product, Tax
from transactions.sales_models import SalesOrder, SalesOrderItem, CustomerInvoice
from datetime import date, timedelta
import random

class Command(BaseCommand):
    help = 'Create sample sales orders and invoices without signals'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample sales data without signals...')
        
        with transaction.atomic():
            # Disable signals
            self.disable_signals()
            
            try:
                # Create sales orders
                self.create_sales_orders()
                
                # Create some invoices
                self.create_sample_invoices()
            finally:
                # Re-enable signals
                self.enable_signals()
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created sales data!')
        )

    def disable_signals(self):
        """Disable problematic signals"""
        from transactions.signals import update_sales_order_totals, update_sales_order_item_totals
        post_save.disconnect(update_sales_order_totals, sender=SalesOrder)
        post_save.disconnect(update_sales_order_item_totals, sender=SalesOrderItem)

    def enable_signals(self):
        """Re-enable signals"""
        from transactions.signals import update_sales_order_totals, update_sales_order_item_totals
        post_save.connect(update_sales_order_totals, sender=SalesOrder)
        post_save.connect(update_sales_order_item_totals, sender=SalesOrderItem)

    def create_sales_orders(self):
        """Create sample sales orders"""
        customers = list(Contact.objects.filter(contact_type__in=['customer', 'both']))
        products = list(Product.objects.all())
        
        if not customers or not products:
            self.stdout.write('No customers or products found. Run basic_seed first.')
            return
        
        sales_orders_data = [
            {
                'customer': customers[0],  # ABC Corporation
                'so_date': date.today() - timedelta(days=5),
                'expected_delivery_date': date.today() + timedelta(days=2),
                'status': 'confirmed',
                'notes': 'Urgent delivery required',
                'items': [
                    {'product': products[0], 'quantity': 2, 'unit_price': products[0].sales_price},  # Dell Laptop
                    {'product': products[3], 'quantity': 5, 'unit_price': products[3].sales_price},  # A4 Notebook
                ]
            },
            {
                'customer': customers[1],  # XYZ Ltd
                'so_date': date.today() - timedelta(days=3),
                'expected_delivery_date': date.today() + timedelta(days=1),
                'status': 'delivered',
                'notes': 'Standard delivery',
                'items': [
                    {'product': products[1], 'quantity': 1, 'unit_price': products[1].sales_price},  # MacBook Pro
                    {'product': products[5], 'quantity': 2, 'unit_price': products[5].sales_price},  # Office Chair
                ]
            },
            {
                'customer': customers[2],  # PQR Industries
                'so_date': date.today() - timedelta(days=7),
                'expected_delivery_date': date.today() - timedelta(days=1),
                'status': 'partially_delivered',
                'notes': 'Partial delivery completed',
                'items': [
                    {'product': products[2], 'quantity': 3, 'unit_price': products[2].sales_price},  # Samsung Galaxy
                    {'product': products[4], 'quantity': 10, 'unit_price': products[4].sales_price},  # Ballpoint Pen Set
                    {'product': products[6], 'quantity': 1, 'unit_price': products[6].sales_price},  # Office Desk
                ]
            },
            {
                'customer': customers[3],  # Tech Solutions Inc
                'so_date': date.today() - timedelta(days=2),
                'expected_delivery_date': date.today() + timedelta(days=3),
                'status': 'draft',
                'notes': 'Pending approval',
                'items': [
                    {'product': products[7], 'quantity': 2, 'unit_price': products[7].sales_price},  # Office 365
                ]
            },
            {
                'customer': customers[4],  # Global Enterprises
                'so_date': date.today() - timedelta(days=10),
                'expected_delivery_date': date.today() - timedelta(days=5),
                'status': 'delivered',
                'notes': 'Completed order',
                'items': [
                    {'product': products[0], 'quantity': 1, 'unit_price': products[0].sales_price},  # Dell Laptop
                    {'product': products[3], 'quantity': 20, 'unit_price': products[3].sales_price},  # A4 Notebook
                    {'product': products[4], 'quantity': 5, 'unit_price': products[4].sales_price},  # Ballpoint Pen Set
                ]
            },
        ]
        
        for i, order_data in enumerate(sales_orders_data, 1):
            # Create sales order
            sales_order = SalesOrder.objects.create(
                so_number=f"SO-{str(i).zfill(4)}",
                customer=order_data['customer'],
                so_date=order_data['so_date'],
                expected_delivery_date=order_data['expected_delivery_date'],
                status=order_data['status'],
                notes=order_data['notes']
            )
            
            # Create sales order items
            for item_data in order_data['items']:
                item = SalesOrderItem.objects.create(
                    sales_order=sales_order,
                    product=item_data['product'],
                    quantity=item_data['quantity'],
                    unit_price=item_data['unit_price'],
                    tax=item_data['product'].sales_tax if item_data['product'].sales_tax else None
                )
                
                # Manually calculate totals for this item
                item.line_total = item.quantity * item.unit_price
                if item.tax:
                    item.tax_amount = item.tax.calculate_tax(item.line_total)
                else:
                    item.tax_amount = Decimal('0.00')
                item.save(update_fields=['line_total', 'tax_amount'])
            
            # Manually calculate totals for the sales order
            items = sales_order.sales_order_items.all()
            sales_order.subtotal = sum(item.line_total for item in items)
            sales_order.tax_amount = sum(item.tax_amount for item in items)
            sales_order.total_amount = sales_order.subtotal + sales_order.tax_amount
            sales_order.save(update_fields=['subtotal', 'tax_amount', 'total_amount'])
            
            self.stdout.write(f'Created sales order for {order_data["customer"].name}')
        
        self.stdout.write(f'Created {len(sales_orders_data)} sales orders')

    def create_sample_invoices(self):
        """Create sample invoices from some sales orders"""
        # Get some delivered sales orders
        delivered_orders = SalesOrder.objects.filter(status='delivered')[:2]
        
        for i, sales_order in enumerate(delivered_orders, 1):
            # Create invoice
            invoice = CustomerInvoice.objects.create(
                invoice_number=f"INV-{str(i).zfill(4)}",
                customer=sales_order.customer,
                invoice_date=sales_order.expected_delivery_date,
                due_date=sales_order.expected_delivery_date + timedelta(days=30),
                status='sent',
                notes=f'Invoice for Sales Order {sales_order.so_number}',
                sales_order=sales_order,
                subtotal=sales_order.subtotal,
                tax_amount=sales_order.tax_amount,
                total_amount=sales_order.total_amount,
                balance_amount=sales_order.total_amount
            )
            
            self.stdout.write(f'Created invoice for {sales_order.customer.name}')
        
        self.stdout.write(f'Created {len(delivered_orders)} invoices')
