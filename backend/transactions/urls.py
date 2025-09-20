from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PurchaseOrderViewSet, PurchaseOrderItemViewSet, VendorBillViewSet,
    SalesOrderViewSet, SalesOrderItemViewSet, CustomerInvoiceViewSet,
    PaymentViewSet
)

router = DefaultRouter()
router.register(r'purchase-orders', PurchaseOrderViewSet)
router.register(r'purchase-order-items', PurchaseOrderItemViewSet)
router.register(r'vendor-bills', VendorBillViewSet)
router.register(r'sales-orders', SalesOrderViewSet)
router.register(r'sales-order-items', SalesOrderItemViewSet)
router.register(r'customer-invoices', CustomerInvoiceViewSet)
router.register(r'payments', PaymentViewSet)

from django.urls import path, include
from .views import (
    PurchaseOrderViewSet, PurchaseOrderItemViewSet, VendorBillViewSet,
    SalesOrderViewSet, SalesOrderItemViewSet, CustomerInvoiceViewSet,
    PaymentViewSet, dashboard_kpi, revenue_expense_chart, recent_transactions
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'purchase-orders', PurchaseOrderViewSet)
router.register(r'purchase-order-items', PurchaseOrderItemViewSet)
router.register(r'vendor-bills', VendorBillViewSet)
router.register(r'sales-orders', SalesOrderViewSet)
router.register(r'sales-order-items', SalesOrderItemViewSet)
router.register(r'customer-invoices', CustomerInvoiceViewSet)
router.register(r'payments', PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/kpi/', dashboard_kpi, name='dashboard_kpi'),
    path('dashboard/revenue-expense/', revenue_expense_chart, name='revenue_expense_chart'),
    path('dashboard/recent-transactions/', recent_transactions, name='recent_transactions'),
]
