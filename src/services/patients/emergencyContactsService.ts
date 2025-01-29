import { IEmergencyContact } from "../../models/usersModels/emergencyContactModel";
import patientModel from "../../models/usersModels/patientModel";
import { firebaseAdmin } from "../../config/firebase-config";
import { validateEmergencyContact } from "../utils";

export const addEmergencyContactsIntoCollection = async (
    tokenPatientId: string,
    newContacts: IEmergencyContact[]
): Promise<{ success: boolean, message: string, duplicateEmails: string[], duplicatePhones: string[] }> => {
    try {
        const decodedToken = await firebaseAdmin.verifySessionCookie(tokenPatientId, true);
        const patientId = decodedToken.uid;
        const patientExists = await firebaseAdmin.getUser(patientId).catch((error) => {
            if ((error as any).code === 'auth/user-not-found') {
                return null;
            } else {
                throw error;
            }
        });

        if (!patientExists) {
            return {
                success: false,
                message: `El paciente con ID ${patientId} no existe.`,
                duplicateEmails: [],
                duplicatePhones: []
            };
        }

        const patientRecord = await patientModel.findOne({ patientId });
        const existingContacts = patientRecord ? patientRecord.emergencyContact || [] : [];

        const duplicatePhoneContacts = newContacts.filter(newContact =>
            existingContacts.some((contact: { phoneNumber: string; }) => contact.phoneNumber === newContact.phoneNumber)
        );

        const duplicateEmailContacts = newContacts.filter(newContact =>
            existingContacts.some((contact: { email: string; }) => contact.email === newContact.email)
        );

        const duplicatePhoneNumbers = duplicatePhoneContacts.map(c => c.phoneNumber);
        const duplicateEmails = duplicateEmailContacts.map(c => c.email);

        if (duplicatePhoneNumbers.length > 0 || duplicateEmails.length > 0) {
            return {
                success: false,
                message: "Algunos contactos ya existen con el mismo número de teléfono o correo electrónico.",
                duplicateEmails,
                duplicatePhones: duplicatePhoneNumbers
            };
        }

        newContacts.forEach(contact => validateEmergencyContact(contact));

        await patientModel.updateOne(
            { patientId },
            { $addToSet: { emergencyContact: { $each: newContacts } } },
            { upsert: true }
        );

        return {
            success: true,
            message: "Contactos de emergencia agregados exitosamente.",
            duplicateEmails: [],
            duplicatePhones: []
        };

    } catch (error) {
        console.error("Error al agregar los contactos de emergencia:", error);
        return {
            success: false,
            message: `Hubo un error al procesar la solicitud: ${(error as any).message || 'Error'}`,
            duplicateEmails: [],
            duplicatePhones: []
        };
    }
};

export const validateEmergencyContactData = (contacts: IEmergencyContact[]): { 
    success: boolean, 
    message?: string, 
    duplicateEmails?: string[], 
    duplicatePhones?: string[] 
} => {
    const phoneCount: Record<string, number> = {};
    const emailCount: Record<string, number> = {};

    try {
        contacts.forEach(contact => validateEmergencyContact(contact));

        contacts.forEach(contact => {
            if (contact.phoneNumber) {
                phoneCount[contact.phoneNumber] = (phoneCount[contact.phoneNumber] || 0) + 1;
            }
            if (contact.email) {
                emailCount[contact.email] = (emailCount[contact.email] || 0) + 1;
            }
        });

        const duplicatePhones = Object.keys(phoneCount).filter(phone => phoneCount[phone] > 1);
        const duplicateEmails = Object.keys(emailCount).filter(email => emailCount[email] > 1);

        if (duplicatePhones.length > 0 || duplicateEmails.length > 0) {
            return { 
                success: false, 
                message: "Hay contactos duplicados en el array de entrada.",
                duplicateEmails,
                duplicatePhones
            };
        }

        return { success: true, message: "Todos los contactos son válidos." }; 
    } catch (error) {
        return { 
            success: false, 
            message: `Error al validar contactos: ${(error as Error).message}` 
        };
    }
};
