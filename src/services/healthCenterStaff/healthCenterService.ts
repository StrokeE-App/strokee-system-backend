import healthCenterModel from "../../models/usersModels/healthCenterModel";
import emergencyModel from "../../models/emergencyModel";
import rolesModel from "../../models/usersModels/rolesModel";
import { firebaseAdmin } from "../../config/firebase-config";
import { AddHealthCenterStaff } from "./healthCenter.dto";
import { healthCenterStaffSchema, updateHealthCenterStaffSchema } from "../../validationSchemas/healthCenterStaff";
import { connectToRedis } from "../../boostrap";
import { sendPatientRegistrationEmail } from "../mail";
import Patient from "../../models/usersModels/patientModel";

export async function addHealthCenterIntoCollection(healthCenterStaff: AddHealthCenterStaff) {
    try {
        console.log(healthCenterStaff);
        const { error } = healthCenterStaffSchema.validate(healthCenterStaff);

        if (error) {
            return { success: false, message: `Error de validación: ${error.details[0].message}` };
        }
        const healthCenterStaffExists = await healthCenterModel.findOne({ email: healthCenterStaff.email });
        console.log(healthCenterStaffExists);
        if (healthCenterStaffExists) {
            return { success: false, message: "El correo electrónico ya está registrado." };
        }

        const user = await firebaseAdmin.createUser({
            email: healthCenterStaff.email,
            password: healthCenterStaff.password,
        });

        const newHealthCenter = new healthCenterModel({
            medicId: user.uid,
            firstName: healthCenterStaff.firstName,
            lastName: healthCenterStaff.lastName,
            email: healthCenterStaff.email,
            isDeleted: false,
        });

        await newHealthCenter.save();
        await rolesModel.create({
            userId: newHealthCenter.medicId,
            role: "clinic",
            allowedApps: ["clinics"],
            isDeleted: false,
        });

        return { success: true, message: "Integrante de centro de salud agregado correctamente.", healthCenterId: newHealthCenter.medicId };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al agregar el centro de salud: ${errorMessage}`);
        return { success: false, message: `Error al agregar el integrante de centro de salud: ${errorMessage}` };
    }
}

export async function deleteHealthCenterStaff(userId: string) {
    try {

        const exisistingHealthCenterStaff = await healthCenterModel.findOne({ medicId: userId, isDeleted: false });

        if (!exisistingHealthCenterStaff) {
            return { success: false, message: "No se encontró el integrante del centro de salud o ya fue eliminado." };
        }

        await healthCenterModel.deleteOne({ medicId: userId, isDeleted: false });

        await firebaseAdmin.deleteUser(userId);

        await rolesModel.deleteOne({ userId: userId });

        return { success: true, message: "Integrante de centro de salud eliminado correctamente." };
    } catch (error) {
        console.error(`Error al eliminar el integrante: ${error}`);
        return { success: false, message: "Error al eliminar el integrante del centro de salud." };
    }
}

export async function updateHealthCenterStaff(userId: string, updateData: Partial<AddHealthCenterStaff>) {
    try {

        const { error } = updateHealthCenterStaffSchema.validate(updateData);

        if (error) {
            return { success: false, message: `Error de validación: ${error.details[0].message}` };
        }

        const updatedHealthCenterStaff = await healthCenterModel.findOneAndUpdate(
            { medicId: userId, isDeleted: false },
            updateData,
            { new: true }
        );

        if (!updatedHealthCenterStaff) {
            return { success: false, message: "No se encontró el integrante del centro de salud o ya fue eliminado." };
        }

        return { success: true, message: "Integrante de centro de salud actualizado correctamente.", updatedHealthCenterStaff };
    } catch (error) {
        console.error(`Error al actualizar el integrante: ${error}`);
        return { success: false, message: "Error al actualizar el integrante del centro de salud." };
    }
}

export async function getHealthCenterStaff(userId: string) {
    try {
        const healthCenterStaff = await healthCenterModel.findOne({ medicId: userId, isDeleted: false }, { _id: 0, medicId: 0, isDeleted: 0, createdAt: 0, updatedAt: 0 });

        if (!healthCenterStaff) {
            return { success: false, message: "No se encontró el integrante del centro de salud." };
        }

        return { success: true, message: "Integrante de centro de salud obtenido correctamente.", healthCenterStaff };
    } catch (error) {
        console.error(`Error al buscar el integrante: ${error}`);
        return { success: false, message: "Error al buscar el integrante del centro de salud." };
    }
}

export async function getPatientDeliverdToHealthCenter(emergencyId: string) {
    try {
        if (!emergencyId) {
            return { success: false, code: 400, message: "El ID de la emergencia es obligatorio." };
        }

        const emergencyDelivered = await emergencyModel.updateOne(
            { emergencyId },
            { $set: { status: "DELIVERED" } },
            { upsert: false }
        );

        if (emergencyDelivered.matchedCount === 0) {
            return { success: false, code: 404, message: "No se encontró una emergencia con ese ID." };
        }

        return { success: true, code: 200, message: "Emergencia entregada correctamente." };
    } catch (error) {
        console.error(`Error al entregar la emergencia: ${error}`);
        return { success: false, code: 500, message: "Error interno del servidor." };
    }
}

export const sendEmailToRegisterPatient= async (email: string, medicId: string) => {
    try {

        if (!email) {
            return { success: false, message: "No se pudo enviar el correo de activación al contacto de emergencia." };
        }

        if (!medicId) {
            return { success: false, message: "No se pudo enviar el correo de activación al contacto de emergencia." };
        }

        const existingHealthCenterStaff = await healthCenterModel.findOne({ medicId });
        if (!existingHealthCenterStaff) {
            return { success: false, message: "No se encontró el integrante del centro de salud." };
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        (await connectToRedis()).set(`registerPatient:${email}`, JSON.stringify({ code, medicId }), { EX: 1800 }); //30 minutos
        await sendPatientRegistrationEmail(email, code);

        return { success: true, message: "Se envió un correo de activación al contacto de emergencia" };
    } catch (error) {
        console.error("Error al agregar contacto de emergencia:", error);
        return { success: false, message: `Error: ${(error as any).message || "Error"}` };
    }
}

