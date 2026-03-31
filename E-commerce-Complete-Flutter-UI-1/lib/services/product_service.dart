import '../models/product.dart';
import 'api_client.dart';

class ProductService {
  ProductService({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();

  final ApiClient _apiClient;

  Future<List<Product>> fetchProducts({
    int page = 1,
    int limit = 20,
    String? category,
    String? type,
    String? search,
    bool popularOnly = false,
  }) async {
    final params = {
      'page': page.toString(),
      'limit': limit.toString(),
      if (category != null) 'category': category,
      if (type != null) 'type': type,
      if (search != null && search.isNotEmpty) 'search': search,
      if (popularOnly) 'isPopular': 'true',
    };
    final response = await _apiClient.get('/products', queryParameters: params, requiresAuth: false);
    final data = response['data'];
    final list = data is List
        ? data
        : data?['products'] as List<dynamic>? ??
            data?['items'] as List<dynamic>? ??
            [];
    return list
        .whereType<Map<String, dynamic>>()
        .map(Product.fromJson)
        .toList();
  }

  Future<List<Product>> fetchSpecialOffers() async {
    final response =
        await _apiClient.get('/products', queryParameters: {'tag': 'special'}, requiresAuth: false);
    final data = response['data'];
    final list =
        data is List ? data : data?['products'] as List<dynamic>? ?? [];
    return list
        .whereType<Map<String, dynamic>>()
        .map(Product.fromJson)
        .toList();
  }

  Future<Product> fetchProductById(String id) async {
    final response = await _apiClient.get('/products/$id', requiresAuth: false);
    final data = response['data'] as Map<String, dynamic>? ?? {};
    final productJson = data['product'] as Map<String, dynamic>? ?? data;
    return Product.fromJson(productJson);
  }

  Future<List<Product>> searchProducts(String query) async {
    final response = await _apiClient.get(
      '/products/search',
      queryParameters: {'q': query},
      requiresAuth: false,
    );
    final data = response['data'];
    final list =
        data is List ? data : data?['products'] as List<dynamic>? ?? [];
    return list
        .whereType<Map<String, dynamic>>()
        .map(Product.fromJson)
        .toList();
  }

  Future<List<Product>> fetchRelatedProducts(String productId) async {
    final response = await _apiClient.get(
      '/products/$productId/related',
      queryParameters: {'limit': '5'},
      requiresAuth: false,
    );
    final data = response['data'];
    final list =
        data is List ? data : data?['products'] as List<dynamic>? ?? [];
    return list
        .whereType<Map<String, dynamic>>()
        .map(Product.fromJson)
        .toList();
  }
}
