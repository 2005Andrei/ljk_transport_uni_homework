from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Transport
from phonenumber_field.serializerfields import PhoneNumberField

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    phone_number = PhoneNumberField()
    password1 = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = (
            'phone_number', 
            'email', 
            'first_name', 
            'last_name', 
            'password1', 
            'password2'
        )

    def validate(self, attrs):
        if attrs['password1'] != attrs['password2']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password1')
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user

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
    
    # owner = ClientSeriolizer(read_only=True) - when I add client as a foreign key

    class Meta:
        model = Transport
        fields = (
            'id',
            'first_name',
            'last_name',
            'email',
            'phone_number',
            'pickup',
            'destination',
            'details',
            'content',
            'status',
            'delivered_at',
            'cost',
            'created_at',
            'full_name',
            'address',
            'distance',
        )
        read_only_fields = (
            'id',
            'delivered_at',
            'created_at',
            'full_name',
            'address',
        )

    def update(self, instance, validated_data):
        status = validated_data.get('status', instance.status)
        if status == Transport.Status.DELIVERED and instance.status == Transport.Status.IN_SHIPMENT:
            instance.mark_as_delivered()
            validated_data.pop('status', None)
        
        return super().update(instance, validated_data)


class TransportListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='full_name', read_only=True)

    class Meta:
        model = Transport
        fields = (
            'id',
            'full_name',
            'pickup',
            'destination',
            'status',
            'cost',
            'created_at',
            'delivered_at',
        )
        read_only_fields = fields
