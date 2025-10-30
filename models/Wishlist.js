import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  notes: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
});

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [wishlistItemSchema],
  
  // Wishlist settings
  isPublic: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    default: 'My Wishlist',
    maxlength: [100, 'Wishlist name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Sharing
  shareToken: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for performance
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ shareToken: 1 });

// Pre-save middleware
wishlistSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to add item to wishlist
wishlistSchema.methods.addItem = async function(productId, notes = '', priority = 'medium') {
  const existingItem = this.items.find(item => 
    item.product.toString() === productId.toString()
  );

  if (existingItem) {
    // Item already exists, update notes and priority
    existingItem.notes = notes;
    existingItem.priority = priority;
    existingItem.addedAt = new Date();
  } else {
    this.items.push({
      product: productId,
      notes,
      priority,
      addedAt: new Date()
    });
  }

  await this.save();
  return this;
};

// Method to remove item from wishlist
wishlistSchema.methods.removeItem = async function(productId) {
  this.items = this.items.filter(item => 
    item.product.toString() !== productId.toString()
  );
  
  await this.save();
  return this;
};

// Method to check if item exists in wishlist
wishlistSchema.methods.hasItem = function(productId) {
  return this.items.some(item => 
    item.product.toString() === productId.toString()
  );
};

// Method to clear wishlist
wishlistSchema.methods.clear = async function() {
  this.items = [];
  await this.save();
  return this;
};

// Method to generate share token
wishlistSchema.methods.generateShareToken = async function() {
  const token = require('crypto').randomBytes(32).toString('hex');
  this.shareToken = token;
  await this.save();
  return token;
};

// Method to revoke share token
wishlistSchema.methods.revokeShareToken = async function() {
  this.shareToken = undefined;
  await this.save();
  return this;
};

// Method to get share URL
wishlistSchema.methods.getShareUrl = function() {
  if (!this.shareToken) return null;
  return `${process.env.FRONTEND_URL}/wishlist/shared/${this.shareToken}`;
};

// Method to move item to cart (remove from wishlist)
wishlistSchema.methods.moveToCart = async function(productId) {
  const item = this.items.find(item => 
    item.product.toString() === productId.toString()
  );
  
  if (item) {
    this.items = this.items.filter(item => 
      item.product.toString() !== productId.toString()
    );
    await this.save();
    return item;
  }
  
  return null;
};

// Method to get items by priority
wishlistSchema.methods.getItemsByPriority = function(priority) {
  return this.items.filter(item => item.priority === priority);
};

// Static method to find wishlist by share token
wishlistSchema.statics.findByShareToken = function(token) {
  return this.findOne({ shareToken: token, isPublic: true });
};

export default mongoose.model('Wishlist', wishlistSchema);