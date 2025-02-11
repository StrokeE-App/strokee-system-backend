import { IEmergencyContact } from "../../models/usersModels/emergencyContactModel";
import patientModel from "../../models/usersModels/patientModel";
import patientEmergencyContactModel from "../../models/usersModels/patientEmergencyContact";
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

export const getEmergencyContactFromCollection = async (patientId: string, emergencyContactId: string) => {
    try {
        const contact = await patientEmergencyContactModel.aggregate([
            { 
                $match: { "patientId": patientId, "emergencyContact.emergencyContactId": emergencyContactId } 
            },
            { 
                $project: { 
                    _id: 0, 
                    emergencyContact: { 
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$emergencyContact",
                                    as: "contact",
                                    cond: { $eq: ["$$contact.emergencyContactId", emergencyContactId] }
                                }
                            }, 
                            0
                        ]
                    }
                } 
            },
            {
                $replaceRoot: { newRoot: "$emergencyContact" }
            }
        ]);

        return contact[0];
    } catch (error) {
        console.error('Error al obtener el contacto de emergencia:', error);
        return null;
    }
}

export const updateEmergencyContactFromCollection = async (patientId: string, emergencyContactId: string, updatedContact: IEmergencyContact) => {
    try {

        validateEmergencyContact(updatedContact)

        updatedContact.emergencyContactId = emergencyContactId

        const result = await patientEmergencyContactModel.updateOne(
            {patientId ,"emergencyContact.emergencyContactId": emergencyContactId },
            { 
                $set: { 
                    "emergencyContact.$[elem]": updatedContact 
                } 
            },
            {
                arrayFilters: [{ "elem.emergencyContactId": emergencyContactId }]
            }
        );

        if (result.modifiedCount === 0) {
            return { success: false, message: "No se pudo actualizar el contacto de emergencia." };
        }

        return { success: true, message: "Contacto de emergencia actualizado exitosamente." };
    } catch (error) {
        console.error('Error al actualizar el contacto de emergencia:', error);
        return { success: false, message: `Error al actualizar el contacto de emergencia: ${(error as any).message || 'Error'}` };
    }
}

export const deleteEmergencyContactFromCollection = async (patientId: string, emergencyContactId: string) => {
    try {
        const result = await patientEmergencyContactModel.updateOne(
            { patientId, "emergencyContact.emergencyContactId": emergencyContactId },
            { $pull: { emergencyContact: { emergencyContactId } } }
        );

        if (result.modifiedCount === 0) {
            return { success: false, message: "No se pudo eliminar el contacto de emergencia." };
        }       

        return { success: true, message: "Contacto de emergencia eliminado exitosamente." };
    } catch (error) {
        console.error('Error al eliminar el contacto de emergencia:', error);
        return { success: false, message: `Error al eliminar el contacto de emergencia: ${(error as any).message || 'Error'}` };
    }
}
