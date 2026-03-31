import 'package:flutter/material.dart';
import 'package:shop_app/constants.dart';
import 'package:shop_app/screens/select_product/configure_product_screen.dart';

/// Lists sub-types for Printing or Packaging; navigates to ConfigureProductScreen.
class ProductTypeScreen extends StatelessWidget {
  static const String routeName = '/product-type';

  const ProductTypeScreen({Key? key}) : super(key: key);

  static const List<Map<String, String>> printingTypes = [
    {'id': 'notice', 'title': 'Notice', 'subtitle': 'A4, A5 • GSM • 2/4 colour • Single/Double'},
    {'id': 'calendar', 'title': 'Calendar', 'subtitle': '3/6 sheets • GSM 90/100 • Quantity'},
    {'id': 'visiting_card', 'title': 'Visiting card', 'subtitle': 'GSM • Side • 1000/2000'},
  ];

  static const List<Map<String, String>> packagingTypes = [
    {'id': 'straight_tuck_end', 'title': 'Straight tuck end', 'subtitle': 'L×B×H • GSM • Paper type • Lamination'},
    {'id': 'reverse_tuck_end', 'title': 'Reverse tuck end', 'subtitle': 'L×B×H • GSM • Paper type • Lamination'},
    {'id': 'bottom_interlock', 'title': 'Bottom interlock', 'subtitle': 'L×B×H • GSM • Paper type • Lamination'},
    {'id': 'pasting_down', 'title': 'Pasting down', 'subtitle': 'L×B×H • GSM • Paper type • Lamination'},
    {'id': 'cake_box', 'title': 'Cake box', 'subtitle': 'L×B×H • GSM • Paper type • Lamination'},
    {'id': 'paper_bag', 'title': 'Paper bag', 'subtitle': 'Small / Medium / Large • 1000–5000'},
  ];

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    final productLine = args?['productLine'] as String? ?? 'printing';
    final isPrinting = productLine == 'printing';
    final items = isPrinting ? printingTypes : packagingTypes;

    return Scaffold(
      appBar: AppBar(
        title: Text(isPrinting ? 'Printing' : 'Packaging'),
        backgroundColor: kPrimaryColor,
        foregroundColor: Colors.white,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        itemCount: items.length,
        itemBuilder: (context, index) {
          final item = items[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              title: Text(
                item['title']!,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              subtitle: Text(item['subtitle']!),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.pushNamed(
                  context,
                  ConfigureProductScreen.routeName,
                  arguments: {
                    'productLine': productLine,
                    'productSubType': item['id'],
                    'productTitle': item['title'],
                  },
                );
              },
            ),
          );
        },
      ),
    );
  }
}
