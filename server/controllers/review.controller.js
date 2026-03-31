const { Review, Product, Order } = require('../models');

// Get Product Reviews
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    const sortOptions = {
      newest: { createdAt: -1 },
      highest: { rating: -1 },
      lowest: { rating: 1 },
      helpful: { helpfulCount: -1 }
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({
      product: productId,
      isApproved: true
    })
    .populate('user', 'fullName profilePicture')
    .sort(sortOptions[sort] || sortOptions.newest)
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Review.countDocuments({ product: productId, isApproved: true });

    res.json({
      success: true,
      data: {
        reviews,
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

// Create Review
exports.createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment, images } = req.body;

    // Check if user has purchased this product
    const order = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      orderStatus: 'delivered'
    });

    const review = new Review({
      user: req.user._id,
      product: productId,
      order: order?._id,
      rating,
      title,
      comment,
      images,
      isVerifiedPurchase: !!order,
      isApproved: false // Admin approval required
    });

    await review.save();

    // Update product rating
    const product = await Product.findById(productId);
    const reviews = await Review.find({ product: productId, isApproved: true });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    product.rating.average = avgRating;
    product.rating.count = reviews.length;
    product.reviewsCount = reviews.length;
    await product.save();

    res.status(201).json({
      success: true,
      data: { review },
      message: 'Review submitted successfully. Pending admin approval.'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REVIEW_EXISTS',
          message: 'You have already reviewed this product'
        }
      });
    }
    next(error);
  }
};

// Update Review
exports.updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findOne({
      _id: id,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REVIEW_NOT_FOUND',
          message: 'Review not found'
        }
      });
    }

    Object.assign(review, req.body);
    review.isApproved = false; // Require re-approval
    await review.save();

    res.json({
      success: true,
      data: { review },
      message: 'Review updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete Review
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findOneAndDelete({
      _id: id,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REVIEW_NOT_FOUND',
          message: 'Review not found'
        }
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Mark Review as Helpful
exports.markHelpful = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'REVIEW_NOT_FOUND',
          message: 'Review not found'
        }
      });
    }

    if (!review.helpfulUsers.includes(req.user._id)) {
      review.helpfulUsers.push(req.user._id);
      review.helpfulCount += 1;
      await review.save();
    }

    res.json({
      success: true,
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

