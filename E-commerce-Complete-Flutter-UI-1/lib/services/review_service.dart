import 'api_client.dart';

class Review {
  Review({
    required this.id,
    required this.rating,
    required this.title,
    required this.comment,
    required this.userName,
    this.createdAt,
    this.images = const [],
    this.helpfulCount = 0,
  });

  final String id;
  final double rating;
  final String title;
  final String comment;
  final String userName;
  final DateTime? createdAt;
  final List<String> images;
  final int helpfulCount;

  factory Review.fromJson(Map<String, dynamic> json) {
    final images = <String>[];
    final imagesList = json['images'] ?? [];
    if (imagesList is List) {
      for (final img in imagesList) {
        if (img is String && img.isNotEmpty) {
          images.add(img);
        }
      }
    }

    DateTime? createdAt;
    if (json['createdAt'] != null) {
      createdAt = DateTime.tryParse(json['createdAt'].toString());
    }

    final user = json['user'] as Map<String, dynamic>? ?? {};
    final userName =
        user['fullName'] as String? ?? user['name'] as String? ?? 'Anonymous';

    return Review(
      id: '${json['id'] ?? json['_id'] ?? ''}',
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      title: json['title'] as String? ?? '',
      comment: json['comment'] as String? ?? json['review'] as String? ?? '',
      userName: userName,
      createdAt: createdAt,
      images: images,
      helpfulCount: (json['helpfulCount'] as num?)?.toInt() ?? 0,
    );
  }
}

class ReviewService {
  ReviewService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  final ApiClient _apiClient;

  Future<List<Review>> fetchProductReviews(
    String productId, {
    int page = 1,
    int limit = 10,
    String sort = 'newest',
  }) async {
    final params = {
      'page': page.toString(),
      'limit': limit.toString(),
      'sort': sort,
    };
    final response = await _apiClient.get(
      '/reviews/product/$productId',
      queryParameters: params,
    );
    final data = response['data'];
    final list = data is List ? data : data?['reviews'] as List<dynamic>? ?? [];
    return list.whereType<Map<String, dynamic>>().map(Review.fromJson).toList();
  }

  Future<Review> createReview({
    required String productId,
    required double rating,
    required String title,
    required String comment,
    List<String>? images,
  }) async {
    final response = await _apiClient.post(
      '/reviews/product/$productId',
      body: {
        'rating': rating,
        'title': title,
        'comment': comment,
        if (images != null && images.isNotEmpty) 'images': images,
      },
    );
    final data = response['data'] as Map<String, dynamic>? ?? {};
    final reviewJson = data['review'] as Map<String, dynamic>? ?? data;
    return Review.fromJson(reviewJson);
  }

  Future<void> updateReview({
    required String reviewId,
    double? rating,
    String? title,
    String? comment,
    List<String>? images,
  }) async {
    final body = <String, dynamic>{};
    if (rating != null) body['rating'] = rating;
    if (title != null) body['title'] = title;
    if (comment != null) body['comment'] = comment;
    if (images != null) body['images'] = images;

    await _apiClient.put('/reviews/$reviewId', body: body);
  }

  Future<void> deleteReview(String reviewId) async {
    await _apiClient.delete('/reviews/$reviewId');
  }

  Future<void> markHelpful(String reviewId) async {
    await _apiClient.post('/reviews/$reviewId/helpful');
  }
}
