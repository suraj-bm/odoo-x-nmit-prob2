from django.test import TestCase
from django.contrib.auth import get_user_model
from decimal import Decimal
from master.models import Contact, Product, ProductCategory, Tax, ChartOfAccounts
from transactions.models import PurchaseOrder, PurchaseOrderItem
from transactions.sales_models import SalesOrder, SalesOrderItem

User = get_user_model()


class MasterDataTestCase(TestCase):
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role='admin'
        )
        
        self.category = ProductCategory.objects.create(
            name='Test Category',
            description='Test category description'
        )
        
        self.tax = Tax.objects.create(
            name='Test Tax',
            tax_type='percentage',
            rate=Decimal('18.00'),
            applicable_on='both'
        )
        
        self.contact = Contact.objects.create(
            name='Test Contact',
            contact_type='customer',
            email='contact@test.com',
            phone='+91-9876543210'
        )
        
        self.product = Product.objects.create(
            name='Test Product',
            sku='TEST001',
            category=self.category,
            sales_price=Decimal('100.00'),
            purchase_price=Decimal('80.00'),
            sales_tax=self.tax,
            purchase_tax=self.tax,
            current_stock=Decimal('10.00'),
            minimum_stock=Decimal('2.00')
        )

    def test_contact_creation(self):
        """Test contact creation"""
        self.assertEqual(self.contact.name, 'Test Contact')
        self.assertEqual(self.contact.contact_type, 'customer')
        self.assertTrue(self.contact.is_active)

    def test_product_creation(self):
        """Test product creation"""
        self.assertEqual(self.product.name, 'Test Product')
        self.assertEqual(self.product.sku, 'TEST001')
        self.assertEqual(self.product.current_stock, Decimal('10.00'))

    def test_tax_calculation(self):
        """Test tax calculation"""
        amount = Decimal('100.00')
        calculated_tax = self.tax.calculate_tax(amount)
        expected_tax = Decimal('18.00')
        self.assertEqual(calculated_tax, expected_tax)


class TransactionTestCase(TestCase):
    def setUp(self):
        """Set up test data for transactions"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role='admin'
        )
        
        self.vendor = Contact.objects.create(
            name='Test Vendor',
            contact_type='vendor',
            email='vendor@test.com'
        )
        
        self.customer = Contact.objects.create(
            name='Test Customer',
            contact_type='customer',
            email='customer@test.com'
        )
        
        self.tax = Tax.objects.create(
            name='Test Tax',
            tax_type='percentage',
            rate=Decimal('18.00'),
            applicable_on='both'
        )
        
        self.product = Product.objects.create(
            name='Test Product',
            sku='TEST001',
            sales_price=Decimal('100.00'),
            purchase_price=Decimal('80.00'),
            sales_tax=self.tax,
            purchase_tax=self.tax,
            current_stock=Decimal('10.00')
        )

    def test_purchase_order_creation(self):
        """Test purchase order creation"""
        po = PurchaseOrder.objects.create(
            po_number='PO-001',
            vendor=self.vendor,
            po_date='2024-01-01',
            created_by=self.user
        )
        
        item = PurchaseOrderItem.objects.create(
            purchase_order=po,
            product=self.product,
            quantity=Decimal('5.00'),
            unit_price=Decimal('80.00'),
            tax=self.tax
        )
        
        po.calculate_totals()
        
        self.assertEqual(po.vendor, self.vendor)
        self.assertEqual(po.total_amount, Decimal('472.00'))  # 400 + 72 tax
        self.assertEqual(item.line_total, Decimal('400.00'))

    def test_sales_order_creation(self):
        """Test sales order creation"""
        so = SalesOrder.objects.create(
            so_number='SO-001',
            customer=self.customer,
            so_date='2024-01-01',
            created_by=self.user
        )
        
        item = SalesOrderItem.objects.create(
            sales_order=so,
            product=self.product,
            quantity=Decimal('3.00'),
            unit_price=Decimal('100.00'),
            tax=self.tax
        )
        
        so.calculate_totals()
        
        self.assertEqual(so.customer, self.customer)
        self.assertEqual(so.total_amount, Decimal('354.00'))  # 300 + 54 tax
        self.assertEqual(item.line_total, Decimal('300.00'))
