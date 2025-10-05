from rest_framework.routers import DefaultRouter
from .views import PurchaseOrderViewSet,  SalesOrderViewSet,  TransactionViewSet, dashboard_data, purchase_list, purchase_create, purchase_edit, purchase_delete
from django.urls import path, include
from . import views


router = DefaultRouter()
router.register(r'purchase-orders', PurchaseOrderViewSet)
router.register(r'sales-orders', SalesOrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path("purchases/", views.purchase_list, name="purchase_list"),
    path("purchases/new/", views.purchase_create, name="purchase_create"),
    path("purchases/<int:pk>/edit/", views.purchase_edit, name="purchase_edit"),
    path("purchases/<int:pk>/delete/", views.purchase_delete, name="purchase_delete"),
    path('dashboard-data/', dashboard_data, name='dashboard-data'),

]
