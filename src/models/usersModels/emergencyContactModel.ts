import { Schema, Document } from "mongoose";

export interface IEmergencyContact extends Document {
    contactId: string;
    firstName: string;
    lastName: string;
    email: string;
    relationship: string;
    phoneNumber: string;
    isDeleted: boolean;
}

export const EmergencyContactSchema: Schema = new Schema(
    {
        contactId: { type: String, required: true, unique: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        relationship: { type: String, required: true },
        isDeleted: { type: Boolean, default: false },
    },
);

