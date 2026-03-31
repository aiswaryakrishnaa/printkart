const { Wishlist, WishlistItem, Product } = require('../models');

const getBaseUrl = (req) => {
  const host = req.get('host');
  if (host) {
    return `${req.protocol}://${host}`;
  }
  return process.env.APP_URL || 'http://localhost:5000';
};

const normalizeImages = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (_) {
      return [images];
    }
  }
  return [images];
};

const formatImageUrls = (images, baseUrl) => {
  if (!images || images.length === 0) {
    return ['https://placehold.co/600x400'];
  }
  return images.map((img) => {
    if (!img) return 'https://placehold.co/600x400';
    if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
      return img;
    }
    const imagePath = typeof img === 'string' ? img : (img.url || img.path || '');
    if (!imagePath) return 'https://placehold.co/600x400';
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${baseUrl}/uploads/${cleanPath}`;
  });
};

const formatProductForResponse = (product, req) => {
  if (!product) return null;
  const baseUrl = getBaseUrl(req);
  const images = normalizeImages(product.images);
  const formattedImages = formatImageUrls(images, baseUrl);

  const toNumber = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'object' && typeof value.toString === 'function') {
      return parseFloat(value.toString());
    }
    return Number(value) || 0;
  };

  return {
    id: product.id.toString(),
    name: product.name,
    title: product.name,
    description: product.description || '',
    shortDescription: product.shortDescription || '',
    images: formattedImages,
    price: toNumber(product.price),
    rating: toNumber(product.ratingAverage),
    ratingAverage: toNumber(product.ratingAverage),
    ratingCount: product.ratingCount || 0,
    reviewsCount: product.reviewsCount || 0,
    isPopular: product.featured || false,
    availability: product.availability,
    status: product.status,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug
        }
      : null,
    categoryId: product.categoryId,
    sku: product.sku,
    slug: product.slug
  };
};

const fetchWishlistWithItems = async (userId) => {
  return await Wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: {
                select: { id: true, name: true, slug: true }
              }
            }
          }
        }
      }
    }
  });
};

const ensureWishlistForUser = async (userId) => {
  let wishlist = await fetchWishlistWithItems(userId);
  if (!wishlist) {
    wishlist = await Wishlist.create({
      data: {
        userId
      },
      include: {
        items: true
      }
    });
  }
  return wishlist;
};

const buildWishlistResponse = (wishlist, req) => {
  const items = wishlist.items?.map((item) => ({
    id: item.id,
    productId: item.productId,
    product: formatProductForResponse(item.product, req),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  })) || [];

  return {
    id: wishlist.id,
    userId: wishlist.userId,
    items,
    createdAt: wishlist.createdAt,
    updatedAt: wishlist.updatedAt
  };
};

// Get Wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let wishlist = await fetchWishlistWithItems(userId);

    if (!wishlist) {
      wishlist = await ensureWishlistForUser(userId);
      wishlist.items = [];
    }

    res.json({
      success: true,
      data: { wishlist: buildWishlistResponse(wishlist, req) }
    });
  } catch (error) {
    next(error);
  }
};

// Add to Wishlist
exports.addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = parseInt(req.body.productId);

    if (!productId || Number.isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PRODUCT_ID',
          message: 'Valid productId is required'
        }
      });
    }

    const product = await Product.findUnique({
      where: { id: productId },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }

    let wishlist = await ensureWishlistForUser(userId);

    const existingItem = await WishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId
        }
      }
    });

    if (!existingItem) {
      await WishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId
        }
      });
    }

    wishlist = await fetchWishlistWithItems(userId);

    res.json({
      success: true,
      data: { wishlist: buildWishlistResponse(wishlist, req) },
      message: 'Product added to wishlist'
    });
  } catch (error) {
    next(error);
  }
};

// Remove from Wishlist
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = parseInt(req.params.productId);

    if (!productId || Number.isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PRODUCT_ID',
          message: 'Valid productId is required'
        }
      });
    }

    const wishlist = await fetchWishlistWithItems(userId);

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'WISHLIST_NOT_FOUND',
          message: 'Wishlist not found'
        }
      });
    }

    await WishlistItem.delete({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId
        }
      }
    }).catch(() => {});

    const updatedWishlist = await fetchWishlistWithItems(userId) || wishlist;

    res.json({
      success: true,
      data: { wishlist: buildWishlistResponse(updatedWishlist, req) },
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    next(error);
  }
};

