import '../models/user.dart';
import 'api_client.dart';

class UserService {
  UserService({ApiClient? client}) : _client = client ?? ApiClient();

  final ApiClient _client;

  Future<List<UserAddress>> fetchAddresses() async {
    final response = await _client.get('/users/addresses');
    final data = response['data'];
    final list =
        data is List ? data : data?['addresses'] as List<dynamic>? ?? [];
    return list
        .whereType<Map<String, dynamic>>()
        .map(UserAddress.fromJson)
        .toList();
  }

  Future<void> addAddress(Map<String, dynamic> body) async {
    await _client.post('/users/addresses', body: body);
  }

  Future<void> updateAddress(String id, Map<String, dynamic> body) async {
    await _client.put('/users/addresses/$id', body: body);
  }

  Future<void> deleteAddress(String id) async {
    await _client.delete('/users/addresses/$id');
  }

  Future<String> uploadProfilePicture(String filePath) async {
    final response = await _client.postMultipart(
      '/users/upload-avatar',
      files: {'avatar': filePath},
    );
    final data = response['data'] as Map<String, dynamic>?;
    return data?['avatarUrl'] as String? ?? '';
  }
}
