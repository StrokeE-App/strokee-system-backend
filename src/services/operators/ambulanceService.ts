import ambulanceModel from "../../models/usersModels/ambulanceModel";
import { IAmbulance } from "../../models/usersModels/ambulanceModel";
import { ambulanceUpdateSchema } from "../../validationSchemas/ambulanceSchema";

export const addAmbulance = async (ambulanceId: string) => {
    try {

        const existingAmbualnce = await ambulanceModel.findOne({ ambulanceId });
        if (existingAmbualnce) {
            return { success: false, message: `La ambulancia con ID ${ambulanceId} ya existe.` };
        }
        
        await ambulanceModel.create({ ambulanceId });

        return { success: true, message: "Ambulancia agregada correctamente." };
    } catch (error) {
        console.error(`Error al agregar la ambulancia: ${error}`);
        return { success: false, message: "Error al agregar la ambulancia." };
    }
}

export const deleteAmbulance = async (ambulanceId: string) => {
    try {
        const existingAmbulance = await ambulanceModel.findOne({ ambulanceId });
        if (!existingAmbulance) {
            return { success: false, message: `La ambulancia con ID ${ambulanceId} no existe.` };
        }

        await ambulanceModel.deleteOne({ ambulanceId });

        return { success: true, message: "Ambulancia eliminada correctamente." };
    } catch (error) {
        console.error(`Error al eliminar la ambulancia: ${error}`);
        return { success: false, message: "Error al eliminar la ambulancia." };
    }
}

export const editAmbulance = async (ambulanceId: string, updateData: IAmbulance) => {
    try {

        const{ error } = ambulanceUpdateSchema.validate(updateData);

        if (error) {
            return { success: false, message: `Error de validación: ${error.details[0].message}` };
        }

        const existingAmbulance = await ambulanceModel.findOne({ ambulanceId });
        if (!existingAmbulance) {
            return { success: false, message: `La ambulancia con ID ${ambulanceId} no existe.` };
        }

        await ambulanceModel.updateOne({ ambulanceId }, { $set: updateData });

        return { success: true, message: "Ambulancia actualizada correctamente." };
    } catch (error) {
        console.error(`Error al actualizar la ambulancia: ${error}`);
        return { success: false, message: "Error al actualizar la ambulancia." };
    }
}

export const getAmbulance = async (ambulanceId: string) => {
    try {
        const ambulance = await ambulanceModel.findOne({ ambulanceId }, { ambulanceId: 1, status: 1, _id: 0 });
        if (!ambulance) {
            return { success: false, message: `La ambulancia con ID ${ambulanceId} no existe.` };
        }

        return { success: true, message: "Ambulancia obtenida correctamente.", ambulance };
    } catch (error) {       
        console.error(`Error al obtener la ambulancia: ${error}`);
        return { success: false, message: "Error al obtener la ambulancia." };
    }
}
