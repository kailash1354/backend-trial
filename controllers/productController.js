// import Product from "../models/Product.js";
// import cloudinary from "../config/cloudinary.js";
// import fs from "fs-extra";

// export const uploadProductImages = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const files = req.files;

//     if (!files || files.length === 0) {
//       return res.status(400).json({ message: "No files uploaded" });
//     }

//     const product = await Product.findById(id);
//     if (!product) return res.status(404).json({ message: "Product not found" });

//     const uploaded = [];
//     for (const file of files) {
//       const result = await cloudinary.uploader.upload(file.path, {
//         folder: "products",
//       });
//       uploaded.push({
//         public_id: result.public_id,
//         url: result.secure_url,
//       });
//       await fs.remove(file.path);
//     }

//     // append new unique images
//     const currentIds = new Set(product.images.map((i) => i.public_id));
//     const filtered = uploaded.filter((i) => !currentIds.has(i.public_id));

//     product.images.push(...filtered);
//     if (product.images.length > 5) product.images = product.images.slice(0, 5);
//     await product.save();

//     res.status(200).json({
//       message: "Images uploaded successfully",
//       images: product.images,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
