from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'code', 'price', 'created_at', 'owner']
        read_only_fields = ['id', 'created_at', 'owner']
