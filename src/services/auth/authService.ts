import { firebaseAdmin, auth } from "../../config/firebase-config";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { AuthResponse } from "../../models/authResponseModel";
import mongoose from "mongoose";
import patientModel from "../../models/usersModels/patientModel";
import operatorModel from "../../models/usersModels/operatorModel";
import paramedicModel from "../../models/usersModels/paramedicModel";
import { emailSchema, passwordSchema } from "../../validationSchemas/userSchemas";

export const createSessionCookie = async (token: string): Promise<{ sessionCookie: string | null, userId: string | null } | null> => {
    try {
        const decodedToken = await firebaseAdmin.verifyIdToken(token);
        const { user_id: userId } = decodedToken; 

        const sessionCookie = await firebaseAdmin.createSessionCookie(token, { expiresIn: 60 * 60 * 24 * 1000 });

        return { sessionCookie, userId };
    } catch (e: unknown) {
        if (e instanceof Error) {
            if (e.message.includes('auth/user-not-found')) {
                console.error("El usuario no existe. Por favor, verifica las credenciales.");
            } else if (e.message.includes('auth/wrong-password')) {
                console.error("La contraseña es incorrecta. Inténtalo de nuevo.");
            } else if (e.message.includes('auth/invalid-id-token')) {
                console.error("El token de ID proporcionado no es válido o ha expirado.");
            } else if (e.message.includes('auth/id-token-expired')) {
                console.error("El token de ID proporcionado ha expirado.");
            } else {
                console.error("Ocurrió un error durante la autenticación:", e.message);
            }
        } else {
            console.error("Ocurrió un error inesperado durante la autenticación.");
        }

        return null;
    }
};

export const authenticateUser = async (email: string, password: string): Promise<AuthResponse | null> => {
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
                console.log("Error:", e.message);
            }
        } else {
            console.log("Error al autenticar.");
        }

        return null;
    }
};

export const updateEmail = async (
    userId: string,
    newEmail: string,
    userType: "patient" | "paramedic" | "operator"
) => {

    const userModels: Record<string, { model: any; idField: string }> = {
        patient: { model: patientModel, idField: "patientId" },
        paramedic: { model: paramedicModel, idField: "paramedicId" },
        operator: { model: operatorModel, idField: "operatorId" }
    };
    

    if (!userId || !newEmail || !userType) {
        return { success: false, message: "El ID del usuario, el nuevo email y el tipo de usuario son requeridos." };
    }

    const { error } = await emailSchema.validate({ email: newEmail });
    if (error) {
        return { success: false, message: `Error de validación: ${error.details[0].message}` };
    }

    const userData = userModels[userType];
    if (!userData) {
        return { success: false, message: "Tipo de usuario no válido." };
    }

    const { model, idField } = userData;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await firebaseAdmin.updateUser(userId, { email: newEmail });

        const result = await model.findOneAndUpdate(
            { [idField]: userId },
            { $set: { email: newEmail } },
            { new: true, session }
        );

        if (!result) {
            throw new Error("Usuario no encontrado en la base de datos.");
        }

        await session.commitTransaction();
        session.endSession();

        return { success: true, message: "Email actualizado exitosamente en Firebase y MongoDB." };

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        console.error(`Error al actualizar el email: ${errorMessage}`);

        return { success: false, message: `Error al actualizar el email: ${errorMessage}` };
    }
};

export const updatePassword = async (userId: string, newPassword: string) => {
    if (!userId || !newPassword) {
        return { success: false, message: "El ID del usuario y la nueva contraseña son requeridos." };
    }

    try {

        const { error } = await passwordSchema.validate({ password: newPassword });
        if (error) {
            return { success: false, message: `Error de validación: ${error.details[0].message}` };
        }

        await firebaseAdmin.updateUser(userId, { password: newPassword });

        return { success: true, message: "Contraseña actualizada exitosamente en Firebase." };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        console.error(`Error al actualizar la contraseña: ${errorMessage}`);

        return { success: false, message: `Error al actualizar la contraseña: ${errorMessage}` };
    }
};

