import Patient from "../../models/usersModels/patientModel";
import { firebaseAdmin } from "../../config/firebase-cofig";
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
    medications: string[],
    conditions: string[]
): Promise<{ success: boolean, message: string, patientId?: string }> => {
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
            medications,
            conditions
        );

        if (missingField) {
            throw new Error(`El campo ${missingField} es requerido.`);
        }

        const existingPatient = await Patient.findOne({ email });
        if (existingPatient) {
            throw new Error(`El email ${email} ya está registrado.`);
        }

        const patientRecord = await firebaseAdmin.createUser({
            email,
            password,
        });

        if (!patientRecord.uid) {
            throw new Error('No se pudo crear el usuario en Firebase.');
        }

        await firebaseAdmin.setCustomUserClaims(patientRecord.uid, { role: "patient" });

        const newPatient = new Patient({
            patientId: patientRecord.uid,
            firstName,
            lastName,
            email,
            phoneNumber,
            age,
            birthDate,
            weight,
            height,
            medications,
            conditions,
            isDeleted: false
        });

        const insertPatient = await Patient.updateOne(
            { patientId: patientRecord.uid, isDeleted: false },
            newPatient,
            { upsert: true }
        );

        if (insertPatient.upsertedCount > 0) {
            return { success: true, message: 'Paciente agregado exitosamente.', patientId: patientRecord.uid };
        } else {
            return { success: false, message: 'No se realizaron cambios en la base de datos.' };
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Error al agregar al paciente: ${error.message}`);
            return { success: false, message: `Error al agregar al paciente: ${error.message}` };
        } else {
            console.error("Error desconocido al agregar al paciente.");
            return { success: false, message: "Error desconocido al agregar al paciente." };
        }
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


