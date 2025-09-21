from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models.signals import post_save
from decimal import Decimal
from master.models import Contact, Product, Tax
from transactions.models import PurchaseOrder, PurchaseOrderItem
from datetime import date, timedelta
import random

class Command(BaseCommand):
    help = 'Create sample purchase orders and vendor bills without signals'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample purchase data without signals...')
        
        with transaction.atomic():
            # Disable signals
            self.disable_signals()
            
            try:
                # Create purchase orders
                self.create_purchase_orders()
            finally:
                # Re-enable signals
                self.enable_signals()
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created purchase data!')
        )

    def disable_signals(self):
        """Disable problematic signals"""
        from transactions.signals import update_purchase_order_totals, update_purchase_order_item_totals
        post_save.disconnect(update_purchase_order_totals, sender=PurchaseOrder)
        post_save.disconnect(update_purchase_order_item_totals, sender=PurchaseOrderItem)

    def enable_signals(self):
        """Re-enable signals"""
        from transactions.signals import update_purchase_order_totals, update_purchase_order_item_totals
        post_save.connect(update_purchase_order_totals, sender=PurchaseOrder)
        post_save.connect(update_purchase_order_item_totals, sender=PurchaseOrderItem)

    def create_purchase_orders(self):
        """Create sample purchase orders"""
        vendors = list(Contact.objects.filter(contact_type__in=['vendor', 'both']))
        products = list(Product.objects.all())
        
        if not vendors or not products:
            self.stdout.write('No vendors or products found. Run basic_seed first.')
            return
        
        purchase_orders_data = [
            {
                'vendor': vendors[0],  # Supplier One
                'po_date': date.today() - timedelta(days=5),
                'expected_delivery_date': date.today() + timedelta(days=2),
                'status': 'confirmed',
                'notes': 'Urgent delivery required for office supplies',
                'items': [
                    {'product': products[0], 'quantity': 5, 'unit_price': products[0].purchase_price},  # Dell Laptop
                    {'product': products[3], 'quantity': 20, 'unit_price': products[3].purchase_price},  # A4 Notebook
                ]
            },
            {
                'vendor': vendors[1],  # Vendor Two
                'po_date': date.today() - timedelta(days=3),
                'expected_delivery_date': date.today() + timedelta(days=1),
                'status': 'received',
                'notes': 'Bulk order discount applied',
                'items': [
                    {'product': products[1], 'quantity': 2, 'unit_price': products[1].purchase_price},  # MacBook Pro
                    {'product': products[5], 'quantity': 3, 'unit_price': products[5].purchase_price},  # Office Chair
                ]
            },
            {
                'vendor': vendors[2],  # Global Suppliers
                'po_date': date.today() - timedelta(days=7),
                'expected_delivery_date': date.today() - timedelta(days=1),
                'status': 'partially_received',
                'notes': 'Partial delivery completed',
                'items': [
                    {'product': products[2], 'quantity': 10, 'unit_price': products[2].purchase_price},  # Samsung Galaxy
                    {'product': products[4], 'quantity': 15, 'unit_price': products[4].purchase_price},  # Ballpoint Pen Set
                    {'product': products[6], 'quantity': 2, 'unit_price': products[6].purchase_price},  # Office Desk
                ]
            },
            {
                'vendor': vendors[0],  # Supplier One
                'po_date': date.today() - timedelta(days=2),
                'expected_delivery_date': date.today() + timedelta(days=3),
                'status': 'draft',
                'notes': 'Pending approval from management',
                'items': [
                    {'product': products[7], 'quantity': 5, 'unit_price': products[7].purchase_price},  # Office 365
                ]
            },
            {
                'vendor': vendors[1],  # Vendor Two
                'po_date': date.today() - timedelta(days=10),
                'expected_delivery_date': date.today() - timedelta(days=5),
                'status': 'received',
                'notes': 'Completed order - all items delivered',
                'items': [
                    {'product': products[0], 'quantity': 3, 'unit_price': products[0].purchase_price},  # Dell Laptop
                    {'product': products[3], 'quantity': 50, 'unit_price': products[3].purchase_price},  # A4 Notebook
                    {'product': products[4], 'quantity': 10, 'unit_price': products[4].purchase_price},  # Ballpoint Pen Set
                ]
            },
        ]
        
        for i, order_data in enumerate(purchase_orders_data, 1):
            # Create purchase order
            purchase_order = PurchaseOrder.objects.create(
                po_number=f"PO-{str(i).zfill(4)}",
                vendor=order_data['vendor'],
                po_date=order_data['po_date'],
                expected_delivery_date=order_data['expected_delivery_date'],
                status=order_data['status'],
                notes=order_data['notes']
            )
            
            # Create purchase order items
            for item_data in order_data['items']:
                item = PurchaseOrderItem.objects.create(
                    purchase_order=purchase_order,
                    product=item_data['product'],
                    quantity=item_data['quantity'],
                    unit_price=item_data['unit_price'],
                    tax=item_data['product'].purchase_tax if item_data['product'].purchase_tax else None
                )
                
                # Manually calculate totals for this item
                item.line_total = item.quantity * item.unit_price
                if item.tax:
                    item.tax_amount = item.tax.calculate_tax(item.line_total)
                else:
                    item.tax_amount = Decimal('0.00')
                item.save(update_fields=['line_total', 'tax_amount'])
            
            # Manually calculate totals for the purchase order
            items = purchase_order.purchase_order_items.all()
            purchase_order.subtotal = sum(item.line_total for item in items)
            purchase_order.tax_amount = sum(item.tax_amount for item in items)
            purchase_order.total_amount = purchase_order.subtotal + purchase_order.tax_amount
            purchase_order.save(update_fields=['subtotal', 'tax_amount', 'total_amount'])
            
            self.stdout.write(f'Created purchase order for {order_data["vendor"].name}')
        
        self.stdout.write(f'Created {len(purchase_orders_data)} purchase orders')
