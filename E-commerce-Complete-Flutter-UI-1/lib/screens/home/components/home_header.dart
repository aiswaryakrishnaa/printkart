import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../cart/cart_screen.dart';
import '../../notifications/notifications_screen.dart';
import '../../../providers/cart_provider.dart';
import '../../../providers/notification_provider.dart';
import 'icon_btn_with_counter.dart';
import 'search_field.dart';

class HomeHeader extends StatelessWidget {
  const HomeHeader({
    Key? key,
  }) : super(key: key);

  static const String _logoAsset = 'assets/images/iconprintcart.jpeg';

  @override
  Widget build(BuildContext context) {
    final cartItems = context.watch<CartProvider>().totalItems;
    final unread = context.watch<NotificationProvider>().unreadCount;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.08),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: Image.asset(
                _logoAsset,
                width: 48,
                height: 48,
                fit: BoxFit.cover,
                filterQuality: FilterQuality.high,
              ),
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(child: SearchField()),
          const SizedBox(width: 16),
          IconBtnWithCounter(
            svgSrc: "assets/icons/Cart Icon.svg",
            numOfitem: cartItems,
            press: () => Navigator.pushNamed(context, CartScreen.routeName),
          ),
          const SizedBox(width: 8),
          IconBtnWithCounter(
            svgSrc: "assets/icons/Bell.svg",
            numOfitem: unread,
            press: () => Navigator.pushNamed(
              context,
              NotificationsScreen.routeName,
            ),
          ),
        ],
      ),
    );
  }
}
