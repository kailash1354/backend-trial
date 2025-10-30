import Category from "../models/Category.js";
import Product from "../models/Product.js"; // <-- FIX 1: Added missing import
import { asyncHandler } from "../middleware/errorHandler.js";
import slugify from "slugify";

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
export const getAdminCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find()
    .sort({ parent: 1, name: 1 })
    .populate("parent", "name slug");

  res.status(200).json({
    success: true,
    count: categories.length, // --- FIX 2: Send the array under the 'categories' key ---
    categories: categories,
  });
});

// @desc    Create a new category
// @route   POST /api/admin/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, parentId } = req.body;

  const existingCategory = await Category.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
    parent: parentId || null,
  });
  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: `Category name '${name}' already exists at this level.`,
    });
  }

  const parent = parentId || null;
  const category = await Category.create({
    name,
    description,
    image,
    parent: parent,
    user: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: parent
      ? "Subcategory created successfully"
      : "Category created successfully", // --- FIX 2: Send new category under 'category' key ---
    category: category,
  });
});

// @desc    Update a category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, image, isActive, parentId } = req.body;
  const { id } = req.params;

  let updateFields = { description, image, isActive, parent: parentId || null };

  if (name) {
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      _id: { $ne: id },
      parent: parentId || null,
    });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists at this level.",
      });
    }
    updateFields.name = name;
  }

  if (id === parentId) {
    return res.status(400).json({
      success: false,
      message: "A category cannot be its own parent.",
    });
  }

  const category = await Category.findByIdAndUpdate(id, updateFields, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return res
      .status(44) // Use 404 for Not Found
      .json({ success: false, message: "Category not found" });
  }

  res.status(200).json({
    success: true,
    message: "Category updated successfully", // --- FIX 2: Send updated category under 'category' key ---
    category: category,
  });
});

// @desc    Delete a category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);

  if (!category) {
    return res
      .status(404)
      .json({ success: false, message: "Category not found" });
  } // CRITICAL CHECK 1: Prevent deletion if category has products

  const productsCount = await Product.countDocuments({ category: id });
  if (productsCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete: ${productsCount} products are assigned to this category.`,
    });
  } // CRITICAL CHECK 2: Prevent deletion if category has subcategories

  const childrenCount = await Category.countDocuments({ parent: id });
  if (childrenCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete: ${childrenCount} subcategories exist under this category.`,
    });
  }

  await category.deleteOne(); // Use deleteOne()
  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});
