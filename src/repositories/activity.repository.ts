import { AdminActivityLogModel } from "../models/activity.model.js";

export const ActivityRepository = {
  create: (payload: Record<string, unknown>) => AdminActivityLogModel.create(payload),
  list: (limit = 50) => AdminActivityLogModel.find({}).sort({ createdAt: -1 }).limit(limit).lean(),
};
