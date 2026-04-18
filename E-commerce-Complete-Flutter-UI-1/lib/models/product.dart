import 'dart:ui';

import '../config/app_config.dart';

class Product {
  Product({
    required this.id,
    required this.title,
    required this.description,
    required this.images,
    required this.price,
    this.rating = 0,
    this.isFavourite = false,
    this.isPopular = false,
    this.colors = const [],
    this.currency = '\$',
    this.inventoryStatus,
    this.category,
    this.brand,
    this.shortDescription,
    this.type,
  });

  final String id;
  final String title;
  final String description;
  final String? shortDescription;
  final List<String> images;
  final double price;
  final double rating;
  final bool isFavourite;
  final bool isPopular;
  final List<Color> colors;
  final String currency;
  final String? inventoryStatus;
  final String? category;
  final String? brand;
  final String? type;

  factory Product.fromJson(Map<String, dynamic> json) {
    final images = <String>[];
    final media = json['images'] ?? json['media'] ?? [];
    if (media is List) {
      for (final item in media) {
        if (item is String && item.isNotEmpty) {
          images.add(_normalizeImageUrl(item));
        } else if (item is Map<String, dynamic>) {
          final url = item['url'] as String?;
          if (url != null && url.isNotEmpty) {
            images.add(_normalizeImageUrl(url));
          }
        }
      }
    }
    final colorValues = <Color>[];
    final colors = json['colors'] ?? json['colorOptions'];
    if (colors is List) {
      for (final color in colors) {
        final hex = color is String ? color : color?['hex'] as String?;
        if (hex != null) {
          colorValues.add(_parseColor(hex));
        }
      }
    }

    return Product(
      id: '${json['id'] ?? json['_id'] ?? ''}',
      title: json['title'] as String? ??
          json['name'] as String? ??
          'Untitled product',
      description: json['description'] as String? ?? '',
      images: images.isEmpty ? ['https://placehold.co/600x400'] : images,
      price: _parseDouble(json['price']),
      rating: _parseDouble(json['rating'] ?? json['ratingAverage']),
      isFavourite:
          json['isFavourite'] as bool? ?? json['isFavorite'] as bool? ?? false,
      isPopular: json['isPopular'] as bool? ??
          (json['tags'] is List && (json['tags'] as List).contains('popular')),
      colors: colorValues.isEmpty
          ? [
              const Color(0xFFF6625E),
              const Color(0xFF836DB8),
              const Color(0xFFDECB9C),
              const Color(0xFFFFFFFF),
            ]
          : colorValues,
      currency: json['currency'] as String? ?? '₹',
      inventoryStatus:
          json['availability'] as String? ?? json['status'] as String?,
      category:
          json['category']?['name'] as String? ?? json['category'] as String?,
      brand: json['brand'] as String?,
      shortDescription: json['shortDescription'] as String?,
      type: json['type'] as String?,
    );
  }

  static Color _parseColor(String value) {
    var hex = value.replaceAll('#', '');
    if (hex.length == 6) {
      hex = 'FF$hex';
    }
    final intColor = int.tryParse(hex, radix: 16);
    if (intColor == null) return const Color(0xFFF6625E);
    return Color(intColor);
  }

  static double _parseDouble(dynamic value) {
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0;
    return 0;
  }

  static String _normalizeImageUrl(String imagePath) {
    if (imagePath.startsWith('http')) return imagePath;
    var baseUrl = AppConfig.baseUrl;
    if (baseUrl.endsWith('/api')) baseUrl = baseUrl.substring(0, baseUrl.length - 4);
    if (baseUrl.endsWith('/api/')) baseUrl = baseUrl.substring(0, baseUrl.length - 5);
    if (!baseUrl.endsWith('/')) baseUrl = '$baseUrl/';
    return '${baseUrl}uploads/$imagePath';
  }
}
