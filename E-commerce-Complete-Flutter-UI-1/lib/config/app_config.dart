import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:shared_preferences/shared_preferences.dart';

// Conditionally import Platform helper - only available on mobile/desktop
import 'app_config_mobile.dart' if (dart.library.html) 'app_config_web.dart'
    show platformCheckImpl;

const String _kApiBaseUrlKey = 'api_base_url';

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

  static const String _localNetworkIp =
      '192.168.1.14'; // Fallback; use "Set API URL" in app to set your PC IP

  static String get baseUrl {
    if (_overrideBaseUrl != null && _overrideBaseUrl!.isNotEmpty) {
      return _overrideBaseUrl!.endsWith('/api')
          ? _overrideBaseUrl!
          : '$_overrideBaseUrl/api';
    }

    const envUrl = String.fromEnvironment('API_BASE_URL');
    if (envUrl.isNotEmpty) return envUrl;

    if (kIsWeb) {
      return 'http://127.0.0.1:5000/api';
    }

    try {
      final isAndroid = platformCheckImpl();
      if (isAndroid) {
        if (_localNetworkIp.isNotEmpty) {
          return 'http://$_localNetworkIp:5000/api';
        }
        return 'http://10.0.2.2:5000/api';
      }
    } catch (_) {}

    return 'http://127.0.0.1:5000/api';
  }
}
