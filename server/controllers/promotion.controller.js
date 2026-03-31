const prisma = require('../config/prisma');

// Get Available Promotions
exports.getAvailablePromotions = async (req, res, next) => {
  try {
    const now = new Date();
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filter by usage limit (Prisma doesn't support $expr directly)
    const availablePromotions = promotions.filter(p => p.usageCount < p.usageLimit);

    res.json({
      success: true,
      data: { promotions: availablePromotions }
    });
  } catch (error) {
    next(error);
  }
};

// Validate Promo Code
exports.validatePromoCode = async (req, res, next) => {
  try {
    const { code, amount } = req.body;
    const now = new Date();

    const promotion = await prisma.promotion.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      }
    });

    if (!promotion) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PROMO',
          message: 'Invalid or expired promo code'
        }
      });
    }

    // Check usage limits
    if (promotion.usageCount >= promotion.usageLimit) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PROMO_EXHAUSTED',
          message: 'Promo code usage limit reached'
        }
      });
    }

    // Check minimum purchase
    const minPurchase = typeof promotion.minPurchaseAmount === 'object'
      ? parseFloat(promotion.minPurchaseAmount.toString())
      : parseFloat(promotion.minPurchaseAmount || 0);

    if (minPurchase && amount < minPurchase) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MIN_AMOUNT_REQUIRED',
          message: `Minimum purchase amount of ${minPurchase} required`
        }
      });
    }

    // Calculate discount
    const promoValue = typeof promotion.value === 'object'
      ? parseFloat(promotion.value.toString())
      : parseFloat(promotion.value || 0);

    let discount = 0;
    if (promotion.type === 'percentage') {
      discount = (amount * promoValue) / 100;
      if (promotion.maxDiscountAmount) {
        const maxDiscount = typeof promotion.maxDiscountAmount === 'object'
          ? parseFloat(promotion.maxDiscountAmount.toString())
          : parseFloat(promotion.maxDiscountAmount);
        discount = Math.min(discount, maxDiscount);
      }
    } else if (promotion.type === 'fixed_amount') {
      discount = promoValue;
    }

    res.json({
      success: true,
      data: {
        promotion: {
          ...promotion,
          value: promoValue,
          minPurchaseAmount: minPurchase
        },
        discount,
        finalAmount: amount - discount
      }
    });
  } catch (error) {
    next(error);
  }
};

