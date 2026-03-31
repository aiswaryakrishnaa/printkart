const { User, Order } = require('../models');

// Get Addresses (same as user controller)
exports.getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: { addresses: user.addresses }
    });
  } catch (error) {
    next(error);
  }
};

// Add Address
exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { isDefault } = req.body;

    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push(req.body);
    await user.save();

    res.status(201).json({
      success: true,
      data: { address: user.addresses[user.addresses.length - 1] }
    });
  } catch (error) {
    next(error);
  }
};

// Update Address
exports.updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    const address = user.addresses.id(id);
    if (!address) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ADDRESS_NOT_FOUND',
          message: 'Address not found'
        }
      });
    }

    Object.assign(address, req.body);
    await user.save();

    res.json({
      success: true,
      data: { address }
    });
  } catch (error) {
    next(error);
  }
};

// Delete Address
exports.deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    const address = user.addresses.id(id);
    if (!address) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ADDRESS_NOT_FOUND',
          message: 'Address not found'
        }
      });
    }

    address.remove();
    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get Shipping Options
exports.getShippingOptions = async (req, res, next) => {
  try {
    const options = [
      {
        id: 'standard',
        name: 'Standard Delivery',
        description: '5-7 business days',
        cost: 5.00,
        estimatedDays: '5-7'
      },
      {
        id: 'express',
        name: 'Express Delivery',
        description: '2-3 business days',
        cost: 15.00,
        estimatedDays: '2-3'
      },
      {
        id: 'overnight',
        name: 'Overnight Delivery',
        description: 'Next business day',
        cost: 30.00,
        estimatedDays: '1'
      }
    ];

    res.json({
      success: true,
      data: { options }
    });
  } catch (error) {
    next(error);
  }
};

// Calculate Shipping
exports.calculateShipping = async (req, res, next) => {
  try {
    const { address, items, shippingMethod } = req.body;

    // TODO: Calculate based on address, weight, and shipping method
    // For now, return mock calculation
    const baseCost = shippingMethod === 'standard' ? 5 : 
                     shippingMethod === 'express' ? 15 : 30;

    res.json({
      success: true,
      data: {
        cost: baseCost,
        estimatedDays: shippingMethod === 'standard' ? '5-7' :
                       shippingMethod === 'express' ? '2-3' : '1'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Track Shipment
exports.trackShipment = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        orderStatus: order.orderStatus,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        statusHistory: order.statusHistory,
        estimatedDelivery: order.estimatedDelivery
      }
    });
  } catch (error) {
    next(error);
  }
};

