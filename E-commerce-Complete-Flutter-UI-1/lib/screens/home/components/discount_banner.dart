import 'package:flutter/material.dart';

import '../../../services/home_service.dart';

class DiscountBanner extends StatefulWidget {
  const DiscountBanner({
    Key? key,
  }) : super(key: key);

  @override
  State<DiscountBanner> createState() => _DiscountBannerState();
}

class _DiscountBannerState extends State<DiscountBanner> {
  final HomeService _service = HomeService();
  Map<String, dynamic>? _promotion;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final promo = await _service.fetchPromotions();
      if (!mounted) return;
      setState(() {
        _promotion = promo;
      });
    } catch (e) {
      // Silently fail - show default banner
      if (!mounted) return;
      setState(() {
        _promotion = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = _promotion?['title'] as String? ?? 'Limited Time Offer';
    final subtitle =
        _promotion?['description'] as String? ?? 'Exclusive deals for you';

    return Container(
      // width: double.infinity,
      margin: const EdgeInsets.all(20),
      padding: const EdgeInsets.symmetric(
        horizontal: 20,
        vertical: 16,
      ),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF5B3FA8),
            Color(0xFF4A3298),
            Color(0xFF3D2678),
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF4A3298).withValues(alpha: 0.35),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Text.rich(
        TextSpan(
          style: const TextStyle(color: Colors.white),
          children: [
            TextSpan(text: "$title\n"),
            TextSpan(
              text: subtitle,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
