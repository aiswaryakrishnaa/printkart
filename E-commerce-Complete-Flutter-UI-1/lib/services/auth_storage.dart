import 'package:shared_preferences/shared_preferences.dart';

class AuthStorage {
  AuthStorage._();

  static final AuthStorage instance = AuthStorage._();

  static const _kAccessTokenKey = 'access_token';
  static const _kRefreshTokenKey = 'refresh_token';

  SharedPreferences? _prefs;

  Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  String? get accessToken => _prefs?.getString(_kAccessTokenKey);

  String? get refreshToken => _prefs?.getString(_kRefreshTokenKey);

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _prefs?.setString(_kAccessTokenKey, accessToken);
    await _prefs?.setString(_kRefreshTokenKey, refreshToken);
  }

  Future<void> clearTokens() async {
    await _prefs?.remove(_kAccessTokenKey);
    await _prefs?.remove(_kRefreshTokenKey);
  }
}
