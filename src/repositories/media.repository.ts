import { MediaAssetModel, MediaFolderModel } from "../models/media.model.js";

export const MediaRepository = {
  listAssets: () => MediaAssetModel.find({ deletedAt: null }).sort({ createdAt: -1 }).lean(),
  createAsset: (payload: Record<string, unknown>) => MediaAssetModel.create(payload),
  markAssetDeleted: (id: string) =>
    MediaAssetModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true }),
  listFolders: () => MediaFolderModel.find({ deletedAt: null }).lean(),
};
