import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../constants.dart';
import '../../../models/cart.dart';
import '../../../providers/cart_provider.dart';

class CartCard extends StatelessWidget {
  const CartCard({
    Key? key,
    required this.cart,
  }) : super(key: key);

  final CartItem cart;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(
          width: 88,
          child: AspectRatio(
            aspectRatio: 0.88,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFF5F6F9),
                borderRadius: BorderRadius.circular(15),
              ),
              child: CachedNetworkImage(
                imageUrl: cart.product.images.first,
                fit: BoxFit.cover,
                errorWidget: (context, url, error) => const Icon(Icons.broken_image),
              ),
            ),
          ),
        ),
        const SizedBox(width: 20),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                cart.product.title,
                style: const TextStyle(color: Colors.black, fontSize: 16),
                maxLines: 2,
              ),
              const SizedBox(height: 8),
              
              // Price
              Text(
                  "₹${cart.product.price.toStringAsFixed(2)}",
                  style: const TextStyle(
                      fontWeight: FontWeight.w600, color: kPrimaryColor, fontSize: 16),
              ),
              const SizedBox(height: 8),

              // Quantity & Delete Controls
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Quantity Controls
                  Row(
                    children: [
                      _buildQtyButton(
                        icon: Icons.remove, 
                        onTap: () {
                          if (cart.quantity > 1) {
                            context.read<CartProvider>().updateQuantity(cart.id, cart.quantity - 1);
                          }
                        }
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Text(
                          "${cart.quantity}",
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ),
                      _buildQtyButton(
                        icon: Icons.add, 
                        onTap: () {
                          context.read<CartProvider>().updateQuantity(cart.id, cart.quantity + 1);
                        }
                      ),
                    ],
                  ),
                  
                  // Delete Button
                  IconButton(
                    icon: const Icon(Icons.delete_outline, color: Colors.red),
                    onPressed: () {
                       context.read<CartProvider>().removeItem(cart.id);
                    },
                  ),
                ],
              ),
            ],
          ),
        )
      ],
    );
  }

  Widget _buildQtyButton({required IconData icon, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(15),
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: const Color(0xFFF5F6F9),
          borderRadius: BorderRadius.circular(15),
        ),
        child: Icon(icon, size: 16, color: Colors.black54),
      ),
    );
  }
}
