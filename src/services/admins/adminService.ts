import adminModel from "../../models/usersModels/adminModel";
import rolesModel from "../../models/usersModels/rolesModel";
import { firebaseAdmin } from "../../config/firebase-config";
import { RegisterAdmin } from "./admin.dto";
import { adminSchema } from "../../validationSchemas/adminSchema";

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
            role: "admin",
        });

        return { success: true, message: "Administrador registrado exitosamente.", adminId: savedAdmin.adminId };
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al registrar el administrador: ${errorMessage}`);
        return { success: false, message: `Error al registrar el administrador: ${errorMessage}` };
    }
}