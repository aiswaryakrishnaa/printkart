class CustomizationRequest {
  CustomizationRequest({
    required this.id,
    required this.productType,
    required this.requirements,
    required this.status,
    this.productLine,
    this.quantity,
    this.amount,
    this.paperPrice,
    this.printingCharge,
    this.dieCutting,
    this.configOptions,
    this.fileUrl,
    this.fileName,
    this.notes,
    this.paymentStatus,
    this.paymentReference,
    this.assignedShop,
    this.createdAt,
  });

  final int id;
  final String productType;
  final String requirements;
  final String status;
  final String? productLine;
  final int? quantity;
  final double? amount;
  final double? paperPrice;
  final double? printingCharge;
  final double? dieCutting;
  final Map<String, dynamic>? configOptions;
  final String? fileUrl;
  final String? fileName;
  final String? notes;
  final String? paymentStatus;
  final String? paymentReference;
  final String? assignedShop;
  final DateTime? createdAt;

  factory CustomizationRequest.fromJson(Map<String, dynamic> json) {
    return CustomizationRequest(
      id: json['id'] is int ? json['id'] as int : int.tryParse('${json['id']}') ?? 0,
      productType: json['productType'] as String? ?? '',
      requirements: json['requirements'] as String? ?? '',
      status: json['status'] as String? ?? 'pending',
      productLine: json['productLine'] as String?,
      quantity: json['quantity'] is int
          ? json['quantity'] as int
          : int.tryParse('${json['quantity'] ?? ''}'),
      amount: _parseAmount(json['amount']),
      paperPrice: _parseAmount(json['paperPrice']),
      printingCharge: _parseAmount(json['printingCharge']),
      dieCutting: _parseAmount(json['dieCutting']),
      configOptions: json['configOptions'] is Map<String, dynamic>
          ? Map<String, dynamic>.from(json['configOptions'] as Map)
          : null,
      fileUrl: json['fileUrl'] as String?,
      fileName: json['fileName'] as String?,
      notes: json['notes'] as String?,
      paymentStatus: json['paymentStatus'] as String?,
      paymentReference: json['paymentReference'] as String?,
      assignedShop: json['assignedShop'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
    );
  }

  static double? _parseAmount(dynamic v) {
    if (v == null) return null;
    if (v is num) return v.toDouble();
    return double.tryParse(v.toString());
  }
}
