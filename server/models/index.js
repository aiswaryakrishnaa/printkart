const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

// Op replacement for Sequelize operators (exported for controllers)
const Op = {
  or: Symbol('or'),
  and: Symbol('and'),
  eq: Symbol('eq'),
  ne: Symbol('ne'),
  gt: Symbol('gt'),
  gte: Symbol('gte'),
  lt: Symbol('lt'),
  lte: Symbol('lte'),
  like: Symbol('like'),
  in: Symbol('in')
};

// Helper function to convert Sequelize attributes to Prisma select
function getSelectFromAttributes(attributes) {
  if (!attributes) return null;

  // Handle exclude: { exclude: ['password'] }
  if (attributes.exclude && Array.isArray(attributes.exclude)) {
    // For now, just exclude password - we can expand this later
    // Prisma doesn't have exclude, so we'd need to list all fields
    // For simplicity, we'll handle this in toJSON() instead
    return null;
  }

  // Handle include: { include: ['id', 'email'] }
  if (attributes.include && Array.isArray(attributes.include)) {
    const select = {};
    attributes.include.forEach(field => {
      select[field] = true;
    });
    return select;
  }

  return null;
}

// Helper function to convert Sequelize where clause to Prisma where clause
function convertWhere(sequelizeWhere) {
  if (!sequelizeWhere) return {};

  // Check for Symbol keys (Op.or, Op.and, etc.) using Reflect.ownKeys
  const allKeys = Reflect.ownKeys(sequelizeWhere);
  const symbolKeys = allKeys.filter(key => typeof key === 'symbol');

  // Handle Op.or: { [Op.or]: [...] }
  if (symbolKeys.length === 1 && symbolKeys[0] === Op.or) {
    const orArray = sequelizeWhere[Op.or];
    if (Array.isArray(orArray)) {
      return {
        OR: orArray.map(condition => convertWhere(condition))
      };
    }
  }

  // Regular where clause - convert string keys
  const where = {};
  for (const [key, value] of Object.entries(sequelizeWhere)) {
    // Handle nested objects
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively convert nested where clauses
      where[key] = convertWhere(value);
    } else {
      // Auto-convert string IDs to integers for Prisma
      if ((key === 'id' || key.endsWith('Id')) && typeof value === 'string' && !isNaN(value)) {
        where[key] = parseInt(value, 10);
      } else {
        where[key] = value;
      }
    }
  }

  return where;
}

// Create User wrapper with Sequelize-like interface
const createUserWrapper = () => {
  return {
    findOne: async (options) => {
      const where = convertWhere(options?.where);
      // Always include password field for login/authentication
      const user = await prisma.user.findFirst({
        where,
        // Explicitly select all fields including password
      });
      if (user) {
        const userWithMethods = addUserMethods(user);
        console.log('[User.findOne] User found, methods attached. Has comparePassword?', typeof userWithMethods.comparePassword === 'function');
        return userWithMethods;
      }
      return null;
    },
    findAll: async (options) => {
      const where = convertWhere(options?.where);
      const users = await prisma.user.findMany({ where });
      return users.map(user => addUserMethods(user));
    },
    findById: async (id, options) => {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      const select = getSelectFromAttributes(options?.attributes);
      const user = await prisma.user.findUnique({
        where: { id: numericId },
        ...(select && { select })
      });
      return user ? addUserMethods(user) : null;
    },
    findByPk: async (id, options) => {
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      const select = getSelectFromAttributes(options?.attributes);
      const user = await prisma.user.findUnique({
        where: { id: numericId },
        ...(select && { select })
      });
      if (!user) return null;

      // Handle exclude password
      if (options?.attributes?.exclude?.includes('password')) {
        delete user.password;
      }

      return addUserMethods(user);
    },
    create: async (data) => {
      const { password, ...userData } = data;
      // Hash password if provided
      if (password) {
        userData.password = await bcrypt.hash(password, 12);
      }
      const user = await prisma.user.create({ data: userData });
      return addUserMethods(user);
    },
    update: async (data, options) => {
      const where = convertWhere(options?.where);
      const { password, ...updateData } = data;
      // Hash password if provided
      if (password) {
        updateData.password = await bcrypt.hash(password, 12);
      }
      const user = await prisma.user.update({ where, data: updateData });
      return addUserMethods(user);
    },
    destroy: async (options) => {
      const where = convertWhere(options?.where);
      return await prisma.user.delete({ where });
    },
    count: async (options) => {
      const where = convertWhere(options?.where);
      return await prisma.user.count({ where });
    }
  };
};

// Add instance methods to user object
function addUserMethods(user) {
  // Initialize refreshTokens array if not present (for compatibility)
  if (!user.refreshTokens) {
    user.refreshTokens = [];
  }

  // Store original password to track changes
  user._originalPassword = user.password;

  user.comparePassword = async function (candidatePassword) {
    console.log('[comparePassword] FUNCTION CALLED');
    console.log('[comparePassword] this.password exists?', !!this.password);
    console.log('[comparePassword] candidatePassword exists?', !!candidatePassword);

    if (!this.password) {
      console.log('[comparePassword] No password stored for user');
      return false;
    }

    if (!candidatePassword) {
      console.log('[comparePassword] No candidate password provided');
      return false;
    }

    // Check if password is stored as plain text (for migration purposes)
    // If it's not a bcrypt hash, do a direct comparison
    const isHashed = typeof this.password === 'string' && this.password.match(/^\$2[aby]\$/);

    console.log('[comparePassword] Password type:', isHashed ? 'hashed' : 'plain text');
    console.log('[comparePassword] Stored password length:', this.password.length);
    console.log('[comparePassword] Candidate password length:', candidatePassword.length);
    console.log('[comparePassword] Stored password (first 20):', this.password.substring(0, 20));
    console.log('[comparePassword] Candidate password (first 20):', candidatePassword.substring(0, 20));

    if (!isHashed) {
      // Password is stored as plain text - compare directly
      // This handles legacy users with unhashed passwords
      // Trim both to handle any whitespace issues
      const storedPassword = String(this.password).trim();
      const candidatePasswordTrimmed = String(candidatePassword).trim();
      const matches = storedPassword === candidatePasswordTrimmed;

      console.log('[comparePassword] Plain text comparison result:', matches);
      console.log('[comparePassword] Stored (trimmed) length:', storedPassword.length);
      console.log('[comparePassword] Candidate (trimmed) length:', candidatePasswordTrimmed.length);
      console.log('[comparePassword] Stored (trimmed) value:', `"${storedPassword}"`);
      console.log('[comparePassword] Candidate (trimmed) value:', `"${candidatePasswordTrimmed}"`);
      console.log('[comparePassword] Character codes match:',
        storedPassword.split('').map(c => c.charCodeAt(0)).join(',') ===
        candidatePasswordTrimmed.split('').map(c => c.charCodeAt(0)).join(','));

      // If password matches and it's plain text, hash it for future use
      if (matches) {
        console.log('[comparePassword] Password matches! Hashing and saving...');
        this.password = await bcrypt.hash(candidatePasswordTrimmed, 12);
        await this.save();
        console.log('[comparePassword] Password hashed and saved successfully');
      }

      return matches;
    }

    // Normal bcrypt comparison for hashed passwords
    console.log('[comparePassword] Using bcrypt comparison for hashed password');
    const bcryptMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('[comparePassword] Bcrypt comparison result:', bcryptMatch);
    return bcryptMatch;
  };

  user.toJSON = function () {
    const { password, refreshTokens, ...rest } = this;
    return rest;
  };

  // Alias _id to id for compatibility
  user._id = user.id;

  // Save method for Sequelize compatibility
  // Updates the user in the database
  user.save = async function () {
    const { id, password, refreshTokens, _originalPassword, ...updateData } = this;
    // Exclude methods and internal fields
    delete updateData.comparePassword;
    delete updateData.toJSON;
    delete updateData.save;
    delete updateData.set;
    delete updateData._id;

    // Note: refreshTokens is not in Prisma schema, so we'll skip it
    // In a real implementation, refresh tokens should be stored separately

    // Hash password if it's being updated and not already hashed
    // Only update password if it was changed (different from original)
    if (password !== undefined && password !== _originalPassword) {
      // Check if password is already a bcrypt hash (starts with $2a$, $2b$, or $2y$)
      const isHashed = typeof password === 'string' && password.match(/^\$2[aby]\$/);
      if (!isHashed) {
        updateData.password = await bcrypt.hash(password, 12);
      } else {
        updateData.password = password;
      }
    }

    // Update in database
    const updated = await prisma.user.update({
      where: { id: this.id },
      data: updateData
    });

    // Update current object with returned data
    Object.assign(this, updated);
    // Update original password to track future changes
    this._originalPassword = updated.password;
    // Restore refreshTokens array (not persisted in DB)
    if (this.refreshTokens !== undefined) {
      updated.refreshTokens = this.refreshTokens;
    }
    return this;
  };

  // Set method for Sequelize compatibility
  user.set = function (field, value) {
    this[field] = value;
  };

  return user;
}

// Export Prisma client with model aliases for backward compatibility
module.exports = {
  // Prisma client (lowercase model names)
  prisma,

  // Op operators for Sequelize compatibility
  Op,

  // User model with Sequelize-like interface
  User: createUserWrapper(),

  // RefreshToken model
  RefreshToken: {
    create: async (data) => {
      return await prisma.refreshToken.create({ data });
    },
    findOne: async (options) => {
      const where = convertWhere(options?.where);
      return await prisma.refreshToken.findFirst({ where });
    },
    findUnique: async (options) => {
      return await prisma.refreshToken.findUnique(options);
    },
    delete: async (options) => {
      const where = convertWhere(options?.where);
      // Use deleteMany for compatibility with where clauses
      return await prisma.refreshToken.deleteMany({ where });
    },
    deleteMany: async (options) => {
      const where = convertWhere(options?.where);
      return await prisma.refreshToken.deleteMany({ where });
    },
    findMany: async (options) => {
      const where = options?.where ? convertWhere(options.where) : {};
      return await prisma.refreshToken.findMany({ where });
    }
  },

  // Other models (direct Prisma access - may need wrappers if controllers use them)
  Category: prisma.category,
  Product: prisma.product,
  Cart: prisma.cart,
  CartItem: prisma.cartItem,
  Order: prisma.order,
  OrderItem: prisma.orderItem,
  Review: prisma.review,
  Wishlist: prisma.wishlist,
  WishlistItem: prisma.wishlistItem,
  Notification: prisma.notification,
  Promotion: prisma.promotion,
  Address: prisma.address
};

