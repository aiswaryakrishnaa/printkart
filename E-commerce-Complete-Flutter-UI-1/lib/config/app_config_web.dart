// Web implementation - Platform is not available on web
// This stub always returns false since Platform doesn't exist on web

bool platformCheckImpl() {
  // Platform is not available on web, so always return false
  // The main code already checks kIsWeb first, so this should never be called
  // But it's here to satisfy the conditional import
  return false;
}
