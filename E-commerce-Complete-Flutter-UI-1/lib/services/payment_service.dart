import 'api_client.dart';

class PaymentIntent {
  PaymentIntent({
    required this.id,
    required this.clientSecret,
    required this.amount,
    required this.currency,
    required this.status,
    this.orderId,
  });

  final String id;
  final String clientSecret;
  final double amount;
  final String currency;
  final String status;
  final String? orderId;

  factory PaymentIntent.fromJson(Map<String, dynamic> json) {
    return PaymentIntent(
      id: json['id'] as String? ?? '',
      clientSecret: json['clientSecret'] as String? ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency'] as String? ?? 'USD',
      status: json['status'] as String? ?? 'requires_payment_method',
      orderId: json['orderId'] as String?,
    );
  }
}

class PaymentService {
  PaymentService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  final ApiClient _apiClient;

  /// Create a payment intent for an existing order
  Future<PaymentIntent> createPaymentIntent({
    required String orderId,
    double? amount,
  }) async {
    final response = await _apiClient.post(
      '/payments/create-intent',
      body: {
        'orderId': orderId,
        if (amount != null) 'amount': amount,
      },
    );
    final data = response['data'] as Map<String, dynamic>? ?? {};
    final intentJson = data['paymentIntent'] as Map<String, dynamic>? ?? {};
    return PaymentIntent.fromJson(intentJson);
  }

  /// Confirm payment for an existing order
  Future<Map<String, dynamic>> confirmPayment({
    required String orderId,
    required String paymentId,
    required String paymentMethod,
  }) async {
    final response = await _apiClient.post(
      '/payments/confirm',
      body: {
        'orderId': orderId,
        'paymentId': paymentId,
        'paymentMethod': paymentMethod,
      },
    );
    return response['data'] as Map<String, dynamic>? ?? {};
  }

  /// Place order with payment (combined endpoint - recommended for demo)
  Future<Map<String, dynamic>> placeOrderWithPayment({
    List<Map<String, dynamic>>? items,
    required Map<String, dynamic> shippingAddress,
    Map<String, dynamic>? billingAddress,
    required String paymentMethod,
    String? shippingMethod,
    String? couponCode,
    String? paymentId,
  }) async {
    final response = await _apiClient.post(
      '/payments/place-order',
      body: {
        if (items != null && items.isNotEmpty) 'items': items,
        'shippingAddress': shippingAddress,
        if (billingAddress != null) 'billingAddress': billingAddress,
        'paymentMethod': paymentMethod,
        if (shippingMethod != null) 'shippingMethod': shippingMethod,
        if (couponCode != null && couponCode.isNotEmpty)
          'couponCode': couponCode,
        if (paymentId != null) 'paymentId': paymentId,
      },
    );
    return response['data'] as Map<String, dynamic>? ?? {};
  }

  /// Get payment status by payment ID
  Future<Map<String, dynamic>> getPaymentStatus(String paymentId) async {
    final response = await _apiClient.get('/payments/$paymentId/status');
    return response['data'] as Map<String, dynamic>? ?? {};
  }

  /// Process refund for an order
  Future<Map<String, dynamic>> processRefund({
    required String orderId,
    double? amount,
    String? reason,
  }) async {
    final response = await _apiClient.post(
      '/payments/refund',
      body: {
        'orderId': orderId,
        if (amount != null) 'amount': amount,
        if (reason != null && reason.isNotEmpty) 'reason': reason,
      },
    );
    return response['data'] as Map<String, dynamic>? ?? {};
  }
}

