import 'api_client.dart';

class ChatService {
  final ApiClient _apiClient = ApiClient();

  Future<Map<String, dynamic>> getOrCreateRoom() async {
    return _apiClient.get('/chat/room');
  }

  Future<List<dynamic>> getMessages(int roomId) async {
    final response = await _apiClient.get('/chat/messages/$roomId');
    return response['data'] as List<dynamic>;
  }

  Future<Map<String, dynamic>> sendMessage(int roomId, String message) async {
    return _apiClient.post('/chat/send', body: {
      'roomId': roomId,
      'message': message,
    });
  }

  Future<int> getUnreadCount() async {
    try {
      final response = await _apiClient.get('/chat/unread-count');
      return response['count'] ?? 0;
    } catch (e) {
      return 0;
    }
  }
}
