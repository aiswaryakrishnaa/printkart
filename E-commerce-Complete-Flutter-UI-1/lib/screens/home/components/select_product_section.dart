import 'package:flutter/material.dart';
import 'package:shop_app/constants.dart';
import 'package:shop_app/screens/select_product/product_type_screen.dart';

/// "Select product" section: Printing | Packaging
class SelectProductSection extends StatelessWidget {
  const SelectProductSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Select product',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _ProductCard(
                  title: 'Printing',
                  subtitle: 'Notice, Calendar, Visiting card',
                  icon: Icons.print,
                  color: const Color(0xFF4A3298),
                  onTap: () => Navigator.pushNamed(
                    context,
                    ProductTypeScreen.routeName,
                    arguments: {'productLine': 'printing'},
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _ProductCard(
                  title: 'Packaging',
                  subtitle: 'Boxes, Paper bag & more',
                  icon: Icons.inventory_2_outlined,
                  color: kPrimaryColor,
                  onTap: () => Navigator.pushNamed(
                    context,
                    ProductTypeScreen.routeName,
                    arguments: {'productLine': 'packaging'},
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _ProductCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: color.withOpacity(0.08),
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: color.withOpacity(0.2)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, size: 32, color: color),
              const SizedBox(height: 8),
              Text(
                title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.grey.shade700,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
