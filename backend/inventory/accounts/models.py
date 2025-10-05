from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    OWNER = 'owner'
    ACCOUNTANT = 'accountant'

    ROLE_CHOICES = [
        (OWNER, 'Business Owner'),
        (ACCOUNTANT, 'Accountant'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ACCOUNTANT)

    def __str__(self):
        return f"{self.username} ({self.role})"

    def is_owner(self):
        return self.role == self.OWNER

    def is_accountant(self):
        return self.role == self.ACCOUNTANT
