import 'package:flutter/foundation.dart';

import '../services/api_client.dart';

class NotificationModel {
  final int id;
  final String title;
  final String message;
  final String type;
  final bool isRead;
  final DateTime createdAt;

  NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.isRead,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] as int,
      title: json['title'] as String? ?? 'Notification',
      message: json['message'] as String? ?? '',
      type: json['type'] as String? ?? 'system',
      isRead: json['isRead'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

class NotificationProvider extends ChangeNotifier {
  NotificationProvider({ApiClient? apiClient})
      : _apiClient = apiClient ?? ApiClient();

  final ApiClient _apiClient;

  List<NotificationModel> _notifications = [];
  int _unreadCount = 0;
  bool _loading = false;

  List<NotificationModel> get notifications => _notifications;
  int get unreadCount => _unreadCount;
  bool get isLoading => _loading;

  /// Local-only rows for demo when the API has nothing or is unreachable.
  static bool _isDummyId(int id) => id <= -100000;

  static List<NotificationModel> _dummyNotifications() {
    final now = DateTime.now();
    return [
      NotificationModel(
        id: -100001,
        title: 'Order update',
        message: 'Your order #1042 is packed and will ship tomorrow.',
        type: 'order',
        isRead: false,
        createdAt: now.subtract(const Duration(hours: 2)),
      ),
      NotificationModel(
        id: -100002,
        title: 'Weekend offer',
        message: 'Get 15% off novels this weekend. Tap to browse popular picks.',
        type: 'promotion',
        isRead: false,
        createdAt: now.subtract(const Duration(hours: 5)),
      ),
      NotificationModel(
        id: -100003,
        title: 'Payment confirmed',
        message: 'We received your payment. Thank you for shopping with us.',
        type: 'payment',
        isRead: true,
        createdAt: now.subtract(const Duration(days: 1)),
      ),
    ];
  }

  static int _countUnread(List<NotificationModel> list) =>
      list.where((n) => !n.isRead).length;

  Future<void> fetchNotifications() async {
    _setLoading(true);
    try {
      final response = await _apiClient.get('/notifications?limit=50');
      final data = response['data'];
      if (data != null && data['notifications'] != null) {
        final List<dynamic> list = data['notifications'];
        _notifications = list.map((item) => NotificationModel.fromJson(item)).toList();
        _unreadCount = (data['unreadCount'] as num?)?.toInt() ??
            _countUnread(_notifications);
        if (_notifications.isEmpty) {
          _notifications = _dummyNotifications();
          _unreadCount = _countUnread(_notifications);
        }
      } else {
        _notifications = _dummyNotifications();
        _unreadCount = _countUnread(_notifications);
      }
    } catch (e) {
      debugPrint('Error fetching notifications: $e');
      _notifications = _dummyNotifications();
      _unreadCount = _countUnread(_notifications);
    } finally {
      _setLoading(false);
    }
  }

  Future<void> markAsRead(int id) async {
    try {
      if (!_isDummyId(id)) {
        await _apiClient.put('/notifications/$id/read');
      }
      final index = _notifications.indexWhere((n) => n.id == id);
      if (index != -1) {
        final wasUnread = !_notifications[index].isRead;
        _notifications[index] = NotificationModel(
          id: _notifications[index].id,
          title: _notifications[index].title,
          message: _notifications[index].message,
          type: _notifications[index].type,
          isRead: true,
          createdAt: _notifications[index].createdAt,
        );
        if (wasUnread) {
          _unreadCount = (_unreadCount - 1).clamp(0, 1000);
        }
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error marking notification as read: $e');
    }
  }

  void _setLoading(bool value) {
    _loading = value;
    notifyListeners();
  }
}
