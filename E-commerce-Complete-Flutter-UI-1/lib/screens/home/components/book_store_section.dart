import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../models/product.dart';
import '../../../services/home_service.dart';
import '../../details/details_screen.dart';
import '../../../providers/wishlist_provider.dart';
import '../../../constants.dart';
import 'section_title.dart';
import '../../../models/category.dart';
import '../../../config/app_config.dart';

class BookStoreSection extends StatefulWidget {
  const BookStoreSection({super.key});

  @override
  State<BookStoreSection> createState() => _BookStoreSectionState();
}

class _BookStoreSectionState extends State<BookStoreSection> {
  final HomeService _service = HomeService();
  late Future<List<Category>> _categoriesFuture;
  late Future<List<Product>> _featuredFuture;

  @override
  void initState() {
    super.initState();
    _categoriesFuture = _service.fetchCategories();
    _featuredFuture = _service.fetchPopularProducts();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Featured Book Banner
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          child: Text(
            "Book of the Day",
            style: TextStyle(
              fontSize: 22,
              fontFamily: 'Serif',
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
        ),
        FutureBuilder<List<Product>>(
          future: _featuredFuture,
          builder: (context, snapshot) {
            if (!snapshot.hasData || snapshot.data!.isEmpty) return const SizedBox.shrink();
            final product = snapshot.data!.first; // Use the first popular product as featured
            return FeaturedBookBanner(product: product);
          },
        ),
        const SizedBox(height: 30),
        
        // Category Shelves
        FutureBuilder<List<Category>>(
          future: _categoriesFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const SizedBox(height: 100, child: Center(child: CircularProgressIndicator()));
            }
            final categories = snapshot.data ?? [];
            if (categories.isEmpty) return const SizedBox.shrink();

            return Column(
              children: categories.map((category) => CategoryBookShelf(category: category)).toList(),
            );
          },
        ),
      ],
    );
  }
}

class FeaturedBookBanner extends StatelessWidget {
  final Product product;
  const FeaturedBookBanner({super.key, required this.product});

  String _resolveImageUrl(String imagePath) {
    if (imagePath.isEmpty) return '';
    if (imagePath.startsWith('http')) return imagePath;
    String baseUrl = AppConfig.baseUrl; 
    if (baseUrl.endsWith('/api')) baseUrl = baseUrl.substring(0, baseUrl.length - 4);
    else if (baseUrl.endsWith('/api/')) baseUrl = baseUrl.substring(0, baseUrl.length - 5);
    if (!baseUrl.endsWith('/')) baseUrl = '$baseUrl/';
    return '${baseUrl}uploads/$imagePath';
  }

  @override
  Widget build(BuildContext context) {
    final imageUrl = product.images.isNotEmpty ? _resolveImageUrl(product.images.first) : '';
    
    return GestureDetector(
      onTap: () => Navigator.pushNamed(
        context, 
        DetailsScreen.routeName, 
        arguments: ProductDetailsArguments(product: product)
      ),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 20),
        padding: const EdgeInsets.all(20),
        height: 180,
        decoration: BoxDecoration(
          color: const Color(0xFFF5E6CC).withOpacity(0.3), // Soft paper color
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFD4C4A8).withOpacity(0.5)),
        ),
        child: Row(
          children: [
            // Book Image
            Hero(
              tag: "featured_${product.id}",
              child: Container(
                width: 100,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 10, offset: const Offset(5, 5)),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: imageUrl.isNotEmpty
                      ? CachedNetworkImage(imageUrl: imageUrl, fit: BoxFit.cover)
                      : Container(color: Colors.grey[300], child: const Icon(Icons.book)),
                ),
              ),
            ),
            const SizedBox(width: 20),
            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: kPrimaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      "MUST READ",
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: kPrimaryColor),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    product.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontFamily: 'Serif',
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.star, color: Colors.amber, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        "${product.rating} Rating",
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}

class CategoryBookShelf extends StatefulWidget {
  final Category category;
  const CategoryBookShelf({Key? key, required this.category}) : super(key: key);

  @override
  State<CategoryBookShelf> createState() => _CategoryBookShelfState();
}

class _CategoryBookShelfState extends State<CategoryBookShelf> {
  final HomeService _service = HomeService();
  late Future<List<Product>> _productsFuture;

  @override
  void initState() {
    super.initState();
    int? catId = int.tryParse(widget.category.id);
    if (catId != null) {
      _productsFuture = _service.fetchProductsByCategory(catId);
    } else {
      _productsFuture = Future.value([]);
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Product>>(
      future: _productsFuture,
      builder: (context, snapshot) {
        if (!snapshot.hasData || (snapshot.data?.isEmpty ?? true)) {
          return const SizedBox.shrink();
        }
        final products = snapshot.data!;
        
        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Text(
                    widget.category.name,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Serif',
                      color: Colors.black87,
                    ),
                  ),
                  const Spacer(),
                  Icon(Icons.arrow_forward, size: 18, color: Colors.grey[400]),
                ],
              ),
            ),
            const SizedBox(height: 16),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.only(bottom: 20),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(width: 20),
                  ...products.map((product) => Padding(
                    padding: const EdgeInsets.only(right: 24),
                    child: BookCard(
                      product: product,
                      press: () => Navigator.pushNamed(
                        context,
                        DetailsScreen.routeName,
                        arguments: ProductDetailsArguments(product: product),
                      ),
                    ),
                  )),
                ],
              ),
            ),
            const SizedBox(height: 20),
          ],
        );
      },
    );
  }
}

class BookCard extends StatelessWidget {
  const BookCard({Key? key, required this.product, required this.press}) : super(key: key);

  final Product product;
  final VoidCallback press;

  String _resolveImageUrl(String imagePath) {
    if (imagePath.isEmpty) return '';
    if (imagePath.startsWith('http')) return imagePath;

    String baseUrl = AppConfig.baseUrl; 
    if (baseUrl.endsWith('/api')) baseUrl = baseUrl.substring(0, baseUrl.length - 4);
    else if (baseUrl.endsWith('/api/')) baseUrl = baseUrl.substring(0, baseUrl.length - 5);
    if (!baseUrl.endsWith('/')) baseUrl = '$baseUrl/';
    return '${baseUrl}uploads/$imagePath';
  }

  @override
  Widget build(BuildContext context) {
    final String imageUrl = product.images.isNotEmpty ? _resolveImageUrl(product.images.first) : '';
    // Debug print
    if (product.images.isNotEmpty) {
      debugPrint('[BookCard] Original: ${product.images.first} -> Resolved: $imageUrl');
    }

    return GestureDetector(
      onTap: press,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Hero(
            tag: product.id.toString(),
            child: Container(
              height: 160,
              width: 106, // Approx 2:3 ratio
              decoration: BoxDecoration(
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.15),
                    offset: const Offset(4, 4),
                    blurRadius: 8,
                  ),
                ],
              ),
              child: Stack(
                children: [
                   Container(color: Colors.white), // Background for transparent PNGs
                   ClipRRect(
                    borderRadius: const BorderRadius.only(
                      topRight: Radius.circular(4),
                      bottomRight: Radius.circular(4),
                    ),
                    child: imageUrl.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: imageUrl, 
                          fit: BoxFit.fill,
                          width: double.infinity,
                          height: double.infinity,
                          placeholder: (context, url) => Container(color: Colors.grey[200]),
                          errorWidget: (_, __, ___) => Container(color: Colors.grey[200], child: const Icon(Icons.book)),
                        )
                      : Container(color: Colors.grey[200], child: const Icon(Icons.book)),
                  ),
                  // Spine Shadow (Always on top)
                  Positioned(
                    left: 0, top: 0, bottom: 0, width: 4,
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Colors.black.withOpacity(0.3), Colors.transparent], // Darker shadow
                          begin: Alignment.centerLeft,
                          end: Alignment.centerRight,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: 106,
            child: Text(
              product.title,
              style: const TextStyle(
                fontFamily: 'Serif',
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.black87,
                height: 1.2,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            "\$${product.price}",
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: kPrimaryColor,
            ),
          ),
        ],
      ),
    );
  }
}
