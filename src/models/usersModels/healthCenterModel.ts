import mongoose, { Schema, Document } from "mongoose";

export interface IhealthCenter extends Document {
    medicId : string;
    firstName: string;
    lastName: string;
    email: string;
    healthcenterId: string;
    isDeleted : boolean;
}

const MedicSchema: Schema = new Schema(
    {
        medicId: { type: String, required: true, unique: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        healthcenterId: { type: String, required: true },
        isDeleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model<IhealthCenter>("healthCenterStaff", MedicSchema);
