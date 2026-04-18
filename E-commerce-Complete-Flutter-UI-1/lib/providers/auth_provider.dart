import 'dart:async';

import 'package:flutter/foundation.dart';

import '../models/api_exception.dart';
import '../models/user.dart';
import '../services/api_client.dart';
import '../services/auth_storage.dart';

class AuthProvider extends ChangeNotifier {
  AuthProvider({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  final ApiClient _apiClient;
  final AuthStorage _storage = AuthStorage.instance;

  UserProfile? _user;
  bool _loading = false;
  String? _lastError;

  UserProfile? get user => _user;
  bool get isLoading => _loading;
  bool get isAuthenticated => _storage.accessToken != null;
  String? get lastError => _lastError;  

  Future<void> bootstrap() async {
    if (!isAuthenticated) return;
    try {
      await loadProfile();
    } catch (_) {
      await logout();
    }
  }
 
  Future<void> login({
    String? email,
    String? phone,
    required String password,
  }) async {
    _setLoading(true);
    _lastError = null;
    try {
      final body = {
        if (email != null && email.isNotEmpty) 'email': email,
        if (phone != null && phone.isNotEmpty) 'phone': phone,
        'password': password,
      };
      final response = await _apiClient.post(
        '/auth/login',
        body: body,
        requiresAuth: false,
      );
      await _handleAuthResponse(response);
    } on ApiException catch (error) {
      _lastError = error.message;
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> register({
    required String fullName,
    required String email,
    required String phone,
    required String password,
  }) async {
    _setLoading(true);
    _lastError = null;
    
    try {
      final response = await _apiClient.post(
        '/auth/register',
        body: {
          'fullName': fullName,
          'email': email,  
          'phone': phone,
          'password': password,
        },
        requiresAuth: false,
      );
      await _handleAuthResponse(response);
    } on ApiException catch (error) {
      _lastError = error.message;
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadProfile() async {
    if (!isAuthenticated) return;
     try {
      final response = await _apiClient.get('/users/profile');
      final userJson = response['data']?['user'] as Map<String, dynamic>? ??
          response['data'];
      if (userJson != null) {
        _user = UserProfile.fromJson(userJson);
        notifyListeners();
      }
    } catch (error) {
      // If profile loading fails, don't throw - user is still logged in
      print('Failed to load profile: $error');
      // User remains authenticated even if profile fails
    }
  }

  Future<void> updateProfile({
    String? fullName,
    String? phone,
    String? email,
    String? avatar,
  }) async {
    _setLoading(true);
    try {
      final response = await _apiClient.put(
        '/users/profile',
        body: {
          if (fullName != null) 'fullName': fullName,
          if (phone != null) 'phone': phone,
          if (email != null) 'email': email,
          if (avatar != null) 'profilePicture': avatar,
          
        },
      );
      final userJson = response['data']?['user'] as Map<String, dynamic>?;
      if (userJson != null) {
        _user = UserProfile.fromJson(userJson);
      }
    } finally {
      _setLoading(false);
    }
    notifyListeners();
  }

  Future<void> sendOtp({required String destination}) async {
    await _apiClient.post(
      '/auth/send-otp',
      body: destination.contains('@')
          ? {'email': destination}
          : {'phone': destination},
      requiresAuth: false,
    );
  }

  Future<void> verifyOtp({
    String? email,
    String? phone,
    required String otp,
  }) async {
    await _apiClient.post(
      '/auth/verify-otp',
      body: {
        if (email != null) 'email': email,
        if (phone != null) 'phone': phone,
        'otp': otp,
      },
      requiresAuth: false,
    );
  }  

  Future<void> requestPasswordReset(String email) async {
    await _apiClient.post(
      '/auth/forgot-password',
      body: {'email': email},
      requiresAuth: false,
    );
  }

  Future<void> resetPassword({
    required String token,  
    required String newPassword,
  }) async {
    await _apiClient.post(
      '/auth/reset-password',
      body: {
        'token': token,
        'password': newPassword,
      },
      requiresAuth: false,
    );
  }

  Future<void> logout() async {
    final access = _storage.accessToken;
    final refresh = _storage.refreshToken;

    // Clear locally first so the UI is not blocked by network latency or timeouts.
    await _storage.clearTokens();
    _user = null;
    notifyListeners();

    if (access != null && access.isNotEmpty) {
      unawaited(
        _apiClient.logoutWithToken(
          accessToken: access,
          refreshToken: refresh,
        ),
      );
    }
  }

  Future<void> _handleAuthResponse(Map<String, dynamic> response) async {
    final data = response['data'] as Map<String, dynamic>? ?? {};
    final token = data['token'] as String?;
    final refreshToken = data['refreshToken'] as String?;

    if (token == null || token.isEmpty) {
      throw Exception('No token received from server');
    }

    await _storage.saveTokens(
      accessToken: token,
      refreshToken: refreshToken ?? '',
    );

    // Try to load profile, but don't fail if it doesn't work
    try {
      await loadProfile();
    } catch (error) {
      // Profile loading failed, but login is still successful
      // We'll try to load it again later
      print('Profile loading failed: $error');
    }
  }
  

  void _setLoading(bool value) {
    _loading = value;
    notifyListeners();
  }
}
