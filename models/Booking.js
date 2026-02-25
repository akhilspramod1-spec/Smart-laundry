const mongoose = require('mongoose');

const bookingItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClothingItem'
  },
  itemName: String,
  itemIcon: String,
  serviceType: {
    type: String,
    enum: ['wash', 'iron', 'dry_clean', 'wash_iron']
  },
  quantity: {
    type: Number,
    default: 1
  },
  unitPrice: Number,
  totalPrice: Number
});

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pickupDate: {
    type: Date,
    required: true
  },
  pickupTime: {
    type: String,
    default: '10:00'
  },
  pickupAddress: {
    type: String
  },
  items: [bookingItemSchema],
  
  // Pricing & GST
  totalAmount: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    default: 0
  },
  gstRate: {
    type: Number,
    default: 0.18
  },
  cgstAmount: {
    type: Number,
    default: 0
  },
  sgstAmount: {
    type: Number,
    default: 0
  },
  gstAmount: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    default: 0
  },
  
  userTypeAtBooking: {
    type: String,
    default: 'customer'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  invoiceNumber: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
