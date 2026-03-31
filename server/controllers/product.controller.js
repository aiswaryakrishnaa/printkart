const prisma = require('../config/prisma');

// Helper function to normalize images from JSON field
const normalizeImages = (images) => {
  if (!images) return [];
  // If it's already an array, return it
  if (Array.isArray(images)) return images;
  // If it's a string, try to parse it
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      // If parsing fails, treat as single image string
      return [images];
    }
  }
  // If it's a single value, wrap in array
  return [images];
};

// Helper function to format image URLs for Flutter app
const formatImageUrls = (images, baseUrl = 'http://localhost:5000') => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return ['https://placehold.co/600x400'];
  }
  return images.map(img => {
    if (!img) return 'https://placehold.co/600x400';
    // If already a full URL, return as is
    if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
      return img;
    }
    // Otherwise, construct URL
    const imagePath = typeof img === 'string' ? img : (img.url || img.path || '');
    if (!imagePath) return 'https://placehold.co/600x400';
    // Remove leading slash if present to avoid double slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${baseUrl}/uploads/${cleanPath}`;
  });
};

// Get All Products
exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      category,
      type,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      status,
      tag,
      isPopular
    } = req.query;

    const where = {};

    // By default, only show active products for public API
    // Allow status filter to override if explicitly provided
    if (status) {
      where.status = status;
    } else {
      where.status = 'active';
    }

    // Category filter
    if (category) {
      where.categoryId = parseInt(category);
    }

    // Type filter (book or printed_item)
    if (type) {
      where.type = type;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { shortDescription: { contains: search } }
      ];
    }

    // Popular filter
    if (isPopular === 'true') {
      where.featured = true;
    }

    // Sort options
    const orderBy = {};
    const sortField = sortBy === 'price' ? 'price' :
      sortBy === 'rating' ? 'ratingAverage' :
        sortBy === 'soldCount' ? 'soldCount' :
          sortBy === 'createdAt' ? 'createdAt' : 'createdAt';
    orderBy[sortField] = sortOrder === 'asc' ? 'asc' : 'desc';

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy
    });

    // Tag filter (for special offers) - filter after query since tags is JSON
    if (tag) {
      products = products.filter(product => {
        const tags = product.tags;
        if (!tags) return false;
        const tagArray = Array.isArray(tags) ? tags : (typeof tags === 'string' ? JSON.parse(tags) : []);
        return tagArray.includes(tag);
      });
    }

    const total = await prisma.product.count({ where });

    // Format products for Flutter app
    const formattedProducts = products.map(product => {
      const images = normalizeImages(product.images);
      const formattedImages = formatImageUrls(images, req.protocol + '://' + req.get('host'));

      return {
        id: product.id.toString(),
        name: product.name,
        title: product.name, // For Flutter compatibility
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        images: formattedImages,
        price: typeof product.price === 'object' && product.price !== null ? parseFloat(product.price.toString()) : parseFloat(product.price || 0),
        compareAtPrice: product.compareAtPrice ? (typeof product.compareAtPrice === 'object' ? parseFloat(product.compareAtPrice.toString()) : parseFloat(product.compareAtPrice)) : null,
        rating: typeof product.ratingAverage === 'object' && product.ratingAverage !== null ? parseFloat(product.ratingAverage.toString()) : parseFloat(product.ratingAverage || 0),
        ratingAverage: parseFloat(product.ratingAverage || 0),
        ratingCount: product.ratingCount || 0,
        reviewsCount: product.reviewsCount || 0,
        soldCount: product.soldCount || 0,
        viewCount: product.viewCount || 0,
        isPopular: product.featured || false,
        isFavourite: false, // Will be set by wishlist if needed
        availability: product.availability,
        status: product.status,
        type: product.type,
        category: product.category ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug
        } : null,
        categoryId: product.categoryId,
        stockQuantity: product.stockQuantity,
        sku: product.sku,
        slug: product.slug,
        tags: product.tags || [],
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    });

    res.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Product
exports.getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid product ID'
        }
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        vendor: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
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

    // Increment view count
    await prisma.product.update({
      where: { id: productId },
      data: { viewCount: { increment: 1 } }
    });

    // Format product for Flutter app
    const images = normalizeImages(product.images);
    const formattedImages = formatImageUrls(images, req.protocol + '://' + req.get('host'));

    const formattedProduct = {
      id: product.id.toString(),
      name: product.name,
      title: product.name,
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      images: formattedImages,
      price: typeof product.price === 'object' && product.price !== null ? parseFloat(product.price.toString()) : parseFloat(product.price || 0),
      compareAtPrice: product.compareAtPrice ? (typeof product.compareAtPrice === 'object' ? parseFloat(product.compareAtPrice.toString()) : parseFloat(product.compareAtPrice)) : null,
      rating: typeof product.ratingAverage === 'object' && product.ratingAverage !== null ? parseFloat(product.ratingAverage.toString()) : parseFloat(product.ratingAverage || 0),
      ratingAverage: parseFloat(product.ratingAverage || 0),
      ratingCount: product.ratingCount || 0,
      reviewsCount: product.reviewsCount || 0,
      soldCount: product.soldCount || 0,
      viewCount: product.viewCount || 0,
      isPopular: product.featured || false,
      isFavourite: false,
      availability: product.availability,
      status: product.status,
      type: product.type,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug
      } : null,
      categoryId: product.categoryId,
      stockQuantity: product.stockQuantity,
      sku: product.sku,
      slug: product.slug,
      tags: product.tags || [],
      bookDetails: product.bookDetails,
      printedItemDetails: product.printedItemDetails,
      weight: product.weight ? parseFloat(product.weight) : null,
      dimensions: product.dimensions,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };

    res.json({
      success: true,
      data: { product: formattedProduct }
    });
  } catch (error) {
    next(error);
  }
};

// Search Products
exports.searchProducts = async (req, res, next) => {
  try {
    const { q, category, type, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_QUERY',
          message: 'Search query is required'
        }
      });
    }

    const where = {
      status: 'active',
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { shortDescription: { contains: q } }
      ]
    };

    if (category) {
      where.categoryId = parseInt(category);
    }
    if (type) {
      where.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.product.count({ where });

    // Format products for Flutter app
    const formattedProducts = products.map(product => {
      const images = normalizeImages(product.images);
      const formattedImages = formatImageUrls(images, req.protocol + '://' + req.get('host'));

      return {
        id: product.id.toString(),
        name: product.name,
        title: product.name,
        description: product.description || '',
        images: formattedImages,
        price: parseFloat(product.price),
        rating: parseFloat(product.ratingAverage || 0),
        isPopular: product.featured || false,
        availability: product.availability,
        category: product.category ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug
        } : null
      };
    });

    res.json({
      success: true,
      data: {
        products: formattedProducts,
        query: q,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get Product Availability
exports.getProductAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid product ID'
        }
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        availability: true,
        stockQuantity: true
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

    res.json({
      success: true,
      data: {
        availability: product.availability,
        stock: product.stockQuantity,
        inStock: product.availability === 'in_stock' && product.stockQuantity > 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get Related Products
exports.getRelatedProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);
    const limit = parseInt(req.query.limit) || 5;

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid product ID'
        }
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        categoryId: true,
        type: true
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

    const relatedProducts = await prisma.product.findMany({
      where: {
        id: { not: productId },
        status: 'active',
        OR: [
          { categoryId: product.categoryId },
          { type: product.type }
        ]
      },
      select: {
        id: true,
        name: true,
        images: true,
        price: true,
        ratingAverage: true,
        slug: true
      },
      take: limit,
      orderBy: { ratingAverage: 'desc' }
    });

    // Format products for Flutter app
    const formattedProducts = relatedProducts.map(p => {
      const images = normalizeImages(p.images);
      const formattedImages = formatImageUrls(images, req.protocol + '://' + req.get('host'));

      return {
        id: p.id.toString(),
        name: p.name,
        title: p.name,
        images: formattedImages,
        price: typeof p.price === 'object' && p.price !== null ? parseFloat(p.price.toString()) : parseFloat(p.price || 0),
        rating: typeof p.ratingAverage === 'object' && p.ratingAverage !== null ? parseFloat(p.ratingAverage.toString()) : parseFloat(p.ratingAverage || 0),
        slug: p.slug
      };
    });

    res.json({
      success: true,
      data: { products: formattedProducts }
    });
  } catch (error) {
    next(error);
  }
};


// Get Recommended Products
exports.getRecommendedProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        featured: true
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      take: limit,
      orderBy: [
        { ratingAverage: 'desc' },
        { soldCount: 'desc' }
      ]
    });

    // Format products for Flutter app
    const formattedProducts = products.map(product => {
      const images = normalizeImages(product.images);
      const formattedImages = formatImageUrls(images, req.protocol + '://' + req.get('host'));

      return {
        id: product.id.toString(),
        name: product.name,
        title: product.name,
        description: product.description || '',
        images: formattedImages,
        price: parseFloat(product.price),
        rating: parseFloat(product.ratingAverage || 0),
        isPopular: product.featured || false,
        availability: product.availability,
        category: product.category ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug
        } : null
      };
    });

    res.json({
      success: true,
      data: { products: formattedProducts }
    });
  } catch (error) {
    next(error);
  }
};
