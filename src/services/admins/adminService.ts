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
        });

        const savedAdmin = await newAdmin.save();
        await rolesModel.create({
            userId: savedAdmin.adminId,
            allowedApps: ["admins"],
            role: "admin",
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
            { adminId: userId },
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
        const existingAdmin = await adminModel.findOne({ adminId: userId });

        if (!existingAdmin) {
            return { success: false, message: "No se encontró el administrador o ya fue eliminado." };
        }

        await adminModel.deleteOne({ adminId: userId });
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
            { adminId: userId },
            { _id: 0, adminId: 0, createdAt: 0, updatedAt: 0 }
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
        const users = await Promise.all([
            adminModel.aggregate([
                { 
                    $lookup: {
                        from: "userroles",
                        localField: "adminId",
                        foreignField: "userId",
                        as: "roleData"
                    }
                },
                { $unwind: { path: "$roleData", preserveNullAndEmptyArrays: true } },
                { 
                    $project: {
                        userId: "$adminId", // Mantén el campo para referenciar al usuario
                        firstName: 1, // Ajusta según los campos relevantes
                        lastName: 1,
                        email: 1,
                        role: { $ifNull: ["$roleData.role", "Sin rol"] }, // Agrega el rol y maneja valores nulos
                        isActive: "$roleData.isActive"
                    }
                }
            ]),
            operatorModel.aggregate([
                { 
                    $lookup: {
                        from: "userroles",
                        localField: "operatorId",
                        foreignField: "userId",
                        as: "roleData"
                    }
                },
                { $unwind: { path: "$roleData", preserveNullAndEmptyArrays: true } },
                { 
                    $project: {
                        userId: "$operatorId",
                        firstName: 1,
                        lastName: 1,
                        email: 1,
                        role: { $ifNull: ["$roleData.role", "Sin rol"] },
                        isActive: "$roleData.isActive"
                    }
                }
            ]),
            paramedicModel.aggregate([
                { 
                    $lookup: {
                        from: "userroles",
                        localField: "paramedicId",
                        foreignField: "userId",
                        as: "roleData"
                    }
                },
                { $unwind: { path: "$roleData", preserveNullAndEmptyArrays: true } },
                { 
                    $project: {
                        userId: "$paramedicId",
                        firstName: 1,
                        lastName: 1,
                        email: 1,
                        role: { $ifNull: ["$roleData.role", "Sin rol"] },
                        isActive: "$roleData.isActive"
                    }
                }
            ]),
            patientModel.aggregate([
                { 
                    $lookup: {
                        from: "userroles",
                        localField: "patientId",
                        foreignField: "userId",
                        as: "roleData"
                    }
                },
                { $unwind: { path: "$roleData", preserveNullAndEmptyArrays: true } },
                { 
                    $project: {
                        userId: "$patientId",
                        firstName: 1,
                        lastName: 1,
                        email: 1,
                        role: { $ifNull: ["$roleData.role", "Sin rol"] },
                        isActive: "$roleData.isActive"
                    }
                }
            ]),
            clinicModel.aggregate([
                { 
                    $lookup: {
                        from: "userroles",
                        localField: "medicId",
                        foreignField: "userId",
                        as: "roleData"
                    }
                },
                { $unwind: { path: "$roleData", preserveNullAndEmptyArrays: true } },
                { 
                    $project: {
                        userId: "$medicId",
                        firstName: 1,
                        lastName: 1,
                        email: 1,
                        role: { $ifNull: ["$roleData.role", "Sin rol"] },
                        isActive: "$roleData.isActive"
                    }
                }
            ])
        ]);

        const userArray = users.flat(); // Unir los arrays en una sola lista

        return {
            success: true,
            message: "Usuarios obtenidos correctamente.",
            users: userArray
        };
    } catch (error) {
        console.error(`Error al obtener los usuarios: ${error}`);
        return { success: false, message: "Error al obtener los usuarios." };
    }
};

export const inactivateUser = async (userId: string) => {
    try {
        await rolesModel.updateOne({ userId: userId }, { $set: { isActive: false } });
        firebaseAdmin.updateUser(userId, { disabled: true });
        return { success: true, message: "Usuario inactivado exitosamente." };
    } catch (error) {
        console.error(`Error al inactivar el usuario: ${error}`);
        return { success: false, message: "Error al inactivar el usuario." };
    }
};

export const activateUser = async (userId: string) => {
    try {
        await rolesModel.updateOne({ userId: userId }, { $set: { isActive: true } });
        firebaseAdmin.updateUser(userId, { disabled: false });
        return { success: true, message: "Usuario activado exitosamente." };
    } catch (error) {
        console.error(`Error al activar el usuario: ${error}`);
        return { success: false, message: "Error al activar el usuario." };
    }
};