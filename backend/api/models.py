from django.db import models
from django.contrib.auth.models import AbstractUser
from phonenumber_field.modelfields import PhoneNumberField
from django.contrib.auth.models import UserManager
from django.utils import timezone

class User(AbstractUser):
    # abstract user inherits: username, password, first name, last name, email, is_staff, is_active, is_superuser, date_joined, last_login, groups, user_permissions
    username = None # replaced with phone number
    phone_number = PhoneNumberField(blank = False, null = False, unique = True, db_index = True)

    USERNAME_FIELD = 'phone_number'
    #REQUIRED_FIELDS = ['phone_number']
    
    objects = UserManager() # required to not crash the inbuilt user system because if you don't set this, the inbuilt django functions will still try to set username
    
    def __str__(self):
        return self.phone_number

class Transport(models.Model):
    class Status(models.IntegerChoices):
        DELIVERED = 0, 'Delivered'
        IN_SHIPMENT = 1, 'In Shipment'
    

    # will set ownership in the next phase of dev if the client requests this via defining a client model and setting owner = models.ForeignKey(cliet...)


    
    first_name = models.CharField(max_length=64, blank=False)
    last_name = models.CharField(max_length=64, blank=False)
    email = models.EmailField(max_length=254)
    leaving_address = models.CharField(max_length=256, blank=False)
    destination = models.CharField(max_length=256, blank=False)
    phone = models.CharField(max_length=20)
    
    details = models.JSONField(max_length=512, blank=True, default='')
    content = models.TextField(blank=True, default='')

    status = models.PositiveSmallIntegerField(
        choices = Status.choices,
        default = Status.IN_SHIPMENT,
        db_index = True,
    )

    delivered_at = models.DateTimeField(null=True, blank=True)
    
    cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=False,
    )

    created_at = models.DateTimeField(auto_now_add=True)

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
            "from": self.leaving_address,
            "to": self.destination,
        }

    def __str__(self):
        return f"Transport #{self.pk} – {self.full_name()} – ${self.cost}"
