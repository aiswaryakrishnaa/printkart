import 'package:flutter/material.dart';

import '../../../components/product_card.dart';
import '../../../models/product.dart';
import '../../../services/home_service.dart';
import '../../details/details_screen.dart';
import '../../products/products_screen.dart';
import 'section_title.dart';

class PopularProducts extends StatefulWidget {
  const PopularProducts({super.key});

  @override
  State<PopularProducts> createState() => _PopularProductsState();
}

class _PopularProductsState extends State<PopularProducts> {
  final HomeService _service = HomeService();
  late Future<List<Product>> _future;

  @override
  void initState() {
    super.initState();
    _future = _service.fetchPopularProducts();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: SectionTitle(
            title: "Popular Products",
            press: () {
              Navigator.pushNamed(
                context,
                ProductsScreen.routeName,
                arguments: ProductsScreenArguments(
                  appBarTitle: 'Popular Products',
                  status: 'active',
                  sortBy: 'soldCount',
                  sortOrder: 'desc',
                  limit: 50,
                ),
              );
            },
          ),
        ),
        FutureBuilder<List<Product>>(
          future: _future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Padding(
                padding: EdgeInsets.all(20),
                child: LinearProgressIndicator(),
              );
            }
            if (snapshot.hasError) {
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Text(
                  'Could not load popular products.',
                  style: TextStyle(color: Colors.grey.shade700, fontSize: 13),
                ),
              );
            }
            final products = snapshot.data ?? [];
            if (products.isEmpty) {
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Text(
                  'No products to show yet.',
                  style: TextStyle(color: Colors.grey.shade700, fontSize: 13),
                ),
              );
            }
            return SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  ...products.map(
                    (product) => Padding(
                      padding: const EdgeInsets.only(left: 20),
                      child: ProductCard(
                        product: product,
                        onPress: () => Navigator.pushNamed(
                          context,
                          DetailsScreen.routeName,
                          arguments: ProductDetailsArguments(product: product),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 20),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}
