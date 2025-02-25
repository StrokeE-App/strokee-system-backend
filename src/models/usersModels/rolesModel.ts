import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
    userId: string;
    role: string;
    allowedApps: string[];
    isDeleted: boolean;
}

const RoleSchema: Schema = new Schema(
    {
        userId: { type: String, required: true, unique: true },
        role: { type: String, required: true },
        allowedApps: { type: [String], default: [] },
        isDeleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        versionKey: false,
    },

);

export default mongoose.model<IRole>("userRoles", RoleSchema);
