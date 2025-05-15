import mongoose, { Schema, Document } from "mongoose";

export interface IParamedic extends Document {
    paramedicId: string;
    ambulanceId: string;
    firstName: string;
    lastName: string;
    email: string;
    fcmTokens: Array<{
        token: string;
        device: 'web'|'android'|'ios';
        createdAt: Date;
    }>;
    notificationPreferences: {
        emergencies: boolean;
    };
}

const ParamedicSchema: Schema = new Schema(
    {
        paramedicId: { type: String, required: true, unique: true },
        ambulanceId: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
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

export default mongoose.model<IParamedic>("paramedics", ParamedicSchema);
