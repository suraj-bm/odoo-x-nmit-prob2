from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.user_profile, name='user_profile'),
    path('roles/', views.user_roles_info, name='user_roles_info'),
    path('by-role/<str:role>/', views.users_by_role, name='users_by_role'),
    path('check-username/', views.check_username, name='check_username'),

]