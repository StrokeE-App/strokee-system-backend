import mongoose, { Schema, Document } from "mongoose";

export interface IOperator extends Document {
    operatorId : string;
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

const OperatorSchema: Schema = new Schema(
    {
        operatorId: { type: String, required: true, unique: true },
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

export default mongoose.model<IOperator>("operators", OperatorSchema);
