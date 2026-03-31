import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../services/user_service.dart';
import 'addresses_screen.dart';
import '../orders/orders_screen.dart';
import '../customization/customization_screen.dart';
import '../server_config/server_config_screen.dart';
import 'components/profile_menu.dart';
import 'components/profile_pic.dart';

class ProfileScreen extends StatefulWidget {
  static String routeName = "/profile";

  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final UserService _userService = UserService();
  bool _isUploading = false;

  Future<void> _handleImageSelected(File imageFile) async {
    setState(() => _isUploading = true);
    
    try {
      // Upload image to backend
      final avatarUrl = await _userService.uploadProfilePicture(imageFile.path);
      
      // Update user profile with new avatar URL
      if (mounted) {
        await context.read<AuthProvider>().updateProfile(avatar: avatarUrl);
        
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile picture updated successfully!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to upload image: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isUploading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return Scaffold(
      appBar: AppBar(
        title: const Text("Profile"),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(vertical: 20),
        child: Column(
          children: [
            Stack(
              children: [
                ProfilePic(
                  imageUrl: user?.avatar,
                  onImageSelected: _handleImageSelected,
                ),
                if (_isUploading)
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.5),
                        shape: BoxShape.circle,
                      ),
                      child: const Center(
                        child: CircularProgressIndicator(color: Colors.white),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            if (user != null) ...[
              Text(
                user.fullName,
                style:
                    const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              Text(user.email),
              const SizedBox(height: 20),
            ],
            ProfileMenu(
              text: "My Addresses",
              icon: "assets/icons/User Icon.svg",
              press: () {
                Navigator.of(context).pushNamed(AddressesScreen.routeName);
              },
            ),
            ProfileMenu(
              text: "My Orders",
              icon: "assets/icons/receipt.svg",
              press: () {
                Navigator.of(context).pushNamed(OrdersScreen.routeName);
              },
            ),
            ProfileMenu(
              text: "Customization Request",
              icon: "assets/icons/Parcel.svg", 
              press: () {
                Navigator.of(context).pushNamed(CustomizationScreen.routeName);
              },
            ),
            ProfileMenu(
              text: "Server address",
              icon: "assets/icons/Settings.svg",
              press: () {
                Navigator.of(context).pushNamed(
                  ServerConfigScreen.routeName,
                  arguments: {'returnAfterSave': true},
                );
              },
            ),
            ProfileMenu(
              text: "Help Center",
              icon: "assets/icons/Question mark.svg",
              press: () {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text("Help Center"),
                    content: const Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("Need assistance? Contact us:"),
                        SizedBox(height: 10),
                        Text("📧 Email: support@bookstore.com"),
                        Text("📞 Phone: +1 234 567 890"),
                        SizedBox(height: 20),
                        Text("FAQs:", style: TextStyle(fontWeight: FontWeight.bold)),
                        SizedBox(height: 5),
                        Text("• How do I track my order?"),
                        Text("  Go to 'My Orders' in the menu."),
                        SizedBox(height: 5),
                        Text("• Can I cancel an order?"),
                        Text("  Yes, within 24 hours of purchase."),
                      ],
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text("Close"),
                      ),
                    ],
                  ),
                );
              },
            ),
            ProfileMenu(
              text: "Log Out",
              icon: "assets/icons/Log out.svg",
              press: () async {
                // Show confirmation dialog
                final shouldLogout = await showDialog<bool>(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text("Logout"),
                    content: const Text("Are you sure you want to logout?"),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context, false),
                        child: const Text("Cancel"),
                      ),
                      TextButton(
                        onPressed: () => Navigator.pop(context, true),
                        child: const Text(
                          "Logout",
                          style: TextStyle(color: Colors.red),
                        ),
                      ),
                    ],
                  ),
                );

                if (shouldLogout == true && context.mounted) {
                  // Clear tokens and user data
                  await context.read<AuthProvider>().logout();
                  
                  // Navigate to SignIn screen and clear navigation stack
                  if (context.mounted) {
                    Navigator.pushNamedAndRemoveUntil(
                      context,
                      '/sign_in',
                      (route) => false,
                    );
                  }
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}
