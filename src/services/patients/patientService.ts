import Patient from "../../models/usersModels/patientModel";
import emergencyModel from "../../models/emergencyModel";
import rolesModel from "../../models/usersModels/rolesModel";
import { v4 as uuidv4 } from 'uuid';
import { publishToExchange } from "../publisherService";
import { IEmergencyContact } from "../../models/usersModels/emergencyContactModel";
import { firebaseAdmin } from "../../config/firebase-config";
import { validateEmergencyContactData } from "./emergencyContactsService";
import dotenv from "dotenv";

dotenv.config();

const validatePatientFields = (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phoneNumber: string,
    age: number,
    birthDate: Date,
    weight: number,
    height: number,
    emergencyContact: IEmergencyContact[],
    medications: string[],
    conditions: string[]
): string | null => {
    if (!firstName) return "firstName";
    if (!lastName) return "lastName";
    if (!email) return "email";
    if (!password) return "password";
    if (!phoneNumber) return "phoneNumber";
    if (!age) return "age";
    if (!birthDate) return "birthDate";
    if (!weight) return "weight";
    if (!height) return "height";
    if (!emergencyContact) return "emergencyContact";
    if (medications.length === 0) return "medications";
    if (conditions.length === 0) return "conditions";

    return null;
};

export const addPatientIntoPatientCollection = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phoneNumber: string,
    age: number,
    birthDate: Date,
    weight: number,
    height: number,
    emergencyContact: IEmergencyContact[],
    medications: string[],
    conditions: string[]
): Promise<{ success: boolean, message: string, patientId?: string, duplicateEmails?: string[], duplicatePhones?: string[] }> => {
    try {
        const missingField = validatePatientFields(
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
            age,
            birthDate,
            weight,
            height,
            emergencyContact,
            medications,
            conditions
        );

        if (missingField) {
            throw new Error(`El campo ${missingField} es requerido.`);
        }

        const existingPatient = await Patient.findOne({ email });
        if (existingPatient) {
            return {
                success: false,
                message: `El email ${email} ya está registrado.`,
            };
        }

        const contactValidation = validateEmergencyContactData(emergencyContact);
        if (!contactValidation.success) {
            return {
                success: false,
                message: `${contactValidation.message}`,
                duplicateEmails: contactValidation.duplicateEmails || [],
                duplicatePhones: contactValidation.duplicatePhones || [],
            };
        }

        const patientRecord = await firebaseAdmin.createUser({ email, password });
        if (!patientRecord.uid) {
            throw new Error('No se pudo crear el usuario en Firebase.');
        }

        const newPatient = {
            patientId: patientRecord.uid,
            firstName,
            lastName,
            email,
            phoneNumber,
            age,
            birthDate,
            weight,
            height,
            emergencyContact,
            medications,
            conditions,
            isDeleted: false,
        };

        const result = await Patient.updateOne(
            { patientId: patientRecord.uid, isDeleted: false },
            newPatient,
            { upsert: true }
        );

        const newRole = {
            userId: patientRecord.uid,
            role: "patient",
            isDeleted: false,
        }

        const addRole = await rolesModel.updateOne(
            { userId: patientRecord.uid, isDeleted: false },
            newRole,
            { upsert: true }
        );

        if (result.modifiedCount === 0 && addRole.modifiedCount === 0) {
            return { success: true, message: 'Paciente agregado exitosamente.', patientId: patientRecord.uid };
        } else {
            return { success: true, message: 'Paciente actualizado exitosamente.', patientId: patientRecord.uid };
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al agregar al paciente: ${errorMessage}`);
        return { success: false, message: `Error al agregar al paciente: ${errorMessage}` };
    }
};

export const getAllPatientsFromCollection = async () => {
    try {

        const listPatients = await Patient.find()

        return listPatients

    } catch (error) {
        console.log("No de logro obtener pacientes de la base de datos ")
    }
}

export const addEmergencyToCollection = async (patientId: string): Promise<{ success: boolean, message: string, emergencyId?: string }> => {
    try {

        if (!patientId) {
            return { success: false, message: "El ID del paciente es obligatorio." };
        }

        console.log(patientId)

        const existingPatient = await Patient.findOne({ patientId: patientId }, { firstName: 1, lastName: 1, height: 1, weight: 1, phoneNumber: 1 });
        if (!existingPatient) {
            return { success: false, message: "No se encontró un paciente con ese ID." };
        }

        const emergencyId = uuidv4();

        const newEmergency = new emergencyModel({
            emergencyId: emergencyId,
            startDate: new Date().toISOString(),
            pickupDate: null,
            deliveredDate: null,
            patientId: patientId,
            ambulanceId: null,
            nihScale: null,
            status: "PENDING",
            patient: existingPatient
        });

        const savedEmergency = await newEmergency.save();

        const message = {
            emergencyId,
            status: "PENDING",
        };

        await publishToExchange("patient_exchange", "patient_report_queue", message);
        return { success: true, message: "Emergencia creada exitosamente.", emergencyId: savedEmergency.emergencyId };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al agregar la emergencia: ${errorMessage}`);
        return { success: false, message: `Error al agregar la emergencia: ${errorMessage}` };
    }
}

