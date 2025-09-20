from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import add_product_api
from .views import products_api # <-- import the view
from . import views
from .views import (
    ContactViewSet, ProductViewSet, ProductCategoryViewSet,
    TaxViewSet, ChartOfAccountsViewSet
)

router = DefaultRouter()
router.register(r'contacts', ContactViewSet)
router.register(r'products', ProductViewSet)
router.register(r'product-categories', ProductCategoryViewSet)
router.register(r'taxes', TaxViewSet)
router.register(r'chart-of-accounts', ChartOfAccountsViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('add-product/', add_product_api, name='add_product_api'),
        path('products/', products_api, name='products_api'),
         path('chart-of-accounts/', views.ChartOfAccountsListCreateAPIView.as_view(), name='chart-of-accounts-list'),
    path('chart-of-accounts/<int:pk>/', views.ChartOfAccountsRetrieveUpdateDestroyAPIView.as_view(), name='chart-of-accounts-detail'),


]
