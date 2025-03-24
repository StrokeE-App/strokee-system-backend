import mongoose, { Schema, Document } from 'mongoose';
import { IEmergencyContact } from './emergencyContactModel';

export interface IPatient extends Document {
  patientId: string;
  firstName: string;
  lastName: string;
  email: string;
  medicId: string;
  phoneNumber: string;
  age: number;
  emergencyContact: IEmergencyContact[];
  birthDate: Date;
  weight: number;
  height: number;
  medications: string[];
  conditions: string[];
  termsAndConditions: boolean;
  registerDate: Date;
  isDeleted: boolean;
}

const PatientSchema: Schema = new Schema(
  {
    patientId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    medicId: { type: String, required: true },
    emergencyContact: { type: [Object], default: [] },
    phoneNumber: { type: String, required: true },
    age: { type: Number, required: true },
    birthDate: { type: Date, required: true },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    medications: { type: [String], default: [] },
    conditions: { type: [String], default: [] },
    termsAndConditions: { type: Boolean, required: true },
    registerDate: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Patient = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);

export default Patient;
