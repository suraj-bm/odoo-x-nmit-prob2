from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StockLedgerViewSet, LedgerEntriesViewSet, ReportsViewSet
)

router = DefaultRouter()
router.register(r'stock-ledger', StockLedgerViewSet)
router.register(r'ledger-entries', LedgerEntriesViewSet)
router.register(r'reports', ReportsViewSet, basename='reports')

urlpatterns = [
    path('', include(router.urls)),
]
