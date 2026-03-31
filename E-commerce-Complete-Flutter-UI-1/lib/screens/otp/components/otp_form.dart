import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../constants.dart';
import '../../../providers/auth_provider.dart';
import '../../../screens/init_screen.dart';
import '../../login_success/login_success_screen.dart';
import '../otp_screen.dart';

class OtpForm extends StatefulWidget {
  const OtpForm({super.key, this.arguments});

  final OtpScreenArguments? arguments;

  @override
  State<OtpForm> createState() => _OtpFormState();
}

class _OtpFormState extends State<OtpForm> {
  final _controllers =
      List.generate(4, (index) => TextEditingController(), growable: false);
  final _focusNodes = List.generate(4, (index) => FocusNode(), growable: false);
  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    for (final controller in _controllers) {
      controller.dispose();
    }
    for (final node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  Future<void> _verify() async {
    final code = _controllers.map((c) => c.text).join();
    if (code.length != 4) {
      setState(() {
        _error = "Please enter the 4-digit code";
      });
      return;
    }
    setState(() {
      _submitting = true;
      _error = null;
    });
    final auth = context.read<AuthProvider>();
    try {
      await auth.verifyOtp(
        email: widget.arguments?.email,
        phone: widget.arguments?.phone,
        otp: code,
      );
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('OTP verified successfully!'),
          backgroundColor: Colors.green,
        ),
      );

      // Navigate to login success, then home
      Navigator.pushNamedAndRemoveUntil(
        context,
        LoginSuccessScreen.routeName,
        (route) => false,
      );

      // Auto-navigate to home after 1 second
      Future.delayed(const Duration(seconds: 1), () {
        if (mounted) {
          Navigator.pushReplacementNamed(context, InitScreen.routeName);
        }
      });
    } catch (error) {
      setState(() {
        _error = error.toString();
      });
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
    return Column(
      children: [
        SizedBox(height: MediaQuery.of(context).size.height * 0.15),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(
            4,
            (index) => SizedBox(
              width: 60,
              child: TextFormField(
                controller: _controllers[index],
                focusNode: _focusNodes[index],
                autofocus: index == 0,
                obscureText: true,
                style: const TextStyle(fontSize: 24),
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                decoration: otpInputDecoration,
                onChanged: (value) {
                  if (value.length == 1 && index < _focusNodes.length - 1) {
                    _focusNodes[index + 1].requestFocus();
                  }
                },
              ),
            ),
          ),
        ),
        SizedBox(height: MediaQuery.of(context).size.height * 0.1),
        if (_error != null)
          Text(
            _error!,
            style: const TextStyle(color: Colors.red),
          ),
        ElevatedButton(
          onPressed: _submitting ? null : _verify,
          child: _submitting
              ? const SizedBox(
                  height: 18,
                  width: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text("Continue"),
        ),
      ],
    );
  }
}
