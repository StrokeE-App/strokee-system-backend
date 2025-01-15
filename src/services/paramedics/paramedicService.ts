import paramedicModel from "../../models/usersModels/paramedicModel";
import emergencyModel from "../../models/emergencyModel";
import { firebaseAdmin } from "../../config/firebase-config";
import { isValidFirstName, isValidLastName, isValidEmail, isValidPassword } from "../utils";

export const validateParamedicFields = (
    ambulanceId: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string
): string | null => {
    if (!ambulanceId) return "ambulanceId";
    if (!firstName) return "firstName";
    if (!lastName) return "lastName";
    if (!email) return "email";
    if (!password) return "password";
    return null;
};

export const addParamedicIntoCollection = async (
    ambulanceId: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
): Promise<{ success: boolean, message: string, ambulanceId?: string }> => {
    try {
        const missingField = validateParamedicFields(
            ambulanceId,
            firstName,
            lastName,
            email,
            password
        );

        if (missingField) {
            throw new Error(`El campo ${missingField} es requerido.`);
        }

        if (!isValidFirstName(firstName)) {
            throw new Error(`El nombre ${firstName} excede el límite de caracteres permitido.`);
        }

        if (!isValidLastName(lastName)) {
            throw new Error(`El apellido ${lastName} excede el límite de caracteres permitido.`);
        }

        if (!isValidEmail(email)) {
            throw new Error(`El correo electrónico ${email} no tiene un formato válido.`);
        }

        if (!isValidPassword(password)) {
            throw new Error(`La contraseña debe tener al menos 8 caracteres.`);
        }

        const existinParamedic = await paramedicModel.findOne({ email });
        if (existinParamedic) {
            return {
                success: false,
                message: `El email ${email} ya está registrado.`,
            };
        }

        const paramedicRecord = await firebaseAdmin.createUser({ email, password });
        if (!paramedicRecord.uid) {
            throw new Error('No se pudo crear el usuario en Firebase.');
        }

        await firebaseAdmin.setCustomUserClaims(paramedicRecord.uid, { role: "paramedic" });

        const newParamedic = {
            paramedicId: paramedicRecord.uid,
            ambulanceId,
            firstName,
            lastName,
            email,
            isDeleted: false,
        };

        const result = await paramedicModel.updateOne(
            { ambulanceId: paramedicRecord.uid, isDeleted: false },
            newParamedic,
            { upsert: true }
        );

        if (result.upsertedCount > 0) {
            return { success: true, message: 'Paramedico agregado exitosamente.', ambulanceId: paramedicRecord.uid };
        } else {
            return { success: false, message: 'No se realizaron cambios en la base de datos.' };
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        console.error(`Error al agregar al paramedico: ${errorMessage}`);
        return { success: false, message: `Error al agregar al paramedico: ${errorMessage}` };
    }
};

export const getAllActiveEmergenciesFromCollection = async (userId: string) => {
    try {

        if(!userId){
            return { success: false, message: "El el userId es obligatorio" };
        }

        const paramedic = await paramedicModel.findOne({ paramedicId: userId, isDeleted: false }, { _id: 0, ambulanceId: 1 });

        if (!paramedic) {
            return { success: false, message: "Paramédico no encontrado." };
        }

        const emergencies = await emergencyModel.aggregate([
            {
                $match: {
                    ambulanceId: paramedic.ambulanceId,
                    status: "ACTIVE"
                }
            },
            {
                $lookup: {
                    from: "patients",
                    localField: "patientId",
                    foreignField: "patientId",
                    as: "patient"
                }
            },
            {
                $unwind: "$patient"
            },
            {
                $project: {
                    "_id": 0,
                    "emergencyId": 1,
                    "status": 1,
                    "startDate": 1,
                    "pickupDate": 1,
                    "deliveredDate": 1,
                    "nihScale": 1,
                    "patient.firstName": 1,
                    "patient.lastName": 1,
                    "patient.age": 1,
                    "patient.height": 1,
                    "patient.weight": 1,
                    "patient.phoneNumber": 1
                }
            }
        ]);

        if (!emergencies || emergencies.length === 0) {
            return { success: true, message: "No se encontraron emergencias" };
        }

        return { success: true, data: emergencies, message: "Emergencias encontradas" };

    }catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        console.error(`Error al consultar las emergencias: ${errorMessage}`);
        return { success: false, message: `Error al consultar las emergencias: ${errorMessage}` };
    }
}