const mongoose = require('mongoose');

const clothingItemSchema = new mongoose.Schema({
  numericId: {
    type: Number,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  washPrice: {
    type: Number,
    default: 0
  },
  ironPrice: {
    type: Number,
    default: 0
  },
  dryCleanPrice: {
    type: Number,
    default: 0
  },
  hasWash: {
    type: Boolean,
    default: true
  },
  hasIron: {
    type: Boolean,
    default: true
  },
  hasDryClean: {
    type: Boolean,
    default: true
  },
  hasWashIron: {
    type: Boolean,
    default: true
  },
  studentDiscountPercent: {
    type: Number,
    default: 20
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ClothingItem', clothingItemSchema);
