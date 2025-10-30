import express from "express";
import { body } from "express-validator";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { protect, authorize } from "../middleware/auth.js";
// --- FIX: Correct import ---
import {
  asyncHandler,
  validationErrorHandler,
} from "../middleware/errorHandler.js";
// --- END FIX ---
import {
  uploadImage,
  deleteImage,
  deleteMultipleImages,
} from "../utils/upload.js";

const router = express.Router();

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const sort = req.query.sort || "-createdAt";
    const category = req.query.category;
    const brand = req.query.brand;
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || 999999;
    const search = req.query.search || "";
    const inStock = req.query.inStock === "true";
    const featured = req.query.featured === "true";

    const query = { status: "active", visibility: "visible" };

    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (search) query.$text = { $search: search };
    if (inStock) query["inventory.quantity"] = { $gt: 0 };
    if (featured) query.featured = true;
    query.price = { $gte: minPrice, $lte: maxPrice };

    const products = await Product.find(query)
      .select(
        "name slug price compareAtPrice images category ratings inventory status featured"
      )
      .populate("category", "name slug")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  })
);

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug")
      .populate("reviews.user", "firstName lastName avatar");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    product.meta.views = (product.meta.views || 0) + 1;
    await product.save();

    res.status(200).json({
      success: true,
      data: { product },
    });
  })
);

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
router.get(
  "/slug/:slug",
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({
      slug: req.params.slug,
      status: "active",
    })
      .populate("category", "name slug")
      .populate("reviews.user", "firstName lastName avatar");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    product.meta.views = (product.meta.views || 0) + 1;
    await product.save();

    res.status(200).json({
      success: true,
      data: { product },
    });
  })
);

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
router.post(
  "/",
  [
    protect,
    authorize("admin"),
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Product name is required")
      .isLength({ min: 3, max: 100 })
      .withMessage("Product name must be between 3 and 100 characters"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Product description is required")
      .isLength({ min: 5, max: 2000 })
      .withMessage("Product description must be at least 5 characters"),
    body("price")
      .isFloat({ min: 0.01 })
      .withMessage("Price must be greater than 0"),
    body("category")
      .notEmpty()
      .withMessage("Product category is required")
      .isMongoId()
      .withMessage("Please provide a valid category ID"),
    body("inventory.quantity")
      .isInt({ min: 0 })
      .withMessage("Quantity must be a non-negative integer"),
    validationErrorHandler,
  ],
  asyncHandler(async (req, res) => {
    const productData = req.body;

    const category = await Category.findById(productData.category);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }

    // FIX (for Save): Handle empty subcategory
    if (productData.subcategory === "") {
      productData.subcategory = null;
    }

    // Do not allow images to be set on create
    if (productData.images) {
      delete productData.images;
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: { product },
    });
  })
);

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put(
  "/:id",
  [
    protect,
    authorize("admin"),
    body("name")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Product name must be between 3 and 100 characters"),
    body("description")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 5 })
      .withMessage("Product description must be at least 5 characters"),
    body("price")
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage("Price must be greater than 0.01"),
    body("category")
      .optional()
      .notEmpty()
      .withMessage("Product category is required")
      .isMongoId()
      .withMessage("Please provide a valid category ID"),
    validationErrorHandler,
  ],
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // FIX (for Save): Handle empty subcategory to prevent CastError
    const updateData = req.body;
    if (updateData.subcategory === "") {
      updateData.subcategory = null;
    }

    // CRITICAL: Do not allow the 'images' array to be updated from this endpoint
    // This prevents the "Preview existing" bug
    if (updateData.images) {
      delete updateData.images;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData, // Use the cleaned updateData
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: { product: updatedProduct },
    });
  })
);

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.images && product.images.length > 0) {
      // FIX (for Delete): Filter out any missing public_ids
      const publicIds = product.images
        .map((img) => img.public_id)
        .filter(Boolean); // 'filter(Boolean)' removes null/undefined

      if (publicIds.length > 0) {
        await deleteMultipleImages(publicIds);
      }
    }

    // FIX (for Delete): Change product.remove() to product.deleteOne()
    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  })
);

// @desc    Upload product images (dedupe + max limit)
// @route   POST /api/products/:id/images
// @access  Private/Admin
router.post(
  "/:id/images",
  [
    protect,
    authorize("admin"),
    (req, res, next) => {
      // multer middleware: expects field name 'images'
      const uploadMiddleware = uploadImage.array("images", 10);
      uploadMiddleware(req, res, function (err) {
        if (err) {
          const errorMessage =
            err.message ||
            "File upload failed due to a server error or validation issue.";
          return res.status(400).json({
            success: false,
            message: errorMessage,
          });
        }
        next();
      });
    },
  ],
  asyncHandler(async (req, res) => {
    const MAX_IMAGES_PER_PRODUCT = 5;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // If client sent an 'images' JSON field accidentally, remove it (we rely on files)
    if (req.body && req.body.images) {
      delete req.body.images;
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image",
      });
    }

    // Map incoming files to image objects
    const incomingImages = req.files.map((file) => ({
      public_id: file.public_id,
      url: file.secure_url,
      alt: req.body.alt || product.name || "",
    }));

    // Build set of existing public_ids for fast lookup
    const existingPublicIds = new Set(
      (product.images || []).map((img) => img.public_id).filter(Boolean)
    );

    // Filter out duplicates (same public_id) and also enforce global max
    const spotsLeft = Math.max(
      0,
      MAX_IMAGES_PER_PRODUCT - (product.images ? product.images.length : 0)
    );

    const imagesToAdd = [];
    for (const img of incomingImages) {
      if (imagesToAdd.length >= spotsLeft) break;
      if (!img.public_id) continue; // safety
      if (existingPublicIds.has(img.public_id)) {
        // skip duplicates
        continue;
      }
      imagesToAdd.push(img);
      existingPublicIds.add(img.public_id);
    }

    if (imagesToAdd.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No new images were added — either all uploads duplicate existing images or product image limit reached.",
      });
    }

    // Push new unique images
    product.images = product.images
      ? product.images.concat(imagesToAdd)
      : imagesToAdd;

    // Ensure product.images length never exceeds MAX_IMAGES_PER_PRODUCT (safety)
    if (product.images.length > MAX_IMAGES_PER_PRODUCT) {
      product.images = product.images.slice(0, MAX_IMAGES_PER_PRODUCT);
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: `${imagesToAdd.length} images uploaded successfully`,
      data: { images: product.images },
    });
  })
);

// @desc    Delete product image
// @route   DELETE /api/products/:id/images/:publicId
// @access  Private/Admin
router.delete(
  "/:id/images/:publicId",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    const imageIndex = product.images.findIndex(
      (img) => img.public_id === req.params.publicId
    );
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }
    await deleteImage(req.params.publicId);
    product.images.splice(imageIndex, 1);
    await product.save();

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  })
);

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post(
  "/:id/reviews",
  [
    protect,
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Comment must be at least 10 characters"),
    validationErrorHandler,
  ],
  asyncHandler(async (req, res) => {
    const { rating, comment, images } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    const existingReview = product.reviews.find(
      (review) => review.user.toString() === req.user.id.toString()
    );
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }
    const review = {
      user: req.user.id,
      rating,
      comment,
      images: images || [],
    };
    product.reviews.push(review);
    product.calculateAverageRating();
    await product.save();
    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: { review },
    });
  })
);

// @desc    Update product review
// @route   PUT /api/products/:id/reviews/:reviewId
// @access  Private
router.put(
  "/:id/reviews/:reviewId",
  [
    protect,
    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment")
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage("Comment must be at least 10 characters"),
    validationErrorHandler,
  ],
  asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }
    if (review.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own reviews",
      });
    }
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    product.calculateAverageRating();
    await product.save();
    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: { review },
    });
  })
);

// @desc    Delete product review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
router.delete(
  "/:id/reviews/:reviewId",
  protect,
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }
    if (
      review.user.toString() !== req.user.id.toString() &&
      req.user.role !== "admin"
    ) {
      // --- THIS WAS THE SYNTAX ERROR ---
      // It was `res.status(4JSON).json({`
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews",
      });
      // --- END OF SYNTAX ERROR FIX ---
    }

    // Find the index and splice
    const reviewIndex = product.reviews.findIndex(
      (r) => r._id.toString() === req.params.reviewId
    );
    if (reviewIndex > -1) {
      product.reviews.splice(reviewIndex, 1);
    }

    product.calculateAverageRating();
    await product.save();
    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  })
);

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
router.get(
  "/:id/related",
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      status: "active",
      visibility: "visible",
    })
      .limit(8)
      .select("name slug price images ratings");
    res.status(200).json({
      success: true,
      data: { products: relatedProducts },
    });
  })
);

// @desc    Get product filters
// @route   GET /api/products/filters
// @access  Public
router.get(
  "/filters/all",
  asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true })
      .select("name slug")
      .sort({ name: 1 });
    const brands = await Product.distinct("brand", { status: "active" });
    const priceRange = await Product.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);
    res.status(200).json({
      success: true,
      data: {
        categories,
        brands: brands.filter(Boolean).sort(),
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 1000 },
      },
    });
  })
);

export default router;
