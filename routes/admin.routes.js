import express from "express";
import { body } from "express-validator";
import { protect, authorize } from "../middleware/auth.js";
import {
  asyncHandler,
  validationErrorHandler,
} from "../middleware/errorHandler.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
// --- THIS IS THE FIX ---
import Category from "../models/Category.js"; // Was "../models.js"
// --- END FIX ---

import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

// Apply admin authorization to all routes in this file
router.use(protect, authorize("admin"));

// ===================================
// ADMIN PRODUCT ROUTE
// ===================================
// @desc    Get all products (Admin)
// @route   GET /api/admin/products
// @access  Private/Admin
router.get(
  "/products",
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || "-createdAt";
    const search = req.query.search || "";

    const query = {};

    if (search) {
      // Note: $text search requires a text index on your Product schema
      query.$text = { $search: search };
    }
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.availability === "inStock") {
      query["inventory.quantity"] = { $gt: 0 };
    } else if (req.query.availability === "outOfStock") {
      query["inventory.quantity"] = { $lte: 0 };
    }

    const products = await Product.find(query)
      // This select statement is correct and includes 'images'
      .select("name slug price images category inventory status")
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

// ===================================
// CATEGORY MANAGEMENT ROUTES
// ===================================
const categoryValidation = [
  body("name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Category name is required"),
  validationErrorHandler,
];

router
  .route("/categories")
  .get(getAdminCategories)
  .post(categoryValidation, createCategory);

router
  .route("/categories/:id")
  .put(categoryValidation, updateCategory)
  .delete(deleteCategory);

// ===================================
// EXISTING ADMIN ROUTES
// ===================================

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
router.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $nin: ["cancelled"] } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const recentOrders = await Order.find()
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderNumber total status createdAt");

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("firstName lastName email createdAt");

    const lowStockProducts = await Product.find({
      "inventory.trackQuantity": true,
      "inventory.quantity": { $lte: 5 },
    }).limit(10);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
        },
        recentOrders,
        recentUsers,
        lowStockProducts,
      },
    });
  })
);

// --- (Keep all other existing routes: /analytics/*, etc.) ---

// @desc    Get user analytics
// @route   GET /api/admin/analytics/users
router.get(
  "/analytics/users",
  asyncHandler(async (req, res) => {
    const dateRange = req.query.dateRange || "30";
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));
    const userRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);
    const userRoles = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    const verificationStats = await User.aggregate([
      { $group: { _id: "$isVerified", count: { $sum: 1 } } },
    ]);
    res.status(200).json({
      success: true,
      data: { userRegistrations, userRoles, verificationStats },
    });
  })
);

// @desc    Get product analytics
// @route   GET /api/admin/analytics/products
router.get(
  "/analytics/products",
  asyncHandler(async (req, res) => {
    const topProducts = await Product.aggregate([
      { $match: { status: "active" } },
      { $sort: { "meta.sales": -1 } },
      { $limit: 10 },
      {
        $project: {
          name: 1,
          price: 1,
          "meta.sales": 1,
          "meta.views": 1,
          "ratings.average": 1,
        },
      },
    ]);
    const productStatus = await Product.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const categoryDistribution = await Product.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      { $project: { category: "$category.name", count: 1 } },
    ]);
    res.status(200).json({
      success: true,
      data: { topProducts, productStatus, categoryDistribution },
    });
  })
);

// @desc    Get revenue analytics
// @route   GET /api/admin/analytics/revenue
router.get(
  "/analytics/revenue",
  asyncHandler(async (req, res) => {
    const dateRange = req.query.dateRange || "30";
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));
    const revenueOverTime = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ["cancelled"] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);
    const revenueByPaymentMethod = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ["cancelled"] },
        },
      },
      {
        $group: {
          _id: "$paymentInfo.method",
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
    ]);
    const averageOrderValue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $nin: ["cancelled"] },
        },
      },
      { $group: { _id: null, average: { $avg: "$total" } } },
    ]);
    res.status(200).json({
      success: true,
      data: {
        revenueOverTime,
        revenueByPaymentMethod,
        averageOrderValue: averageOrderValue[0]?.average || 0,
      },
    });
  })
);

// @desc    Get system health
// @route   GET /api/admin/system/health
router.get(
  "/system/health",
  asyncHandler(async (req, res) => {
    const mongoose = require("mongoose");
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        status:
          mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        host: mongoose.connection.host,
      },
      environment: process.env.NODE_ENV || "development",
    };
    res.status(200).json({ success: true, data: { health } });
  })
);

// @desc    Bulk operations
// @route   POST /api/admin/bulk
router.post(
  "/bulk",
  asyncHandler(async (req, res) => {
    const { operation, target, data } = req.body;
    if (!operation || !target || !data) {
      return res.status(400).json({
        success: false,
        message: "Operation, target, and data are required",
      });
    }
    let result;
    switch (operation) {
      case "updateStatus":
        if (target === "products") {
          result = await Product.updateMany(
            { _id: { $in: data.ids } },
            { status: data.status }
          );
        } else if (target === "orders") {
          result = await Order.updateMany(
            { _id: { $in: data.ids } },
            { status: data.status }
          );
        }
        break;
      case "delete":
        if (target === "products") {
          result = await Product.deleteMany({ _id: { $in: data.ids } });
        } else if (target === "users") {
          result = await User.deleteMany({ _id: { $in: data.ids } });
        }
        break;
      case "updatePrices":
        if (target === "products") {
          const bulkOps = data.updates.map((update) => ({
            updateOne: {
              filter: { _id: update.id },
              update: { price: update.price },
            },
          }));
          result = await Product.bulkWrite(bulkOps);
        }
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid operation" });
    }
    res.status(200).json({
      success: true,
      message: "Bulk operation completed successfully",
      data: { result },
    });
  })
);

// @desc    Export data
// @route   GET /api/admin/export/:type
router.get(
  "/export/:type",
  asyncHandler(async (req, res) => {
    const { type } = req.params;
    const format = req.query.format || "json";
    let data;
    let filename;
    switch (type) {
      case "users":
        data = await User.find().select("-password");
        filename = "users_export";
        break;
      case "products":
        data = await Product.find().populate("category", "name");
        filename = "products_export";
        break;
      case "orders":
        data = await Order.find()
          .populate("user", "firstName lastName email")
          .populate("items.product", "name");
        filename = "orders_export";
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid export type" });
    }
    if (format === "csv") {
      const { Parser } = require("json2csv");
      const parser = new Parser();
      const csv = parser.parse(data);
      res.header("Content-Type", "text/csv");
      res.attachment(`${filename}.csv`);
      res.send(csv);
    } else {
      res.status(200).json({ success: true, data: { [type]: data } });
    }
  })
);

// @desc    Site settings
// @route   PUT /api/admin/settings
router.put(
  "/settings",
  asyncHandler(async (req, res) => {
    const settings = req.body;
    const siteSettings = {
      siteName: settings.siteName || "Luxe Heritage",
      siteDescription: settings.siteDescription || "Premium Luxury Fashion",
      maintenanceMode: settings.maintenanceMode || false,
      allowRegistrations: settings.allowRegistrations !== false,
      defaultShippingCost: settings.defaultShippingCost || 5.99,
      taxRate: settings.taxRate || 0.08,
      currency: settings.currency || "USD",
      contactEmail: settings.contactEmail || "support@luxeheritage.com",
      contactPhone: settings.contactPhone || "+1 (555) 123-4567",
      socialMedia: settings.socialMedia || {},
      updatedAt: new Date(),
    };
    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: { settings: siteSettings },
    });
  })
);

export default router;
