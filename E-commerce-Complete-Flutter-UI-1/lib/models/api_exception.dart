class ApiException implements Exception {
  ApiException({
    required this.statusCode,
    required this.message,
    this.code,
    this.details,
  });

  final int statusCode;
  final String message;
  final String? code;
  final Object? details;

  factory ApiException.fromJson({
    required int statusCode,
    required Map<String, dynamic> body,
  }) {
    final error = body['error'] as Map<String, dynamic>? ?? {};
    return ApiException(
      statusCode: statusCode,
      message: error['message'] as String? ??
          body['message'] as String? ??
          'Unknown error',
      code: error['code'] as String?,
      details: error['details'],
    );
  }

  @override
  String toString() {
    final buffer = StringBuffer('ApiException($statusCode');
    if (code != null) buffer.write(', code: $code');
    buffer.write(', message: $message)');
    return buffer.toString();
  }
}
