import 'package:flutter/foundation.dart';

import '../models/cart.dart';
import '../models/product.dart';
import '../services/api_client.dart';

class CartProvider extends ChangeNotifier {
  CartProvider({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  final ApiClient _apiClient;

  List<CartItem> _items = [];
  bool _loading = false;
  double _total = 0;

  List<CartItem> get items => _items;
  bool get isLoading => _loading;
  double get total => _total;
  int get totalItems => _items.fold<int>(0, (sum, item) => sum + item.quantity);

  Future<void> loadCart() async {
    // Schedule loading to avoid notification during build if called from create:
    await Future.microtask(() {});
    _setLoading(true);
    try {
      final response = await _apiClient.get('/cart');
      final data = response['data'] ?? {};
      final list =
          data['items'] ?? data['cartItems'] ?? data['cart']?['items'] ?? [];
      _items = (list as List<dynamic>)
          .whereType<Map<String, dynamic>>()
          .map(CartItem.fromJson)
          .toList();
      _total = (data['total'] as num?)?.toDouble() ??
          data['cart']?['total']?.toDouble() ??
          _items.fold(0, (sum, item) => sum + item.subtotal);
    } finally {
      _setLoading(false);
    }
    notifyListeners();
  }

  Future<void> addToCart({
    required Product product,
    int quantity = 1,
    Map<String, dynamic>? variant,
  }) async {
    await _apiClient.post('/cart/add', body: {
      'productId': product.id,
      'quantity': quantity,
      if (variant != null) 'variant': variant,
    });
    await loadCart();
  }

  Future<void> updateQuantity(String itemId, int quantity) async {
    await _apiClient.put('/cart/update/$itemId', body: {'quantity': quantity});
    await loadCart();
  }

  Future<void> removeItem(String itemId) async {
    await _apiClient.delete('/cart/remove/$itemId');
    await loadCart();
  }

  Future<void> clear() async {
    await _apiClient.delete('/cart/clear');
    await loadCart();
  }

  void _setLoading(bool value) {
    _loading = value;
    notifyListeners();
  }
}
