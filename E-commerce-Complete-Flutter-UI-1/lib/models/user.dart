import '../config/app_config.dart';

class UserProfile {
  UserProfile({
    required this.id,
    required this.fullName,
    required this.email,
    this.phone,
    this.avatar,
    this.addresses = const [],
  });

  final String id;
  final String fullName;
  final String email;
  final String? phone;
  final String? avatar;
  final List<UserAddress> addresses;

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    final addresses = <UserAddress>[];
    final addressList = json['addresses'] as List<dynamic>? ?? [];
    for (final address in addressList) {
      if (address is Map<String, dynamic>) {
        addresses.add(UserAddress.fromJson(address));
      }
    }
    var avatarUrl = json['profilePicture'] as String? ?? json['avatar'] as String?;
    if (avatarUrl != null && avatarUrl.startsWith('/')) {
      avatarUrl = '${AppConfig.baseUrl.replaceAll("/api", "")}$avatarUrl';
    }

    return UserProfile(
      id: '${json['id'] ?? json['_id'] ?? ''}',
      fullName:
          json['fullName'] as String? ?? json['name'] as String? ?? 'No name',
      email: json['email'] as String? ?? '',
      phone: json['phone'] as String?,
      avatar: avatarUrl,
      addresses: addresses,
    );
  }

  UserProfile copyWith({
    String? fullName,
    String? email,
    String? phone,
    String? avatar,
    List<UserAddress>? addresses,
  }) {
    return UserProfile(
      id: id,
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      avatar: avatar ?? this.avatar,
      addresses: addresses ?? this.addresses,
    );
  }
}

class UserAddress {
  UserAddress({
    required this.id,
    required this.fullName,
    required this.phone,
    required this.addressLine1,
    required this.city,
    required this.state,
    required this.zipCode,
    required this.country,
    this.addressLine2,
    this.isDefault = false,
    this.type,
  });

  final String id;
  final String fullName;
  final String phone;
  final String addressLine1;
  final String? addressLine2;
  final String city;
  final String state;
  final String zipCode;
  final String country;
  final bool isDefault;
  final String? type;

  factory UserAddress.fromJson(Map<String, dynamic> json) {
    return UserAddress(
      id: '${json['id'] ?? json['_id'] ?? ''}',
      fullName: json['fullName'] as String? ?? json['name'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      addressLine1:
          json['addressLine1'] as String? ?? json['line1'] as String? ?? '',
      addressLine2: json['addressLine2'] as String?,
      city: json['city'] as String? ?? '',
      state: json['state'] as String? ?? '',
      zipCode:
          json['zipCode'] as String? ?? json['postalCode'] as String? ?? '',
      country: json['country'] as String? ?? '',
      isDefault: json['isDefault'] as bool? ?? false,
      type: json['type'] as String?,
    );
  }
}
