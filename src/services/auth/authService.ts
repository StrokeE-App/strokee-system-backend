import { firebaseAdmin, auth } from "../../config/firebase-cofig";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { AuthResponse } from "../../models/authResponseModel";

export const createSessionCookie = async (token: string): Promise<String | null> => {
    try {
        const decodedToken = await firebaseAdmin.verifyIdToken(token);

        const sessionCookie = await firebaseAdmin.createSessionCookie(token, { expiresIn: 60 * 60 * 24 * 1000 }); 

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
                console.log("Error desconocido:", e.message);
            }
        } else {
            console.log("Error desconocido al autenticar.");
        }

        return null;
    }
};