import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { env } from "../config/env.js";
import { MediaRepository } from "../repositories/media.repository.js";

export const MediaService = {
  listAssets: () => MediaRepository.listAssets(),

  async registerUpload(file: Express.Multer.File) {
    const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
    const optimizedPath = path.join(uploadDir, `optimized-${file.filename}.webp`);
    await sharp(file.path).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 82 }).toFile(optimizedPath);

    const stat = await fs.stat(optimizedPath);
    const publicUrl = `/uploads/${path.basename(optimizedPath)}`;

    return MediaRepository.createAsset({
      storagePath: optimizedPath,
      publicUrl,
      mimeType: "image/webp",
      bytes: stat.size,
      tags: [],
      responsiveMeta: { widths: [640, 1024, 1920] },
      optimizationMeta: { format: "webp", quality: 82 },
      usageRefs: [],
    });
  },
};
