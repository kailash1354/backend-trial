import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: String,
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  variant: {
    name: String,
    value: String,
    priceAdjustment: {
      type: Number,
      default: 0
    }
  },
  totalPrice: {
    type: Number,
    required: true
  }
});

const shippingAddressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: String,
  address: { type: String, required: true },
  address2: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: String
});

const paymentInfoSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['card', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  transactionId: String,
  paidAt: Date,
  refundedAt: Date,
  refundAmount: Number,
  lastFour: String,
  brand: String
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  billingAddress: shippingAddressSchema,
  paymentInfo: paymentInfoSchema,
  
  // Price breakdown
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  
  // Order status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  
  // Shipping
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'overnight'],
    default: 'standard'
  },
  trackingNumber: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  
  // Order notes
  notes: String,
  customerNotes: String,
  
  // Timestamps
  confirmedAt: Date,
  processingAt: Date,
  shippedAt: Date,
  cancelledAt: Date,
  returnedAt: Date,
  
  // Metadata
  ipAddress: String,
  userAgent: String,
  
  // Gift options
  isGift: {
    type: Boolean,
    default: false
  },
  giftMessage: String,
  giftWrap: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    this.orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  }
  next();
});

// Calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((total, item) => total + item.totalPrice, 0);
  this.total = this.subtotal + this.tax + this.shippingCost - this.discount;
};

// Virtual for order age
orderSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Virtual for estimated delivery
orderSchema.virtual('deliveryEstimate').get(function() {
  const shippingDays = {
    standard: 5,
    express: 2,
    overnight: 1
  };
  
  const days = shippingDays[this.shippingMethod] || 5;
  return new Date(this.createdAt.getTime() + (days * 24 * 60 * 60 * 1000));
});

// Method to update status with timestamp
orderSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  
  const statusTimestamps = {
    confirmed: 'confirmedAt',
    processing: 'processingAt',
    shipped: 'shippedAt',
    delivered: 'deliveredAt',
    cancelled: 'cancelledAt',
    returned: 'returnedAt'
  };
  
  if (statusTimestamps[newStatus]) {
    this[statusTimestamps[newStatus]] = new Date();
  }
  
  return this.save();
};

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  const cancellableStatuses = ['pending', 'confirmed'];
  return cancellableStatuses.includes(this.status);
};

// Method to check if order can be returned
orderSchema.methods.canBeReturned = function() {
  if (this.status !== 'delivered') return false;
  
  const daysSinceDelivery = Math.floor((Date.now() - this.deliveredAt.getTime()) / (1000 * 60 * 60 * 24));
  return daysSinceDelivery <= 30; // 30-day return policy
};

// Index for performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model('Order', orderSchema);