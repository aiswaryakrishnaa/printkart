import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:shop_app/constants.dart';
import 'package:shop_app/screens/customization/customization_screen.dart';
import 'package:shop_app/screens/home/home_screen.dart';
import 'package:shop_app/screens/profile/profile_screen.dart';
import 'package:shop_app/screens/notifications/notifications_screen.dart';
import 'package:shop_app/screens/chat/chat_screen.dart';
import 'package:provider/provider.dart';
import 'package:shop_app/providers/notification_provider.dart';
import 'package:shop_app/providers/chat_provider.dart';

const Color inActiveIconColor = Color(0xFFB6B6B6);

class InitScreen extends StatefulWidget {
  const InitScreen({super.key});

  static String routeName = kMainShellRoute;

  @override
  State<InitScreen> createState() => _InitScreenState();
}

class _InitScreenState extends State<InitScreen> {
  int currentSelectedIndex = 0;

  void updateCurrentIndex(int index) {
    setState(() {
      currentSelectedIndex = index;
    });
  }

  final pages = [
    const HomeScreen(),
    const CustomizationScreen(),
    const NotificationsScreen(),
    const ChatScreen(),
    const ProfileScreen()
  ];

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: currentSelectedIndex == 0,
      onPopInvoked: (didPop) {
        if (didPop) return;
        if (currentSelectedIndex != 0) {
          setState(() {
            currentSelectedIndex = 0;
          });
        }
      },
      child: Scaffold(
        body: pages[currentSelectedIndex],
        bottomNavigationBar: BottomNavigationBar(
          onTap: updateCurrentIndex,
          currentIndex: currentSelectedIndex,
          showSelectedLabels: false,
          showUnselectedLabels: false,
          type: BottomNavigationBarType.fixed,
          items: [
            BottomNavigationBarItem(
              icon: SvgPicture.asset(
                "assets/icons/Shop Icon.svg",
                colorFilter: const ColorFilter.mode(
                  inActiveIconColor,
                  BlendMode.srcIn,
                ),
              ),
              activeIcon: SvgPicture.asset(
                "assets/icons/Shop Icon.svg",
                colorFilter: const ColorFilter.mode(
                  kPrimaryColor,
                  BlendMode.srcIn,
                ),
              ),
              label: "Home",
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.edit_note, color: inActiveIconColor),
              activeIcon: const Icon(Icons.edit_note, color: kPrimaryColor),
              label: "Customize",
            ),
            BottomNavigationBarItem(
              icon: Consumer<NotificationProvider>(
                builder: (context, notification, child) {
                  return Badge(
                    backgroundColor: Colors.red,
                    isLabelVisible: notification.unreadCount > 0,
                    label: Text(notification.unreadCount.toString()),
                    child: const Icon(Icons.notifications_outlined, color: inActiveIconColor),
                  );
                },
              ),
              activeIcon: Consumer<NotificationProvider>(
                builder: (context, notification, child) {
                  return Badge(
                    backgroundColor: Colors.red,
                    isLabelVisible: notification.unreadCount > 0,
                    label: Text(notification.unreadCount.toString()),
                    child: const Icon(Icons.notifications, color: kPrimaryColor),
                  );
                },
              ),
              label: "Notifications",
            ),
            BottomNavigationBarItem(
              icon: Consumer<ChatProvider>(
                builder: (context, chat, child) {
                  return Badge(
                    backgroundColor: Colors.red,
                    isLabelVisible: chat.unreadCount > 0,
                    smallSize: 10,
                    child: SvgPicture.asset(
                      "assets/icons/Chat bubble Icon.svg",
                      colorFilter: const ColorFilter.mode(
                        inActiveIconColor,
                        BlendMode.srcIn,
                      ),
                    ),
                  );
                },
              ),
              activeIcon: Consumer<ChatProvider>(
                builder: (context, chat, child) {
                  return Badge(
                    backgroundColor: Colors.red,
                    isLabelVisible: chat.unreadCount > 0,
                    smallSize: 10,
                    child: SvgPicture.asset(
                      "assets/icons/Chat bubble Icon.svg",
                      colorFilter: const ColorFilter.mode(
                        kPrimaryColor,
                        BlendMode.srcIn,
                      ),
                    ),
                  );
                },
              ),
              label: "Chat",
            ),
            BottomNavigationBarItem(
              icon: SvgPicture.asset(
                "assets/icons/User Icon.svg",
                colorFilter: const ColorFilter.mode(
                  inActiveIconColor,
                  BlendMode.srcIn,
                ),
              ),
              activeIcon: SvgPicture.asset(
                "assets/icons/User Icon.svg",
                colorFilter: const ColorFilter.mode(
                  kPrimaryColor,
                  BlendMode.srcIn,
                ),
              ),
              label: "Profile",
            ),
          ],
        ),
      ),
    );
  }
}
