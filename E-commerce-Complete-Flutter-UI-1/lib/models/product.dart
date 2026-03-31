import 'dart:ui';

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

  factory Product.fromJson(Map<String, dynamic> json) {
    final images = <String>[];
    final media = json['images'] ?? json['media'] ?? [];
    if (media is List) {
      for (final item in media) {
        if (item is String && item.isNotEmpty) {
          images.add(item);
        } else if (item is Map<String, dynamic>) {
          final url = item['url'] as String?;
          if (url != null && url.isNotEmpty) {
            images.add(url);
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
      price: (json['price'] is num ? (json['price'] as num) : 0).toDouble(),
      rating: (json['rating'] is num ? (json['rating'] as num) : 0).toDouble(),
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
}
