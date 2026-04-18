import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:shop_app/constants.dart';
import 'package:shop_app/services/customization_service.dart';

/// Configure product options and see live price; upload design and confirm order.
class ConfigureProductScreen extends StatefulWidget {
  static const String routeName = '/configure-product';

  const ConfigureProductScreen({Key? key}) : super(key: key);

  @override
  State<ConfigureProductScreen> createState() => _ConfigureProductScreenState();
}

class _ConfigureProductScreenState extends State<ConfigureProductScreen> {
  final CustomizationService _customizationService = CustomizationService();

  String? _productLine;
  String? _productSubType;
  String? _productTitle;

  // Packaging / generic
  final _lController = TextEditingController(text: '10');
  final _hController = TextEditingController(text: '10');
  final _wController = TextEditingController(text: '10');
  String _gsm = '350';
  String? _paperType;
  String? _lamination;
  String? _laminationType;

  // Printing
  String? _size; // A4, A5
  String? _colour;
  String? _side;
  String? _noOfSheets;

  // Paper bag
  String? _sizeKey; // small, medium, large

  String _quantity = '1000';
  String? _selectedFilePath;
  String? _selectedFileName;

  Map<String, dynamic>? _priceResult;
  bool _loadingPrice = false;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadArgs());
  }

  void _loadArgs() {
    final args =
        ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    if (args == null) return;
    setState(() {
      _productLine = args['productLine'] as String? ?? 'printing';
      _productSubType = args['productSubType'] as String? ?? 'notice';
      _productTitle = args['productTitle'] as String? ?? 'Product';
      if (_productLine == 'printing') {
        _size = _productSubType == 'notice' ? 'A4' : null;
        _noOfSheets = _productSubType == 'calendar' ? '6' : null;
        _colour = _productSubType == 'notice' ? '4' : '2';
        _side = 'Single';
        if (_productSubType == 'notice') {
          _gsm = _colour == '4' ? '100' : '70';
        } else if (_productSubType == 'visiting_card') {
          _gsm = '400';
          if (_quantity != '1000' && _quantity != '2000') {
            _quantity = '1000';
          }
        } else if (_productSubType == 'calendar') {
          _gsm = '90';
          const calQty = ['1000', '2000', '3000', '4000', '5000'];
          if (!calQty.contains(_quantity)) {
            _quantity = '1000';
          }
        }
      } else {
        _paperType = 'white back';
        _lamination = 'no';
        _sizeKey = _productSubType == 'paper_bag' ? 'medium' : null;
        if (_productSubType == 'paper_bag') {
          const bagQty = ['1000', '2000', '5000'];
          if (!bagQty.contains(_quantity)) {
            _quantity = '1000';
          }
        } else if (_productLine == 'packaging') {
          const boxQty = ['1000', '2000', '3000', '5000'];
          if (!boxQty.contains(_quantity)) {
            _quantity = '1000';
          }
          _gsm = _gsm == '400' ? '400' : '350';
        }
      }
      _fetchPrice();
    });
  }

  Map<String, dynamic> _buildRequestBody() {
    final body = <String, dynamic>{
      'productLine': _productLine,
      'productSubType': _productSubType,
      'quantity': int.tryParse(_quantity) ?? 1000,
    };
    if (_productLine == 'packaging') {
      if (_productSubType == 'paper_bag') {
        body['sizeKey'] = _sizeKey ?? 'medium';
        body['gsm'] = int.tryParse(_gsm) ?? 350;
      } else {
        body['l'] = double.tryParse(_lController.text) ?? 10;
        body['h'] = double.tryParse(_hController.text) ?? 10;
        body['w'] = double.tryParse(_wController.text) ?? 10;
        body['gsm'] = int.tryParse(_gsm) ?? 350;
      }
    } else {
      body['size'] = _size;
      body['gsm'] = int.tryParse(_gsm);
      body['noOfSheets'] =
          _noOfSheets != null ? int.tryParse(_noOfSheets!) : null;
      body['side'] = _side;
      if (_productSubType == 'notice') {
        body['colour'] = _colour ?? '4';
      }
    }
    return body;
  }

  Future<void> _fetchPrice() async {
    setState(() => _loadingPrice = true);
    try {
      final result =
          await _customizationService.calculatePrice(_buildRequestBody());
      if (mounted)
        setState(() {
          _priceResult = result;
          _loadingPrice = false;
        });
    } catch (e) {
      if (mounted)
        setState(() {
          _priceResult = null;
          _loadingPrice = false;
        });
    }
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'jpg', 'png', 'jpeg'],
    );
    if (result != null && result.files.single.path != null) {
      final f = result.files.single;
      if (f.size > 10 * 1024 * 1024) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('File too large. Max 10MB.'),
                backgroundColor: Colors.red),
          );
        }
        return;
      }
      setState(() {
        _selectedFilePath = f.path;
        _selectedFileName = f.name;
      });
    }
  }

  Future<bool> _runDummyPayment(double amount) async {
    final ok = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Text('Dummy payment'),
        content: Text(
          'Simulate a successful payment of ₹${amount.toStringAsFixed(2)}?\n\n'
          'No real money is charged — demo only.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Pay now'),
          ),
        ],
      ),
    );
    return ok ?? false;
  }

  Future<void> _confirmOrder() async {
    if (_priceResult == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please wait for price to load.')),
      );
      return;
    }
    final total = (_priceResult!['total'] as num?)?.toDouble() ?? 0.0;
    final isPrintOrPackaging =
        _productLine == 'printing' || _productLine == 'packaging';
    if (isPrintOrPackaging) {
      final paid = await _runDummyPayment(total);
      if (!paid) return;
    }

    setState(() => _submitting = true);
    try {
      final configOptions = <String, dynamic>{
        'quantity': int.tryParse(_quantity) ?? 1000,
        'gsm': _gsm,
      };
      if (_productLine == 'packaging') {
        if (_productSubType == 'paper_bag') {
          configOptions['sizeKey'] = _sizeKey;
        } else {
          configOptions['l'] = _lController.text;
          configOptions['h'] = _hController.text;
          configOptions['w'] = _wController.text;
          configOptions['paperType'] = _paperType;
          configOptions['lamination'] = _lamination;
          if (_lamination == 'yes')
            configOptions['laminationType'] = _laminationType;
        }
      } else {
        configOptions['size'] = _size;
        configOptions['colour'] = _colour;
        configOptions['side'] = _side;
        configOptions['noOfSheets'] = _noOfSheets;
      }

      final paperPrice = (_priceResult!['paperPrice'] as num?)?.toDouble();
      final printingCharge =
          (_priceResult!['printingCharge'] as num?)?.toDouble();
      final dieCutting = (_priceResult!['dieCutting'] as num?)?.toDouble();

      await _customizationService.submitCustomization(
        productType: _productSubType ?? 'custom',
        productLine: _productLine,
        requirements: 'Config: $_productTitle - ${configOptions.toString()}',
        configOptions: configOptions,
        quantity: int.tryParse(_quantity) ?? 1000,
        amount: total,
        paperPrice: paperPrice,
        printingCharge: printingCharge,
        dieCutting: dieCutting,
        filePath: _selectedFilePath,
        dummyPaymentSucceeded: isPrintOrPackaging,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Order submitted successfully!')),
        );
        Navigator.of(context).pushNamedAndRemoveUntil(
          kMainShellRoute,
          (route) => false,
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  void dispose() {
    _lController.dispose();
    _hController.dispose();
    _wController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isPrinting = _productLine == 'printing';
    final isPaperBag = _productSubType == 'paper_bag';

    return Scaffold(
      appBar: AppBar(
        title: Text(_productTitle ?? 'Configure'),
        backgroundColor: kPrimaryColor,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (isPrinting)
              ..._buildPrintingFields()
            else
              ..._buildPackagingFields(isPaperBag),
            const SizedBox(height: 24),
            const Text('Quantity',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              isExpanded: true,
              value: _quantity,
              decoration: const InputDecoration(border: OutlineInputBorder()),
              items: (isPrinting
                      ? (_productSubType == 'visiting_card'
                          ? ['1000', '2000']
                          : _productSubType == 'calendar'
                              ? [
                                  '1000',
                                  '2000',
                                  '3000',
                                  '4000',
                                  '5000'
                                ]
                              : [
                                  '1000',
                                  '2000',
                                  '3000',
                                  '4000',
                                  '5000',
                                  '10000'
                                ])
                      : (isPaperBag
                          ? ['1000', '2000', '5000']
                          : ['1000', '2000', '3000', '5000']))
                  .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                  .toList(),
              onChanged: (v) => setState(() {
                _quantity = v ?? _quantity;
                _fetchPrice();
              }),
            ),
            const SizedBox(height: 24),
            if (_loadingPrice)
              const Center(
                  child: Padding(
                      padding: EdgeInsets.all(24),
                      child: CircularProgressIndicator()))
            else if (_priceResult != null) ...[
              const Text('Price breakdown',
                  style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      if (_productLine == 'packaging' &&
                          !isPaperBag &&
                          _priceResult!['gsmUsed'] != null) ...[
                        _row(
                          'Board (GSM × rate)',
                          '${_priceResult!['gsmUsed']} gsm × ${_priceResult!['rateUsed']}',
                          plainRight: true,
                        ),
                      ],
                      _row('Paper Price', _priceResult!['paperPrice']),
                      _row('Printing charge', _priceResult!['printingCharge']),
                      _row('Die cutting', _priceResult!['dieCutting']),
                      const Divider(),
                      _row('Total', _priceResult!['total'], bold: true),
                      if (isPrinting ||
                          isPaperBag ||
                          (_productLine == 'packaging' && !isPaperBag)) ...[
                        const SizedBox(height: 8),
                        Text(
                          isPaperBag
                              ? 'GST is charged in addition to these bag rates.'
                              : isPrinting
                                  ? 'GST is charged in addition to these sheet rates.'
                                  : 'GST is charged in addition to these packaging totals.',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade700,
                            height: 1.35,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
            const SizedBox(height: 24),
            const Text('Upload design (optional)',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            InkWell(
              onTap: _pickFile,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.attach_file, color: kPrimaryColor),
                    const SizedBox(width: 12),
                    Expanded(
                        child:
                            Text(_selectedFileName ?? 'Select PDF or image')),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _submitting ? null : _confirmOrder,
                style: ElevatedButton.styleFrom(
                  backgroundColor: kPrimaryColor,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                ),
                child: _submitting
                    ? const SizedBox(
                        height: 24,
                        width: 24,
                        child: CircularProgressIndicator(color: Colors.white))
                    : const Text('Confirm order',
                        style: TextStyle(fontSize: 18, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildPrintingFields() {
    final isNotice = _productSubType == 'notice';
    final isCalendar = _productSubType == 'calendar';
    return [
      if (isNotice) ...[
        _dropdown(
            'Size',
            _size,
            ['A4', 'A5'],
            (v) => setState(() {
                  _size = v;
                  _fetchPrice();
                })),
        Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Text(
            'Colour sets which price table applies (GST is added on top of sheet rates).',
            style: TextStyle(fontSize: 12, color: Colors.grey.shade700, height: 1.35),
          ),
        ),
        DropdownButtonFormField<String>(
          isExpanded: true,
          value: _colour ?? '4',
          decoration: const InputDecoration(
            labelText: 'Print type (colour)',
            border: OutlineInputBorder(),
          ),
          items: const [
            DropdownMenuItem(
              value: '4',
              child: Text(
                '4 — Full colour (100 gsm notice rates)',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            DropdownMenuItem(
              value: '2',
              child: Text(
                '2 — Single colour (70 gsm rates)',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
          onChanged: (v) => setState(() {
            _colour = v ?? '4';
            _gsm = _colour == '4' ? '100' : '70';
            _fetchPrice();
          }),
        ),
        const SizedBox(height: 16),
        _dropdown(
            'Side',
            _side,
            ['Single', 'Double'],
            (v) => setState(() {
                  _side = v;
                  _fetchPrice();
                })),
      ],
      if (isCalendar) ...[
        Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Text(
            'Rates shown are for 90 gsm; 100 gsm uses the same quantity tiers with a 100/90 price adjustment (GST extra).',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey.shade700,
              height: 1.35,
            ),
          ),
        ),
        _dropdown(
            'No. of sheets',
            _noOfSheets,
            ['3', '6'],
            (v) => setState(() {
                  _noOfSheets = v;
                  _fetchPrice();
                })),
        _dropdown(
            'GSM',
            _gsm,
            ['90', '100'],
            (v) => setState(() {
                  _gsm = v ?? _gsm;
                  _fetchPrice();
                })),
      ],
      if (_productSubType == 'visiting_card') ...[
        Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Text(
            '400 gsm visiting card — prices are for 1000 or 2000 cards (GST is added on top).',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey.shade700,
              height: 1.35,
            ),
          ),
        ),
        _dropdown(
            'Side',
            _side,
            ['Single', 'Double'],
            (v) => setState(() {
                  _side = v;
                  _fetchPrice();
                })),
      ],
    ];
  }

  List<Widget> _buildPackagingFields(bool isPaperBag) {
    if (isPaperBag) {
      return [
        _dropdown(
            'Size',
            _sizeKey == 'small'
                ? 'Small'
                : _sizeKey == 'large'
                    ? 'Large'
                    : 'Medium',
            ['Small', 'Medium', 'Large'], (v) {
          setState(() {
            _sizeKey = v?.toLowerCase() ?? 'medium';
            _fetchPrice();
          });
        }),
        Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Text(
            'Prices follow the paper-bag tariff (1000 / 2000 / 5000 copies by size). GSM is for your order notes only.',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey.shade700,
              height: 1.35,
            ),
          ),
        ),
        _dropdown(
            'GSM (notes)',
            _gsm,
            ['350', '400'],
            (v) => setState(() {
                  _gsm = v ?? _gsm;
                  _fetchPrice();
                })),
      ];
    }
    return [
      const Text('Size (L × H × W)',
          style: TextStyle(fontWeight: FontWeight.bold)),
      const SizedBox(height: 8),
      Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Text(
          'Paper = ((L×H×W+1.5) × GSM × Rate ÷ 100,000,000) × boxes. '
          'Only 350 gsm (rate 65) and 400 gsm (rate 55); heavier gsm uses a lower rate in this sheet, so paper line can be less than 350 gsm for the same size. '
          'Printing ₹4600 + die ₹1/box (GST extra). Quantities: 1000 / 2000 / 3000 / 5000.',
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade700,
            height: 1.35,
          ),
        ),
      ),
      Row(
        children: [
          Expanded(
              child: TextFormField(
                  controller: _lController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'L'),
                  onChanged: (_) => _fetchPrice())),
          const SizedBox(width: 8),
          Expanded(
              child: TextFormField(
                  controller: _hController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'H'),
                  onChanged: (_) => _fetchPrice())),
          const SizedBox(width: 8),
          Expanded(
              child: TextFormField(
                  controller: _wController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'W'),
                  onChanged: (_) => _fetchPrice())),
        ],
      ),
      const SizedBox(height: 16),
      _dropdown(
          'Paper type',
          _paperType,
          ['white back', 'gray back'],
          (v) => setState(() {
                _paperType = v;
                _fetchPrice();
              })),
      _dropdown(
          'GSM',
          _gsm,
          ['350', '400'],
          (v) => setState(() {
                _gsm = v ?? _gsm;
                _fetchPrice();
              })),
      _dropdown(
          'Lamination',
          _lamination,
          ['yes', 'no'],
          (v) => setState(() {
                _lamination = v;
                _fetchPrice();
              })),
      if (_lamination == 'yes')
        _dropdown(
            'Finish',
            _laminationType,
            ['gloss', 'matt'],
            (v) => setState(() {
                  _laminationType = v;
                  _fetchPrice();
                })),
    ];
  }

  Widget _dropdown(String label, String? value, List<String> options,
      ValueChanged<String?> onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: DropdownButtonFormField<String>(
        isExpanded: true,
        value: value ?? options.first,
        decoration: InputDecoration(
            labelText: label, border: const OutlineInputBorder()),
        items: options
            .map((e) => DropdownMenuItem(
                  value: e,
                  child: Text(e, overflow: TextOverflow.ellipsis),
                ))
            .toList(),
        onChanged: onChanged,
      ),
    );
  }

  Widget _row(String label, dynamic value,
      {bool bold = false, bool plainRight = false}) {
    final v =
        value is num ? value.toStringAsFixed(2) : value?.toString() ?? '0';
    final right = plainRight ? v : '₹ $v';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: TextStyle(fontWeight: bold ? FontWeight.bold : null)),
          Text(right,
              style: TextStyle(fontWeight: bold ? FontWeight.bold : null)),
        ],
      ),
    );
  }
}
