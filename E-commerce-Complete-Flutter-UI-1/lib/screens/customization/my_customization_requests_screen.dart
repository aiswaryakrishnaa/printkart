import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../constants.dart';
import '../../models/customization_request.dart';
import '../../services/customization_service.dart';

class MyCustomizationRequestsScreen extends StatefulWidget {
  static const String routeName = '/my-customization-requests';

  const MyCustomizationRequestsScreen({super.key});

  @override
  State<MyCustomizationRequestsScreen> createState() =>
      _MyCustomizationRequestsScreenState();
}

class _MyCustomizationRequestsScreenState
    extends State<MyCustomizationRequestsScreen> {
  final _service = CustomizationService();
  late Future<List<CustomizationRequest>> _future;

  @override
  void initState() {
    super.initState();
    _future = _service.fetchMyCustomizations();
  }

  Future<void> _reload() async {
    setState(() {
      _future = _service.fetchMyCustomizations();
    });
    await _future;
  }

  Color _statusColor(String s) {
    switch (s.toLowerCase()) {
      case 'completed':
        return Colors.green;
      case 'processing':
        return Colors.blue;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.orange;
    }
  }

  Widget _statusChip(String status) {
    final c = _statusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: c.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: c,
          fontWeight: FontWeight.w600,
          fontSize: 12,
        ),
      ),
    );
  }

  Color _paymentColor(String s) {
    switch (s.toLowerCase()) {
      case 'paid':
        return Colors.green;
      case 'failed':
        return Colors.red;
      default:
        return Colors.deepOrange;
    }
  }

  Widget _paymentChip(String? paymentStatus) {
    final s = (paymentStatus ?? 'pending').toLowerCase();
    final c = _paymentColor(s);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: c.withOpacity(0.12),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        'Pay: $s',
        style: TextStyle(
          color: c,
          fontWeight: FontWeight.w600,
          fontSize: 11,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Print & packaging orders'),
      ),
      body: RefreshIndicator(
        onRefresh: _reload,
        child: FutureBuilder<List<CustomizationRequest>>(
          future: _future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(24),
                children: [
                  Text(
                    'Could not load requests.\n${snapshot.error}',
                    style: TextStyle(color: Colors.grey.shade800),
                  ),
                  const SizedBox(height: 16),
                  FilledButton(
                    onPressed: _reload,
                    child: const Text('Retry'),
                  ),
                ],
              );
            }
            final list = snapshot.data ?? [];
            if (list.isEmpty) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: const [
                  SizedBox(height: 80),
                  Center(
                    child: Text(
                      'No customization requests yet.',
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                  ),
                ],
              );
            }
            return ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
              itemCount: list.length,
              separatorBuilder: (_, __) => const SizedBox(height: 14),
              itemBuilder: (context, index) {
                return _RequestCard(
                  request: list[index],
                  statusChip: _statusChip,
                  paymentChip: _paymentChip,
                  detailSection: _buildExpandedBody,
                  listContext: context,
                );
              },
            );
          },
        ),
      ),
    );
  }

  Widget _buildExpandedBody(BuildContext ctx, CustomizationRequest r) {
    final dateStr = r.createdAt != null
        ? '${r.createdAt!.toLocal()}'.split('.').first
        : '—';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Divider(height: 1),
        const SizedBox(height: 14),
        _detailRow('Request ID', '#${r.id}'),
        _detailRow('Status', r.status),
        _detailRow('Payment', (r.paymentStatus ?? 'pending').toLowerCase()),
        if (r.paymentReference != null && r.paymentReference!.isNotEmpty)
          _detailRow('Payment ref', r.paymentReference!),
        if (r.assignedShop != null && r.assignedShop!.trim().isNotEmpty)
          _detailRow('Assigned shop', r.assignedShop!.trim()),
        if (r.productLine != null && r.productLine!.isNotEmpty)
          _detailRow('Product line', r.productLine!),
        if (r.quantity != null)
          _detailRow('Quantity', '${r.quantity}'),
        _detailRow('Submitted', dateStr),
        if (r.amount != null)
          _detailRow('Quote total', '₹${r.amount!.toStringAsFixed(2)}'),
        if (r.paperPrice != null)
          _detailRow('Paper', '₹${r.paperPrice!.toStringAsFixed(2)}'),
        if (r.printingCharge != null)
          _detailRow('Printing', '₹${r.printingCharge!.toStringAsFixed(2)}'),
        if (r.dieCutting != null)
          _detailRow('Die cutting', '₹${r.dieCutting!.toStringAsFixed(2)}'),
        if (r.configOptions != null && r.configOptions!.isNotEmpty) ...[
          const SizedBox(height: 10),
          Text(
            'Configuration',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              color: Colors.grey.shade800,
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 6),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              r.configOptions!.entries.map((e) => '${e.key}: ${e.value}').join('\n'),
              style: TextStyle(fontSize: 12, color: Colors.grey.shade900, height: 1.35),
            ),
          ),
        ],
        const SizedBox(height: 12),
        Text(
          'Requirements',
          style: TextStyle(
            fontWeight: FontWeight.w600,
            color: Colors.grey.shade800,
            fontSize: 13,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          r.requirements,
          style: TextStyle(fontSize: 14, height: 1.45, color: Colors.grey.shade900),
        ),
        if (r.notes != null && r.notes!.trim().isNotEmpty) ...[
          const SizedBox(height: 14),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: kPrimaryLightColor,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: kPrimaryColor.withOpacity(0.25)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.info_outline, size: 18, color: kPrimaryColor),
                    const SizedBox(width: 6),
                    Text(
                      'Message from shop',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: kPrimaryColor,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  r.notes!,
                  style: TextStyle(fontSize: 14, height: 1.45, color: Colors.grey.shade900),
                ),
              ],
            ),
          ),
        ],
        if (r.fileUrl != null && r.fileUrl!.isNotEmpty) ...[
          const SizedBox(height: 14),
          Text(
            'Attachment',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              color: Colors.grey.shade800,
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 6),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: SelectableText(
                  r.fileUrl!,
                  style: TextStyle(fontSize: 12, color: Colors.blue.shade700),
                ),
              ),
              IconButton(
                tooltip: 'Copy link',
                icon: const Icon(Icons.copy, size: 20),
                onPressed: () async {
                  await Clipboard.setData(ClipboardData(text: r.fileUrl!));
                  if (!ctx.mounted) return;
                  ScaffoldMessenger.of(ctx).showSnackBar(
                    const SnackBar(content: Text('Link copied')),
                  );
                },
              ),
            ],
          ),
          if (r.fileName != null && r.fileName!.isNotEmpty)
            Text(
              r.fileName!,
              style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
            ),
        ],
        const SizedBox(height: 8),
      ],
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 108,
            child: Text(
              label,
              style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }
}

class _RequestCard extends StatelessWidget {
  const _RequestCard({
    required this.request,
    required this.statusChip,
    required this.paymentChip,
    required this.detailSection,
    required this.listContext,
  });

  final CustomizationRequest request;
  final Widget Function(String status) statusChip;
  final Widget Function(String? paymentStatus) paymentChip;
  final Widget Function(BuildContext ctx, CustomizationRequest r) detailSection;
  final BuildContext listContext;

  @override
  Widget build(BuildContext context) {
    final r = request;
    final date = r.createdAt != null
        ? '${r.createdAt!.toLocal()}'.split('.').first
        : '';
    final quote = r.amount != null ? '₹${r.amount!.toStringAsFixed(2)}' : 'Quote pending';

    return Material(
      elevation: 0,
      color: Colors.transparent,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey.shade300),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Theme(
          data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
          child: ExpansionTile(
            key: ValueKey<int>(r.id),
            tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 4),
            maintainState: true,
            shape: const Border(),
            collapsedShape: const Border(),
            leading: CircleAvatar(
              radius: 20,
              backgroundColor: kPrimaryColor.withOpacity(0.12),
              child: Text(
                '${r.id}',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: kPrimaryColor,
                ),
              ),
            ),
            title: Text(
              r.productType,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 16,
                height: 1.25,
              ),
            ),
            subtitle: Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.schedule, size: 14, color: Colors.grey.shade600),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          date.isEmpty ? '—' : date,
                          style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      statusChip(r.status),
                      const SizedBox(width: 8),
                      paymentChip(r.paymentStatus),
                      const Spacer(),
                      Text(
                        quote,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          color: kPrimaryColor,
                          fontSize: 15,
                        ),
                      ),
                    ],
                  ),
                  if (r.assignedShop != null && r.assignedShop!.trim().isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(
                      'Shop: ${r.assignedShop!.trim()}',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade700,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                  const SizedBox(height: 6),
                  Text(
                    'Tap to view details',
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.grey.shade500,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ),
            ),
            children: [detailSection(listContext, r)],
          ),
        ),
      ),
    );
  }
}
