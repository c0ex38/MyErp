from django.db import models
from django.conf import settings
from company.models import Company
from product.models import Product
from datetime import timedelta
from django.utils.timezone import now

def default_delivery_date():
    return now().date() + timedelta(days=4)

class Order(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='orders')
    delivery_date = models.DateField(default=default_delivery_date)
    created_at = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    # Ek alanlar
    global_discount = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # örn: 20.00
    vat_rate = models.DecimalField(max_digits=5, decimal_places=2, default=20)        # örn: 20.00
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    vat_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.company.name} - {self.total}₺"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    item_discount = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # % oran

    def __str__(self):
        return f"{self.product.name} x{self.quantity}"
