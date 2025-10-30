import mongoose from "mongoose";
import slugify from "slugify"; // Ensure slugify is imported if needed elsewhere

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: String,
    image: {
      url: String,
      public_id: String,
    },
    // CRITICAL FIX: Add parent field for nested hierarchy
    parent: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      default: null, // Top-level categories have parent: null
    },
    // We can track the depth, though not strictly required for a simple 2-level structure
    level: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true, // Admin who created the category
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field to store subcategories (children)
categorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

// Pre-save hook to generate slug and determine level
categorySchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  // Calculate level based on parent
  if (this.isModified("parent") && this.parent) {
    const parentCategory = await this.model("Category").findById(this.parent);
    if (parentCategory) {
      this.level = parentCategory.level + 1;
    }
  } else if (!this.parent) {
    this.level = 0; // Top level
  }

  next();
});

// Add text index for search functionality
categorySchema.index({ name: "text", description: "text" });
categorySchema.index({ slug: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);
