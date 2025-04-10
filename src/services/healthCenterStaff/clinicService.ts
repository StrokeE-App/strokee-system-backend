import healthcenterModel from "../../models/usersModels/clinicModel";
import { v4 as uuidv4 } from 'uuid';
import { IHealthcenter } from "../../models/usersModels/clinicModel";
import { healthcenterUpdateSchema } from "../../validationSchemas/healthcenterModel";

export const addHealthcenter = async (healthcenterName: string) => {
    try {

        if (!healthcenterName) {
            return { success: false, message: "El nombre del centro de salud es obligatorio." };
        }

        const existingHealthcenter = await healthcenterModel.findOne({ healthcenterName });
        if (existingHealthcenter) {
            return { success: false, message: `El centro de salud con el nombre ${healthcenterName} ya existe.` };
        }

        const healthcenterId = uuidv4();

        const transformedHealthCenterName = healthcenterName.toLowerCase().replace(/\s+/g, "_");

        await healthcenterModel.create({ healthcenterId: healthcenterId, healthcenterName: transformedHealthCenterName });

        return { success: true, message: "El centro de salud ha sido agregado correctamente." };
    } catch (error) {
        console.error(`Error al agregar el centro de salud: ${error}`);
        return { success: false, message: "Error al agregar el centro de salud." };
    }
}

export const getHealthcenters = async () => {
    try {
        const Healthcenters = await healthcenterModel.find({}, { _id: 0, createdAt: 0, updatedAt: 0 });
        return { success: true, message: "Centros de salud obtenidos correctamente.", Healthcenters };
    } catch (error) {
        console.error(`Error al obtener los centros de salud: ${error}`);
        return { success: false, message: "Error al obtener los centros de salud." };
    }
}

export const getHealthcenter = async (healthcenterId: string) => {
    try {
        const Healthcenter = await healthcenterModel.findOne({ healthcenterId }, { _id: 0, createdAt: 0, updatedAt: 0 });
        if (!Healthcenter) {
            return { success: true, message: "El centro de salud no existe.", code: 404 };
        }
        return { success: true, message: "Centro de salud obtenido correctamente.", Healthcenter };
    } catch (error) {
        console.error(`Error al obtener el centro de salud: ${error}`);
        return { success: false, message: "Error al obtener el centro de salud." };
    }
}

export const updateHealthcenter = async (
    healthcenterId: string,
    updateData: Partial<IHealthcenter>
) => {
    try {
        // Aplicar formato si el nombre fue incluido en la actualización
        if (updateData.healthcenterName) {
            updateData.healthcenterName = updateData.healthcenterName
                .toLowerCase()
                .replace(/\s+/g, "_");
        }

        const { error } = healthcenterUpdateSchema.validate(updateData);

        if (error) {
            return {
                success: false,
                message: `Error de validación: ${error.details[0].message}`,
            };
        }

        const existingHealthcenter = await healthcenterModel.findOne({ healthcenterId });
        if (!existingHealthcenter) {
            return {
                success: false,
                message: "El centro de salud no existe.",
            };
        }

        await healthcenterModel.updateOne({ healthcenterId }, { $set: updateData });

        return {
            success: true,
            message: "Centro de salud actualizado correctamente.",
        };
    } catch (error) {
        console.error(`Error al actualizar el centro de salud: ${error}`);
        return {
            success: false,
            message: "Error al actualizar el centro de salud.",
        };
    }
};


export const deleteHealthcenter = async (healthcenterId: string) => {
    try {
        if (!healthcenterId) {
            return { success: false, message: "El id del centro de salud es obligatorio." };
        }
        const existingHealthcenter = await healthcenterModel.findOne({ healthcenterId });
        if (!existingHealthcenter) {
            return { success: false, message: "El centro de salud no existe." };
        }
        await healthcenterModel.deleteOne({ healthcenterId });
        return { success: true, message: "Centro de salud eliminado correctamente." };
    } catch (error) {
        console.error(`Error al eliminar el centro de salud: ${error}`);
        return { success: false, message: "Error al eliminar el centro de salud." };
    }
}