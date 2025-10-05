# accounts/permissions.py
from rest_framework.permissions import BasePermission

class OwnerOrAccountantPermission(BasePermission):
    """
    Owners → Full access (GET, POST, PUT, PATCH, DELETE)
    Accountants → Only GET + POST
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.user.role == 'owner':
            return True   # full CRUD
        elif request.user.role == 'accountant':
            return request.method in ['GET', 'POST']  # only Create + Read
        return False
