const rawApiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_BASE_URL = rawApiBase.replace(/\/+$/, '');

export const toAbsoluteUrl = (pathOrUrl) => {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const normalizedPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const uploadsUrl = (fileNameOrPath) => {
  if (!fileNameOrPath) return null;
  if (
    fileNameOrPath.startsWith('http://') ||
    fileNameOrPath.startsWith('https://')
  ) {
    return fileNameOrPath;
  }
  if (fileNameOrPath.startsWith('/uploads/')) {
    return `${API_BASE_URL}${fileNameOrPath}`;
  }
  if (fileNameOrPath.startsWith('uploads/')) {
    return `${API_BASE_URL}/${fileNameOrPath}`;
  }
  return `${API_BASE_URL}/uploads/${fileNameOrPath}`;
};
