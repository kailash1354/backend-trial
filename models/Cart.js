import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  variant: {
    name: String,
    value: String,
    priceAdjustment: {
      type: Number,
      default: 0
    }
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  
  // Price calculations
  subtotal: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  shipping: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  
  // Applied coupon
  coupon: {
    code: String,
    discount: Number,
    type: {
      type: String,
      enum: ['percentage', 'fixed']
    }
  },
  
  // Shipping method
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'overnight'],
    default: 'standard'
  },
  
  // Session-based cart (for guests)
  sessionId: String,
  
  // Expiry for guest carts (24 hours)
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  
  // Metadata
  lastActivity: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Index for guest cart cleanup
 cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });

// Pre-save middleware to calculate totals
cartSchema.pre('save', async function(next) {
  if (this.isModified('items') || this.isModified('coupon') || this.isModified('shippingMethod')) {
    await this.calculateTotals();
  }
  
  this.lastActivity = new Date();
  next();
});

// Method to calculate totals
cartSchema.methods.calculateTotals = async function() {
  try {
    await this.populate({
      path: 'items.product',
      select: 'price compareAtPrice inventory.trackQuantity inventory.quantity inventory.allowBackorders'
    });

    let subtotal = 0;
    
    this.items.forEach(item => {
      if (item.product) {
        const itemPrice = item.product.price + (item.variant?.priceAdjustment || 0);
        subtotal += itemPrice * item.quantity;
      }
    });

    this.subtotal = subtotal;
    
    // Apply coupon discount
    let discount = 0;
    if (this.coupon) {
      if (this.coupon.type === 'percentage') {
        discount = (subtotal * this.coupon.discount) / 100;
      } else {
        discount = this.coupon.discount;
      }
    }
    this.discount = discount;

    // Calculate shipping (simplified - in real app, this would be more complex)
    const shippingRates = {
      standard: 5.99,
      express: 12.99,
      overnight: 24.99
    };
    this.shipping = shippingRates[this.shippingMethod] || 0;

    // Calculate tax (simplified - in real app, this would be based on location)
    this.tax = ((subtotal - discount) * 0.08); // 8% tax rate

    this.total = this.subtotal - this.discount + this.tax + this.shipping;
  } catch (error) {
    throw new Error('Error calculating cart totals: ' + error.message);
  }
};

// Method to add item to cart
cartSchema.methods.addItem = async function(productId, quantity = 1, variant = null) {
  const existingItem = this.items.find(item => {
    const productMatch = item.product.toString() === productId.toString();
    const variantMatch = JSON.stringify(item.variant) === JSON.stringify(variant);
    return productMatch && variantMatch;
  });

  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.lastModified = new Date();
  } else {
    this.items.push({
      product: productId,
      quantity,
      variant,
      addedAt: new Date()
    });
  }

  await this.save();
  return this;
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function(productId, variant = null) {
  this.items = this.items.filter(item => {
    const productMatch = item.product.toString() === productId.toString();
    const variantMatch = JSON.stringify(item.variant) === JSON.stringify(variant);
    return !(productMatch && variantMatch);
  });

  await this.save();
  return this;
};

// Method to update item quantity
cartSchema.methods.updateQuantity = async function(productId, quantity, variant = null) {
  const item = this.items.find(item => {
    const productMatch = item.product.toString() === productId.toString();
    const variantMatch = JSON.stringify(item.variant) === JSON.stringify(variant);
    return productMatch && variantMatch;
  });

  if (item) {
    if (quantity <= 0) {
      return this.removeItem(productId, variant);
    } else {
      item.quantity = quantity;
      item.lastModified = new Date();
      await this.save();
    }
  }

  return this;
};

// Method to clear cart
cartSchema.methods.clear = async function() {
  this.items = [];
  this.coupon = undefined;
  this.subtotal = 0;
  this.tax = 0;
  this.shipping = 0;
  this.discount = 0;
  this.total = 0;
  
  await this.save();
  return this;
};

// Method to apply coupon
cartSchema.methods.applyCoupon = async function(couponCode, discount, type = 'percentage') {
  this.coupon = {
    code: couponCode,
    discount,
    type
  };
  
  await this.save();
  return this;
};

// Method to remove coupon
cartSchema.methods.removeCoupon = async function() {
  this.coupon = undefined;
  await this.save();
  return this;
};

// Method to get item count
cartSchema.methods.getItemCount = function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
};

// Method to validate stock for all items
cartSchema.methods.validateStock = async function() {
  await this.populate({
    path: 'items.product',
    select: 'inventory.trackQuantity inventory.quantity inventory.allowBackorders name'
  });

  const stockIssues = [];

  this.items.forEach(item => {
    if (item.product && item.product.inventory.trackQuantity) {
      const stockCheck = item.product.checkStock(item.quantity);
      if (!stockCheck.available) {
        stockIssues.push({
          product: item.product.name,
          requested: item.quantity,
          available: stockCheck.availableQuantity,
          message: stockCheck.message
        });
      }
    }
  });

  return {
    isValid: stockIssues.length === 0,
    issues: stockIssues
  };
};

export default mongoose.model('Cart', cartSchema);