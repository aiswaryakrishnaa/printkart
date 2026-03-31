// Mobile/Desktop implementation - only imported on non-web platforms
import 'dart:io' show Platform;

// Export the check function that uses Platform
bool platformCheckImpl() {
  return Platform.isAndroid;
}
