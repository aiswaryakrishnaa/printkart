import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'screens/server_config/initial_route_screen.dart';

import 'providers/auth_provider.dart';
import 'providers/cart_provider.dart';
import 'providers/notification_provider.dart';
import 'providers/wishlist_provider.dart';
import 'providers/chat_provider.dart';
import 'config/app_config.dart';
import 'routes.dart';
import 'services/auth_storage.dart';
import 'theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AuthStorage.instance.init();
  await AppConfig.loadOverride();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..bootstrap()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(
            create: (_) => WishlistProvider()..loadWishlist()),
        ChangeNotifierProvider(
            create: (_) => NotificationProvider()),
        ChangeNotifierProvider(create: (_) => ChatProvider()),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'Books & Prints Shop',
        theme: AppTheme.lightTheme(context),
        initialRoute: InitialRouteScreen.routeName,
        routes: routes,
      ),
    );
  }
}
