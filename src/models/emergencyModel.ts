import mongoose, { Schema, Document } from "mongoose";

export interface IEmeregency extends Document {
    emergencyId: string;
    startDate: Date;
    pickupDate: Date;
    deliveredDate: Date;
    attendedDate: Date;
    patientId: string; 
    ambulanceId: string;
    status: string;
    healthcenterId: string;
    latitude: number;
    longitude: number;
    activatedBy: {
        rol : string;
        phoneNumber : string;
        userId: string;
    }
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
        activatedBy: { type: Object, required: true },
        latitude: { type: Number, required: false, default: 0 },
        longitude: { type: Number, required: false, default: 0 },
        startDate: { type: Date, required: true },
        pickupDate: { type: Date, required: false },
        deliveredDate: { type: Date, required: false },
        attendedDate: { type: Date, required: false },
        patientId: { type: String, required: true },
        ambulanceId: { type: String, required: false },
        status: { type: String, required: true, default: "PENDING" },
        healthcenterId: { type: String, required: false },
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

export default mongoose.model<IEmeregency>("emergencies", EmergencySchema);