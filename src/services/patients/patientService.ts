import Patient from "../../models/usersModels/patientModel";
import emergencyModel from "../../models/emergencyModel";
import patientEmergencyContactModel from "../../models/usersModels/patientEmergencyContact";
import mongoose from 'mongoose';
import rolesModel from "../../models/usersModels/rolesModel";
import { v4 as uuidv4 } from 'uuid';
import { publishToExchange } from "../publisherService";
import { IEmergencyContact } from "../../models/usersModels/emergencyContactModel";
import { firebaseAdmin } from "../../config/firebase-config";
import { patientSchema } from "../../validationSchemas/patientShemas";
import { PatientUpdate } from "./patient.dto";
import { sendMessage } from "../whatsappService";
import { connectToRedis } from "../../boostrap";
import { hashEmail, validateVerificationCodePatient } from "../utils";
import { handleAsyncErrorRegister } from "../errorHandlers";
import dotenv from "dotenv";

dotenv.config();

export const addPatientIntoPatientCollection = async (data: any): Promise<{
    success: boolean;
    message: string;
    patientId?: string;
}> => {
    // Validar datos con schema
    const { error } = patientSchema.validate(data);
    if (error) {
        return { success: false, message: `Error de validación: ${error.details[0].message}` };
    }

    const {
        firstName, lastName, email, password, phoneNumber, age, birthDate,
        weight, height, emergencyContact, medications, conditions, token
    } = data;

    // Validar el token de registro
    let invitedByMedicId: string;
    try {
        const { medicId } = await validateVerificationCodePatient(email, token);
        invitedByMedicId = medicId;
    } catch {
        return { success: false, message: "El correo electrónico o el código de verificación es incorrecto." };
    }

    // Iniciar transacción en MongoDB
    const session = await mongoose.startSession();
    session.startTransaction();

    let firebaseUserId: string | undefined;

    try {
        // Verificar si el paciente ya existe
        const existingPatient = await Patient.findOne({ email }).session(session);
        if (existingPatient) {
            return { success: false, message: `El email ${email} ya está registrado.` };
        }

        // Asignar ID único a contactos de emergencia
        for (const contact of emergencyContact) {
            contact.emergencyContactId = uuidv4();
            contact.canActivateEmergency = false;
        }

        // Crear usuario en Firebase
        try {
            const patientRecord = await firebaseAdmin.createUser({ email, password });
            firebaseUserId = patientRecord.uid;
        } catch (error: any) {
            if (error.code === "auth/email-already-exists") {
                throw new Error("Ya existe un usuario registrado con este correo.");
            }
            throw new Error(`Error al crear el usuario en Firebase: ${error.message}`);
        }

        // Crear documento del paciente en la base de datos
        const newPatient = {
            patientId: firebaseUserId,
            firstName,
            lastName,
            email,
            medicId: invitedByMedicId,
            phoneNumber,
            age,
            emergencyContact,
            birthDate,
            weight,
            height,
            medications,
            conditions,
            isDeleted: false,
        };

        await Patient.updateOne(
            { patientId: firebaseUserId, isDeleted: false },
            { $set: newPatient },
            { upsert: true, session }
        );

        // Asignar rol al usuario
        const newRole = {
            userId: firebaseUserId,
            role: "patient",
            allowedApps: ["patients"],
            isDeleted: false,
        };

        await rolesModel.updateOne(
            { userId: firebaseUserId, isDeleted: false },
            { $set: newRole },
            { upsert: true, session }
        );

        // Confirmar la transacción
        await session.commitTransaction();
        session.endSession();

        // Eliminar el token de Redis
        const redisClient = await connectToRedis();
        await redisClient.del(`registerPatient:${hashEmail(email)}`);

        return { success: true, message: "Paciente agregado exitosamente.", patientId: firebaseUserId };

    } catch (error) {
        return await handleAsyncErrorRegister({
            error,
            session,
            firebaseUserId,
            contextMessage: "Error al agregar al paciente"
        });
    }
};
export const getAllPatientsFromCollection = async () => {
    try {

        const listPatients = await Patient.find()

        return listPatients

    } catch (error) {
        console.log("No de logro obtener pacientes de la base de datos ")
    }
}

export const addEmergencyToCollection = async (patientId: string, role: string, emergencyContactId?: string | null): Promise<{ success: boolean, message: string, emergencyId?: string }> => {
    try {

        let phoneNumber = "";

        if (!patientId) {
            return { success: false, message: "El ID del paciente es obligatorio." };
        }

        console.log("role", role)

        const allowedRoles = ["patient", "emergencyContact"];
        if (!allowedRoles.includes(role)) {
            return { success: false, message: "El rol no es valido" };
        }

        const existingPatient = await Patient.findOne({ patientId: patientId }, { firstName: 1, lastName: 1, height: 1, weight: 1, phoneNumber: 1 });
        if (!existingPatient) {
            return { success: false, message: "No se encontró un paciente con ese ID." };
        }

        // 🚧 Verificación de emergencia activa
        const existingEmergency = await emergencyModel.findOne({
            patientId,
            status: { $in: ["PENDING", "TO_AMBULANCE", "CONFIRMED"] } // Verifica si hay una emergencia en curso
        });

        if (existingEmergency) {
            return { success: false, message: "Ya tienes una emergencia activa. Espera a que sea atendida antes de solicitar otra." };
        }

        phoneNumber = existingPatient.phoneNumber

        if (role === "emergencyContact") {
            if (!emergencyContactId) {
                return { success: false, message: "El ID del contacto de emergencia es obligatorio." };
            }
            const emergencyContact = await patientEmergencyContactModel.findOne({ patients: patientId, fireBaseId: emergencyContactId });
            if (!emergencyContact) {
                return { success: false, message: "No se encontró un contacto de emergencia con ese ID." };
            }

            phoneNumber = emergencyContact.phoneNumber;
        }

        console.log(patientId)

        const emergencyId = uuidv4();

        const newEmergency = new emergencyModel({
            emergencyId: emergencyId,
            startDate: new Date().toISOString(),
            pickupDate: null,
            deliveredDate: null,
            patientId: patientId,
            activatedBy: { rol: role, phoneNumber: phoneNumber, userId: role === "emergencyContact" ? emergencyContactId : patientId },
            ambulanceId: null,
            nihScale: null,
            status: "PENDING",
            patient: existingPatient
        });

        const savedEmergency = await newEmergency.save();


        await sendMessage(existingPatient.firstName, existingPatient.lastName, phoneNumber);

        const message = {
            emergencyId,
            status: "PENDING",
        };

        await publishToExchange("patient_exchange", "patient_report_queue", message);
        return { success: true, message: "Emergencia creada exitosamente.", emergencyId: savedEmergency.emergencyId };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al agregar la emergencia: ${errorMessage}`);
        return { success: false, message: `Error al agregar la emergencia: ${errorMessage}` };
    }
}

export const getAllEmergencyContactFromCollection = async (patientId: string): Promise<{ success: boolean, message: string, data: { email: string }[] | null }> => {
    try {

        if (!patientId) {
            return { success: false, message: "El ID del paciente es obligatorio.", data: null };
        }

        const existingPatient = await Patient.findOne({ patientId: patientId }, { _id: 0, emergencyContact: 1 });
        if (!existingPatient) {
            return { success: true, message: "No se encontró un paciente con ese ID.", data: null };
        }

        return { success: true, message: "Contactos de emergencia obtenidos exitosamente.", data: existingPatient.emergencyContact };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error encontrar contactos de emergencia: ${errorMessage}`);
        return { success: false, message: `Error encontrar contactos de emergencia: ${errorMessage}`, data: null };
    }
}

export const getEmergencyContactFromCollection = async (emergencyContactId: string) => {
    try {

        if (!emergencyContactId) {
            return { success: false, message: "El ID del paciente es obligatorio." };
        }

        const existingPatient = await Patient.findOne({ patientId: emergencyContactId }, { _id: 0, emergencyContact: 1 });
        if (!existingPatient) {
            return { success: true, message: "No se encontró un paciente con ese ID.", data: null };
        }

        return { success: true, message: "Contactos de emergencia obtenidos exitosamente.", data: existingPatient.emergencyContact };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error encontrar contactos de emergencia: ${errorMessage}`);
        return { success: false, message: `Error encontra contacto de emergencia: ${errorMessage}` };
    }
}

export const updatePatientFromCollection = async (patientId: string, patientData: PatientUpdate) => {
    try {

        if (!patientId) {
            return { success: false, message: "El ID del paciente es obligatorio." };
        }

        const { error } = patientSchema.validate(patientData);
        if (error) {
            return { success: false, message: `Error de validación: ${error.details[0].message}` };
        }

        const existingPatient = await Patient.findOne({ patientId: patientId });
        if (!existingPatient) {
            return { success: false, message: "No se encontró un paciente con ese ID." };
        }

        const { firstName, lastName, phoneNumber, age, birthDate, weight, height, medications, conditions } = patientData;

        existingPatient.firstName = firstName;
        existingPatient.lastName = lastName;
        existingPatient.phoneNumber = phoneNumber;
        existingPatient.age = age;
        existingPatient.birthDate = birthDate;
        existingPatient.weight = weight;
        existingPatient.height = height;
        existingPatient.medications = medications;
        existingPatient.conditions = conditions;

        await existingPatient.save();

        return { success: true, message: "Paciente actualizado correctamente" };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al actualizar el paciente: ${errorMessage}`);
        return { success: false, message: `Error al actualizar el paciente: ${errorMessage}` };
    }
};

export const getPatientFromCollection = async (patientId: string) => {
    try {

        if (!patientId) {
            return { success: false, message: "El ID del paciente es obligatorio." };
        }

        const existingPatient = await Patient.findOne({ patientId: patientId }, { _id: 0, isDeleted: 0, createdAt: 0, updatedAt: 0 });
        if (!existingPatient) {
            return { success: false, message: "No se encontró un paciente con ese ID." };
        }

        return { success: true, message: "Paciente obtenido exitosamente.", data: existingPatient };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error encontrar paciente: ${errorMessage}`);
        return { success: false, message: `Error encontrar paciente: ${errorMessage}` };
    }
}

export const deletePatientFromCollection = async (patientId: string) => {
    try {

        if (!patientId) {
            return { success: false, message: "El ID del paciente es obligatorio." };
        }

        const existingPatient = await Patient.findOne({ patientId: patientId });
        if (!existingPatient) {
            return { success: false, message: "No se encontró un paciente con ese ID." };
        }

        firebaseAdmin.deleteUser(patientId);

        await Patient.deleteOne({ patientId: patientId });
        await rolesModel.deleteOne({ userId: patientId });
        await patientEmergencyContactModel.deleteOne({ patientId: patientId });

        return { success: true, message: "Paciente eliminado exitosamente." };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al eliminar el paciente: ${errorMessage}`);
        return { success: false, message: `Error al eliminar el paciente: ${errorMessage}` };
    }
}