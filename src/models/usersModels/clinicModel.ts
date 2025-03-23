import mongoose, { Schema, Document } from "mongoose";

export interface IHealthcenter extends Document {
    healthcenterId: string;
    healthcenterName: string;
}

const AmbulanceSchema: Schema = new Schema(
    {
        healthcenterId: { type: String, required: true, unique: true },
        healthcenterName: { type: String, required: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model<IHealthcenter>("healthcenters", AmbulanceSchema);