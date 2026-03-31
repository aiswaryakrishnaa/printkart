class Category {
  Category({
    required this.id,
    required this.name,
    this.icon,
    this.type,
  });

  final String id;
  final String name;
  final String? icon;
  final String? type;

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: '${json['id'] ?? json['_id'] ?? ''}',
      name: json['name'] as String? ?? json['title'] as String? ?? '',
      icon: json['icon'] as String?,
      type: json['type'] as String?,
    );
  }
}
