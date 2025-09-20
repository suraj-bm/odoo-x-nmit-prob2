from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.db import transaction
from decimal import Decimal
from .models import PurchaseOrder, PurchaseOrderItem, VendorBill
from .sales_models import SalesOrder, SalesOrderItem, CustomerInvoice
from .payment_models import Payment
from reports.models import StockLedger, LedgerEntries
from master.models import ChartOfAccounts


@receiver(post_save, sender=PurchaseOrder)
def update_purchase_order_totals(sender, instance, created, **kwargs):
    """Update purchase order totals when items are saved"""
    if not created:
        instance.calculate_totals()


@receiver(post_save, sender=PurchaseOrderItem)
def update_purchase_order_item_totals(sender, instance, created, **kwargs):
    """Update purchase order totals when items are saved"""
    instance.purchase_order.calculate_totals()


@receiver(post_save, sender=SalesOrder)
def update_sales_order_totals(sender, instance, created, **kwargs):
    """Update sales order totals when items are saved"""
    if not created:
        instance.calculate_totals()


@receiver(post_save, sender=SalesOrderItem)
def update_sales_order_item_totals(sender, instance, created, **kwargs):
    """Update sales order totals when items are saved"""
    instance.sales_order.calculate_totals()


@receiver(post_save, sender=PurchaseOrder)
def create_purchase_stock_ledger(sender, instance, created, **kwargs):
    """Create stock ledger entries when PO is confirmed"""
    if instance.status == 'confirmed':
        with transaction.atomic():
            for item in instance.purchase_order_items.all():
                # Get current stock balance
                last_entry = StockLedger.objects.filter(
                    product=item.product
                ).order_by('-created_at').first()
                
                current_balance_qty = last_entry.balance_quantity if last_entry else Decimal('0.00')
                current_balance_value = last_entry.balance_value if last_entry else Decimal('0.00')
                
                # Calculate new balances
                new_balance_qty = current_balance_qty + item.quantity
                new_balance_value = current_balance_value + item.line_total
                
                # Create stock ledger entry
                StockLedger.objects.create(
                    product=item.product,
                    transaction_type='purchase',
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                    total_value=item.line_total,
                    balance_quantity=new_balance_qty,
                    balance_value=new_balance_value,
                    purchase_order=instance,
                    reference_number=instance.po_number,
                    transaction_date=instance.po_date,
                    notes=f"Purchase from {instance.vendor.name}"
                )
                
                # Update product current stock
                item.product.current_stock = new_balance_qty
                item.product.save(update_fields=['current_stock'])


@receiver(post_save, sender=SalesOrder)
def create_sales_stock_ledger(sender, instance, created, **kwargs):
    """Create stock ledger entries when SO is confirmed"""
    if instance.status == 'confirmed':
        with transaction.atomic():
            for item in instance.sales_order_items.all():
                # Get current stock balance
                last_entry = StockLedger.objects.filter(
                    product=item.product
                ).order_by('-created_at').first()
                
                current_balance_qty = last_entry.balance_quantity if last_entry else Decimal('0.00')
                current_balance_value = last_entry.balance_value if last_entry else Decimal('0.00')
                
                # Calculate new balances (subtract for sales)
                new_balance_qty = current_balance_qty - item.quantity
                new_balance_value = current_balance_value - item.line_total
                
                # Create stock ledger entry
                StockLedger.objects.create(
                    product=item.product,
                    transaction_type='sale',
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                    total_value=item.line_total,
                    balance_quantity=new_balance_qty,
                    balance_value=new_balance_value,
                    sales_order=instance,
                    reference_number=instance.so_number,
                    transaction_date=instance.so_date,
                    notes=f"Sale to {instance.customer.name}"
                )
                
                # Update product current stock
                item.product.current_stock = new_balance_qty
                item.product.save(update_fields=['current_stock'])


@receiver(post_save, sender=Payment)
def create_payment_ledger_entries(sender, instance, created, **kwargs):
    """Create ledger entries when payment is made"""
    if created:
        with transaction.atomic():
            # Get cash/bank account (assuming it exists)
            cash_account = ChartOfAccounts.objects.filter(
                name__icontains='cash',
                account_type='asset'
            ).first()
            
            if not cash_account:
                # Create a default cash account if it doesn't exist
                cash_account = ChartOfAccounts.objects.create(
                    name='Cash Account',
                    code='CASH001',
                    account_type='asset',
                    parent_category='current_assets'
                )
            
            if instance.payment_type == 'vendor_payment':
                # Debit: Cash Account, Credit: Accounts Payable
                accounts_payable = ChartOfAccounts.objects.filter(
                    name__icontains='accounts payable',
                    account_type='liability'
                ).first()
                
                if not accounts_payable:
                    accounts_payable = ChartOfAccounts.objects.create(
                        name='Accounts Payable',
                        code='AP001',
                        account_type='liability',
                        parent_category='current_liabilities'
                    )
                
                # Debit Cash
                LedgerEntries.objects.create(
                    account=cash_account,
                    entry_type='debit',
                    amount=instance.amount,
                    description=f"Payment to {instance.vendor_bill.vendor.name}",
                    payment=instance,
                    reference_number=instance.payment_number,
                    transaction_date=instance.payment_date
                )
                
                # Credit Accounts Payable
                LedgerEntries.objects.create(
                    account=accounts_payable,
                    entry_type='credit',
                    amount=instance.amount,
                    description=f"Payment to {instance.vendor_bill.vendor.name}",
                    payment=instance,
                    reference_number=instance.payment_number,
                    transaction_date=instance.payment_date
                )
                
                # Update vendor bill paid amount
                instance.vendor_bill.paid_amount += instance.amount
                instance.vendor_bill.calculate_balance()
                
            elif instance.payment_type == 'customer_payment':
                # Debit: Cash Account, Credit: Accounts Receivable
                accounts_receivable = ChartOfAccounts.objects.filter(
                    name__icontains='accounts receivable',
                    account_type='asset'
                ).first()
                
                if not accounts_receivable:
                    accounts_receivable = ChartOfAccounts.objects.create(
                        name='Accounts Receivable',
                        code='AR001',
                        account_type='asset',
                        parent_category='current_assets'
                    )
                
                # Debit Cash
                LedgerEntries.objects.create(
                    account=cash_account,
                    entry_type='debit',
                    amount=instance.amount,
                    description=f"Payment from {instance.customer_invoice.customer.name}",
                    payment=instance,
                    reference_number=instance.payment_number,
                    transaction_date=instance.payment_date
                )
                
                # Credit Accounts Receivable
                LedgerEntries.objects.create(
                    account=accounts_receivable,
                    entry_type='credit',
                    amount=instance.amount,
                    description=f"Payment from {instance.customer_invoice.customer.name}",
                    payment=instance,
                    reference_number=instance.payment_number,
                    transaction_date=instance.payment_date
                )
                
                # Update customer invoice paid amount
                instance.customer_invoice.paid_amount += instance.amount
                instance.customer_invoice.calculate_balance()
