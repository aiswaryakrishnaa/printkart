import 'dart:convert';

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

    final files = filePath != null ? {'file': filePath} : null;

    return _apiClient.postMultipart(
      '/customizations',
      fields: fields,
      files: files,
    );
  }

  Future<List<dynamic>> getMyCustomizations() async {
    final response = await _apiClient.get('/customizations');
    return response['data'] as List<dynamic>;
  }
}
