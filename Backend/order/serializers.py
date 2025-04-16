from rest_framework import serializers
from .models import Order, OrderItem
from product.models import Product
from company.models import Company
from decimal import Decimal


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_code = serializers.ReadOnlyField(source='product.code')

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_code',
            'quantity', 'unit_price', 'item_discount'
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    company_name = serializers.ReadOnlyField(source='company.name')

    class Meta:
        model = Order
        fields = [
            'id', 'company', 'company_name', 'delivery_date', 'created_at', 'owner',
            'global_discount', 'vat_rate',
            'subtotal', 'discount_amount', 'vat_amount', 'total',
            'items'
        ]
        read_only_fields = [
            'id', 'created_at', 'owner',
            'subtotal', 'discount_amount', 'vat_amount', 'total'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user
        validated_data.pop('owner', None)
        order = Order.objects.create(owner=user, **validated_data)

        subtotal = Decimal('0')

        # Ürünleri kaydet ve ara toplamı hesapla
        for item_data in items_data:
            quantity = item_data['quantity']
            price = item_data['unit_price']
            discount = item_data.get('item_discount', Decimal('0'))

            # Ürün bazlı indirim hesapla
            discounted_price = price - (price * discount / 100)
            subtotal += discounted_price * quantity

            OrderItem.objects.create(order=order, **item_data)

        # Genel iskonto ve KDV
        general_discount = order.global_discount
        discount_amount = subtotal * general_discount / 100
        discounted_total = subtotal - discount_amount
        vat_amount = discounted_total * order.vat_rate / 100
        total = discounted_total + vat_amount

        # Değerleri güncelle
        order.subtotal = subtotal
        order.discount_amount = discount_amount
        order.vat_amount = vat_amount
        order.total = total
        order.save()

        return order
