from typing_extensions import Required
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from phonenumber_field.modelfields import PhoneNumberField
from django.contrib.auth.models import UserManager
from django.utils import timezone

class CustomUserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError('The Phone Number must be set')
        
        if 'email' in extra_fields:
            extra_fields['email'] = self.normalize_email(extra_fields['email'])
            
        user = self.model(phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(phone_number, password, **extra_fields)



class User(AbstractUser):
    # abstract user inherits: username, password, first name, last name, email, is_staff, is_active, is_superuser, date_joined, last_login, groups, user_permissions
    username = None # replaced with phone number
    phone_number = PhoneNumberField(blank = False, null = False, unique = True, db_index = True)


    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = CustomUserManager() # i was wrong

    def __str__(self):
        return self.phone_number


# ===================================================


class Transport(models.Model):
    class Status(models.IntegerChoices):
        DELIVERED = 0, 'Delivered'
        IN_SHIPMENT = 1, 'In Shipment'
       
    first_name = models.CharField(max_length=64, blank=False)
    last_name = models.CharField(max_length=64, blank=False)
    email = models.EmailField(max_length=254, blank=True)
    phone_number = PhoneNumberField(blank = False, null = False, db_index = True)
    pickup = models.CharField(max_length=256, blank=False)
    destination = models.CharField(max_length=256, blank=False)
    details = models.CharField(max_length=512, blank=True, default='')
    content = models.TextField(blank=True, default='')
    status = models.PositiveSmallIntegerField(choices = Status.choices, default = Status.IN_SHIPMENT, db_index = True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, blank=False)
    distance = models.DecimalField(max_digits=10, decimal_places=2, blank=False, default=100)

    created_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    def mark_as_delivered(self):
        if self.status == self.Status.IN_SHIPMENT:
            self.status = self.Status.DELIVERED
            self.delivered_at = timezone.now()
            self.save(update_fields = ['status', 'delivered_at'])


    class Meta:
        verbose_name = 'Transport Request'
        verbose_name_plural = 'Transport Requests'
        ordering = ['-created_at']

    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def address(self):
        return {
            "from": self.pickup,
            "to": self.destination,
        }

    def __str__(self):
        return f"Transport #{self.pk} – {self.full_name()} – ${self.cost}"
