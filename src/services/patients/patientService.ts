import Patient from "../../models/usersModels/patientModel";
import { authSDK, auth } from "../../config/firebase-cofig";
import { signInWithEmailAndPassword } from 'firebase/auth';
import axios from "axios";
import dotenv from "dotenv";
import { AuthResponse } from "../../models/authResponseModel";

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
): Promise<void> => {
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

        const patientRecord = await authSDK.createUser({
            email,
            password,
        });

        if (!patientRecord.uid) {
            throw new Error('No se pudo crear el usuario en Firebase.');
        }

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

        await Patient.updateOne(
            { patientId: patientRecord.uid, isDeleted: false },
            newPatient,
            { upsert: true }
        );

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Error al agregar al paciente: ${error.message}`);
            throw new Error(`Error al agregar al paciente: ${error.message}`);
        } else {
            console.error("Error desconocido al agregar al paciente.");
            throw new Error("Error desconocido al agregar al paciente.");
        }
    }
};

export const cookiesForPatient = async (token: string): Promise<String | null> => {
    try {
        const decodedToken = await authSDK.verifyIdToken(token);

        const sessionCookie = await authSDK.createSessionCookie(token, { expiresIn: 60 * 60 * 24 * 1000 }); 

        return sessionCookie;
    } catch (e: unknown) {
        if (e instanceof Error) {
            if (e.message.includes('auth/user-not-found')) {
                console.error("El usuario no existe. Por favor, verifica las credenciales.");
            } else if (e.message.includes('auth/wrong-password')) {
                console.error("La contraseña es incorrecta. Inténtalo de nuevo.");
            } else if (e.message.includes('auth/invalid-id-token')) {
                console.error("El token de ID proporcionado no es válido o ha expirado.");
            } else {
                console.error("Ocurrió un error desconocido durante la autenticación:", e.message);
            }
        } else {
            console.error("Ocurrió un error inesperado durante la autenticación.");
        }

        return null;
    }
};

export const authenticatePatient = async (email: string, password: string): Promise<AuthResponse | null> => {
    try {

        const patientRecord = await signInWithEmailAndPassword(auth, email, password);

        const idToken = await patientRecord.user.getIdToken();
        const refreshToken = patientRecord.user.refreshToken;

        return { idToken, refreshToken };
    } catch (e: unknown) {
        if (e instanceof Error) {
            if (e.message.includes('auth/user-not-found')) {
                console.log("El usuario no existe.");
            } else if (e.message.includes('auth/wrong-password')) {
                console.log("Contraseña incorrecta.");
            } else {
                console.log("Error desconocido:", e.message);
            }
        } else {
            console.log("Error desconocido al autenticar.");
        }

        return null;
    }
};

export const refreshUserToken = async (refreshToken: String) => {

    try {
        const url = `https://securetoken.googleapis.com/v1/token?key=${process.env.APIKEY}`;

        const response = await axios.post(url, {
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        });

        const { id_token, expires_in, refresh_token, user_id } = response.data;

        return {
            message: "Token refrescado exitosamente.",
            idToken: id_token,
            expiresIn: expires_in,
            refreshToken: refresh_token,
            userId: user_id,
        };
    } catch (error: unknown) {
        console.error("Failed to refresh token |", error)
    }
}

export const getAllPatientsFromCollection = async () => {
    try {

        const listPatients = await Patient.find()

        return listPatients

    } catch (error) {
        console.log("No de logro obtener pacientes de la base de datos ")
    }
}


