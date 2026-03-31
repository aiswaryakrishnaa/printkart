import 'product.dart';

class CartItem {
  CartItem({
    required this.id,
    required this.product,
    required this.quantity,
    required this.subtotal,
    this.variant,
  });

  final String id;
  final Product product;
  final int quantity;
  final double subtotal;
  final Map<String, dynamic>? variant;

  factory CartItem.fromJson(Map<String, dynamic> json) {
    final productJson =
        json['product'] as Map<String, dynamic>? ?? <String, dynamic>{};
    final quantity = (json['quantity'] as num?)?.toInt() ??
        (json['qty'] as num?)?.toInt() ??
        1;
    final price = (productJson['price'] as num? ?? 0).toDouble();

    return CartItem(
      id: '${json['id'] ?? json['_id'] ?? productJson['id'] ?? productJson['_id']}',
      product: Product.fromJson(productJson),
      quantity: quantity,
      subtotal: (json['subtotal'] as num?)?.toDouble() ??
          (json['total'] as num?)?.toDouble() ??
          (price * quantity),
      variant: json['variant'] as Map<String, dynamic>?,
    );
  }
}
