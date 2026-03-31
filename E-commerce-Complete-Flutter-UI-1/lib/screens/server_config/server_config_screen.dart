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
      _controller.text = '192.168.1.14';
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
            'Cannot reach server at $baseUrl.\nCheck phone + PC are on same Wi‑Fi, correct IPv4, server running, and Windows Firewall allows port 5000.';
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
    final host = rawInput
        .replaceFirst('http://', '')
        .replaceFirst('https://', '')
        .split('/')[0]
        .trim();
    if (host.contains(':')) {
      return 'http://$host/api';
    }
    return 'http://$host:5000/api';
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
        child: LayoutBuilder(
          builder: (context, constraints) => SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: constraints.maxHeight),
              child: Form(
                key: _formKey,
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
                  'Enter the IP address of the computer where the backend server is running.\n\nConnect your phone to the same Wi‑Fi as that computer.',
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
                    labelText: 'Server IP address',
                    hintText: 'e.g. 192.168.1.14',
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
                    onPressed: (_saving || _testing) ? null : _testConnectionOnly,
                    child: _testing
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Test Connection'),
                  ),
                ),
                if (_info != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    _info!,
                    style: const TextStyle(color: Colors.green, fontSize: 12),
                  ),
                ],
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    _error!,
                    style: const TextStyle(color: Colors.red, fontSize: 13),
                  ),
                ],
                const Spacer(),
                SizedBox(
                  height: 52,
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
                const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
