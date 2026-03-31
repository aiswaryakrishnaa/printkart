import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../components/custom_surfix_icon.dart';
import '../../../components/form_error.dart';
import '../../../config/app_config.dart';
import '../../../constants.dart';
import '../../../helper/keyboard.dart';
import '../../../models/api_exception.dart';
import '../../../providers/auth_provider.dart';
import '../../../screens/init_screen.dart';
import '../../forgot_password/forgot_password_screen.dart';

class SignForm extends StatefulWidget {
  const SignForm({super.key});

  @override
  State<SignForm> createState() => _SignFormState();
}

class _SignFormState extends State<SignForm> {
  final _formKey = GlobalKey<FormState>();
  String? email;
  String? password;
  bool? remember = false;
  final List<String?> errors = [];
  bool _submitting = false;
  String? _submitError;

  void addError({String? error}) {
    if (!errors.contains(error)) {
      setState(() {
        errors.add(error);
      });
    }
  }

  void removeError({String? error}) {
    if (errors.contains(error)) {
      setState(() {
        errors.remove(error);
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();
    KeyboardUtil.hideKeyboard(context);
    setState(() {
      _submitting = true;
      _submitError = null;
    });

    final auth = context.read<AuthProvider>();
    try {
      print('Attempting login with email: $email'); // Debug print
      await auth.login(email: email, password: password!);
      if (!mounted) return;

      print('Login successful, navigating...'); // Debug print

      // Show success message
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Login successful!'),
          backgroundColor: Colors.green,
        ),
      );

      // Navigate directly to home (skip login success screen)
      Navigator.pushNamedAndRemoveUntil(
        context,
        InitScreen.routeName,
        (route) => false,
      );
    } on ApiException catch (error) {
      String errorMessage = error.message;

      if (error.code == 'INVALID_CREDENTIALS') {
        errorMessage =
            'Invalid email or password. Please check your credentials.';
      } else if (error.code == 'VALIDATION_ERROR') {
        errorMessage = error.message.isNotEmpty
            ? error.message
            : 'Please check your input.';
      } else if (error.statusCode == -1 ||
          error.message.contains('No route to host') ||
          error.message.contains('SocketException') ||
          error.message.contains('Connection refused')) {
        errorMessage =
            'Cannot reach server. Tap "Network error? Set API server" below and enter your computer\'s IP (run ipconfig on PC). Same Wi‑Fi as this device.';
      }

      print(
          'Login ApiException: ${error.code} - ${error.message}'); // Debug print

      setState(() {
        _submitError = errorMessage;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 6),
          ),
        );
      }
    } catch (error) {
      String errorMessage = 'Login failed. Please try again.';
      final errStr = error.toString();

      if (errStr.contains('Network') ||
          errStr.contains('Socket') ||
          errStr.contains('No route to host') ||
          errStr.contains('Connection refused')) {
        errorMessage =
            'Cannot reach server. Tap "Network error? Set API server" below and enter your computer\'s IP (run ipconfig on PC). Same Wi‑Fi required.';
      } else {
        errorMessage = errStr.replaceAll('Exception: ', '');
      }

      print('Login error: $error'); // Debug print

      setState(() {
        _submitError = errorMessage;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 6),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _submitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          TextFormField(
            keyboardType: TextInputType.emailAddress,   
            onSaved: (newValue) => email = newValue,
            onChanged: (value) {
              if (value.isNotEmpty) {
                removeError(error: kEmailNullError);
              } else if (emailValidatorRegExp.hasMatch(value)) {
                removeError(error: kInvalidEmailError);
              }
              return;
            },
            
            validator: (value) {
              if (value!.isEmpty) {
                addError(error: kEmailNullError);
                return "";
              } else if (!emailValidatorRegExp.hasMatch(value)) {
                addError(error: kInvalidEmailError);
                return "";
              }
              return null;
            },
            decoration: const InputDecoration(
              labelText: "Email",
              hintText: "Enter your email",
              floatingLabelBehavior: FloatingLabelBehavior.always,
              suffixIcon: CustomSurffixIcon(svgIcon: "assets/icons/Mail.svg"),
            ),
          ),
          const SizedBox(height: 20),
          TextFormField(
            obscureText: true,
            onSaved: (newValue) => password = newValue,
            onChanged: (value) {
              if (value.isNotEmpty) {
                removeError(error: kPassNullError);
              } else if (value.length >= 6) {
                removeError(error: kShortPassError);
              }
              return;
            },
            validator: (value) {
              if (value!.isEmpty) {
                addError(error: kPassNullError);
                return "";
              } else if (value.length < 6) {
                addError(error: kShortPassError);
                return "";
              }
              return null;
            },
            decoration: const InputDecoration(
              labelText: "Password",
              hintText: "Enter your password",
              floatingLabelBehavior: FloatingLabelBehavior.always,
              suffixIcon: CustomSurffixIcon(svgIcon: "assets/icons/Lock.svg"),
            ),
          ),

          
          const SizedBox(height: 20),
          Row(
            children: [
              Checkbox(
                value: remember,
                activeColor: kPrimaryColor,
                onChanged: (value) {
                  setState(() {
                    remember = value;
                  });
                },
              ),
              const Text("Remember me"),
              const Spacer(),
              GestureDetector(
                onTap: () => Navigator.pushNamed(
                    context, ForgotPasswordScreen.routeName),
                child: const Text(
                  "Forgot Password",
                  style: TextStyle(decoration: TextDecoration.underline),
                ),
              )
            ],
          ),
          FormError(errors: errors),
          if (_submitError != null) ...[
            const SizedBox(height: 8),
            Text(
              _submitError!,
              style: const TextStyle(color: Colors.red),
            ),
          ],
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _submitting ? null : _submit,
            child: _submitting
                ? const SizedBox(
                    height: 18,
                    width: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text("Continue"),
          ),
          const SizedBox(height: 12),
          TextButton(
            onPressed: _submitting ? null : _showSetApiUrlDialog,
            child: Text(
              'Network error? Set API server',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
                decoration: TextDecoration.underline,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _showSetApiUrlDialog() async {
    final controller = TextEditingController(
      text: AppConfig.overrideBaseUrl
          ?.replaceFirst('/api', '')
          .replaceFirst('http://', '')
          .replaceFirst('https://', '') ??
          '192.168.1.14',
    );
    if (!mounted) return;
    final result = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('API server address'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Enter your computer\'s IP (where the backend runs).\nSame Wi‑Fi as this device.',
              style: TextStyle(fontSize: 12),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              decoration: const InputDecoration(
                labelText: 'IP or host',
                hintText: 'e.g. 192.168.1.14',
              ),
              keyboardType: TextInputType.url,
              autofocus: true,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, ''),
            child: const Text('Clear'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, controller.text.trim()),
            child: const Text('Save'),
          ),
        ],
      ),
    );
    if (result == null || !mounted) return;
    String baseUrl;
    if (result.isEmpty) {
      await AppConfig.setOverride(null);
      baseUrl = AppConfig.baseUrl;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Using default: $baseUrl')),
        );
      }
      return;
    }
    String host = result
        .replaceFirst('http://', '')
        .replaceFirst('https://', '')
        .split('/')[0]
        .trim();
    if (host.contains(':')) {
      baseUrl = 'http://$host/api';
    } else {
      baseUrl = 'http://${host}:5000/api';
    }
    await AppConfig.setOverride(baseUrl);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Server set to $baseUrl. Try logging in again.'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }
}
