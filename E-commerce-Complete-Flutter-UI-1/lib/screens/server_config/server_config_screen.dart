import 'dart:async';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../../config/app_config.dart';
import '../../constants.dart';
import '../sign_in/sign_in_screen.dart';

/// First-time setup: user enters the server IP (same network as PC running backend).
/// Saved in SharedPreferences and used app-wide for all API calls.
class ServerConfigScreen extends StatefulWidget {
  static const String routeName = '/server-config';

  const ServerConfigScreen({super.key});

  @override
  State<ServerConfigScreen> createState() => _ServerConfigScreenState();
}

class _ServerConfigScreenState extends State<ServerConfigScreen> {
  static const String _defaultServer = '10.0.2.2:5000';

  final _controller = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _saving = false;
  bool _testing = false;
  String? _error;
  String? _info;
  String? _currentSavedServer;

  @override
  void initState() {
    super.initState();
    _loadCurrent();
  }

  void _loadCurrent() {
    final url = AppConfig.overrideBaseUrl;
    _currentSavedServer = url;
    if (url != null && url.isNotEmpty) {
      final host = url
          .replaceFirst('/api', '')
          .replaceFirst('http://', '')
          .replaceFirst('https://', '')
          .split('/')[0]
          .trim();
      if (host.isNotEmpty) _controller.text = host;
    }
    if (_controller.text.isEmpty) {
      _controller.text = _defaultServer;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _saveAndContinue() async {
    _error = null;
    _info = null;
    if (!_formKey.currentState!.validate()) return;

    final input = _controller.text.trim();
    if (input.isEmpty) {
      setState(() => _error = 'Please enter server IP address');
      return;
    }

    setState(() => _saving = true);

    final baseUrl = _buildBaseUrl(input);
    final ok = await _checkServerReachable(baseUrl);
    if (!ok) {
      if (!mounted) return;
      setState(() {
        _saving = false;
        _error =
            'Cannot reach server at $baseUrl.\nCheck internet connection and that the server URL is correct.';
      });
      return;
    }
    await AppConfig.setOverride(baseUrl);

    if (!mounted) return;
    setState(() => _saving = false);

    Navigator.pushNamedAndRemoveUntil(
      context,
      SignInScreen.routeName,
      (route) => false,
    );
  }

  String _buildBaseUrl(String rawInput) {
    final input = rawInput.trim();
    final host = input
        .replaceFirst('http://', '')
        .replaceFirst('https://', '')
        .split('/')[0]
        .trim();

    final hasScheme = input.startsWith('http://') || input.startsWith('https://');
    if (hasScheme) {
      final normalized = input.endsWith('/api')
          ? input
          : input.endsWith('/api/')
              ? input.substring(0, input.length - 1)
              : '${input.replaceAll(RegExp(r"/+$"), "")}/api';
      return normalized;
    }

    final isIpv4 = RegExp(r'^\d{1,3}(\.\d{1,3}){3}$').hasMatch(host);
    if (host.contains(':')) {
      return 'http://$host/api';
    }
    if (isIpv4) {
      return 'http://$host:5000/api';
    }
    // Domain without scheme: default to HTTPS for hosted APIs.
    return 'https://$host/api';
  }

  Future<bool> _checkServerReachable(String baseUrl) async {
    try {
      final uri = Uri.parse('$baseUrl/health');
      final response = await http.get(uri).timeout(const Duration(seconds: 4));
      return response.statusCode >= 200 && response.statusCode < 300;
    } on TimeoutException {
      return false;
    } catch (_) {
      return false;
    }
  }

  Future<void> _testConnectionOnly() async {
    setState(() {
      _error = null;
      _info = null;
    });
    final input = _controller.text.trim();
    if (input.isEmpty) {
      setState(() => _error = 'Enter server IP first');
      return;
    }
    final baseUrl = _buildBaseUrl(input);
    setState(() => _testing = true);
    final ok = await _checkServerReachable(baseUrl);
    if (!mounted) return;
    setState(() {
      _testing = false;
      if (ok) {
        _info = 'Server reachable: $baseUrl';
      } else {
        _error = 'Server not reachable: $baseUrl';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SizedBox(height: 48),
                      Icon(
                        Icons.settings_ethernet,
                        size: 64,
                        color: kPrimaryColor,
                      ),
                      const SizedBox(height: 24),
                      const Text(
                        'Set server address',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Enter your backend server IP/domain.\n\nFor hosted production, use the deployed domain.\nFor local PC server, use your computer IPv4 and same Wi‑Fi.',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey.shade700,
                          height: 1.4,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 32),
                      if (_currentSavedServer != null &&
                          _currentSavedServer!.isNotEmpty) ...[
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.green.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: Colors.green.withValues(alpha: 0.25),
                            ),
                          ),
                          child: Text(
                            'Current server: $_currentSavedServer',
                            style: const TextStyle(fontSize: 12),
                          ),
                        ),
                        const SizedBox(height: 12),
                      ],
                      TextFormField(
                        controller: _controller,
                        decoration: const InputDecoration(
                          labelText: 'Server IP or domain',
                          hintText: 'e.g. 10.0.2.2:5000 or 192.168.1.10',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.computer),
                        ),
                        keyboardType: TextInputType.url,
                        validator: (value) {
                          final v = value?.trim() ?? '';
                          if (v.isEmpty) return 'Enter server IP';
                          return null;
                        },
                      ),
                      const SizedBox(height: 10),
                      SizedBox(
                        height: 46,
                        child: OutlinedButton(
                          onPressed:
                              (_saving || _testing) ? null : _testConnectionOnly,
                          child: _testing
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2),
                                )
                              : const Text('Test Connection'),
                        ),
                      ),
                      if (_info != null) ...[
                        const SizedBox(height: 8),
                        Text(
                          _info!,
                          style: const TextStyle(
                              color: Colors.green, fontSize: 12),
                        ),
                      ],
                      if (_error != null) ...[
                        const SizedBox(height: 12),
                        Text(
                          _error!,
                          style: const TextStyle(
                              color: Colors.red, fontSize: 13),
                        ),
                      ],
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
                child: SizedBox(
                  height: 52,
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _saving ? null : _saveAndContinue,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: kPrimaryColor,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: _saving
                        ? const SizedBox(
                            height: 24,
                            width: 24,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : const Text(
                            'Save & Continue',
                            style: TextStyle(
                              fontSize: 18,
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
