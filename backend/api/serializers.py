from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Transport
from phonenumber_field.serializerfields import PhoneNumberField

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    phone_number = PhoneNumberField()  

    class Meta:
        model = User
        fields = (
            'id',
            'phone_number',
            'first_name',
            'last_name',
            'email',
            'is_staff',
            'is_active',
            'date_joined',
            'last_login',
        )
        read_only_fields = ('id', 'date_joined', 'last_login', 'is_active', 'is_staff')


class UserMinimalSerializer(serializers.ModelSerializer):
    phone_number = PhoneNumberField()

    class Meta:
        model = User
        fields = ('id', 'phone_number', 'first_name', 'last_name')
        read_only_fields = fields


class TransportSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    address = serializers.DictField(read_only=True)
    status_display = serializers.CharField(read_only=True)
    
    # owner = ClientSeriolizer(read_only=True) - when I add client as a foreign key

    class Meta:
        model = Transport
        fields = (
            'id',
            'first_name',
            'last_name',
            'phone',
            'email',
            'leaving_address',
            'destination',
            'details',
            'content',
            'status',
            'status_display',
            'delivered_at',
            'cost',
            'created_at',
            'full_name',
            'address',
        )
        read_only_fields = (
            'id',
            'delivered_at',
            'created_at',
            'full_name',
            'address',
            'status_display',
        )

    def update(self, instance, validated_data):
        status = validated_data.get('status', instance.status)
        if status == Transport.Status.DELIVERED and instance.status == Transport.Status.IN_SHIPMENT:
            instance.mark_as_delivered()
            validated_data.pop('status', None)
        
        return super().update(instance, validated_data)


class TransportListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Transport
        fields = (
            'id',
            'full_name',
            'leaving_address',
            'destination',
            'status',
            'status_display',
            'cost',
            'created_at',
            'delivered_at',
        )
        read_only_fields = fields
