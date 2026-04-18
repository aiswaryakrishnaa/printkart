import 'dart:async';

import 'package:flutter/material.dart';

/// Promotional banners at the top of the home feed (auto-advancing carousel).
class HomeBannerCarousel extends StatefulWidget {
  const HomeBannerCarousel({super.key});

  @override
  State<HomeBannerCarousel> createState() => _HomeBannerCarouselState();
}

class _HomeBannerCarouselState extends State<HomeBannerCarousel> {
  final PageController _controller = PageController(viewportFraction: 1);
  int _page = 0;
  Timer? _autoScrollTimer;

  static const _banners = <String>[
    'assets/images/banner1.jpeg',
    'assets/images/banner2.jpeg',
    'assets/images/bnr33.jpeg',
  ];

  static const _autoScrollInterval = Duration(seconds: 4);

  @override
  void initState() {
    super.initState();
    _autoScrollTimer = Timer.periodic(_autoScrollInterval, (_) => _advance());
  }

  void _advance() {
    if (!mounted || !_controller.hasClients) return;
    final n = _banners.length;
    final current = _controller.page?.round() ?? _page;
    final next = (current + 1) % n;
    _controller.animateToPage(
      next,
      duration: const Duration(milliseconds: 500),
      curve: Curves.easeInOut,
    );
  }

  @override
  void dispose() {
    _autoScrollTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: AspectRatio(
            aspectRatio: 16 / 9,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  PageView.builder(
                    controller: _controller,
                    itemCount: _banners.length,
                    onPageChanged: (i) => setState(() => _page = i),
                    itemBuilder: (context, index) {
                      return Image.asset(
                        _banners[index],
                        fit: BoxFit.contain,
                        alignment: Alignment.center,
                      );
                    },
                  ),
                  Positioned(
                    left: 0,
                    right: 0,
                    bottom: 12,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        _banners.length,
                        (i) => Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            width: _page == i ? 22 : 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: _page == i
                                  ? Colors.white
                                  : Colors.white.withValues(alpha: 0.45),
                              borderRadius: BorderRadius.circular(4),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.25),
                                  blurRadius: 4,
                                  offset: const Offset(0, 1),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
