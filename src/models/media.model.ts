import { Schema, model } from "mongoose";
import { baseSchemaOptions, softDeleteFields } from "./base.js";

const mediaFolderSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    parentId: { type: String, default: null },
  },
  baseSchemaOptions,
);
softDeleteFields(mediaFolderSchema);

const mediaAssetSchema = new Schema(
  {
    folderId: String,
    storagePath: { type: String, required: true },
    publicUrl: { type: String, required: true },
    mimeType: String,
    bytes: Number,
    width: Number,
    height: Number,
    altText: String,
    caption: String,
    tags: { type: [String], default: [] },
    responsiveMeta: { type: Schema.Types.Mixed, default: {} },
    optimizationMeta: { type: Schema.Types.Mixed, default: {} },
    usageRefs: { type: [String], default: [] },
  },
  baseSchemaOptions,
);
mediaAssetSchema.index({ tags: 1 });
softDeleteFields(mediaAssetSchema);

export const MediaFolderModel = model("MediaFolder", mediaFolderSchema);
export const MediaAssetModel = model("MediaAsset", mediaAssetSchema);
