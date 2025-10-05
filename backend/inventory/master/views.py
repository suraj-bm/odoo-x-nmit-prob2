from django.shortcuts import render


# Create your views here.
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Contact, Product, Tax, ChartOfAccounts
from .serializers import ContactSerializer, ProductSerializer, TaxSerializer, ChartOfAccountsSerializer
from accounts.permissions import OwnerOrAccountantPermission

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated, OwnerOrAccountantPermission]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, OwnerOrAccountantPermission]

class TaxViewSet(viewsets.ModelViewSet):
    queryset = Tax.objects.all()
    serializer_class = TaxSerializer
    permission_classes = [IsAuthenticated, OwnerOrAccountantPermission]

class ChartOfAccountsViewSet(viewsets.ModelViewSet):
    queryset = ChartOfAccounts.objects.all()
    serializer_class = ChartOfAccountsSerializer
    permission_classes = [IsAuthenticated, OwnerOrAccountantPermission]
