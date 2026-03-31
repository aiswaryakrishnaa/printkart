import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../../services/customization_service.dart';
import '../../constants.dart';

class CustomizationScreen extends StatefulWidget {
  static String routeName = "/customization";

  const CustomizationScreen({super.key});

  @override
  State<CustomizationScreen> createState() => _CustomizationScreenState();
}

class _CustomizationScreenState extends State<CustomizationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _customizationService = CustomizationService();
  
  String? _productType;
  String? _requirements;
  String? _selectedFilePath;
  String? _selectedFileName;
  bool _isLoading = false;

  Future<void> _pickFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'jpg', 'png', 'jpeg'],
    );

    if (result != null) {
      final file = result.files.single;
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text("File too large. Maximum size is 10MB."),
              backgroundColor: Colors.red,
            ),
          );
        }
        return;
      }

      if (mounted) {
        setState(() {
          _selectedFilePath = file.path;
          _selectedFileName = file.name;
        });
      }
    }
  }

  Future<void> _submit() async {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      
      setState(() => _isLoading = true);
      
      try {
        await _customizationService.submitCustomization(
          productType: _productType!,
          requirements: _requirements!,
          filePath: _selectedFilePath,
        );
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Request submitted successfully!")),
          );
          Navigator.pop(context);
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text("Error: $e")),
          );
        }
      } finally {
        if (mounted) setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Customization Request"),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: _isLoading 
            ? const Center(child: CircularProgressIndicator())
            : SingleChildScrollView(
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Tell us what you need",
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        "Describe your bespoke requirements and upload any reference designs or documents.",
                        style: TextStyle(color: Colors.grey),
                      ),
                      const SizedBox(height: 30),
                      TextFormField(
                        onSaved: (newValue) => _productType = newValue,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return "Please enter product type";
                          }
                          return null;
                        },
                        decoration: const InputDecoration(
                          labelText: "Product Type",
                          hintText: "e.g. Wedding Invitation, Custom Journal",
                          floatingLabelBehavior: FloatingLabelBehavior.always,
                        ),
                      ),
                      const SizedBox(height: 20),
                      TextFormField(
                        maxLines: 5,
                        onSaved: (newValue) => _requirements = newValue,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return "Please describe your requirements";
                          }
                          return null;
                        },
                        decoration: const InputDecoration(
                          labelText: "Requirements",
                          hintText: "Enter detailed specifications here...",
                          floatingLabelBehavior: FloatingLabelBehavior.always,
                        ),
                      ),
                      const SizedBox(height: 30),
                      const Text(
                        "Reference Document (Optional)",
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 10),
                      InkWell(
                        onTap: _pickFile,
                        child: Container(
                          padding: const EdgeInsets.all(15),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey.shade300),
                            borderRadius: BorderRadius.circular(10),
                            color: Colors.grey.shade50,
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.attach_file, color: kPrimaryColor),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  _selectedFileName ?? "Select PDF or Image file",
                                  style: TextStyle(
                                    color: _selectedFileName == null ? Colors.grey : Colors.black,
                                  ),
                                ),
                              ),
                              if (_selectedFileName != null)
                                IconButton(
                                  icon: const Icon(Icons.close, size: 20),
                                  onPressed: () {
                                    setState(() {
                                      _selectedFilePath = null;
                                      _selectedFileName = null;
                                    });
                                  },
                                ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 40),
                      SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: ElevatedButton(
                          onPressed: _submit,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: kPrimaryColor,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                          ),
                          child: const Text(
                            "Submit Request",
                            style: TextStyle(
                              fontSize: 18,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
        ),
      ),
    );
  }
}
