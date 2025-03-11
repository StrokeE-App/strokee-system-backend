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
import { console } from "inspector";
import emergencyModel from "../../models/emergencyModel";

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

        const existingPatient = await patientModel.findOne({ patientId });
        if (!existingPatient) {
            return { success: false, message: "No existe el paciente con el ID proporcionado" };
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        (await connectToRedis()).set(`registerEmergencyContact:${code}`, JSON.stringify({ code, contactId, patientId }), { EX: 1800 }); //30 minutos
        await sendRegistrationEmail(email, code);

        return { success: true, message: "Se envió un correo de activación al contacto de emergencia" };
    } catch (error) {
        console.error("Error al agregar contacto de emergencia:", error);
        return { success: false, message: `Error: ${(error as any).message || "Error"}` };
    }
}

async function validateVerificationCode(verificationCode: string) {
    const redisClient = await connectToRedis();
    const storedData = await redisClient.get(`registerEmergencyContact:${verificationCode}`);

    if (!storedData) {
        throw new Error("El código de verificación ha expirado o es incorrecto");
    }

    const { code, contactId, patientId } = JSON.parse(storedData); // Extraer solo el código

    if (code !== verificationCode) {
        throw new Error("El código de verificación es incorrecto");
    }

    return { contactId, patientId };
}


async function createFirebaseUser(email: string, password: string) {
    try {
        return await firebaseAdmin.createUser({ email, password });
    } catch (firebaseError: any) {
        if (firebaseError.code === "auth/email-already-exists") {
            throw new Error("El correo ya está registrado. Intenta con otro.");
        }
        throw new Error(`Error de Firebase: ${firebaseError.message}`);
    }
}

async function checkExistingEmergencyContact(contactId: string) {
    return await patientEmergencyContactModel.findOne({ "patients.emergencyContactId": contactId });
}

async function saveEmergencyContact(data: any, patientId: string, contactId: string, fireBaseId: string) {
    return await patientEmergencyContactModel.create({
        fireBaseId,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        patients: [{ patientId, emergencyContactId: contactId }],
    });
}

async function updatePatientEmergencyContact(patientId: string, contactId: string) {
    return await patientModel.updateOne(
        { patientId, "emergencyContact.emergencyContactId": contactId },
        { $set: { "emergencyContact.$[elem].canActivateEmergency": true } },
        { arrayFilters: [{ "elem.emergencyContactId": contactId }] }
    );
}

export const registerEmergencyContactToActivateEmergencyIntoCollection = async (
    data: RegisterEmergencyContactValidation
): Promise<{ success: boolean, message?: string }> => {
    try {
        const { error } = patientEmergencyContactSchema.validate(data);
        if (error) return { success: false, message: `Error de validación: ${error.details[0].message}` };

        const { contactId, patientId } = await validateVerificationCode(data.verification_code);

        const emergencyContactRecord = await createFirebaseUser(data.email, data.password);
        if (!emergencyContactRecord) throw new Error("Error al crear el contacto de emergencia");

        const existingContact = await checkExistingEmergencyContact(contactId);
        if (existingContact) {
            await firebaseAdmin.deleteUser(emergencyContactRecord.uid);
            return { success: false, message: "El token de invitación ya ha sido utilizado o es inválido." };
        }

        const emergencyContact = await saveEmergencyContact(data, patientId, contactId, emergencyContactRecord.uid);
        const role = await rolesModel.create({
            userId: emergencyContactRecord.uid,
            role: "emergencyContact",
            isDeleted: false,
            allowedApps: ["patients"]
        });

        const result = await updatePatientEmergencyContact(patientId, contactId);

        if (!emergencyContact || !role || result.modifiedCount === 0) {
            await firebaseAdmin.deleteUser(emergencyContactRecord.uid);
            return { success: false, message: "Error al registrar contacto en la base de datos." };
        }

        const redisClient = await connectToRedis();
        await redisClient.del(`registerEmergencyContact:${data.verification_code}`);

        return { success: true, message: "Contacto de emergencia registrado exitosamente." };

    } catch (error: any) {
        console.error("Error al agregar contacto de emergencia:", error);
        return { success: false, message: error.message };
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
        const contact = await await patientModel.findOne(
            { patientId, "emergencyContact.emergencyContactId": emergencyContactId },
            { "emergencyContact.$": 1 }
        );

        if (contact && contact.emergencyContact && contact.emergencyContact.length > 0) {
            return contact.emergencyContact[0];
        } else {
            return null;
        }

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

        if (result && result.modifiedCount === 0) {
            return { success: false, message: "No se pudo actualizar el contacto de emergencia." };
        }

        if (result === undefined) {
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

export const getEmergencyContactUserFromCollection = async (userId: string) => {
    try {
        const contactWithPatients = await patientEmergencyContactModel.aggregate([
            {
                $match: { fireBaseId: userId },
            },
            {
                $lookup: {
                    from: "patients", // Nombre de la colección de pacientes
                    localField: "patients.patientId",
                    foreignField: "patientId",
                    as: "patientDetails",
                },
            },
            {
                $project: {
                    _id: 0,
                    userId: "$fireBaseId",
                    email: 1,
                    firstName: 1,
                    lastName: 1,
                    phoneNumber: 1,
                    patientDetails: {
                        patientId: 1,
                        firstName: 1,
                        lastName: 1,
                        email: 1,
                        phoneNumber: 1,
                        conditions: 1,
                        medications: 1,
                    },
                },
            },
        ]);
        return contactWithPatients;
    } catch (error) {
        console.error('Error al obtener el contacto de emergencia:', error);
        return null;
    }
}

export const verifyEmergencyContact = async (userId: string, code: string) => {
    try {
        if (!userId || !code) {
            return { success: false, message: "Faltan datos para verificar la cuenta." };
        }

        // Obtener el código y token almacenados en Redis
        const redisClient = await connectToRedis();
        const storedData = await redisClient.get(`registerEmergencyContact:${code}`);

        if (!storedData) {
            return { success: false, message: "Código expirado o inválido." };
        }

        const { code: storedCode, contactId: contactId, patientId: patientId } = JSON.parse(storedData);

        // Verificar si el código y el token coinciden
        if (code !== storedCode) {
            return { success: false, message: "Código es inválido." };
        }

        // Buscar el contacto de emergencia
        const existingContact = await patientEmergencyContactModel.findOne({ fireBaseId: userId });
        if (!existingContact) {
            return { success: false, message: "El contacto de emergencia no está registrado." };
        }

        // Verificar si ya está vinculado al paciente
        const alreadyLinked = existingContact.patients.some(p => p.patientId === patientId);
        if (alreadyLinked) {
            return { success: false, message: "Este contacto ya está vinculado al paciente." };
        }

        // Vincular el contacto con el paciente
        await patientEmergencyContactModel.updateOne(
            { _id: existingContact._id },
            { $push: { patients: { patientId, emergencyContactId: contactId } } }
        );

        const result = await updatePatientEmergencyContact(patientId, contactId);

        if (result.modifiedCount === 0) {
            return { success: false, message: "Error al registrar contacto en la base de datos." };
        }

        // Eliminar el código y token de Redis
        await redisClient.del(`registerEmergencyContact:${code}`);

        return { success: true, message: "Contacto de emergencia vinculado con éxito." };

    } catch (error) {
        console.error("Error al verificar el contacto de emergencia:", error);
        return { success: false, message: `Error: ${(error as any).message || "Error inesperado."}` };
    }
};
