const { User, RefreshToken, Op } = require('../models');
const { validationResult } = require('express-validator');
const { generateToken, generateRefreshToken, verifyRefreshToken: jwtVerifyRefreshToken } = require('../config/jwt');

// Helper function to calculate token expiry date
const getTokenExpiryDate = () => {
  // JWT_REFRESH_EXPIRES_IN is '30d', so we calculate 30 days from now
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);
  return expiryDate;
};

// Register User
exports.register = async (req, res, next) => {
  try {
    console.log('Registration attempt:', { 
      fullName: req.body.fullName, 
      email: req.body.email, 
      phone: req.body.phone,
      hasPassword: !!req.body.password 
    });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      const firstError = errors.array()[0];
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: firstError.msg || 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { fullName, email, phone, password } = req.body;

    // Trim and normalize email/phone
    const normalizedEmail = email ? email.trim().toLowerCase() : '';
    const normalizedPhone = phone ? phone.trim() : '';

    console.log('Checking for existing user with:', { email: normalizedEmail, phone: normalizedPhone });

    // Check if user exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: normalizedEmail }, { phone: normalizedPhone }]
      }
    });

    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email or phone already exists'
        }
      });
    }

    console.log('Creating new user...');
    
    // Create user
    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: password
    });

    console.log('User created successfully:', user.id);

    // Generate tokens
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshTokenString = generateRefreshToken({ id: user.id });

    // Store refresh token in database
    await RefreshToken.create({
      userId: user.id,
      token: refreshTokenString,
      expiresAt: getTokenExpiryDate()
    });

    console.log('Registration successful for user:', user.id);

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
        refreshToken: refreshTokenString
      },
      message: 'User registered successfully. Please verify your email/phone.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    next(error);
  }
};

// Login User
exports.login = async (req, res, next) => {
  try {
    console.log('Login attempt:', { email: req.body.email, hasPassword: !!req.body.password });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Get the first error message for better UX
      const firstError = errors.array()[0];
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: firstError.msg || 'Validation failed',
          details: errors.array()
        }
      });
    }

    let { email, phone, password } = req.body;
    
    // Trim and normalize email/phone
    email = email ? email.trim().toLowerCase() : '';
    phone = phone ? phone.trim() : '';
    // Trim password to handle any accidental whitespace
    password = password ? password.trim() : '';
    
    // Ensure at least email or phone is provided
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELD',
          message: 'Either email or phone is required'
        }
      });
    }

    console.log('Looking for user with:', { email: email || null, phone: phone || null });

    // Find user - fix the query to properly handle email or phone
    const whereClause = {};
    if (email) {
      whereClause.email = email; // Already lowercased above
    } else if (phone) {
      whereClause.phone = phone;
    }

    const user = await User.findOne({
      where: whereClause
    });
    
    console.log('User found:', !!user);
    if (user) {
      console.log('User password hash (first 20 chars):', user.password ? user.password.substring(0, 20) + '...' : 'null');
      console.log('Password hash length:', user.password ? user.password.length : 0);
      console.log('Is password a bcrypt hash?', user.password ? user.password.startsWith('$2') : false);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email/phone or password'
        }
      });
    }

    // Check password
    console.log('Comparing password. Input length:', password ? password.length : 0);
    console.log('Input password value:', password ? `"${password}"` : 'null');
    console.log('Stored password value:', user.password ? `"${user.password.substring(0, 50)}"` : 'null');
    console.log('User object has comparePassword method?', typeof user.comparePassword === 'function');
    
    let isMatch = false;
    try {
      isMatch = await user.comparePassword(password);
      console.log('Password match:', isMatch);
    } catch (error) {
      console.error('Error in comparePassword:', error);
      console.error('Error stack:', error.stack);
      isMatch = false;
    }
    
    if (!isMatch) {
      console.log('Password mismatch! Make sure the password in database is properly hashed.');
    }
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email/phone or password'
        }
      });
    }

    console.log('Login successful for user:', user.id, user.role);
    
    // Generate tokens
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshTokenString = generateRefreshToken({ id: user.id });
    
    // Store refresh token in database
    await RefreshToken.create({
      userId: user.id,
      token: refreshTokenString,
      expiresAt: getTokenExpiryDate()
    });
    
    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
        refreshToken: refreshTokenString
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    next(error);
  }
};

// Send OTP
exports.sendOTP = async (req, res, next) => {
  try {
    const { phone, email } = req.body;

    if (!phone && !email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELD',
          message: 'Phone or email is required'
        }
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In production, send OTP via SMS/Email service
    // For now, we'll just save it
    const user = await User.findOne({
      where: {
        [Op.or]: [{ phone }, { email }]
      }
    });

    if (phone) {
      if (user) {
        user.phoneVerificationOTP = otp;
        user.phoneVerificationOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();
      }
      // TODO: Send SMS via Twilio
      console.log(`OTP for ${phone}: ${otp}`);
    }

    res.json({
      success: true,
      data: {
        otp: process.env.NODE_ENV === 'development' ? otp : null, // Only in dev
        expiresIn: 600 // 10 minutes
      },
      message: 'OTP sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP
exports.verifyOTP = async (req, res, next) => {
  try {
    const { phone, email, otp } = req.body;

    const user = await User.findOne({
      where: {
        [Op.or]: [{ phone }, { email }]
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    if (phone && user.phoneVerificationOTP !== otp) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OTP',
          message: 'Invalid OTP'
        }
      });
    }

    if (phone && new Date() > user.phoneVerificationOTPExpiry) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'OTP_EXPIRED',
          message: 'OTP has expired'
        }
      });
    }

    if (phone) {
      user.isPhoneVerified = true;
      user.phoneVerificationOTP = undefined;
      user.phoneVerificationOTPExpiry = undefined;
    }

    if (email) {
      user.isEmailVerified = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Forgot Password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email, phone } = req.body;

    const user = await User.findOne({
      where: {
        [Op.or]: [
          email ? { email } : { email: '' },
          phone ? { phone } : { phone: '' }
        ]
      }
    });

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If account exists, password reset instructions will be sent'
      });
    }

    // Generate reset token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // TODO: Send reset email/SMS
    console.log(`Reset token for ${email || phone}: ${resetToken}`);

    res.json({
      success: true,
      message: 'Password reset instructions sent'
    });
  } catch (error) {
    next(error);
  }
};

// Reset Password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      where: {
        resetPasswordToken: token
      }
    });

    if (!user || !user.resetPasswordExpiry || new Date() > user.resetPasswordExpiry) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired reset token'
        }
      });
    }

    // Password will be hashed automatically in the save() method
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Refresh Token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: refreshTokenString } = req.body;

    if (!refreshTokenString) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Refresh token is required'
        }
      });
    }

    // Verify JWT token first
    let decoded;
    try {
      decoded = jwtVerifyRefreshToken(refreshTokenString);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid or expired refresh token'
        }
      });
    }

    // Check if refresh token exists in database
    const storedToken = await RefreshToken.findOne({
      where: { token: refreshTokenString }
    });

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Refresh token not found'
        }
      });
    }

    // Check if token is expired in database
    if (new Date() > new Date(storedToken.expiresAt)) {
      // Delete expired token
      await RefreshToken.delete({ where: { id: storedToken.id } });
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Refresh token expired'
        }
      });
    }

    // Get user
    const user = await User.findByPk(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found or inactive'
        }
      });
    }

    // Delete old refresh token
    await RefreshToken.delete({ where: { id: storedToken.id } });

    // Generate new tokens
    const newToken = generateToken({ id: user.id, email: user.email, role: user.role });
    const newRefreshTokenString = generateRefreshToken({ id: user.id });

    // Store new refresh token in database
    await RefreshToken.create({
      userId: user.id,
      token: newRefreshTokenString,
      expiresAt: getTokenExpiryDate()
    });

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshTokenString
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    next(error);
  }
};

// Logout
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken: refreshTokenString } = req.body;
    
    // If refresh token is provided, delete it from database
    if (refreshTokenString) {
      await RefreshToken.delete({
        where: { token: refreshTokenString }
      });
    }
    
    // If user is authenticated (from middleware), delete all their refresh tokens
    if (req.user && req.user.id) {
      await RefreshToken.delete({
        where: { userId: req.user.id }
      });
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    next(error);
  }
};


