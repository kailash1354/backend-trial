import { Schema, model } from "mongoose";
import { baseSchemaOptions } from "./base.js";

const activitySchema = new Schema(
  {
    actorUserId: String,
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: String,
    beforeData: Schema.Types.Mixed,
    afterData: Schema.Types.Mixed,
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  baseSchemaOptions,
);
activitySchema.index({ actorUserId: 1, createdAt: -1 });

export const AdminActivityLogModel = model("AdminActivityLog", activitySchema);
