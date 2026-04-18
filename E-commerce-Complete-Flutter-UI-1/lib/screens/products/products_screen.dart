import 'package:flutter/material.dart';
import 'package:shop_app/components/product_card.dart';

import '../../models/product.dart';
import '../../services/product_service.dart';
import '../details/details_screen.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  static String routeName = "/products";

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  final ProductService _service = ProductService();
  Future<List<Product>>? _future;
  ProductsScreenArguments? _args;

  @override
  void initState() {
    super.initState();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final raw = ModalRoute.of(context)?.settings.arguments;
    final args = raw is ProductsScreenArguments ? raw : null;
    if (args != _args) {
      setState(() {
        _args = args;
        _future = _service.fetchProducts(
          search: args?.search,
          category: args?.category,
          type: args?.type,
          popularOnly: args?.popularOnly ?? false,
          sortBy: args?.sortBy,
          sortOrder: args?.sortOrder,
          status: args?.status,
          limit: args?.limit ?? 20,
        );
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = _args?.appBarTitle ?? 'Products';
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: FutureBuilder<List<Product>>(
            future: _future ?? _service.fetchProducts(),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }
              if (snapshot.hasError) {
                return Center(
                    child: Text('Failed to load products: ${snapshot.error}'));
              }
              var products = snapshot.data ?? [];
              if (_args?.type != null) {
                products = products
                    .where((product) => product.type == _args!.type)
                    .toList();
              }
              if (products.isEmpty) {
                return const Center(child: Text('No products found'));
              }
              return GridView.builder(
                itemCount: products.length,
                gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                  maxCrossAxisExtent: 200,
                  childAspectRatio: 0.7,
                  mainAxisSpacing: 20,
                  crossAxisSpacing: 16,
                ),
                itemBuilder: (context, index) => ProductCard(
                  product: products[index],
                  onPress: () => Navigator.pushNamed(
                    context,
                    DetailsScreen.routeName,
                    arguments:
                        ProductDetailsArguments(product: products[index]),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

class ProductsScreenArguments {
  ProductsScreenArguments({
    this.search,
    this.category,
    this.type,
    this.popularOnly = false,
    this.sortBy,
    this.sortOrder,
    this.status,
    this.limit,
    this.appBarTitle,
  });

  final String? search;
  final String? category;
  final String? type;
  /// Matches backend `isPopular=true` (featured products).
  final bool popularOnly;
  final String? sortBy;
  final String? sortOrder;
  final String? status;
  final int? limit;
  final String? appBarTitle;
}
