from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Transport
from .serializers import TransportSerializer

User = get_user_model()


class PhoneTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'phone_number'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['phone_number'] = self.fields.pop('username')


class PhoneTokenObtainPairView(TokenObtainPairView):
    serializer_class = PhoneTokenObtainPairSerializer


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def create_transport(request):
    serializer = TransportSerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_transport(request, pk):
    try:
        transport = Transport.objects.get(pk=pk)
    except Transport.DoesNotExist:
        return Response(
            {'error': 'Transport not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    partial = request.method == 'PATCH'
    serializer = TransportSerializer(transport, data=request.data, partial=partial)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_transport(request, pk):
    try:
        transport = Transport.objects.get(pk=pk)
    except Transport.DoesNotExist:
        return Response(
            {'error': 'Transport not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    transport.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_transports(request):
    transports = Transport.objects.all()
    serializer = TransportSerializer(transports, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transport(request, pk):
    try:
        transport = Transport.objects.get(pk=pk)
    except Transport.DoesNotExist:
        return Response(
            {'error': 'Transport not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = TransportSerializer(transport)
    return Response(serializer.data)
