import 'package:flutter/widgets.dart';
import 'package:shop_app/screens/products/products_screen.dart';

import 'screens/cart/cart_screen.dart';
import 'screens/checkout/checkout_screen.dart';
import 'screens/complete_profile/complete_profile_screen.dart';
import 'screens/details/details_screen.dart';
import 'screens/forgot_password/forgot_password_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/init_screen.dart';
import 'screens/login_success/login_success_screen.dart';
import 'screens/notifications/notifications_screen.dart';
import 'screens/otp/otp_screen.dart';
import 'screens/profile/addresses_screen.dart';
import 'screens/profile/profile_screen.dart';
import 'screens/sign_in/sign_in_screen.dart';
import 'screens/sign_up/sign_up_screen.dart';
import 'screens/splash/splash_screen.dart';
import 'screens/customization/customization_screen.dart';
import 'screens/customization/my_customization_requests_screen.dart';
import 'screens/orders/orders_screen.dart';
import 'screens/select_product/product_type_screen.dart';
import 'screens/select_product/configure_product_screen.dart';
import 'screens/server_config/initial_route_screen.dart';
import 'screens/server_config/server_config_screen.dart';

// We use name route
// All our routes will be available here
final Map<String, WidgetBuilder> routes = {
  InitialRouteScreen.routeName: (context) => const InitialRouteScreen(),
  ServerConfigScreen.routeName: (context) => const ServerConfigScreen(),
  InitScreen.routeName: (context) => const InitScreen(),
  SplashScreen.routeName: (context) => const SplashScreen(),
  SignInScreen.routeName: (context) => const SignInScreen(),
  ForgotPasswordScreen.routeName: (context) => const ForgotPasswordScreen(),
  LoginSuccessScreen.routeName: (context) => const LoginSuccessScreen(),
  SignUpScreen.routeName: (context) => const SignUpScreen(),
  CompleteProfileScreen.routeName: (context) => const CompleteProfileScreen(),
  OtpScreen.routeName: (context) => const OtpScreen(),
  HomeScreen.routeName: (context) => const HomeScreen(),
  ProductsScreen.routeName: (context) => const ProductsScreen(),
  DetailsScreen.routeName: (context) => const DetailsScreen(),
  CartScreen.routeName: (context) => const CartScreen(),
  CheckoutScreen.routeName: (context) => const CheckoutScreen(),
  ProfileScreen.routeName: (context) => const ProfileScreen(),
  AddressesScreen.routeName: (context) => const AddressesScreen(),
  NotificationsScreen.routeName: (context) => const NotificationsScreen(),
  CustomizationScreen.routeName: (context) => const CustomizationScreen(),
  MyCustomizationRequestsScreen.routeName: (context) =>
      const MyCustomizationRequestsScreen(),
  OrdersScreen.routeName: (context) => const OrdersScreen(),
  ProductTypeScreen.routeName: (context) => const ProductTypeScreen(),
  ConfigureProductScreen.routeName: (context) => const ConfigureProductScreen(),
};
