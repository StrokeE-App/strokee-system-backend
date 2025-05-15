import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
    userId: string;
    role: string;
    allowedApps: string[];
    isActive: boolean;
}

const RoleSchema: Schema = new Schema(
    {
        userId: { type: String, required: true, unique: true },
        role: { type: String, required: true },
        allowedApps: { type: [String], default: [] },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },

);

export default mongoose.model<IRole>("userRoles", RoleSchema);
