import 'dart:async';
import 'package:flutter/material.dart';
import '../services/chat_service.dart';

class ChatProvider extends ChangeNotifier {
  final ChatService _chatService = ChatService();
  int _unreadCount = 0;
  Timer? _timer;

  int get unreadCount => _unreadCount;

  ChatProvider() {
    startPolling();
  }

  void startPolling() {
    _timer?.cancel();
    _fetchUnreadCount();
    _timer = Timer.periodic(const Duration(seconds: 10), (timer) {
      _fetchUnreadCount();
    });
  }

  Future<void> _fetchUnreadCount() async {
    final count = await _chatService.getUnreadCount();
    if (_unreadCount != count) {
      _unreadCount = count;
      notifyListeners();
    }
  }

  void resetCount() {
    _unreadCount = 0;
    notifyListeners();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
