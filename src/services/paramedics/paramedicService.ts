import paramedicModel from "../../models/usersModels/paramedicModel";
import emergencyModel from "../../models/emergencyModel";
import rolesModel from "../../models/usersModels/rolesModel";
import { publishToExchange } from "../publisherService";
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

        const newRole = {
            userId: paramedicRecord.uid,
            role: "paramedic",
            isDeleted: false,
        }

        const addRole = await rolesModel.updateOne(
            { userId: paramedicRecord.uid, isDeleted: false },
            newRole,
            { upsert: true }
        );

        if (result.upsertedCount > 0 && addRole.upsertedCount > 0) {
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

export const updateEmergencyPickUpFromCollection = async (
    emergencyId: string,
    pickupDate: string
) => {
    try {
        if (!emergencyId) {
            return { success: false, message: "El ID de emergencia es obligatorio." };
        }
        if (!pickupDate) {
            return { success: false, message: "La fecha de recogida es obligatoria." };
        }

        const parsedPickUpDate = new Date(pickupDate);
        if (isNaN(parsedPickUpDate.getTime())) {
            return { success: false, message: "La fecha de recogida no es válida." };
        }

        const updateResult = await emergencyModel.updateOne(
            { emergencyId },
            { $set: { pickupDate: parsedPickUpDate.toISOString() } },
            { upsert: false }
        );

        if (updateResult.matchedCount === 0) {
            return { success: false, message: "No se encontró una emergencia con ese ID." };
        }

        if (updateResult.modifiedCount === 0) {
            return { success: false, message: "No se realizaron cambios en la emergencia." };
        }

        const message = {
            emergencyId,
            pickupDate: parsedPickUpDate.toISOString(),
            status: "ACTIVE",
        };

        await publishToExchange("paramedic_exchange", "paramedic_update_queue", message);

        return { success: true, message: "Emergencia confirmada y mensaje enviado." };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        console.error(`Error al actualizar la hora de recogida del paciente [ID: ${emergencyId}]: ${errorMessage}`);
        return { success: false, message: `Error al actualizar la hora de recogida: ${errorMessage}` };
    }
};

export const cancelEmergencyCollection = async (emergencyId: string, pickupDate: string) => {
    try {
        if (!emergencyId) {
            return { success: false, message: "El ID de emergencia es obligatorio." };
        }
        if (!pickupDate) {
            return { success: false, message: "La fecha de recogida es obligatoria." };
        }

        const parsedPickUpDate = new Date(pickupDate);
        if (isNaN(parsedPickUpDate.getTime())) {
            return { success: false, message: "La fecha de recogida no es válida." };
        }

        const updateResult = await emergencyModel.updateOne(
            { emergencyId },
            { $set: { pickupDate: parsedPickUpDate.toISOString(), status: "CANCELLED" } },
            { upsert: false }
        );

        if (updateResult.matchedCount === 0) {
            return { success: false, message: "No se encontró una emergencia con ese ID." };
        }

        if (updateResult.modifiedCount === 0) {
            return { success: false, message: "No se realizaron cambios en la emergencia." };
        }

        return { success: true, message: "Emergencia stroke descartada." };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        console.error(`Error al descartar la emergencia de stroke [ID: ${emergencyId}]: ${errorMessage}`);
        return { success: false, message: `Error al descartar la emergencia: ${errorMessage}` };
    }
};