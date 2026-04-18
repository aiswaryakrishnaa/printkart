import 'dart:convert';

import '../models/customization_request.dart';
import 'api_client.dart';

class CustomizationService {
  final ApiClient _apiClient = ApiClient();

  /// Calculate price for packaging/printing config. No auth required.
  Future<Map<String, dynamic>> calculatePrice(Map<String, dynamic> body) async {
    final response = await _apiClient.post(
      '/customizations/calculate-price',
      body: body,
      requiresAuth: false,
    );
    return response['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> submitCustomization({
    required String productType,
    required String requirements,
    String? filePath,
    String? productLine,
    Map<String, dynamic>? configOptions,
    int? quantity,
    double? amount,
    double? paperPrice,
    double? printingCharge,
    double? dieCutting,
    bool dummyPaymentSucceeded = false,
  }) async {
    final fields = <String, String>{
      'productType': productType,
      'requirements': requirements,
    };
    if (productLine != null) fields['productLine'] = productLine;
    if (configOptions != null) fields['configOptions'] = jsonEncode(configOptions);
    if (quantity != null) fields['quantity'] = quantity.toString();
    if (amount != null) fields['amount'] = amount.toString();
    if (paperPrice != null) fields['paperPrice'] = paperPrice.toString();
    if (printingCharge != null) fields['printingCharge'] = printingCharge.toString();
    if (dieCutting != null) fields['dieCutting'] = dieCutting.toString();
    if (dummyPaymentSucceeded) {
      fields['dummyPaymentSucceeded'] = 'true';
    }

    final files = filePath != null ? {'file': filePath} : null;

    return _apiClient.postMultipart(
      '/customizations',
      fields: fields,
      files: files,
    );
  }

  Future<List<CustomizationRequest>> fetchMyCustomizations() async {
    final response = await _apiClient.get('/customizations');
    final data = response['data'];
    if (data is! List) return [];
    return data
        .whereType<Map<String, dynamic>>()
        .map(CustomizationRequest.fromJson)
        .toList();
  }
}
