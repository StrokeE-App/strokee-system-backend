import mongoose, { Schema, Document } from "mongoose";

export interface IhealthCenter extends Document {
    medicId : string;
    firstName: string;
    lastName: string;
    email: string;
    healthcenterId: string;
    fcmTokens: Array<{
        token: string;
        device: 'web'|'android'|'ios';
        createdAt: Date;
    }>;
    notificationPreferences: {
        emergencies: boolean;
    };
}

const MedicSchema: Schema = new Schema(
    {
        medicId: { type: String, required: true, unique: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        healthcenterId: { type: String, required: true },
        fcmTokens: { type: [Object], default: [] },
        notificationPreferences: {
            emergencies: { type: Boolean, default: true },
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model<IhealthCenter>("healthCenterStaff", MedicSchema);
