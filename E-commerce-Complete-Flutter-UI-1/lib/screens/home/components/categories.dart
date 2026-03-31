import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../../models/category.dart';
import '../../../services/home_service.dart';
import '../../products/products_screen.dart';

class Categories extends StatefulWidget {
  const Categories({super.key});

  @override
  State<Categories> createState() => _CategoriesState();
}

class _CategoriesState extends State<Categories> {
  final HomeService _service = HomeService();
  late Future<List<Category>> _future;

  @override
  void initState() {
    super.initState();
    _future = _service.fetchCategories();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Category>>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Padding(
            padding: EdgeInsets.all(20),
            child: LinearProgressIndicator(),
          );
        }
        if (snapshot.hasError) {
          return const SizedBox.shrink(); // Hide on error
        }
        final categories = snapshot.data ?? [];
        if (categories.isEmpty) return const SizedBox.shrink();
        return Padding(
          padding: const EdgeInsets.all(20),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: categories
                  .map(
                    (category) => Padding(
                      padding: const EdgeInsets.only(right: 12),
                      child: CategoryCard(
                        icon: category.icon ?? "assets/icons/Discover.svg",
                        text: category.name,
                        press: () {
                          Navigator.pushNamed(
                            context,
                            ProductsScreen.routeName,
                            arguments:
                                ProductsScreenArguments(category: category.id),
                          );
                        },
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
        );
      },
    );
  }
}

class CategoryCard extends StatelessWidget {
  const CategoryCard({
    Key? key,
    required this.icon,
    required this.text,
    required this.press,
  }) : super(key: key);

  final String icon, text;
  final GestureTapCallback press;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: press,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            height: 56,
            width: 56,
            decoration: BoxDecoration(
              color: const Color(0xFFFFECDF),
              borderRadius: BorderRadius.circular(10),
            ),
            child: icon.contains('assets')
                ? SvgPicture.asset(icon)
                : SvgPicture.network(icon),
          ),
          const SizedBox(height: 4),
          SizedBox(
            width: 60,
            child: Text(text, textAlign: TextAlign.center),
          )
        ],
      ),
    );
  }
}
