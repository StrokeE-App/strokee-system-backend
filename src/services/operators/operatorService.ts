import operatorModel from "../../models/usersModels/operatorModel";
import rolesModel from "../../models/usersModels/rolesModel";
import { publishToExchange } from "../publisherService";
import emergencyModel from "../../models/emergencyModel";
import { isValidFirstName, isValidLastName, isValidEmail, isValidPassword } from "../utils";
import { firebaseAdmin } from "../../config/firebase-config";
import { UpdateOperator } from "./operator.dto";
import { operatorSchema } from "../../validationSchemas/operatorSchema";

export const validateOperatorFields = (
    firstName: string,
    lastName: string,
    email: string,
    password: string
): string | null => {
    if (!firstName) return "firstName";
    if (!lastName) return "lastName";
    if (!email) return "email";
    if (!password) return "password";
    return null;
};

export const addOperatorIntoCollection = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
): Promise<{ success: boolean, message: string, operatorId?: string }> => {
    try {
        const missingField = validateOperatorFields(
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

        const existinOperator = await operatorModel.findOne({ email });
        if (existinOperator) {
            return {
                success: false,
                message: `El email ${email} ya está registrado.`,
            };
        }

        const operatorRecord = await firebaseAdmin.createUser({ email, password });
        if (!operatorRecord.uid) {
            throw new Error('No se pudo crear el usuario en Firebase.');
        }

        const newOperator = {
            operatorId: operatorRecord.uid,
            firstName,
            lastName,
            email,
            isDeleted: false,
        };

        const result = await operatorModel.updateOne(
            { operatorId: operatorRecord.uid, isDeleted: false },
            newOperator,
            { upsert: true }
        );

        const newRole = {
            userId: operatorRecord.uid,
            role: "operator",
            allowedApps: ["operators"],
            isDeleted: false,
        }

        const addRole = await rolesModel.updateOne(
            { userId: operatorRecord.uid, isDeleted: false },
            newRole,
            { upsert: true }
        );

        if (result.upsertedCount > 0 && addRole.upsertedCount > 0) {
            return { success: true, message: 'Operador agregado exitosamente.', operatorId: operatorRecord.uid };
        } else {
            return { success: false, message: 'No se realizaron cambios en la base de datos.' };
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al agregar al Operador: ${errorMessage}`);
        return { success: false, message: `Error al agregar al Operador: ${errorMessage}` };
    }
};

export const updateEmergencyPickUpFromCollectionOperator = async (
    emergencyId: string, ambulanceId: string
) => {
    try {
        if (!emergencyId) {
            return { success: false, message: "El ID de emergencia es obligatorio." };
        }

        if (!ambulanceId) {
            return { success: false, message: "El ID de la ambulancia es obligatoria." };
        }

        const updateResult = await emergencyModel.updateOne(
            { emergencyId },
            { $set: { status: "ACTIVE", ambulanceId: ambulanceId } },
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
            status: "ACTIVE",
            ambulanceId
        };

        await publishToExchange("operator_exchange", "emergency_started_queue", message);

        return { success: true, message: "Emergencia confirmada y mensaje enviado." };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al actualizar la emergencia [ID: ${emergencyId}]: ${errorMessage}`);
        return { success: false, message: `Error al actualizar la emergencia: ${errorMessage}` };
    }
};

export const cancelEmergencyCollectionOperator = async (emergencyId: string) => {
    try {
        if (!emergencyId) {
            return { success: false, message: "El ID de emergencia es obligatorio." };
        }

        const updateResult = await emergencyModel.updateOne(
            { emergencyId },
            { $set: { status: "CANCELLED" } },
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
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al descartar la emergencia de stroke [ID: ${emergencyId}]: ${errorMessage}`);
        return { success: false, message: `Error al descartar la emergencia: ${errorMessage}` };
    }
};

export const updateOperatorFromCollection = async (operatorId: string, operatorData: UpdateOperator) => {
    try {
        if (!operatorId) {  
            return { success: false, message: "El ID del operador es obligatorio." };
        }

        const { error } = operatorSchema.validate(operatorData);

        if (error) {
            return { success: false, message: `Error de validación: ${error.details[0].message}` };
        }

        const updateResult = await operatorModel.updateOne(
            { operatorId },
            { $set: operatorData },
            { upsert: false }
        );

        if (updateResult.matchedCount === 0) {
            return { success: false, message: "No se encontró un operador con ese ID." };
        }

        if (updateResult.modifiedCount === 0) {
            return { success: false, message: "No se realizaron cambios en el operador." };
        }

        return { success: true, message: "Operador actualizado exitosamente." };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al actualizar el operador: ${errorMessage}`);
        return { success: false, message: `Error al actualizar el operador: ${errorMessage}` };
    }
};

export const getOperatorFromCollection = async (operatorId: string) => {
    try {
        if (!operatorId) {
            return { success: false, message: "El ID del operador es obligatorio." };
        }

        const operator = await operatorModel.findOne({ operatorId }, { _id: 0, firstName: 1, lastName: 1, email: 1 });

        if (!operator) {
            return { success: false, message: "No se encontró un operador con ese ID." };
        }   

        return { success: true, message: "Operador obtenido exitosamente.", operator };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al obtener el operador: ${errorMessage}`);
        return { success: false, message: `Error al obtener el operador: ${errorMessage}` };
    }
};

export const deleteOperatorFromCollection = async (operatorId: string) => {
    try {
        if (!operatorId) {
            return { success: false, message: "El ID del operador es obligatorio." };
        }

        const exsistingOperator = await operatorModel.findOne({ operatorId });

        if (!exsistingOperator) {
            return { success: false, message: "No se encontró un operador con ese ID." };
        }
        
        await firebaseAdmin.deleteUser(operatorId);

        await operatorModel.deleteOne({ operatorId });
        await rolesModel.deleteOne({ userId: operatorId });

        return { success: true, message: "Operador eliminado exitosamente." };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al eliminar el operador: ${errorMessage}`);
        return { success: false, message: `Error al eliminar el operador: ${errorMessage}` };
    }   
}
