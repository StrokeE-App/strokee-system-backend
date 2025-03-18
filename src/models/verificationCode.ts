import mongoose, { Schema, Document } from "mongoose";

interface IVerificationCode extends Document {
    email: string;
    code: string;
    type: string;
    data: Record<string, string>;
    createdAt: Date;
}

const VerificationCodeSchema = new Schema<IVerificationCode>({
    email: { type: String, required: true, unique: true },
    code: { type: String, required: true },
    type: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now, expires: 1800 }, // Expira en 1 minuto
}, {
    timestamps: false,
    versionKey: false
});

export default mongoose.model<IVerificationCode>("verificationCode", VerificationCodeSchema);
