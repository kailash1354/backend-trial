import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      maxlength: [1000, "Review cannot exceed 1000 characters"],
    },
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
    helpful: {
      type: Number,
      default: 0,
    },
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [300, "Short description cannot exceed 300 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    compareAtPrice: {
      type: Number,
      min: [0, "Compare at price cannot be negative"],
    },
    cost: {
      type: Number,
      min: [0, "Cost cannot be negative"],
    },
    images: [
      {
        public_id: {
          type: String,
          required: false, // FIX: Changed to false
        },
        url: {
          type: String,
          required: false, // FIX: Changed to false
        },
        alt: String,
        isMain: {
          type: Boolean,
          default: false,
        },
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
    },
    brand: {
      type: String,
      trim: true,
      index: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
    },
    inventory: {
      trackQuantity: {
        type: Boolean,
        default: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: [0, "Quantity cannot be negative"],
        default: 0,
      },
      lowStockThreshold: {
        type: Number,
        default: 5,
      },
      allowBackorders: {
        type: Boolean,
        default: false,
      },
    },
    variants: [
      {
        name: {
          type: String,
          required: true,
        },
        options: [
          {
            name: String,
            value: String,
            priceAdjustment: {
              type: Number,
              default: 0,
            },
            quantity: {
              type: Number,
              default: 0,
            },
            sku: String,
          },
        ],
      },
    ],
    specifications: [
      {
        name: String,
        value: String,
      },
    ],
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    reviews: [reviewSchema],
    ratings: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
      distribution: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 },
      },
    },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
    status: {
      type: String,
      enum: ["draft", "active", "inactive", "archived"],
      default: "draft",
    },
    visibility: {
      type: String,
      enum: ["visible", "hidden", "scheduled"],
      default: "visible",
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isDigital: {
      type: Boolean,
      default: false,
    },
    digitalFile: {
      public_id: String,
      url: String,
      filename: String,
      size: Number,
    },
    weight: {
      type: Number,
      default: 0,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    shipping: {
      isFree: {
        type: Boolean,
        default: false,
      },
      shippingClass: String,
    },
    taxes: {
      taxable: {
        type: Boolean,
        default: true,
      },
      taxClass: String,
    },
    meta: {
      views: {
        type: Number,
        default: 0,
      },
      sales: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search and filtering
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, status: 1, visibility: 1 });
productSchema.index({ price: 1, ratings: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ featured: 1, status: 1 });

// Virtual for discount percentage
productSchema.virtual("discountPercentage").get(function () {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(
      ((this.compareAtPrice - this.price) / this.compareAtPrice) * 100
    );
  }
  return 0;
});

// Virtual for availability
productSchema.virtual("inStock").get(function () {
  return this.inventory.quantity > 0 || this.inventory.allowBackorders;
});

// Virtual for URL
productSchema.virtual("url").get(function () {
  return `/products/${this.slug}`;
});

// Pre-save middleware to generate slug
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  next();
});

// Method to calculate average rating
productSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.ratings.average = 0;
    this.ratings.count = 0;
    this.ratings.distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    return;
  }

  const totalRating = this.reviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  this.ratings.average = totalRating / this.reviews.length;
  this.ratings.count = this.reviews.length;

  // Calculate distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  this.reviews.forEach((review) => {
    distribution[review.rating]++;
  });
  this.ratings.distribution = distribution;
};

// Method to check stock
productSchema.methods.checkStock = function (quantity = 1, variant = null) {
  if (!this.inventory.trackQuantity) {
    return { available: true, message: "Stock tracking disabled" };
  }

  if (this.inventory.allowBackorders) {
    return { available: true, message: "Backorders allowed" };
  }

  if (this.inventory.quantity >= quantity) {
    return { available: true, message: "In stock" };
  }

  return {
    available: false,
    message: `Only ${this.inventory.quantity} items available`,
    availableQuantity: this.inventory.quantity,
  };
};

// Method to update stock
productSchema.methods.updateStock = function (
  quantity,
  operation = "decrease"
) {
  if (!this.inventory.trackQuantity) return;

  if (operation === "decrease") {
    this.inventory.quantity = Math.max(0, this.inventory.quantity - quantity);
  } else if (operation === "increase") {
    this.inventory.quantity += quantity;
  }

  // Check for low stock
  if (this.inventory.quantity <= this.inventory.lowStockThreshold) {
    // Emit low stock event (handled by event listeners)
    this.emit("lowStock", this);
  }
};

export default mongoose.model("Product", productSchema);
