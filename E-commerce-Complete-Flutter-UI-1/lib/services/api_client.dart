import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/app_config.dart';
import '../models/api_exception.dart';
import 'auth_storage.dart';

class ApiClient {
  ApiClient({http.Client? httpClient})
      : _httpClient = httpClient ?? http.Client();

  final http.Client _httpClient;
  final AuthStorage _authStorage = AuthStorage.instance;

  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    bool requiresAuth = true,
  }) async {
    return _send(
      'GET',
      path,
      queryParameters: queryParameters,
      requiresAuth: requiresAuth,
    );
  }

  Future<Map<String, dynamic>> post(
    String path, {
    Map<String, dynamic>? queryParameters,
    Object? body,
    bool requiresAuth = true,
  }) async {
    return _send(
      'POST',
      path,
      queryParameters: queryParameters,
      body: body,
      requiresAuth: requiresAuth,
    );
  }

  Future<Map<String, dynamic>> put(
    String path, {
    Object? body,
    bool requiresAuth = true,
  }) async {
    return _send(
      'PUT',
      path,
      body: body,
      requiresAuth: requiresAuth,
    );
  }

  Future<Map<String, dynamic>> delete(
    String path, {
    Object? body,
    bool requiresAuth = true,
  }) async {
    return _send(
      'DELETE',
      path,
      body: body,
      requiresAuth: requiresAuth,
    );
  }

  Future<Map<String, dynamic>> postMultipart(
    String path, {
    Map<String, String>? fields,
    Map<String, String>? files,
    bool requiresAuth = true,
  }) async {
    final uri = Uri.parse('${AppConfig.baseUrl}$path');
    final request = http.MultipartRequest('POST', uri);

    final headers = <String, String>{
      'Accept': 'application/json',
    };

    final token = _authStorage.accessToken;
    if (requiresAuth && token != null) {
      headers['Authorization'] = 'Bearer $token';
    }

    request.headers.addAll(headers);
    if (fields != null) request.fields.addAll(fields);

    if (files != null) {
      for (final entry in files.entries) {
        request.files.add(await http.MultipartFile.fromPath(entry.key, entry.value));
      }
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    final decoded = _decodeResponse(response);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException.fromJson(
        statusCode: response.statusCode,
        body: decoded,
      );
    }

    return decoded;
  }

  Future<Map<String, dynamic>> _send(
    String method,
    String path, {
    Map<String, dynamic>? queryParameters,
    Object? body,
    bool requiresAuth = true,
    bool retrying = false,
  }) async {
    final uri = Uri.parse('${AppConfig.baseUrl}$path').replace(
      queryParameters: queryParameters?.map(
        (key, value) => MapEntry(key, value?.toString()),
      ),
    );

    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    };

    final token = _authStorage.accessToken;
    if (requiresAuth && token != null) {
      headers['Authorization'] = 'Bearer $token';
    }

    http.Response response;
    try {
      switch (method) {
        case 'POST':
          response = await _httpClient.post(
            uri,
            headers: headers,
            body: body == null ? null : jsonEncode(body),
          );
          break;
        case 'PUT':
          response = await _httpClient.put(
            uri,
            headers: headers,
            body: body == null ? null : jsonEncode(body),
          );
          break;
        case 'DELETE':
          response = await _httpClient.delete(
            uri,
            headers: headers,
            body: body == null ? null : jsonEncode(body),
          );
          break;
        default:
          response = await _httpClient.get(uri, headers: headers);
      }
    } catch (error) {
      throw ApiException(
        statusCode: -1,
        message: 'Network error: $error',
      );
    }

    if (response.statusCode == 401 && requiresAuth && !retrying) {
      final refreshed = await _refreshToken();
      if (refreshed) {
        return _send(
          method,
          path,
          queryParameters: queryParameters,
          body: body,
          requiresAuth: requiresAuth,
          retrying: true,
        );
      }
    }

    final decoded = _decodeResponse(response);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException.fromJson(
        statusCode: response.statusCode,
        body: decoded,
      );
    }

    return decoded;
  }

  Map<String, dynamic> _decodeResponse(http.Response response) {
    if (response.body.isEmpty) return {};
    return jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
  }

  Future<bool> _refreshToken() async {
    final refreshToken = _authStorage.refreshToken;
    if (refreshToken == null) return false;

    try {
      final res = await post(
        '/auth/refresh',
        body: {'refreshToken': refreshToken},
        requiresAuth: false,
      );
      final data = res['data'] as Map<String, dynamic>?;
      final token = data?['token'] as String?;
      final newRefresh = data?['refreshToken'] as String? ?? refreshToken;
      if (token != null) {
        await _authStorage.saveTokens(
          accessToken: token,
          refreshToken: newRefresh,
        );
        return true;
      }
    } catch (_) {
      await _authStorage.clearTokens();
    }
    return false;
  }
}
