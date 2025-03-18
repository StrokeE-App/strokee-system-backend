import mongoose, { Schema, Document } from "mongoose";

export interface IPatientEmergencyContact extends Document {
    fireBaseId: string;
    email: string;
    phoneNumber: string;
    patients: [
        {
            patientId: string;
            emergencyContactId: string;
        }
    ];
}

const PatientEmergencyContactSchema: Schema = new Schema(
    {
        fireBaseId: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        phoneNumber: { type: String, required: true },
        patients: { type: [Object], default: [] },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model<IPatientEmergencyContact>("patientEmergencyContact", PatientEmergencyContactSchema);