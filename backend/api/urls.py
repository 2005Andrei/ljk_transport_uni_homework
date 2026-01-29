from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    path('auth/login/', views.PhoneTokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('transports/create/', views.create_transport, name='create_transport'),
    path('transports/<int:pk>/update/', views.update_transport, name='update_transport'),
    path('transports/<int:pk>/delete/', views.delete_transport, name='delete_transport'),
    
    path('transports/', views.list_transports, name='list_transports'),
    path('transports/<int:pk>/', views.get_transport, name='get_transport'),
]
