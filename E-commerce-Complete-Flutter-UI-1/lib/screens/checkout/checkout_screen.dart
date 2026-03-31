import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../constants.dart';
import '../../models/user.dart';
import '../../providers/cart_provider.dart';
import '../../services/order_service.dart';
import '../../services/user_service.dart';

class CheckoutScreen extends StatefulWidget {
  static String routeName = "/checkout";

  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final OrderService _orderService = OrderService();
  final UserService _userService = UserService();

  UserAddress? _selectedShippingAddress;
  UserAddress? _selectedBillingAddress;
  String _selectedPaymentMethod = 'card';
  bool _sameAsShipping = true;
  bool _isLoading = false;
  List<UserAddress> _addresses = [];

  final List<Map<String, String>> _paymentMethods = [
    {'value': 'card', 'label': 'Credit/Debit Card', 'icon': '💳'},
    {'value': 'paypal', 'label': 'PayPal', 'icon': '🅿️'},
    {'value': 'google_pay', 'label': 'Google Pay', 'icon': 'G'},
    {'value': 'apple_pay', 'label': 'Apple Pay', 'icon': '🍎'},
    {'value': 'upi', 'label': 'UPI', 'icon': '📱'},
    {'value': 'cod', 'label': 'Cash on Delivery', 'icon': '💵'},
  ];

  @override
  void initState() {
    super.initState();
    _loadAddresses();
  }

  Future<void> _loadAddresses() async {
    try {
      final addresses = await _userService.fetchAddresses();
      setState(() {
        _addresses = addresses;
        if (addresses.isNotEmpty) {
          _selectedShippingAddress = addresses.firstWhere(
            (a) => a.isDefault,
            orElse: () => addresses.first,
          );
          if (_sameAsShipping) {
            _selectedBillingAddress = _selectedShippingAddress;
          }
        }
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading addresses: $e')),
        );
      }
    }
  }

  Future<void> _placeOrder() async {
    if (_selectedShippingAddress == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a shipping address')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final cartProvider = context.read<CartProvider>();
      final cartItems = cartProvider.items;

      // Convert cart items to order items format
      final orderItems = cartItems
          .map((item) => {
                'productId': int.tryParse(item.product.id) ?? 0,
                'name': item.product.title,
                'image': item.product.images.isNotEmpty
                    ? item.product.images.first
                    : '',
                'quantity': item.quantity,
                'price': item.product.price,
                'total': item.subtotal,
                'variant': item.variant,
              })
          .toList();

      // Prepare addresses
      final shippingAddress = {
        'fullName': _selectedShippingAddress!.fullName,
        'phone': _selectedShippingAddress!.phone,
        'addressLine1': _selectedShippingAddress!.addressLine1,
        'city': _selectedShippingAddress!.city,
        'state': _selectedShippingAddress!.state,
        'zipCode': _selectedShippingAddress!.zipCode,
        'country': _selectedShippingAddress!.country,
      };

      final billingAddress = _sameAsShipping
          ? shippingAddress
          : _selectedBillingAddress != null
              ? {
                  'fullName': _selectedBillingAddress!.fullName,
                  'phone': _selectedBillingAddress!.phone,
                  'addressLine1': _selectedBillingAddress!.addressLine1,
                  'city': _selectedBillingAddress!.city,
                  'state': _selectedBillingAddress!.state,
                  'zipCode': _selectedBillingAddress!.zipCode,
                  'country': _selectedBillingAddress!.country,
                }
              : shippingAddress;

      // Place order with payment
      await _orderService.placeOrderWithPayment(
        items: orderItems,
        shippingAddress: shippingAddress,
        billingAddress: billingAddress,
        paymentMethod: _selectedPaymentMethod,
        shippingMethod: 'standard',
      );

      if (!mounted) return;

      // Clear cart
      await cartProvider.clear();

      // Show success message
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Order placed successfully!'),
          backgroundColor: Colors.green,
        ),
      );

      // Navigate back to home or orders
      if (!mounted) return;
      Navigator.of(context).popUntil((route) => route.isFirst);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error placing order: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final cartProvider = context.watch<CartProvider>();
    final total = cartProvider.total;
    final subtotal = total / 1.1; // Approximate subtotal (assuming 10% tax)
    final tax = total - subtotal;
    final shipping = 0.0;

    return Scaffold(
      appBar: AppBar(
        title: const Text("Checkout"),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Shipping Address Section
                  _buildSectionTitle('Shipping Address'),
                  _addresses.isEmpty
                      ? _buildAddAddressButton()
                      : _buildAddressSelector(
                          _addresses,
                          _selectedShippingAddress,
                          (address) {
                            setState(() {
                              _selectedShippingAddress = address;
                              if (_sameAsShipping) {
                                _selectedBillingAddress = address;
                              }
                            });
                          },
                        ),
                  const SizedBox(height: 20),

                  // Billing Address Section
                  _buildSectionTitle('Billing Address'),
                  CheckboxListTile(
                    title: const Text('Same as shipping address'),
                    value: _sameAsShipping,
                    onChanged: (value) {
                      setState(() {
                        _sameAsShipping = value ?? true;
                        if (_sameAsShipping) {
                          _selectedBillingAddress = _selectedShippingAddress;
                        }
                      });
                    },
                  ),
                  if (!_sameAsShipping)
                    _addresses.isEmpty
                        ? _buildAddAddressButton()
                        : _buildAddressSelector(
                            _addresses,
                            _selectedBillingAddress,
                            (address) {
                              setState(() => _selectedBillingAddress = address);
                            },
                          ),
                  const SizedBox(height: 20),

                  // Payment Method Section
                  _buildSectionTitle('Payment Method'),
                  ..._paymentMethods.map((method) => RadioListTile<String>(
                        title: Row(
                          children: [
                            Text(method['icon'] ?? ''),
                            const SizedBox(width: 8),
                            Text(method['label'] ?? ''),
                          ],
                        ),
                        value: method['value'] ?? '',
                        groupValue: _selectedPaymentMethod,
                        onChanged: (value) {
                          setState(
                              () => _selectedPaymentMethod = value ?? 'card');
                        },
                      )),
                  const SizedBox(height: 20),

                  // Order Summary
                  _buildSectionTitle('Order Summary'),
                  _buildOrderSummary(subtotal, tax, shipping, total),
                  const SizedBox(height: 20),

                  // Place Order Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _placeOrder,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        backgroundColor: kPrimaryColor,
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Text(
                              'Place Order',
                              style: TextStyle(fontSize: 16),
                            ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildAddressSelector(
    List<UserAddress> addresses,
    UserAddress? selected,
    ValueChanged<UserAddress> onChanged,
  ) {
    return DropdownButtonFormField<UserAddress>(
      value: selected,
      isExpanded: true,
      decoration: const InputDecoration(
        border: OutlineInputBorder(),
        labelText: 'Select Address',
        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      ),
      // itemHeight: null allows items to have variable height, ensuring the Column fits
      // We use isDense: true to reduce internal padding if needed, but itemHeight: null is key.
      itemHeight: null, 
      items: addresses.map((address) {
        return DropdownMenuItem<UserAddress>(
          value: address,
          child: Column(
            mainAxisSize: MainAxisSize.min, // Important for fitting in the dropdown item area
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                address.fullName,
                style: const TextStyle(fontWeight: FontWeight.bold),
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Text(
                '${address.addressLine1}, ${address.city}, ${address.state} ${address.zipCode}',
                style: const TextStyle(fontSize: 12),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        );
      }).toList(),
      onChanged: (address) {
        if (address != null) onChanged(address);
      },
    );
  }

  Widget _buildAddAddressButton() {
    return OutlinedButton.icon(
      onPressed: () async {
        // Navigate to address management screen, then reload addresses
        await Navigator.of(context).pushNamed('/addresses');
        await _loadAddresses();
      },
      icon: const Icon(Icons.add),
      label: const Text('Add New Address'),
    );
  }

  Widget _buildOrderSummary(
    double subtotal,
    double tax,
    double shipping,
    double total,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          _buildSummaryRow('Subtotal', "\$${subtotal.toStringAsFixed(2)}"),
          _buildSummaryRow('Tax', "\$${tax.toStringAsFixed(2)}"),
          _buildSummaryRow('Shipping', "\$${shipping.toStringAsFixed(2)}"),
          const Divider(),
          _buildSummaryRow(
            'Total',
            "\$${total.toStringAsFixed(2)}",
            isTotal: true,
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              fontSize: isTotal ? 16 : 14,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              fontSize: isTotal ? 18 : 14,
            ),
          ),
        ],
      ),
    );
  }
}
