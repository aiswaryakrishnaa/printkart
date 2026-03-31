const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WishlistItem = sequelize.define('WishlistItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  wishlistId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'wishlists',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  }
}, {
  tableName: 'wishlist_items',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['wishlistId', 'productId'] }
  ]
});

module.exports = WishlistItem;

