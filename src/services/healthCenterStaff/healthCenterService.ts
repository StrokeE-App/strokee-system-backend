import healthCenterModel from "../../models/usersModels/healthCenterModel";
import rolesModel from "../../models/usersModels/rolesModel";
import { firebaseAdmin } from "../../config/firebase-config";
import { AddHealthCenterStaff } from "./healthCenter.dto";
import { healthCenterStaffSchema } from "../../validationSchemas/healthCenterStaff";

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
            return { success: false, message: "El correo electrónico ya esta registrado." };
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
            role: "healthCenterStaff",
            isDeleted: false,
        });
        
        return { success: true, message: "Integrante de centro de salud agregado correctamente.", healthCenterId: newHealthCenter.medicId };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al agregar el centro de salud: ${errorMessage}`);
        return { success: false, message: `Error al agregar el integrante de centro de salud: ${errorMessage}` };
    }
}