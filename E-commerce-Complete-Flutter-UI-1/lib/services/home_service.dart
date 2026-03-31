import '../models/product.dart';
import '../models/category.dart';
import 'api_client.dart';

class HomeService {
  HomeService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  final ApiClient _apiClient;

  Future<List<Category>> fetchCategories({String? type}) async {
    try {
      final response = await _apiClient.get(
        '/categories',
        queryParameters: type != null ? {'type': type} : null,
        requiresAuth: false,
      );
      final data = response['data'];
      final list =
          data is List ? data : data?['categories'] as List<dynamic>? ?? [];
      return list
          .whereType<Map<String, dynamic>>()
          .map(Category.fromJson)
          .toList();
    } catch (e) {
      return []; // Return empty list on error
    }
  }

  Future<List<Product>> fetchSpecialOffers() async {
    try {
      final response = await _apiClient
          .get('/products', queryParameters: {'tag': 'special'}, requiresAuth: false);
      final data = response['data'];
      final list =
          data is List ? data : data?['products'] as List<dynamic>? ?? [];
      return list
          .whereType<Map<String, dynamic>>()
          .map(Product.fromJson)
          .toList();
    } catch (e) {
      return []; // Return empty list on error
    }
  }

  Future<List<Product>> fetchPopularProducts() async {
    try {
      final response = await _apiClient
          .get('/products', queryParameters: {'sortBy': 'soldCount', 'sortOrder': 'desc', 'limit': '10'}, requiresAuth: false);
      final data = response['data'];
      final list =
          data is List ? data : data?['products'] as List<dynamic>? ?? [];
      return list
          .whereType<Map<String, dynamic>>()
          .map(Product.fromJson)
          .toList();
    } catch (e) {
      return []; // Return empty list on error
    }
  }

  Future<List<Product>> fetchProductsByCategory(int categoryId) async {
    try {
      final response = await _apiClient
          .get('/categories/$categoryId/products', requiresAuth: false);
      final data = response['data'];
      final list =
          data is List ? data : data?['products'] as List<dynamic>? ?? [];
      return list
          .whereType<Map<String, dynamic>>()
          .map(Product.fromJson)
          .toList();
    } catch (e) {
      return []; // Return empty list on error
    }
  }

  Future<Map<String, dynamic>> fetchPromotions() async {
    try {
      final response = await _apiClient.get('/promotions/available');
      final data = response['data'];
      if (data is Map<String, dynamic>) return data;
      if (data is List &&
          data.isNotEmpty &&
          data.first is Map<String, dynamic>) {
        return data.first as Map<String, dynamic>;
      }
      return {};
    } catch (e) {
      return {}; // Return empty map on error
    }
  }
}
