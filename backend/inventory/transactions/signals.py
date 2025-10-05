
# same code as above
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import PurchaseOrder, SalesOrder, Transaction

@receiver(post_save, sender=PurchaseOrder)
def create_purchase_transaction(sender, instance, created, **kwargs):
    if created:
        Transaction.objects.create(
            transaction_type='purchase_order',
            related_object=instance,
            date=instance.order_date,
            amount=instance.calculate_total()
        )

@receiver(post_save, sender=SalesOrder)
def create_sales_transaction(sender, instance, created, **kwargs):
    if created:
        total_amount = sum([item.total for item in instance.items.all()])
        Transaction.objects.create(
            transaction_type='sales_order',
            related_object=instance,
            date=instance.order_date,
            amount=total_amount
        )
