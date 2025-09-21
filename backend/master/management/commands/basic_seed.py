from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from decimal import Decimal
from master.models import Contact, Product, ProductCategory, Tax, ChartOfAccounts
from datetime import date, timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with basic sample data'

    def handle(self, *args, **options):
        self.stdout.write('Starting to seed basic data...')
        
        with transaction.atomic():
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
        
        self.stdout.write(
            self.style.SUCCESS('Successfully seeded basic data!')
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

    def create_chart_of_accounts(self):
        """Create chart of accounts"""
        accounts_data = [
            {'name': 'Cash Account', 'code': 'CASH001', 'account_type': 'asset', 'parent_category': 'current_assets'},
            {'name': 'Bank Account', 'code': 'BANK001', 'account_type': 'asset', 'parent_category': 'current_assets'},
            {'name': 'Accounts Receivable', 'code': 'AR001', 'account_type': 'asset', 'parent_category': 'current_assets'},
            {'name': 'Inventory', 'code': 'INV001', 'account_type': 'asset', 'parent_category': 'current_assets'},
            {'name': 'Sales Revenue', 'code': 'SR001', 'account_type': 'income', 'parent_category': 'revenue'},
            {'name': 'Cost of Goods Sold', 'code': 'COGS001', 'account_type': 'expense', 'parent_category': 'cost_of_goods_sold'},
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
            {'name': 'Software', 'description': 'Software and digital products'},
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
            {'name': 'ABC Corporation', 'contact_type': 'customer', 'email': 'contact@abccorp.com', 'phone': '+91-9876543210', 'address': '123 Business Park, Sector 5', 'city': 'Mumbai', 'state': 'Maharashtra', 'country': 'India', 'pincode': '400001', 'gst_number': '27AABCU9603R1ZX', 'pan_number': 'AABCU9603A'},
            {'name': 'XYZ Ltd', 'contact_type': 'customer', 'email': 'info@xyzltd.com', 'phone': '+91-9876543211', 'address': '456 Corporate Plaza, Connaught Place', 'city': 'Delhi', 'state': 'Delhi', 'country': 'India', 'pincode': '110001', 'gst_number': '07AABCU9603R1ZY', 'pan_number': 'AABCU9603B'},
            {'name': 'PQR Industries', 'contact_type': 'customer', 'email': 'sales@pqrind.com', 'phone': '+91-9876543212', 'address': '789 Industrial Area, Whitefield', 'city': 'Bangalore', 'state': 'Karnataka', 'country': 'India', 'pincode': '560066', 'gst_number': '29AABCU9603R1ZZ', 'pan_number': 'AABCU9603C'},
            {'name': 'Tech Solutions Inc', 'contact_type': 'customer', 'email': 'orders@techsolutions.com', 'phone': '+91-9876543213', 'address': '321 Tech Park, HITEC City', 'city': 'Hyderabad', 'state': 'Telangana', 'country': 'India', 'pincode': '500081', 'gst_number': '36AABCU9603R1ZA', 'pan_number': 'AABCU9603D'},
            {'name': 'Global Enterprises', 'contact_type': 'customer', 'email': 'business@globalent.com', 'phone': '+91-9876543214', 'address': '654 Trade Center, Salt Lake', 'city': 'Kolkata', 'state': 'West Bengal', 'country': 'India', 'pincode': '700091', 'gst_number': '19AABCU9603R1ZB', 'pan_number': 'AABCU9603E'},
            
            # Vendors
            {'name': 'Supplier One', 'contact_type': 'vendor', 'email': 'orders@supplier1.com', 'phone': '+91-9876543218', 'address': '111 Supply Chain, T. Nagar', 'city': 'Chennai', 'state': 'Tamil Nadu', 'country': 'India', 'pincode': '600017', 'gst_number': '33AABCU9603R1ZF', 'pan_number': 'AABCU9603I'},
            {'name': 'Vendor Two', 'contact_type': 'vendor', 'email': 'purchase@vendor2.com', 'phone': '+91-9876543219', 'address': '222 Wholesale Market, Burrabazar', 'city': 'Kolkata', 'state': 'West Bengal', 'country': 'India', 'pincode': '700007', 'gst_number': '19AABCU9603R1ZG', 'pan_number': 'AABCU9603J'},
            {'name': 'Global Suppliers', 'contact_type': 'vendor', 'email': 'contact@globalsuppliers.com', 'phone': '+91-9876543220', 'address': '333 International Trade Center, Koregaon Park', 'city': 'Pune', 'state': 'Maharashtra', 'country': 'India', 'pincode': '411001', 'gst_number': '27AABCU9603R1ZH', 'pan_number': 'AABCU9603K'},
        ]
        
        for contact_data in contacts_data:
            Contact.objects.get_or_create(
                email=contact_data['email'],
                defaults=contact_data
            )
        
        self.stdout.write(f'Created {len(contacts_data)} contacts')

    def create_products(self):
        """Create sample products"""
        categories = list(ProductCategory.objects.all())
        taxes = list(Tax.objects.all())
        
        products_data = [
            {'name': 'Dell Laptop XPS 13', 'sku': 'LAP001', 'description': 'High-performance business laptop with 16GB RAM, 512GB SSD', 'category': categories[0], 'hsn_code': '8471', 'sales_price': Decimal('75000.00'), 'purchase_price': Decimal('65000.00'), 'sales_tax': taxes[2], 'purchase_tax': taxes[2], 'current_stock': Decimal('15.00'), 'minimum_stock': Decimal('3.00')},
            {'name': 'MacBook Pro 14"', 'sku': 'LAP002', 'description': 'Apple MacBook Pro with M2 chip, 16GB RAM, 512GB SSD', 'category': categories[0], 'hsn_code': '8471', 'sales_price': Decimal('150000.00'), 'purchase_price': Decimal('130000.00'), 'sales_tax': taxes[2], 'purchase_tax': taxes[2], 'current_stock': Decimal('8.00'), 'minimum_stock': Decimal('2.00')},
            {'name': 'Samsung Galaxy S24', 'sku': 'PHONE001', 'description': 'Latest Samsung smartphone with 128GB storage', 'category': categories[0], 'hsn_code': '8517', 'sales_price': Decimal('45000.00'), 'purchase_price': Decimal('38000.00'), 'sales_tax': taxes[2], 'purchase_tax': taxes[2], 'current_stock': Decimal('25.00'), 'minimum_stock': Decimal('5.00')},
            {'name': 'A4 Notebook (Pack of 10)', 'sku': 'NOTE001', 'description': 'High-quality A4 size notebooks, 200 pages each', 'category': categories[1], 'hsn_code': '4820', 'sales_price': Decimal('500.00'), 'purchase_price': Decimal('300.00'), 'sales_tax': taxes[0], 'purchase_tax': taxes[0], 'current_stock': Decimal('100.00'), 'minimum_stock': Decimal('20.00')},
            {'name': 'Ballpoint Pen Set', 'sku': 'PEN001', 'description': 'Premium ballpoint pen set with 12 pens', 'category': categories[1], 'hsn_code': '9608', 'sales_price': Decimal('200.00'), 'purchase_price': Decimal('120.00'), 'sales_tax': taxes[0], 'purchase_tax': taxes[0], 'current_stock': Decimal('50.00'), 'minimum_stock': Decimal('10.00')},
            {'name': 'Ergonomic Office Chair', 'sku': 'CHAIR001', 'description': 'High-back ergonomic office chair with lumbar support', 'category': categories[2], 'hsn_code': '9401', 'sales_price': Decimal('12000.00'), 'purchase_price': Decimal('8000.00'), 'sales_tax': taxes[2], 'purchase_tax': taxes[2], 'current_stock': Decimal('15.00'), 'minimum_stock': Decimal('3.00')},
            {'name': 'Office Desk (120cm)', 'sku': 'DESK001', 'description': 'Wooden office desk with drawers and cable management', 'category': categories[2], 'hsn_code': '9403', 'sales_price': Decimal('15000.00'), 'purchase_price': Decimal('10000.00'), 'sales_tax': taxes[2], 'purchase_tax': taxes[2], 'current_stock': Decimal('10.00'), 'minimum_stock': Decimal('2.00')},
            {'name': 'Microsoft Office 365 Business', 'sku': 'OFFICE365', 'description': 'Microsoft Office 365 Business subscription (1 year)', 'category': categories[3], 'hsn_code': '8523', 'sales_price': Decimal('8000.00'), 'purchase_price': Decimal('6000.00'), 'sales_tax': taxes[2], 'purchase_tax': taxes[2], 'current_stock': Decimal('50.00'), 'minimum_stock': Decimal('10.00')},
        ]
        
        for product_data in products_data:
            Product.objects.get_or_create(
                sku=product_data['sku'],
                defaults=product_data
            )
        
        self.stdout.write(f'Created {len(products_data)} products')
