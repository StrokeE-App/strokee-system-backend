import uniqid from "uniqid";
import { IEmergencyContact } from "../../models/usersModels/emergencyContactModel";
import patientEmergencyContact from "../../models/usersModels/patientEmergencyContact";
import { firebaseAdmin } from "../../config/firebase-cofig";

const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidPhoneNumber = (phoneNumber: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phoneNumber);
};

export const addEmergencyContactsIntoCollection = async (patientId: string, newContacts: IEmergencyContact[]): Promise<{ success: boolean, message: string, duplicateEmails: string[], duplicatePhones: string[] }> => {
    try {
        const patientExists = await firebaseAdmin.getUser(patientId).catch((error) => {
            if ((error as any).code === 'auth/user-not-found') {
                return null;
            } else {
                throw error;
            }
        });

        if (!patientExists) {
            return { success: false, message: `El paciente con ID ${patientId} no existe.`, duplicateEmails: [], duplicatePhones: [] };
        }

        const patientRecord = await patientEmergencyContact.findOne({ patientId });

        const existingContacts = patientRecord ? patientRecord.contacts : [];

        const duplicatePhoneContacts = newContacts.filter((newContact) => {
            return existingContacts.some(contact => contact.phoneNumber === newContact.phoneNumber);
        });

        const duplicateEmailContacts = newContacts.filter((newContact) => {
            return existingContacts.some(contact => contact.email === newContact.email);
        });

        const duplicatePhoneNumbers = duplicatePhoneContacts.map(c => c.phoneNumber);
        const duplicateEmails = duplicateEmailContacts.map(c => c.email);

        if (duplicatePhoneNumbers.length > 0 || duplicateEmails.length > 0) {
            return { 
                success: false, 
                message: "Algunos contactos ya existen con el mismo número de teléfono o correo electrónico.",
                duplicateEmails: duplicateEmails,
                duplicatePhones: duplicatePhoneNumbers
            };
        }

        newContacts.forEach(contact => {
            if (contact.email && !isValidEmail(contact.email)) {
                throw new Error(`El correo electrónico ${contact.email} no tiene un formato válido.`);
            }
            if (contact.phoneNumber && !isValidPhoneNumber(contact.phoneNumber)) {
                throw new Error(`El número de teléfono ${contact.phoneNumber} no tiene un formato válido.`);
            }
            if (!contact.firstName || (!contact.phoneNumber && !contact.email)) {
                throw new Error("Cada contacto debe tener un nombre y al menos un número de teléfono o correo electrónico.");
            }
        });

        const MAX_NAME_LENGTH = 100;
        newContacts.forEach(contact => {
            if (contact.firstName && contact.firstName.length > MAX_NAME_LENGTH) {
                throw new Error(`El nombre del contacto ${contact.firstName} excede el límite de ${MAX_NAME_LENGTH} caracteres.`);
            }
        });

        const MAX_CONTACTS = 10;
        if (newContacts.length + (patientRecord ? patientRecord.contacts.length : 0) > MAX_CONTACTS) {
            throw new Error(`El número máximo de contactos de emergencia es ${MAX_CONTACTS}.`);
        }

        const contactsWithIds = newContacts.map((newContact) => {
            if (!newContact.contactId) {
                newContact.contactId = uniqid(); 
            }
            return newContact;
        });

        if (!patientRecord) {
            const newPatientRecord = new patientEmergencyContact({
                patientId,
                contacts: contactsWithIds, 
            });
            await newPatientRecord.save();
            return { success: true, message: "Paciente y contactos de emergencia agregados exitosamente.", duplicateEmails: [], duplicatePhones: [] };
        } else {
            contactsWithIds.forEach((newContact) => {
                const contactExists = patientRecord.contacts.some(contact => contact.contactId === newContact.contactId);
                if (!contactExists) {
                    patientRecord.contacts.push(newContact);
                }
            });

            await patientRecord.save();
            return { success: true, message: "Contactos de emergencia agregados exitosamente.", duplicateEmails: [], duplicatePhones: [] };
        }
    } catch (error) {
        console.error("Error al agregar los contactos de emergencia:", error);
        return { success: false, message: `Hubo un error al procesar la solicitud: ${(error as any).message || 'Error desconocido.'}`, duplicateEmails: [], duplicatePhones: [] };
    }
};
