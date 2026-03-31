import '../models/order.dart';
import 'api_client.dart';

class OrderService {
  final ApiClient _apiClient;

  OrderService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<List<Order>> fetchOrders() async {
    final response = await _apiClient.get('/orders', requiresAuth: true);
    final data = response['data']?['orders'] as List?;
    if (data == null) return [];
    return data.map((json) => Order.fromJson(json)).toList();
  }

  Future<void> placeOrderWithPayment({
    required List<Map<String, dynamic>> items,
    required Map<String, dynamic> shippingAddress,
    required Map<String, dynamic> billingAddress,
    required String paymentMethod,
    required String shippingMethod,
  }) async {
    await _apiClient.post(
      '/orders/create',
      body: {
        'items': items,
        'shippingAddress': shippingAddress,
        'billingAddress': billingAddress,
        'paymentMethod': paymentMethod,
        'shippingMethod': shippingMethod,
      },
      requiresAuth: true,
    );
  }
}
