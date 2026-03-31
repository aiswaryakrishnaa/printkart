const { Prisma } = require('@prisma/client');
const prisma = require('../config/prisma');

// Helper function to calculate cart total
const calculateCartTotal = (items) => {
  return items.reduce((sum, item) => {
    const price = typeof item.price === 'object' ? parseFloat(item.price.toString()) : parseFloat(item.price || 0);
    return sum + (price * item.quantity);
  }, 0);
};

// Get Cart
exports.getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!cart) {
      // Create empty cart
      cart = await prisma.cart.create({
        data: {
          userId
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: {
                    select: {
                      id: true,
                      name: true,
                      slug: true
                    }
                  }
                }
              }
            }
          }
        }
      });
    }

    const total = calculateCartTotal(cart.items);

    // Format cart items for response
    const formattedItems = cart.items.map(item => {
      const product = item.product;
      const images = product.images ? (Array.isArray(product.images) ? product.images : JSON.parse(product.images || '[]')) : [];
      const formattedImages = images.length > 0 ? images.map(img => {
        if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
          return img;
        }
        const baseUrl = req.protocol + '://' + req.get('host');
        const imagePath = typeof img === 'string' ? img : (img.url || img.path || '');
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        return imagePath ? `${baseUrl}/uploads/${cleanPath}` : 'https://placehold.co/600x400';
      }) : ['https://placehold.co/600x400'];

      return {
        id: item.id.toString(),
        productId: product.id.toString(),
        product: {
          id: product.id.toString(),
          name: product.name,
          title: product.name,
          description: product.description || '',
          images: formattedImages,
          price: typeof product.price === 'object' ? parseFloat(product.price.toString()) : parseFloat(product.price || 0),
          compareAtPrice: product.compareAtPrice ? (typeof product.compareAtPrice === 'object' ? parseFloat(product.compareAtPrice.toString()) : parseFloat(product.compareAtPrice)) : null,
          rating: typeof product.ratingAverage === 'object' ? parseFloat(product.ratingAverage.toString()) : parseFloat(product.ratingAverage || 0),
          availability: product.availability,
          status: product.status,
          category: product.category ? {
            id: product.category.id.toString(),
            name: product.category.name,
            slug: product.category.slug
          } : null
        },
        quantity: item.quantity,
        price: typeof item.price === 'object' ? parseFloat(item.price.toString()) : parseFloat(item.price || 0),
        variant: item.variant || null
      };
    });

    res.json({
      success: true,
      data: {
        cart: {
          id: cart.id.toString(),
          userId: cart.userId.toString(),
          items: formattedItems
        },
        total
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    next(error);
  }
};

// Add to Cart
exports.addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1, variant } = req.body;

    // Find product
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product || product.status !== 'active') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found or unavailable'
        }
      });
    }

    // Check stock
    if (product.availability === 'out_of_stock' || (product.trackQuantity && product.stockQuantity < quantity)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_STOCK',
          message: 'Product is out of stock or insufficient quantity available'
        }
      });
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      });
    }

    // Check if product already in cart with same variant
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id,
        // variant: variant ? { equals: variant } : { equals: Prisma.DbNull } // Simplified variant check for now
      }
    });

    let cartItem;
    if (existingItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          price: typeof product.price === 'object' ? parseFloat(product.price.toString()) : parseFloat(product.price || 0)
        },
        include: {
          product: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          }
        }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity,
          price: typeof product.price === 'object' ? parseFloat(product.price.toString()) : parseFloat(product.price || 0),
          variant: variant || null
        },
        include: {
          product: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          }
        }
      });
    }

    // Get updated cart with all items
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Format response
    const images = cartItem.product.images ? (Array.isArray(cartItem.product.images) ? cartItem.product.images : JSON.parse(cartItem.product.images || '[]')) : [];
    const formattedImages = images.length > 0 ? images.map(img => {
      if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
        return img;
      }
      const baseUrl = req.protocol + '://' + req.get('host');
      const imagePath = typeof img === 'string' ? img : (img.url || img.path || '');
      const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
      return imagePath ? `${baseUrl}/uploads/${cleanPath}` : 'https://placehold.co/600x400';
    }) : ['https://placehold.co/600x400'];

    res.json({
      success: true,
      data: {
        cart: {
          id: updatedCart.id.toString(),
          userId: updatedCart.userId.toString(),
          items: updatedCart.items.map(item => ({
            id: item.id.toString(),
            productId: item.product.id.toString(),
            product: {
              id: item.product.id.toString(),
              name: item.product.name,
              images: formattedImages,
              price: typeof item.product.price === 'object' ? parseFloat(item.product.price.toString()) : parseFloat(item.product.price || 0)
            },
            quantity: item.quantity,
            price: typeof item.price === 'object' ? parseFloat(item.price.toString()) : parseFloat(item.price || 0),
            variant: item.variant || null
          }))
        }
      },
      message: 'Product added to cart'
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    next(error);
  }
};

// Update Cart Item
exports.updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CART_NOT_FOUND',
          message: 'Cart not found'
        }
      });
    }

    // Find cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: parseInt(itemId),
        cartId: cart.id
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ITEM_NOT_FOUND',
          message: 'Cart item not found'
        }
      });
    }

    if (quantity <= 0) {
      // Remove item
      await prisma.cartItem.delete({
        where: { id: cartItem.id }
      });
    } else {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity }
      });
    }

    // Get updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true
                  }
                }
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        cart: {
          id: updatedCart.id.toString(),
          userId: updatedCart.userId.toString(),
          items: updatedCart.items.map(item => ({
            id: item.id.toString(),
            productId: item.product.id.toString(),
            quantity: item.quantity,
            price: typeof item.price === 'object' ? parseFloat(item.price.toString()) : parseFloat(item.price || 0)
          }))
        }
      },
      message: 'Cart updated successfully'
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    next(error);
  }
};

// Remove from Cart
exports.removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CART_NOT_FOUND',
          message: 'Cart not found'
        }
      });
    }

    // Find and delete cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: parseInt(itemId),
        cartId: cart.id
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ITEM_NOT_FOUND',
          message: 'Cart item not found'
        }
      });
    }

    await prisma.cartItem.delete({
      where: { id: cartItem.id }
    });

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    next(error);
  }
};

// Clear Cart
exports.clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (cart) {
      // Delete all cart items
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    }

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    next(error);
  }
};
