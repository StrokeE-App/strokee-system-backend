import Patient from "../../models/usersModels/patientModel";
import emergencyModel from "../../models/emergencyModel";
import patientEmergencyContactModel from "../../models/usersModels/patientEmergencyContact";
import mongoose from 'mongoose';
import rolesModel from "../../models/usersModels/rolesModel";
import { v4 as uuidv4 } from 'uuid';
import { publishToExchange } from "../publisherService";
import { IEmergencyContact } from "../../models/usersModels/emergencyContactModel";
import { firebaseAdmin } from "../../config/firebase-config";
import { patientSchema, patientUpadteSchema } from "../../validationSchemas/patientShemas";
import { PatientUpdate } from "./patient.dto";
import { sendMessage } from "../whatsappService";
import { hashEmail, validateVerificationCodePatient } from "../utils";
import { handleAsyncErrorRegister } from "../errorHandlers";
import { notifyOperatorsAboutEmergency } from "../operators/operatorService";
import dotenv from "dotenv";
import verificationCode from "../../models/verificationCode";

dotenv.config();

export const addPatientIntoPatientCollection = async (data: any): Promise<{ 
    success: boolean;
    message: string;
    patientId?: string;
}> => {
    const { error } = patientSchema.validate(data);
    if (error) {
        return { success: false, message: `Error de validación: ${error.details[0].message}` };
    }

    if (data.termsAndConditions !== true) {
        return { success: false, message: "Debe aceptar los términos y condiciones." };
    }

    const {
        firstName, lastName, email, password, phoneNumber, age, birthDate,
        weight, height, emergencyContact, medications, conditions, token, registerDate
    } = data;

    const formattedRegisterDate = new Date(registerDate);
    let invitedByMedicId: string;
    try {
        const { medicId } = await validateVerificationCodePatient(email, token);
        invitedByMedicId = medicId;
    } catch {
        return { success: false, message: "El correo electrónico o el código de verificación es incorrecto." };
    }

    try {
        const existingPatient = await Patient.findOne({ email });
        if (existingPatient) {
            return { success: false, message: `El email ${email} ya está registrado.` };
        }

        for (const contact of emergencyContact) {
            contact.emergencyContactId = uuidv4();
            contact.canActivateEmergency = false;
        }

        const firebaseUser = await firebaseAdmin.createUser({ email, password });
        const firebaseUserId = firebaseUser.uid;

        const newPatient = new Patient({
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
            termsAndConditions: true,
            registerDate: formattedRegisterDate.toISOString(),
        });

        await newPatient.save();

        await rolesModel.updateOne(
            { userId: firebaseUserId },
            { $set: { userId: firebaseUserId, role: "patient", allowedApps: ["patients"] } },
            { upsert: true }
        );

        await verificationCode.deleteOne({ email: email, type: "REGISTER_PATIENT" });

        return { success: true, message: "Paciente agregado exitosamente.", patientId: firebaseUserId };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        console.error(`Error al agregar la emergencia: ${errorMessage}`);

        return { success: false, message: `Error al agregar paciente: ${errorMessage}` };
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

export const addEmergencyToCollection = async (patientId: string, role: string, emergencyContactId?: string): Promise<{ success: boolean, message: string, emergencyId?: string }> => {
    try {
        if (!patientId) {
            return { success: false, message: "El ID del paciente es obligatorio." };
        }

        const allowedRoles = ["patient", "emergencyContact"];
        if (!allowedRoles.includes(role)) {
            return { success: false, message: "El rol no es válido." };
        }

        const existingPatient = await Patient.findOne(
            { patientId },
            { firstName: 1, lastName: 1, height: 1, weight: 1, phoneNumber: 1 }
        );
        if (!existingPatient) {
            return { success: false, message: "No se encontró un paciente con ese ID." };
        }

        let phoneNumber = existingPatient.phoneNumber;

        // Verificación de emergencia activa
        const existingEmergency = await emergencyModel.findOne({
            patientId,
            status: { $in: ["PENDING", "TO_AMBULANCE", "CONFIRMED"] }
        });

        if (existingEmergency) {
            return { success: false, message: "Ya tienes una emergencia activa. Espera a que sea atendida antes de solicitar otra." };
        }

        let userId = patientId; // Paciente como activador por defecto

        if (role === "emergencyContact") {
            if (!emergencyContactId) {
                return { success: false, message: "El ID del contacto de emergencia es obligatorio." };
            }
            const emergencyContact = await patientEmergencyContactModel.findOne({ "patients.emergencyContactId" : emergencyContactId });
            if (!emergencyContact || !emergencyContact.fireBaseId) {
                return { success: false, message: "No se encontró un contacto de emergencia válido para el paciente." };
            }
            userId = emergencyContact.fireBaseId;
            phoneNumber = emergencyContact.phoneNumber;
        }

        const emergencyId = uuidv4();

        const newEmergency = new emergencyModel({
            emergencyId,
            startDate: new Date().toISOString(),
            pickupDate: null,
            deliveredDate: null,
            attendedDate: null,
            patientId,
            activatedBy: { rol: role, phoneNumber, userId },
            ambulanceId: null,
            status: "PENDING",
            patient: existingPatient
        });

        const savedEmergency = await newEmergency.save();

        const message = {
            emergencyId,
            status: "PENDING",
        };

        await notifyOperatorsAboutEmergency(
            emergencyId,
            patientId,
            `${existingPatient.firstName} ${existingPatient.lastName}`
        );

        await publishToExchange("patient_exchange", "patient_report_queue", message);

        try {
            await sendMessage(existingPatient.firstName, existingPatient.lastName, phoneNumber);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            console.warn(`No se pudo enviar el mensaje al paciente: ${errorMessage}`);
        }

        return { success: true, message: "Emergencia creada exitosamente.", emergencyId: savedEmergency.emergencyId };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        console.error(`Error al agregar la emergencia: ${errorMessage}`);
        return { success: false, message: `Error al agregar la emergencia: ${errorMessage}` };
    }
};

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

        const { error } = patientUpadteSchema.validate(patientData);
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

        const existingPatient = await Patient.findOne({ patientId: patientId }, { _id: 0, createdAt: 0, updatedAt: 0 });
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
        await patientEmergencyContactModel.updateMany(
            { "patients.patientId": patientId }, 
            { $pull: { patients: { patientId: patientId } } }
        );

        return { success: true, message: "Paciente eliminado exitosamente." };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al eliminar el paciente: ${errorMessage}`);
        return { success: false, message: `Error al eliminar el paciente: ${errorMessage}` };
    }
}