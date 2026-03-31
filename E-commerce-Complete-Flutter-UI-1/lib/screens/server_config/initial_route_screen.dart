import 'package:flutter/material.dart';

import 'server_config_screen.dart';

/// Decides the first screen.
/// Flow: IP page -> Login -> Home.
class InitialRouteScreen extends StatelessWidget {
  static const String routeName = '/';

  const InitialRouteScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Always open server screen first. User must save IP before login.
    return const ServerConfigScreen();
  }
}
