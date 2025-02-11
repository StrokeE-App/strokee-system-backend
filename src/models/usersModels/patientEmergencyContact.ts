import mongoose, { Schema, Document } from "mongoose";
import { IEmergencyContact } from "./emergencyContactModel";

export interface IPatientEmergencyContact extends Document {
    patientId: string;
    emergencyContact: Array<IEmergencyContact>; 
}

const PatientEmergencyContactSchema: Schema = new Schema(
    {
        patientId: { type: String, required: true, unique: true },
        emergencyContact: { type: Array, default: [] },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model<IPatientEmergencyContact>("patientEmergencyContact", PatientEmergencyContactSchema);