import Patient from "../../models/usersModels/patientModel";
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

        await firebaseAdmin.setCustomUserClaims(patientRecord.uid, { role: "patient" });

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

        if (result.upsertedCount > 0) {
            return { success: true, message: 'Paciente agregado exitosamente.', patientId: patientRecord.uid };
        } else {
            return { success: false, message: 'No se realizaron cambios en la base de datos.' };
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
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


