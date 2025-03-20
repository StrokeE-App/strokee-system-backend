import mongoose from "mongoose";
import { firebaseAdmin } from "../config/firebase-config";

// Mapeo de errores de Firebase a español
const firebaseErrorMessages: Record<string, string> = {
    "auth/email-already-exists": "Ya existe un usuario registrado con este correo.",
    "auth/invalid-email": "El formato del correo electrónico no es válido.",
    "auth/user-not-found": "No se encontró un usuario con este correo.",
    "auth/wrong-password": "La contraseña es incorrecta.",
    "auth/weak-password": "La contraseña es demasiado débil. Usa una más segura.",
    "auth/uid-already-exists": "El UID ya está registrado.",
    "auth/too-many-requests": "Demasiados intentos fallidos. Intenta más tarde.",
    "auth/network-request-failed": "Error de conexión. Verifica tu red.",
    "auth/internal-error": "Ocurrió un error interno. Intenta nuevamente.",
};

// Función para traducir errores de Firebase
function translateFirebaseError(error: any): string {
    if (error?.code && firebaseErrorMessages[error.code]) {
        console.error("Error de Firebase traducido:", error);
        return firebaseErrorMessages[error.code]; // Traducción personalizada
    }
    console.error("Error desconocido de Firebase:", error);
    return "Ocurrió un error inesperado con Firebase."; // Mensaje genérico
}

export const handleAsyncErrorRegister = async ({
    error,
    session,
    firebaseUserId,
    contextMessage
}: {
    error: any;
    session?: mongoose.ClientSession;
    firebaseUserId?: string;
    contextMessage: string;
}): Promise<{ success: false; message: string }> => {
    let errorMessage = error instanceof Error ? error.message : "Error desconocido";

    // Si el error es de Firebase, traducirlo
    if (error?.code) {
        errorMessage = translateFirebaseError(error);
    }

    console.error(`${contextMessage}: ${errorMessage}`);

    // Revertir transacción si existe
    if (session) {
        await session.abortTransaction();
        session.endSession();
    }

    // Eliminar usuario en Firebase si se creó antes del error
    if (firebaseUserId) {
        try {
            await firebaseAdmin.deleteUser(firebaseUserId);
            console.log("Usuario eliminado de Firebase debido a un error en la base de datos.");
        } catch (firebaseError) {
            console.error("Error al eliminar usuario de Firebase:", firebaseError);
        }
    }

    return { success: false, message: `${contextMessage}: ${errorMessage}` };
};
