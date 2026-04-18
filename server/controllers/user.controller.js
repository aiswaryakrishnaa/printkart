const { User } = require('../models');
const prisma = require('../config/prisma');
const { validationResult } = require('express-validator');

// Get User Profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        profilePicture: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        addresses: true
      }
    });
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// Update Profile
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { fullName, email, phone, profilePicture } = req.body;
    const user = await User.findByPk(req.user.id);

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      success: true,
      data: { user },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get Addresses
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    res.json({
      success: true,
      data: { addresses }
    });
  } catch (error) {
    next(error);
  }
};

// Add Address
exports.addAddress = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
      type = 'home',
      isDefault = false
    } = req.body;

    // If setting as default, unset all other default addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: req.user.id,
          isDefault: true
        },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        fullName,
        phone: phone || null,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        state,
        zipCode,
        country,
        type: type || 'home',
        isDefault: isDefault || false
      }
    });

    res.status(201).json({
      success: true,
      data: { address },
      message: 'Address added successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update Address
exports.updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const addressId = parseInt(id, 10);

    if (isNaN(addressId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid address ID'
        }
      });
    }

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: req.user.id
      }
    });

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ADDRESS_NOT_FOUND',
          message: 'Address not found'
        }
      });
    }

    // If setting as default, unset all other default addresses
    if (req.body.isDefault === true) {
      await prisma.address.updateMany({
        where: {
          userId: req.user.id,
          id: { not: addressId },
          isDefault: true
        },
        data: { isDefault: false }
      });
    }

    // Prepare update data
    const updateData = {};
    if (req.body.fullName !== undefined) updateData.fullName = req.body.fullName;
    if (req.body.phone !== undefined) updateData.phone = req.body.phone || null;
    if (req.body.addressLine1 !== undefined) updateData.addressLine1 = req.body.addressLine1;
    if (req.body.addressLine2 !== undefined) updateData.addressLine2 = req.body.addressLine2 || null;
    if (req.body.city !== undefined) updateData.city = req.body.city;
    if (req.body.state !== undefined) updateData.state = req.body.state;
    if (req.body.zipCode !== undefined) updateData.zipCode = req.body.zipCode;
    if (req.body.country !== undefined) updateData.country = req.body.country;
    if (req.body.type !== undefined) updateData.type = req.body.type;
    if (req.body.isDefault !== undefined) updateData.isDefault = req.body.isDefault;

    const address = await prisma.address.update({
      where: { id: addressId },
      data: updateData
    });

    res.json({
      success: true,
      data: { address },
      message: 'Address updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete Address
exports.deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const addressId = parseInt(id, 10);

    if (isNaN(addressId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid address ID'
        }
      });
    }

    // Check if address exists and belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: req.user.id
      }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ADDRESS_NOT_FOUND',
          message: 'Address not found'
        }
      });
    }

    await prisma.address.delete({
      where: { id: addressId }
    });

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Change Password
exports.changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Current password is incorrect'
        }
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Upload Avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded'
        }
      });
    }

    const avatarUrl = req.file.path && req.file.path.startsWith('http')
      ? req.file.path
      : `/uploads/${req.file.filename}`;

    // Update user's profile picture
    await prisma.user.update({
      where: { id: req.user.id },
      data: { profilePicture: avatarUrl }
    });

    res.json({
      success: true,
      data: { avatarUrl },
      message: 'Avatar uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
};
