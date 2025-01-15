import mongoose, { Schema, Document } from "mongoose";

export interface IEmeregency extends Document {
    emergencyId: string;
    startDate: Date;
    pickupDate: Date;
    deliveredDate: Date;
    patientId: string; 
    ambulanceId: string;
    nihScale: string;
    status: string;
    patient?: {
        firstName: string;
        lastName: string;
        height: number;
        weight: number;
        phoneNumber: string;
      };
}

const EmergencySchema: Schema = new Schema (
    {
        emergencyId: { type: String, required: true, unique: true },
        startDate: { type: Date, required: true },
        pickupDate: { type: Date, required: true },
        deliveredDate: { type: Date, required: true },
        patientId: { type: String, required: true },
        ambulanceId: { type: String, required: true },
        nihScale: { type: String, required: true },
        status: { type: String, required: true, default: "ACTIVE" },
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

export default mongoose.model<IEmeregency>("emergencies", EmergencySchema);