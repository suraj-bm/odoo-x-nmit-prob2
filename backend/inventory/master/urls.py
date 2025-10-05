from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContactViewSet, ProductViewSet, TaxViewSet, ChartOfAccountsViewSet

router = DefaultRouter()
router.register(r'contacts', ContactViewSet)
router.register(r'products', ProductViewSet)
router.register(r'taxes', TaxViewSet)
router.register(r'chart-of-accounts', ChartOfAccountsViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
