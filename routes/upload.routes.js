import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadImage, deleteImage, getImageUrl } from '../utils/upload.js';

const router = express.Router();

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
router.post('/image', [
  protect,
  uploadImage.single('image')
], asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      publicId: req.file.public_id,
      url: req.file.secure_url,
      format: req.file.format,
      width: req.file.width,
      height: req.file.height,
      size: req.file.bytes
    }
  });
}));

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
router.post('/images', [
  protect,
  uploadImage.array('images', 10)
], asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please upload at least one image'
    });
  }

  const uploadedImages = req.files.map(file => ({
    publicId: file.public_id,
    url: file.secure_url,
    format: file.format,
    width: file.width,
    height: file.height,
    size: file.bytes
  }));

  res.status(200).json({
    success: true,
    message: `${req.files.length} images uploaded successfully`,
    data: { images: uploadedImages }
  });
}));

// @desc    Delete image
// @route   DELETE /api/upload/:publicId
// @access  Private/Admin
router.delete('/:publicId', [
  protect,
  authorize('admin')
], asyncHandler(async (req, res) => {
  const { publicId } = req.params;

  await deleteImage(publicId);

  res.status(200).json({
    success: true,
    message: 'Image deleted successfully'
  });
}));

// @desc    Get optimized image URL
// @route   GET /api/upload/optimize/:publicId
// @access  Public
router.get('/optimize/:publicId', asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  const { width, height, crop, quality, format } = req.query;

  const options = {
    width: width ? parseInt(width) : undefined,
    height: height ? parseInt(height) : undefined,
    crop,
    quality,
    format
  };

  const optimizedUrl = getImageUrl(publicId, options);

  res.status(200).json({
    success: true,
    data: { url: optimizedUrl }
  });
}));

// @desc    Upload avatar
// @route   POST /api/upload/avatar
// @access  Private
router.post('/avatar', [
  protect,
  uploadImage.single('avatar')
], asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an avatar image'
    });
  }

  // Apply avatar-specific optimizations
  const avatarUrl = getImageUrl(req.file.public_id, {
    width: 200,
    height: 200,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  });

  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: {
      publicId: req.file.public_id,
      url: avatarUrl,
      originalUrl: req.file.secure_url
    }
  });
}));

// @desc    Upload product images
// @route   POST /api/upload/products
// @access  Private/Admin
router.post('/products', [
  protect,
  authorize('admin'),
  uploadImage.array('images', 10)
], asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please upload at least one product image'
    });
  }

  const productImages = req.files.map(file => {
    // Generate multiple sizes for product images
    const sizes = {
      thumbnail: getImageUrl(file.public_id, { width: 150, height: 150, crop: 'fill' }),
      small: getImageUrl(file.public_id, { width: 300, height: 300, crop: 'fill' }),
      medium: getImageUrl(file.public_id, { width: 600, height: 600, crop: 'fill' }),
      large: getImageUrl(file.public_id, { width: 1200, height: 1200, crop: 'fill' }),
      original: file.secure_url
    };

    return {
      publicId: file.public_id,
      ...sizes,
      format: file.format,
      width: file.width,
      height: file.height,
      size: file.bytes
    };
  });

  res.status(200).json({
    success: true,
    message: `${req.files.length} product images uploaded successfully`,
    data: { images: productImages }
  });
}));

// @desc    Upload banner images
// @route   POST /api/upload/banners
// @access  Private/Admin
router.post('/banners', [
  protect,
  authorize('admin'),
  uploadImage.array('banners', 5)
], asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please upload at least one banner image'
    });
  }

  const bannerImages = req.files.map(file => {
    // Generate banner-specific sizes
    const sizes = {
      mobile: getImageUrl(file.public_id, { width: 768, height: 400, crop: 'fill' }),
      tablet: getImageUrl(file.public_id, { width: 1024, height: 500, crop: 'fill' }),
      desktop: getImageUrl(file.public_id, { width: 1920, height: 600, crop: 'fill' }),
      original: file.secure_url
    };

    return {
      publicId: file.public_id,
      ...sizes,
      format: file.format,
      width: file.width,
      height: file.height,
      size: file.bytes
    };
  });

  res.status(200).json({
    success: true,
    message: `${req.files.length} banner images uploaded successfully`,
    data: { banners: bannerImages }
  });
}));

// @desc    Get upload statistics
// @route   GET /api/upload/stats
// @access  Private/Admin
router.get('/stats', [
  protect,
  authorize('admin')
], asyncHandler(async (req, res) => {
  const cloudinary = require('../config/cloudinary.js').default;
  
  try {
    // Get usage statistics from Cloudinary
    const usage = await cloudinary.api.usage();
    
    res.status(200).json({
      success: true,
      data: {
        plan: usage.plan,
        last_updated: usage.last_updated,
        transformations: usage.transformations,
        objects: usage.objects,
        bandwidth: usage.bandwidth,
        storage: usage.storage,
        requests: usage.requests,
        resources: usage.resources,
        derived_resources: usage.derived_resources
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upload statistics'
    });
  }
}));

export default router;