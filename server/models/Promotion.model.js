const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Promotion = sequelize.define('Promotion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    uppercase: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('percentage', 'fixed_amount', 'free_shipping'),
    allowNull: false
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  minPurchaseAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  maxDiscountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  applicableTo: {
    type: DataTypes.ENUM('all', 'categories', 'products'),
    defaultValue: 'all'
  },
  categoryIds: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  productIds: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  userUsageLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'promotions',
  timestamps: true
});

module.exports = Promotion;
