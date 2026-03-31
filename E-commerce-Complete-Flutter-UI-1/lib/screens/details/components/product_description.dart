import 'package:flutter/material.dart';
import '../../../../constants.dart';
import '../../../../models/product.dart';

class ProductDescription extends StatefulWidget {
  const ProductDescription({
    Key? key,
    required this.product,
    this.pressOnSeeMore,
  }) : super(key: key);

  final Product product;
  final GestureTapCallback? pressOnSeeMore;

  @override
  State<ProductDescription> createState() => _ProductDescriptionState();
}

class _ProductDescriptionState extends State<ProductDescription> {
  bool isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title
              Text(
                widget.product.title,
                style: const TextStyle(
                  fontFamily: 'Serif',
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 8),
              
              // Author
              if (widget.product.shortDescription != null || widget.product.brand != null)
                Text(
                  "by ${widget.product.shortDescription ?? widget.product.brand}",
                  style: const TextStyle(
                    fontSize: 16,
                    color: Colors.grey,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              const SizedBox(height: 12),

              // Rating Row
              Row(
                children: [
                   const Icon(Icons.star, color: Colors.amber, size: 20),
                   const SizedBox(width: 4),
                   Text(
                     widget.product.rating.toString(),
                     style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                   ),
                   const SizedBox(width: 8),
                   const Text("(120 Reviews)", style: TextStyle(color: Colors.grey, fontSize: 13)), // Placeholder for standard look
                ],
              ),
              const SizedBox(height: 16),

              // Price
              Text(
                "₹${widget.product.price}",
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: kPrimaryColor,
                ),
              ),
            ],
          ),
        ),
        
        // Divider
        const Padding(
          padding: EdgeInsets.symmetric(vertical: 20, horizontal: 20),
          child: Divider(color: Color(0xFFEEEEEE), thickness: 1),
        ),

        // Description Section
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
               const Text(
                "Description",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 12),
              
              // Expandable Text
              Text(
                widget.product.description,
                maxLines: isExpanded ? null : 3,
                overflow: isExpanded ? TextOverflow.visible : TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 15,
                  height: 1.6,
                  color: Color(0xFF555555),
                ),
              ),
              const SizedBox(height: 8),
              GestureDetector(
                onTap: () {
                  setState(() {
                    isExpanded = !isExpanded;
                  });
                },
                child: Row(
                  children: [
                    Text(
                      isExpanded ? "Read Less" : "Read More",
                      style: const TextStyle(
                        color: kPrimaryColor,
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                    Icon(
                      isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                      color: kPrimaryColor,
                      size: 18,
                    )
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
