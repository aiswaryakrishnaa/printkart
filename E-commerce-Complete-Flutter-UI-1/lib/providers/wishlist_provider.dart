import 'package:flutter/foundation.dart';

import '../models/product.dart';
import '../services/api_client.dart';

class WishlistProvider extends ChangeNotifier {
  WishlistProvider({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();

  final ApiClient _apiClient;

  List<Product> _items = [];
  bool _loading = false;

  List<Product> get items => _items;
  bool get isLoading => _loading;

  Future<void> loadWishlist() async {
    await Future.microtask(() {});
    _setLoading(true);
    try {
      final response = await _apiClient.get('/wishlist');
      final data = response['data'];
      final wishlistData = data?['wishlist'];
      final products = data is List
          ? data
          : (data?['items'] as List<dynamic>? ??
              wishlistData?['items'] as List<dynamic>? ??
              []);
      _items = products
          .whereType<Map<String, dynamic>>()
          .map(Product.fromJson)
          .toList();
    } finally {
      _setLoading(false);
    }
    notifyListeners();
  }

  Future<void> toggle(Product product) async {
    final exists = _items.any((element) => element.id == product.id);
    if (exists) {
      await _apiClient.delete('/wishlist/remove/${product.id}');
      _items.removeWhere((element) => element.id == product.id);
    } else {
      await _apiClient.post('/wishlist/add', body: {'productId': product.id});
      _items = [..._items, product];
    }
    notifyListeners();
  }

  bool isFavourite(String productId) =>
      _items.any((product) => product.id == productId);

  void _setLoading(bool value) {
    _loading = value;
    notifyListeners();
  }
}
