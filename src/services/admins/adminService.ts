import adminModel from "../../models/usersModels/adminModel";
import patientModel from "../../models/usersModels/patientModel";
import operatorModel from "../../models/usersModels/operatorModel";
import paramedicModel from "../../models/usersModels/paramedicModel";
import clinicModel from "../../models/usersModels/healthCenterModel";
import rolesModel from "../../models/usersModels/rolesModel";
import { firebaseAdmin } from "../../config/firebase-config";
import { RegisterAdmin } from "./admin.dto";
import { adminSchema, updateAdminSchema } from "../../validationSchemas/adminSchema";

export const registerAdminIntoCollection = async (adminData: RegisterAdmin) => {
    try {
        const { error } = adminSchema.validate(adminData);
        if (error) {
            return { success: false, message: `Error de validación: ${error.details[0].message}` };
        }

        const adminExists = await adminModel.findOne({ email: adminData.email });
        if (adminExists) {
            return { success: false, message: "El correo electrónica ya esta registrado." };
        }

        const user = await firebaseAdmin.createUser({
            email: adminData.email,
            password: adminData.password,
        });

        const newAdmin = new adminModel({
            adminId: user.uid,
            firstName: adminData.firstName,
            lastName: adminData.lastName,
            email: adminData.email,
            isDeleted: false,
        });

        const savedAdmin = await newAdmin.save();
        await rolesModel.create({
            userId: savedAdmin.adminId,
            allowedApps: ["admins"],
            role: "admin",
            isDeleted: false,
        });

        return { success: true, message: "Administrador registrado exitosamente.", adminId: savedAdmin.adminId };
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al registrar el administrador: ${errorMessage}`);
        return { success: false, message: `Error al registrar el administrador: ${errorMessage}` };
    }
}

export async function updateAdmin(userId: string, updateData: Partial<RegisterAdmin>) {
    try {
        const { error } = updateAdminSchema.validate(updateData);

        if (error) {
            return { success: false, message: `Error de validación: ${error.details[0].message}` };
        }

        const updatedAdmin = await adminModel.findOneAndUpdate(
            { adminId: userId, isDeleted: false },
            updateData,
            { new: true }
        );

        if (!updatedAdmin) {
            return { success: false, message: "No se encontró el administrador o ya fue eliminado." };
        }

        return { success: true, message: "Administrador actualizado correctamente.", updatedAdmin };
    } catch (error) {
        console.error(`Error al actualizar el administrador: ${error}`);
        return { success: false, message: "Error al actualizar el administrador." };
    }
}

export async function deleteAdmin(userId: string) {
    try {
        const existingAdmin = await adminModel.findOne({ adminId: userId, isDeleted: false });

        if (!existingAdmin) {
            return { success: false, message: "No se encontró el administrador o ya fue eliminado." };
        }

        await adminModel.deleteOne({ adminId: userId, isDeleted: false });
        await firebaseAdmin.deleteUser(userId);
        await rolesModel.deleteOne({ userId });

        return { success: true, message: "Administrador eliminado correctamente." };
    } catch (error) {
        console.error(`Error al eliminar el administrador: ${error}`);
        return { success: false, message: "Error al eliminar el administrador." };
    }
}

export async function getAdmin(userId: string) {
    try {
        const admin = await adminModel.findOne(
            { adminId: userId, isDeleted: false },
            { _id: 0, adminId: 0, isDeleted: 0, createdAt: 0, updatedAt: 0 }
        );

        if (!admin) {
            return { success: false, message: "No se encontró el administrador." };
        }

        return { success: true, message: "Administrador obtenido correctamente.", admin };
    } catch (error) {
        console.error(`Error al buscar el administrador: ${error}`);
        return { success: false, message: "Error al buscar el administrador." };
    }
}
export const getAllUsers = async () => {
    try {
        const [admins, operators, paramedics, patients, healthCenterStaffs] = await Promise.all([
            adminModel.find({}),
            operatorModel.find({}),
            paramedicModel.find({}),
            patientModel.find({}),
            clinicModel.find({})
        ]);

        return {
            success: true,
            message: "Usuarios obtenidos correctamente.",
            admins,
            operators,
            paramedics,
            patients,
            healthCenterStaffs
        }
    } catch (error) {
        console.error(`Error al obtener los usuarios: ${error}`);
        return { success: false, message: "Error al obtener los usuarios." };
    }
};

