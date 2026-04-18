import 'package:flutter/foundation.dart' show kDebugMode, kIsWeb;
import 'package:shared_preferences/shared_preferences.dart';

const String _kApiBaseUrlKey = 'api_base_url';
const String _kHostedApiBaseUrl = 'https://my-node-project-three.vercel.app/api';
const String _kLocalDebugApiBaseUrl = 'http://10.0.2.2:5000/api';

class AppConfig {
  AppConfig._();

  /// Override from SharedPreferences (set in-app when using physical device).
  static String? _overrideBaseUrl;

  /// Load saved API URL override at startup. Call from main() before runApp().
  static Future<void> loadOverride() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _overrideBaseUrl = prefs.getString(_kApiBaseUrlKey);
    } catch (_) {
      _overrideBaseUrl = null;
    }
  }

  /// Set API base URL override (e.g. http://192.168.1.100:5000/api). Pass null to clear.
  static Future<void> setOverride(String? url) async {
    _overrideBaseUrl = url;
    try {
      final prefs = await SharedPreferences.getInstance();
      if (url == null) {
        await prefs.remove(_kApiBaseUrlKey);
      } else {
        await prefs.setString(_kApiBaseUrlKey, url);
      }
    } catch (_) {}
  }

  /// Current override if any (for display in UI).
  static String? get overrideBaseUrl => _overrideBaseUrl;

  static String get baseUrl {
    if (_overrideBaseUrl != null && _overrideBaseUrl!.isNotEmpty) {
      return _overrideBaseUrl!.endsWith('/api')
          ? _overrideBaseUrl!
          : '$_overrideBaseUrl/api';
    }

    const envUrl = String.fromEnvironment('API_BASE_URL');
    if (envUrl.isNotEmpty) return envUrl;

    // In debug mobile runs, prefer local backend (Android emulator loopback).
    // Users on real devices can override this from Server Config screen.
    if (!kIsWeb && kDebugMode) return _kLocalDebugApiBaseUrl;
    return _kHostedApiBaseUrl;
  }
}
