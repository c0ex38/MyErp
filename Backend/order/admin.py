from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'unit_price', 'item_discount')
    can_delete = False

class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'company', 'total', 'delivery_date', 'created_at', 'owner')
    list_filter = ('company', 'delivery_date')
    search_fields = ('company__name', 'owner__username')
    readonly_fields = (
        'subtotal', 'discount_amount', 'vat_amount', 'total',
        'created_at', 'owner'
    )
    inlines = [OrderItemInline]

admin.site.register(Order, OrderAdmin)
admin.site.register(OrderItem)
