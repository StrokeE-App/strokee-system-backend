import mongoose, { Schema, Document } from "mongoose";
import { IEmergencyContact, EmergencyContactSchema } from "./emergencyContactModel";


export interface IPatientEmergencyContacts extends Document {
    patientId: string;  
    contacts: IEmergencyContact[];  
}

const PatientEmergencyContactsSchema: Schema = new Schema(
    {
        patientId: { type: String, required: true, unique: true },
        contacts: { type: [EmergencyContactSchema], default: [] },  
    },
    { timestamps: true }
);

export default mongoose.model<IPatientEmergencyContacts>("PatientEmergencyContacts", PatientEmergencyContactsSchema);
