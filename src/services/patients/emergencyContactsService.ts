import { IEmergencyContact } from "../../models/usersModels/emergencyContactModel";
import patientModel from "../../models/usersModels/patientModel";
import rolesModel from "../../models/usersModels/rolesModel";
import patientEmergencyContactModel from "../../models/usersModels/patientEmergencyContact";
import { sendRegistrationEmail } from "../mail";
import { v4 as uuidv4 } from 'uuid';
import { firebaseAdmin } from "../../config/firebase-config";
import { emergencyContactSchema } from "../../validationSchemas/emergencyContactSchema";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { patientEmergencyContactSchema } from "../../validationSchemas/patientShemas";
import { RegisterEmergencyContactValidation } from "./patient.dto";
import { console } from "inspector";
import modelVerificationCode from "../../models/verificationCode";
import verificationCodeModel from "../../models/verificationCode";

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

        const { error } = emergencyContactSchema.validate(newContact);
        if (error) {
            return {
                success: false,
                message: error.message,
            };
        }

        newContact.emergencyContactId = uuidv4();
        newContact.canActivateEmergency = false;

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

        await modelVerificationCode.findOneAndUpdate(
            { email },
            {
                $set: {
                    email,
                    code,
                    type: "REGISTER_EMERGENCY_CONTACT",
                    data: {
                        contactId,
                        patientId
                    }
                }
            },
            { upsert: true, new: true }
        )
        await sendRegistrationEmail(email, code);

        return { success: true, message: "Se envió un correo de activación al contacto de emergencia" };
    } catch (error) {
        console.error("Error al agregar contacto de emergencia:", error);
        return { success: false, message: `Error: ${(error as any).message || "Error"}` };
    }
}

async function validateVerificationCode(verificationCode: string) {

    const storedData = await verificationCodeModel.findOne({ code: verificationCode, type: "REGISTER_EMERGENCY_CONTACT" });

    if (!storedData) {
        throw new Error("El código de verificación ha expirado o es incorrecto");
    }

    const data = storedData.data;
    const contactId = data.contactId;
    const patientId = data.patientId;
    const code = storedData.code;

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

        const existingEmergencyContact = await patientEmergencyContactModel.findOne({ email: data.email });

        if (existingEmergencyContact) {
            await firebaseAdmin.deleteUser(emergencyContactRecord.uid);
            return { success: false, message: "El contacto de emergencia ya ha sido registrado." };
        }

        const emergencyContact = await saveEmergencyContact(data, patientId, contactId, emergencyContactRecord.uid);
        const role = await rolesModel.create({
            userId: emergencyContactRecord.uid,
            role: "emergencyContact",
            allowedApps: ["patients"]
        });

        const result = await updatePatientEmergencyContact(patientId, contactId);

        if (!emergencyContact || !role || result.modifiedCount === 0) {
            await firebaseAdmin.deleteUser(emergencyContactRecord.uid);
            return { success: false, message: "Error al registrar contacto en la base de datos." };
        }

        await verificationCodeModel.deleteOne({ code: data.verification_code, type: "REGISTER_EMERGENCY_CONTACT" });

        return { success: true, message: "Contacto de emergencia registrado exitosamente." };

    } catch (error: any) {
        console.error("Error al agregar contacto de emergencia:", error);
        return { success: false, message: error.message };
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

        const { error } = emergencyContactSchema.validate(updatedContact);

        if (error) return { success: false, message: `Error de validación: ${error.details[0].message}` };

        updatedContact.emergencyContactId = emergencyContactId

        const result = await patientModel.updateOne(
            { patientId, "emergencyContact.emergencyContactId": emergencyContactId },
            {
                $set: {
                    "emergencyContact.$[elem].firstName": updatedContact.firstName,
                    "emergencyContact.$[elem].lastName": updatedContact.lastName,
                    "emergencyContact.$[elem].email": updatedContact.email,
                    "emergencyContact.$[elem].phoneNumber": updatedContact.phoneNumber,
                    "emergencyContact.$[elem].relationship": updatedContact.relationship,
                    "emergencyContact.$[elem].emergencyContactId": updatedContact.emergencyContactId,
                    "emergencyContact.$[elem].canActivateEmergency": updatedContact.canActivateEmergency
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
        // Paso 1: Obtener el contacto de emergencia
        const contact = await patientEmergencyContactModel.findOne(
            { fireBaseId: userId },
            { _id: 0, fireBaseId: 1, email: 1, phoneNumber: 1, patients: 1 }
        ).lean(); // Usar .lean() para obtener un objeto plano

        if (!contact) {
            return null; // Si no se encuentra el contacto, retornar null
        }

        // Paso 2: Obtener los IDs de los pacientes
        const patientIds = contact.patients.map((p: any) => p.patientId);

        // Paso 3: Obtener los detalles de los pacientes
        const patientDetails = await patientModel.find(
            { patientId: { $in: patientIds } },
            { _id: 0, patientId: 1, firstName: 1, lastName: 1, email: 1, phoneNumber: 1, conditions: 1, medications: 1 }
        ).lean(); // Usar .lean() para obtener objetos planos

        // Paso 4: Combinar los datos
        const combinedData = {
            userId: contact.fireBaseId,
            email: contact.email,
            phoneNumber: contact.phoneNumber,
            patientDetails: contact.patients.map((p: any) => {
                const detail = patientDetails.find((d: any) => d.patientId === p.patientId);
                return {
                    ...detail,
                    emergencyContactId: p.emergencyContactId, // Asociar el emergencyContactId
                };
            }),
        };

        return {
            message: "Contacto de emergencia obtenido exitosamente.",
            data: combinedData,
        };
    } catch (error) {
        console.error('Error al obtener el contacto de emergencia:', error);
        return null;
    }
};

export const verifyEmergencyContact = async (userId: string, _code: string) => {
    try {
        if (!userId || !_code) {
            return { success: false, message: "Faltan datos para verificar la cuenta." };
        }

        // Obtener el código y token almacenados en en mongodb
        const storedData = await verificationCodeModel.findOne({ code: _code, type: "REGISTER_EMERGENCY_CONTACT" });

        if (!storedData) {
            return { success: false, message: "Código expirado o inválido." };
        }

        const data = storedData.data;
        const contactId = data.contactId;
        const patientId = data.patientId;
        const code = storedData.code;

        // Verificar si el código y el token coinciden
        if (_code !== code) {
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
        await verificationCodeModel.deleteOne({ code: code, type: "REGISTER_EMERGENCY_CONTACT" });

        return { success: true, message: "Contacto de emergencia vinculado con éxito." };

    } catch (error) {
        console.error("Error al verificar el contacto de emergencia:", error);
        return { success: false, message: `Error: ${(error as any).message || "Error inesperado."}` };
    }
};
