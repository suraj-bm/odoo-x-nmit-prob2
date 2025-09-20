from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models.signals import post_save
from decimal import Decimal
from master.models import Contact, Product, ProductCategory, Tax, ChartOfAccounts
from transactions.models import PurchaseOrder, PurchaseOrderItem, VendorBill
from transactions.sales_models import SalesOrder, SalesOrderItem, CustomerInvoice
from transactions.payment_models import Payment
from reports.models import StockLedger, LedgerEntries
from datetime import date, timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Starting to seed data...')
        
        # Create users
        self.create_users()
        
        # Create chart of accounts
        self.create_chart_of_accounts()
        
        # Create taxes
        self.create_taxes()
        
        # Create product categories
        self.create_product_categories()
        
        # Create contacts
        self.create_contacts()
        
        # Create products
        self.create_products()
        
        # Skip sample transactions for now to avoid signal recursion
        # self.create_sample_transactions()
        
        self.stdout.write(
            self.style.SUCCESS('Successfully seeded data!')
        )

    def create_users(self):
        """Create sample users"""
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@shivaccounts.com',
                password='admin123',
                role='admin',
                first_name='Admin',
                last_name='User'
            )
            self.stdout.write('Created admin user')
        
        if not User.objects.filter(username='invoicing').exists():
            User.objects.create_user(
                username='invoicing',
                email='invoicing@shivaccounts.com',
                password='invoicing123',
                role='invoicing_user',
                first_name='Invoicing',
                last_name='User'
            )
            self.stdout.write('Created invoicing user')
        
        if not User.objects.filter(username='customer1').exists():
            User.objects.create_user(
                username='customer1',
                email='customer1@example.com',
                password='customer123',
                role='contact',
                first_name='John',
                last_name='Doe'
            )
            self.stdout.write('Created customer user')

    def create_chart_of_accounts(self):
        """Create chart of accounts"""
        accounts_data = [
            # Assets
            {'name': 'Cash Account', 'code': 'CASH001', 'account_type': 'asset', 'parent_category': 'current_assets'},
            {'name': 'Bank Account', 'code': 'BANK001', 'account_type': 'asset', 'parent_category': 'current_assets'},
            {'name': 'Accounts Receivable', 'code': 'AR001', 'account_type': 'asset', 'parent_category': 'current_assets'},
            {'name': 'Inventory', 'code': 'INV001', 'account_type': 'asset', 'parent_category': 'current_assets'},
            {'name': 'Office Equipment', 'code': 'OE001', 'account_type': 'asset', 'parent_category': 'fixed_assets'},
            
            # Liabilities
            {'name': 'Accounts Payable', 'code': 'AP001', 'account_type': 'liability', 'parent_category': 'current_liabilities'},
            {'name': 'Accrued Expenses', 'code': 'AE001', 'account_type': 'liability', 'parent_category': 'current_liabilities'},
            
            # Equity
            {'name': 'Owner Equity', 'code': 'OEQ001', 'account_type': 'equity', 'parent_category': 'equity'},
            {'name': 'Retained Earnings', 'code': 'RE001', 'account_type': 'equity', 'parent_category': 'equity'},
            
            # Income
            {'name': 'Sales Revenue', 'code': 'SR001', 'account_type': 'income', 'parent_category': 'revenue'},
            {'name': 'Service Revenue', 'code': 'SVR001', 'account_type': 'income', 'parent_category': 'revenue'},
            
            # Expenses
            {'name': 'Cost of Goods Sold', 'code': 'COGS001', 'account_type': 'expense', 'parent_category': 'cost_of_goods_sold'},
            {'name': 'Office Rent', 'code': 'OR001', 'account_type': 'expense', 'parent_category': 'operating_expenses'},
            {'name': 'Utilities', 'code': 'UTIL001', 'account_type': 'expense', 'parent_category': 'operating_expenses'},
            {'name': 'Office Supplies', 'code': 'OS001', 'account_type': 'expense', 'parent_category': 'operating_expenses'},
        ]
        
        for account_data in accounts_data:
            ChartOfAccounts.objects.get_or_create(
                code=account_data['code'],
                defaults=account_data
            )
        
        self.stdout.write('Created chart of accounts')

    def create_taxes(self):
        """Create tax rates"""
        taxes_data = [
            {'name': 'GST 5%', 'tax_type': 'percentage', 'rate': Decimal('5.00'), 'applicable_on': 'both'},
            {'name': 'GST 12%', 'tax_type': 'percentage', 'rate': Decimal('12.00'), 'applicable_on': 'both'},
            {'name': 'GST 18%', 'tax_type': 'percentage', 'rate': Decimal('18.00'), 'applicable_on': 'both'},
            {'name': 'GST 28%', 'tax_type': 'percentage', 'rate': Decimal('28.00'), 'applicable_on': 'both'},
            {'name': 'No Tax', 'tax_type': 'percentage', 'rate': Decimal('0.00'), 'applicable_on': 'both'},
        ]
        
        for tax_data in taxes_data:
            Tax.objects.get_or_create(
                name=tax_data['name'],
                defaults=tax_data
            )
        
        self.stdout.write('Created taxes')

    def create_product_categories(self):
        """Create product categories"""
        categories_data = [
            {'name': 'Electronics', 'description': 'Electronic devices and accessories'},
            {'name': 'Office Supplies', 'description': 'Office stationery and supplies'},
            {'name': 'Furniture', 'description': 'Office and home furniture'},
            {'name': 'Books', 'description': 'Books and educational materials'},
            {'name': 'Clothing', 'description': 'Apparel and accessories'},
        ]
        
        for category_data in categories_data:
            ProductCategory.objects.get_or_create(
                name=category_data['name'],
                defaults=category_data
            )
        
        self.stdout.write('Created product categories')

    def create_contacts(self):
        """Create sample contacts"""
        contacts_data = [
            # Customers
            {'name': 'ABC Corporation', 'contact_type': 'customer', 'email': 'contact@abccorp.com', 'phone': '+91-9876543210', 'city': 'Mumbai', 'state': 'Maharashtra', 'gst_number': '27AABCU9603R1ZX'},
            {'name': 'XYZ Ltd', 'contact_type': 'customer', 'email': 'info@xyzltd.com', 'phone': '+91-9876543211', 'city': 'Delhi', 'state': 'Delhi', 'gst_number': '07AABCU9603R1ZY'},
            {'name': 'PQR Industries', 'contact_type': 'customer', 'email': 'sales@pqrind.com', 'phone': '+91-9876543212', 'city': 'Bangalore', 'state': 'Karnataka', 'gst_number': '29AABCU9603R1ZZ'},
            
            # Vendors
            {'name': 'Supplier One', 'contact_type': 'vendor', 'email': 'orders@supplier1.com', 'phone': '+91-9876543213', 'city': 'Chennai', 'state': 'Tamil Nadu', 'gst_number': '33AABCU9603R1ZA'},
            {'name': 'Vendor Two', 'contact_type': 'vendor', 'email': 'purchase@vendor2.com', 'phone': '+91-9876543214', 'city': 'Kolkata', 'state': 'West Bengal', 'gst_number': '19AABCU9603R1ZB'},
            {'name': 'Global Suppliers', 'contact_type': 'vendor', 'email': 'contact@globalsuppliers.com', 'phone': '+91-9876543215', 'city': 'Pune', 'state': 'Maharashtra', 'gst_number': '27AABCU9603R1ZC'},
        ]
        
        for contact_data in contacts_data:
            Contact.objects.get_or_create(
                email=contact_data['email'],
                defaults=contact_data
            )
        
        self.stdout.write('Created contacts')

    def create_products(self):
        """Create sample products"""
        categories = ProductCategory.objects.all()
        taxes = Tax.objects.all()
        
        products_data = [
            {'name': 'Laptop', 'sku': 'LAP001', 'description': 'High-performance laptop', 'category': categories[0], 'hsn_code': '8471', 'sales_price': Decimal('50000.00'), 'purchase_price': Decimal('45000.00'), 'sales_tax': taxes[2], 'purchase_tax': taxes[2], 'current_stock': Decimal('10.00'), 'minimum_stock': Decimal('2.00')},
            {'name': 'Office Chair', 'sku': 'CHAIR001', 'description': 'Ergonomic office chair', 'category': categories[2], 'hsn_code': '9401', 'sales_price': Decimal('8000.00'), 'purchase_price': Decimal('6000.00'), 'sales_tax': taxes[2], 'purchase_tax': taxes[2], 'current_stock': Decimal('15.00'), 'minimum_stock': Decimal('3.00')},
            {'name': 'Notebook', 'sku': 'NOTE001', 'description': 'A4 size notebook', 'category': categories[1], 'hsn_code': '4820', 'sales_price': Decimal('50.00'), 'purchase_price': Decimal('30.00'), 'sales_tax': taxes[0], 'purchase_tax': taxes[0], 'current_stock': Decimal('100.00'), 'minimum_stock': Decimal('20.00')},
            {'name': 'Pen Set', 'sku': 'PEN001', 'description': 'Ballpoint pen set', 'category': categories[1], 'hsn_code': '9608', 'sales_price': Decimal('200.00'), 'purchase_price': Decimal('120.00'), 'sales_tax': taxes[0], 'purchase_tax': taxes[0], 'current_stock': Decimal('50.00'), 'minimum_stock': Decimal('10.00')},
            {'name': 'T-Shirt', 'sku': 'TSHIRT001', 'description': 'Cotton t-shirt', 'category': categories[4], 'hsn_code': '6109', 'sales_price': Decimal('500.00'), 'purchase_price': Decimal('300.00'), 'sales_tax': taxes[1], 'purchase_tax': taxes[1], 'current_stock': Decimal('25.00'), 'minimum_stock': Decimal('5.00')},
        ]
        
        for product_data in products_data:
            Product.objects.get_or_create(
                sku=product_data['sku'],
                defaults=product_data
            )
        
        self.stdout.write('Created products')

    def create_sample_transactions(self):
        """Create sample transactions"""
        # Get sample data
        vendors = Contact.objects.filter(contact_type='vendor')
        customers = Contact.objects.filter(contact_type='customer')
        products = Product.objects.all()
        taxes = Tax.objects.all()
        admin_user = User.objects.filter(role='admin').first()
        
        # Create purchase orders
        for i in range(3):
            vendor = random.choice(vendors)
            po = PurchaseOrder.objects.create(
                po_number=f'PO-{1001 + i}',
                vendor=vendor,
                po_date=date.today() - timedelta(days=random.randint(1, 30)),
                expected_delivery_date=date.today() + timedelta(days=random.randint(1, 15)),
                status='confirmed',
                notes=f'Sample purchase order {i+1}',
                created_by=admin_user
            )
            
            # Add items to PO
            for j in range(random.randint(1, 3)):
                product = random.choice(products)
                quantity = random.randint(1, 5)
                PurchaseOrderItem.objects.create(
                    purchase_order=po,
                    product=product,
                    quantity=quantity,
                    unit_price=product.purchase_price,
                    tax=product.purchase_tax
                )
            
            po.calculate_totals()
        
        # Create sales orders
        for i in range(3):
            customer = random.choice(customers)
            so = SalesOrder.objects.create(
                so_number=f'SO-{2001 + i}',
                customer=customer,
                so_date=date.today() - timedelta(days=random.randint(1, 30)),
                expected_delivery_date=date.today() + timedelta(days=random.randint(1, 15)),
                status='confirmed',
                notes=f'Sample sales order {i+1}',
                created_by=admin_user
            )
            
            # Add items to SO
            for j in range(random.randint(1, 3)):
                product = random.choice(products)
                quantity = random.randint(1, 3)
                SalesOrderItem.objects.create(
                    sales_order=so,
                    product=product,
                    quantity=quantity,
                    unit_price=product.sales_price,
                    tax=product.sales_tax
                )
            
            so.calculate_totals()
        
        self.stdout.write('Created sample transactions')
