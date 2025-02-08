import { IEmergencyContact } from "../../models/usersModels/emergencyContactModel";
import patientModel from "../../models/usersModels/patientModel";
import patientEmergencyContactModel from "../../models/usersModels/patientEmergencyContact";
import { firebaseAdmin } from "../../config/firebase-config";
import { validateEmergencyContact } from "../utils";
import { v4 as uuidv4 } from 'uuid';

export const addEmergencyContactIntoCollection = async (
    patientId: string,
    newContact: IEmergencyContact
): Promise<{ success: boolean, message?: string }> => {
    try {

        const patientRecord = await patientModel.findOne({ patientId });

        if (!patientRecord) {
            return {
                success: false,
                message: `El paciente con ID ${patientId} no existe.`,
            };
        }

        validateEmergencyContact(newContact)

        newContact.emergencyContactId = uuidv4();

        await patientEmergencyContactModel.updateOne(
            { patientId },
            { $push: { emergencyContact: newContact } },
            { upsert: true }
        );

        return {
            success: true,
            message: "Contacto de emergencia agregado exitosamente.",
        };

    } catch (error) {
        console.error("Error al agregar contacto de emergencia:", error);
        return {
            success: false,
            message: `Hubo un error al procesar la solicitud: ${(error as any).message || 'Error'}`,
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
        console.log(contacts)
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
