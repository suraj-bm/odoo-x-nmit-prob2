from django.shortcuts import render
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from .models import PurchaseOrder
from master.models import Contact
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import PurchaseOrder,  SalesOrder,  Transaction
from .serializers import (
    PurchaseOrderSerializer, 
    SalesOrderSerializer,  TransactionSerializer
)
from accounts.permissions import OwnerOrAccountantPermission
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import api_view, permission_classes






class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # skip CSRF for JWT


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsAuthenticated, OwnerOrAccountantPermission]



class SalesOrderViewSet(viewsets.ModelViewSet):
    queryset = SalesOrder.objects.all()
    serializer_class = SalesOrderSerializer
    permission_classes = [IsAuthenticated, OwnerOrAccountantPermission]






class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated, OwnerOrAccountantPermission]
def is_owner(user):
    return user.groups.filter(name="Owner").exists()

# Check if user is accountant
def is_accountant(user):
    return user.groups.filter(name="Accountant").exists()

def purchase_list(request):
    purchases = PurchaseOrder.objects.all()
    return render(request, "transaction/purchase_list.html", {"purchases": purchases})

@user_passes_test(lambda u: is_owner(u) or is_accountant(u))
def purchase_create(request):
    if request.method == "POST":
        vendor_id = request.POST.get("vendor")
        vendor = Contact.objects.get(id=vendor_id)
        purchase = PurchaseOrder.objects.create(
            vendor=vendor,
            order_date=timezone.now(),
            status="draft"
        )
        return redirect("purchase_list")
    vendors = Contact.objects.filter(type__in=["vendor", "both"])
    return render(request, "transaction/purchase_form.html", {"vendors": vendors})

@user_passes_test(is_owner)  # only owner can delete
def purchase_delete(request, pk):
    purchase = get_object_or_404(PurchaseOrder, pk=pk)
    purchase.delete()
    return redirect("purchase_list")

@user_passes_test(is_owner)  # only owner can edit
def purchase_edit(request, pk):
    purchase = get_object_or_404(PurchaseOrder, pk=pk)
    if request.method == "POST":
        purchase.status = request.POST.get("status", purchase.status)
        purchase.save()
        return redirect("purchase_list")
    return render(request, "transaction/purchase_edit.html", {"purchase": purchase})




from django.db.models import Sum
from django.db.models.functions import TruncMonth
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import PurchaseOrder, SalesOrder
import calendar
from django.http import JsonResponse
from django.db.models import F, FloatField, ExpressionWrapper
from django.db.models.functions import ExtractMonth


from django.db.models import F, Sum, FloatField, ExpressionWrapper
from django.db.models.functions import ExtractMonth, Coalesce
from django.http import JsonResponse
from .models import SalesOrder, PurchaseOrder
from django.db.models.functions import Cast, ExtractMonth, Coalesce
from django.db.models import F, Sum, FloatField, ExpressionWrapper


@api_view(["GET"])
def dashboard_data(request):
    # Fetch purchases and sales
    purchases = PurchaseOrder.objects.all().values("order_date", "total_amount")
    sales = SalesOrder.objects.prefetch_related("items").all()

    # Serialize sales manually (total per order)
    sales_serialized = []
    for so in sales:
        total_amount = sum([item.quantity * float(item.unit_price) * (1 + float(item.tax_percent)/100) for item in so.items.all()])
        sales_serialized.append({
            "order_date": so.order_date,
            "total_amount": total_amount
        })

    # Convert QuerySet to list for frontend
    return Response({
        "purchases": list(purchases),
        "sales": sales_serialized
    })