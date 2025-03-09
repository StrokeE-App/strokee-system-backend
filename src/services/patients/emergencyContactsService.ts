import { IEmergencyContact } from "../../models/usersModels/emergencyContactModel";
import patientModel from "../../models/usersModels/patientModel";
import rolesModel from "../../models/usersModels/rolesModel";
import patientEmergencyContactModel from "../../models/usersModels/patientEmergencyContact";
import { sendRegistrationEmail } from "../mail";
import { validateEmergencyContact } from "../utils";
import { v4 as uuidv4 } from 'uuid';
import { firebaseAdmin } from "../../config/firebase-config";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { patientEmergencyContactSchema } from "../../validationSchemas/patientShemas";
import { RegisterEmergencyContactValidation } from "./patient.dto";
import { connectToRedis } from "../../boostrap";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY_JWT || '';

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

        await patientModel.updateOne(
            { patientId },
            { $push: { emergencyContact: newContact } }
        );

        return {
            success: true,
            message: "Contacto de emergencia agregado exitosamente.",
        };

    } catch (error) {
        console.error("Error al agregar contacto de emergencia:", error);
        return { success: false, message: `Error: ${(error as any).message || "Error"}` };
    }
};

export const sendEmailToRegisterEmergencyContact = async (patientId: string, contactId: string, email: string) => {
    try {

        if (!email) {
            return { success: false, message: "No se pudo enviar el correo de activación al contacto de emergencia." };
        }

        if (!patientId || !contactId) {
            return { success: false, message: "No se pudo enviar el correo de activación al contacto de emergencia." };
        }

        const token = jwt.sign({ patientId, contactId }, SECRET_KEY, { expiresIn: "30m" });

        console.log(token);

        const existingPatient = await patientModel.findOne({ patientId });
        if (!existingPatient) {
            return { success: false, message: "No existe el paciente con el ID proporcionado" };
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        (await connectToRedis()).set(`registerEmergencyContact:${contactId}`, code, { EX: 1800 }); //30 minutos
        await sendRegistrationEmail(email, code, token);

        return { success: true, message: "Se envió un correo de activación al contacto de emergencia" };
    } catch (error) {
        console.error("Error al agregar contacto de emergencia:", error);
        return { success: false, message: `Error: ${(error as any).message || "Error"}` };
    }
}

export const registerEmergencyContactToActivateEmergencyIntoCollection = async (data: RegisterEmergencyContactValidation, verificationToken: string): Promise<{ success: boolean, message?: string }> => {
    try {
        const { patientId, contactId } = jwt.verify(verificationToken, SECRET_KEY) as { patientId: string, contactId: string };

        console.log(patientId, contactId);

        const { error } = patientEmergencyContactSchema.validate(data);
        if (error) {
            return { success: false, message: `Error de validación: ${error.details[0].message}` };
        }

        const storedCode = (await connectToRedis()).get(`registerEmergencyContact:${contactId}`);

        storedCode.then((value) => {
            console.log(value);
        })
        console.log(data.verification_code);
        if (storedCode === null || await storedCode !== data.verification_code) {
            return { success: false, message: "El código de verificación es incorrecto" };
        }

        let emergencyContactRecord;
        try {
            emergencyContactRecord = await firebaseAdmin.createUser({
                email: data.email,
                password: data.password
            });
        } catch (firebaseError: any) {
            if (firebaseError.code === "auth/email-already-exists") {
                return { success: false, message: "El correo ya está registrado. Intenta con otro." };
            }
            return { success: false, message: `Error de Firebase: ${firebaseError.message}` };
        }

        if (!emergencyContactRecord) {
            throw new Error("Error al crear el contacto de emergencia");
        }

        const newContact = {
            fireBaseId: emergencyContactRecord.uid,
            emergencyContactId: contactId,
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            email: data.email,
            patients: [patientId],
        }

        const emergencyContact = await patientEmergencyContactModel.create(newContact);

        const role = await rolesModel.create(
            {
                userId: emergencyContactRecord.uid,
                role: "emergencyContact",
                isDeleted: false,
                allowedApps: ["patients"]
            }
        );

        const result = await patientModel.updateOne(
            { patientId, "emergencyContact.emergencyContactId": contactId },
            {
                $set: {
                    "emergencyContact.$[elem].canActivateEmergency": true
                }
            },
            {
                arrayFilters: [{ "elem.emergencyContactId": contactId }]
            }
        );

        if (emergencyContact && role && result.modifiedCount > 0) {
            await (await connectToRedis()).del(`registerEmergencyContact:${contactId}`);
        }

        return { success: true, message: "Contacto de emergencia registrado exitosamente." };

    } catch (error) {
        console.error("Error al agregar contacto de emergencia:", error);
        return { success: false, message: `Ocurrio un error al registrar el contacto de emergencia` };
    }
}

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
        const contact = await await patientModel.findOne(
            { patientId, "emergencyContact.emergencyContactId": emergencyContactId },
            { "emergencyContact.$": 1 }
        );

        return contact.emergencyContact[0];
    } catch (error) {
        console.error('Error al obtener el contacto de emergencia:', error);
        return null;
    }
}

export const updateEmergencyContactFromCollection = async (patientId: string, emergencyContactId: string, updatedContact: IEmergencyContact) => {
    try {

        validateEmergencyContact(updatedContact)

        updatedContact.emergencyContactId = emergencyContactId

        const result = await patientModel.updateOne(
            { patientId, "emergencyContact.emergencyContactId": emergencyContactId },
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
        const result = await patientModel.updateOne(
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
