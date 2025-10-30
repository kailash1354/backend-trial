import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import { logger } from "../middleware/errorHandler.js";

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: (req, file) => {
      // Determine folder based on file type and route
      if (req.route.path.includes("avatar")) return "avatars";
      if (req.route.path.includes("product")) return "products";
      if (req.route.path.includes("banner")) return "banners";
      if (req.route.path.includes("category")) return "categories";
      return "uploads";
    },
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
    transformation: [{ quality: "auto", fetch_format: "auto" }],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      return file.fieldname + "-" + uniqueSuffix;
    },
  },
});

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    // --- FIX: Increased file size limit from 5MB to 10MB ---
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10, // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Image upload middleware
export const uploadImage = upload;

// Multiple images upload
export const uploadMultipleImages = upload.array("images", 10);

// Single image upload
export const uploadSingleImage = upload.single("image");

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Image deleted successfully: ${publicId}`);
    return result;
  } catch (error) {
    logger.error(`Failed to delete image ${publicId}:`, error);
    throw error;
  }
};

// Delete multiple images from Cloudinary
export const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map((id) =>
      cloudinary.uploader.destroy(id)
    );
    const results = await Promise.all(deletePromises);
    logger.info(`Deleted ${publicIds.length} images successfully`);
    return results;
  } catch (error) {
    logger.error(`Failed to delete multiple images:`, error);
    throw error;
  }
};

// Get image URL with transformations
export const getImageUrl = (publicId, options = {}) => {
  try {
    const transformations = [];

    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);

    const transformationString = transformations.join(",");
    const url = transformationString
      ? cloudinary.url(publicId, { transformation: transformationString })
      : cloudinary.url(publicId);

    return url;
  } catch (error) {
    logger.error(`Failed to generate image URL for ${publicId}:`, error);
    throw error;
  }
};

// Optimize image
export const optimizeImage = async (publicId, options = {}) => {
  try {
    const result = await cloudinary.uploader.explicit(publicId, {
      type: "upload",
      eager: [
        {
          quality: options.quality || "auto",
          fetch_format: options.format || "auto",
          width: options.width,
          height: options.height,
          crop: options.crop || "limit",
        },
      ],
    });

    return result;
  } catch (error) {
    logger.error(`Failed to optimize image ${publicId}:`, error);
    throw error;
  }
};

// Upload base64 image
export const uploadBase64Image = async (base64String, folder = "uploads") => {
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder,
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    return result;
  } catch (error) {
    logger.error("Failed to upload base64 image:", error);
    throw error;
  }
};

// Get image metadata
export const getImageMetadata = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
      size: result.bytes,
      createdAt: result.created_at,
    };
  } catch (error) {
    logger.error(`Failed to get metadata for image ${publicId}:`, error);
    throw error;
  }
};

// Configure multer for different file types
export const uploadConfig = {
  avatar: {
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed for avatar"), false);
      }
    },
  },

  product: {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed for products"), false);
      }
    },
  },

  banner: {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed for banners"), false);
      }
    },
  },
};

export default {
  uploadImage,
  uploadMultipleImages,
  uploadSingleImage,
  deleteImage,
  deleteMultipleImages,
  getImageUrl,
  optimizeImage,
  uploadBase64Image,
  getImageMetadata,
  uploadConfig,
};
