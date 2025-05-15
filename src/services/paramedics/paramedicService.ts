import paramedicModel from "../../models/usersModels/paramedicModel";
import emergencyModel from "../../models/emergencyModel";
import rolesModel from "../../models/usersModels/rolesModel";
import clinicModel from "../../models/usersModels/clinicModel";
import Patient from "../../models/usersModels/patientModel";
import { publishToExchange } from "../publisherService";
import { firebaseAdmin, firebaseMessaging } from "../../config/firebase-config";
import { notifyHealthCenterAboutEmergency } from "../healthCenterStaff/healthCenterService";
import { ParamedicUpdate } from "./paramedic.dto";
import { paramedicSchema, paramedicRegisterSchema } from "../../validationSchemas/paramedicSchemas";
import { sendNotification } from "../mail";
import { getAllEmergencyContactFromCollection } from "../patients/patientService";

export const addParamedicIntoCollection = async (
    ambulanceId: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
): Promise<{ success: boolean, message: string, ambulanceId?: string }> => {
    try {
        
        const { error } = paramedicRegisterSchema.validate({ ambulanceId, firstName, lastName, email, password });

        if (error) {
            return {
                success: false,
                message: error.message,
            };
        }

        const existinParamedic = await paramedicModel.findOne({ email });
        if (existinParamedic) {
            return {
                success: false,
                message: `El email ${email} ya está registrado.`,
            };
        }

        const paramedicRecord = await firebaseAdmin.createUser({ email, password });
        if (!paramedicRecord.uid) {
            throw new Error('No se pudo crear el usuario en Firebase.');
        }

        const newParamedic = {
            paramedicId: paramedicRecord.uid,
            ambulanceId,
            firstName,
            lastName,
            email,
        };

        const result = await paramedicModel.updateOne(
            { ambulanceId: paramedicRecord.uid },
            newParamedic,
            { upsert: true }
        );

        const newRole = {
            userId: paramedicRecord.uid,
            role: "paramedic",
            allowedApps: ["paramedics"]
        }

        const addRole = await rolesModel.updateOne(
            { userId: paramedicRecord.uid },
            newRole,
            { upsert: true }
        );

        if (result.upsertedCount > 0 && addRole.upsertedCount > 0) {
            return { success: true, message: 'Paramedico agregado exitosamente.', ambulanceId: paramedicRecord.uid };
        } else {
            return { success: false, message: 'No se realizaron cambios en la base de datos.' };
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al agregar al paramedico: ${errorMessage}`);
        return { success: false, message: `Error al agregar al paramedico: ${errorMessage}` };
    }
};

export const updateEmergencyPickUpFromCollection = async (
    emergencyId: string,
    pickupDate: string,
    healthcenterId: string
) => {
    try {
        if (!emergencyId) {
            return { success: false, message: "El ID de emergencia es obligatorio." };
        }
        if (!pickupDate) {
            return { success: false, message: "La fecha de recogida es obligatoria." };
        }

        if (!healthcenterId) {
            return { success: false, message: "El ID del centro de salud es obligatorio." };
        }

        const existingClinic = await clinicModel.findOne({ healthcenterId });
        
        if (!existingClinic) {
            return { success: false, message: "El centro de salud no existe." };
        }

        const parsedPickUpDate = new Date(pickupDate);
        if (isNaN(parsedPickUpDate.getTime())) {
            return { success: false, message: "La fecha de recogida no es válida." };
        }

        const updatedEmergency = await emergencyModel.findOneAndUpdate(
            { emergencyId },
            { $set: { pickupDate: parsedPickUpDate.toISOString(), status: "CONFIRMED", healthcenterId } },
            { new: true }
        );

        if (!updatedEmergency) {
            return { success: false, message: "No se encontró una emergencia con ese ID." };
        }

        const message = {
            ambulanceId: updatedEmergency.ambulanceId,
            emergencyId,
            pickupDate: parsedPickUpDate.toISOString(),
            status: "CONFIRMED",
        };

        await notifyHealthCenterAboutEmergency(
            emergencyId,
            "Tienes una emergencia en camino",
        );

        if(existingClinic.healthcenterName === "imbanaco"){
            await publishToExchange("paramedic_exchange", "paramedic_update_queue", message);
        }

        const patient = await Patient.findOne({ patientId: updatedEmergency.patientId });
        if (!patient) {
            return { success: false, message: "No se encontró un paramedic con ese ID." };
        }

        const listEmergencyContacts = await getAllEmergencyContactFromCollection(patient.patientId);

        if (listEmergencyContacts.data && listEmergencyContacts.data.length > 0) {
            const uniqueEmails = new Set<string>();
        
            listEmergencyContacts.data.forEach((contact) => {
                if (contact.email && !uniqueEmails.has(contact.email)) {
                    uniqueEmails.add(contact.email);
                    sendNotification(contact.email, patient.firstName, patient.lastName);
                }
            });
        }
        

        return { success: true, message: "Emergencia confirmada y mensaje enviado." };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al actualizar la hora de recogida del paciente [ID: ${emergencyId}]: ${errorMessage}`);
        return { success: false, message: `Error al actualizar la hora de recogida: ${errorMessage}` };
    }
};

export async function getPatientDeliverdToHealthCenter(emergencyId: string, deliveredDate: Date) {
    try {
        if (!emergencyId) {
            return { success: false, code: 400, message: "El ID de la emergencia es obligatorio." };
        }

        const parsedDeliveredDate = new Date(deliveredDate);
        if (isNaN(parsedDeliveredDate.getTime())) {
            return { success: false, code: 400, message: "La fecha de entrega no es válida." };
        }

        const emergencyDelivered = await emergencyModel.findOneAndUpdate(
            { emergencyId },
            { $set: { status: "DELIVERED", deliveredDate: parsedDeliveredDate } },
            { returnDocument: "after" }
        );

        if (!emergencyDelivered) {
            return { success: false, code: 404, message: "No se encontró una emergencia con ese ID." };
        }

        const message = {
            ambulanceId: emergencyDelivered.ambulanceId,
            emergencyId,
            status: "DELIVERED",
        }

        await notifyHealthCenterAboutEmergency(
            emergencyId,
            "El paciente ha sido entregado",
        );

        await publishToExchange("paramedic_exchange", "paramedic_update_queue", message);

        return { success: true, code: 200, message: "Emergencia entregada correctamente." };
    } catch (error) {
        console.error(`Error al entregar la emergencia: ${error}`);
        return { success: false, code: 500, message: "Error interno del servidor." };
    }
}

export const cancelEmergencyCollection = async (emergencyId: string, pickupDate: string) => {
    try {
        if (!emergencyId) {
            return { success: false, message: "El ID de emergencia es obligatorio." };
        }
        if (!pickupDate) {
            return { success: false, message: "La fecha de recogida es obligatoria." };
        }

        const parsedPickUpDate = new Date(pickupDate);
        if (isNaN(parsedPickUpDate.getTime())) {
            return { success: false, message: "La fecha de recogida no es válida." };
        }

        const updateResult = await emergencyModel.findOneAndUpdate(
            { emergencyId },
            { $set: { pickupDate: parsedPickUpDate.toISOString(), status: "CANCELLED" } },
            { returnDocument: "after" }
        );

        if (!updateResult) {
            return { success: false, message: "No se encontró una emergencia con ese ID." };
        }

        const message = {
            ambulanceId: updateResult.ambulanceId,
            emergencyId,
            status: "CANCELLED_BY_PARAMEDIC",
        }

        await publishToExchange("paramedic_exchange", "paramedic_update_queue", message);

        return { success: true, message: "Emergencia stroke descartada." };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al descartar la emergencia de stroke [ID: ${emergencyId}]: ${errorMessage}`);
        return { success: false, message: `Error al descartar la emergencia: ${errorMessage}` };
    }
};

export const updateParamedicFromCollection = async (paramedicId: string, parameidcData: ParamedicUpdate) => {
    try {

        if (!paramedicId) {
            return { success: false, message: "El ID del paramedico es obligatorio." };
        }

        const { error } = paramedicSchema.validate(parameidcData);
        if (error) {
            return { success: false, message: `Error de validación: ${error.details[0].message}` };
        }

        const existingParamedic = await paramedicModel.findOne({ paramedicId: paramedicId });
        if (!existingParamedic) {
            return { success: false, message: "No se encontró un paramedico con ese ID." };
        }

        const { firstName, lastName, ambulanceId } = parameidcData;

        await paramedicModel.updateOne(
            { paramedicId: paramedicId },
            { $set: { firstName, lastName, ambulanceId } }
        );

        return { success: true, message: "paramedico actualizado correctamente" };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al actualizar el paramedico: ${errorMessage}`);
        return { success: false, message: `Error al actualizar el paramedico: ${errorMessage}` };
    }
};

export const getParamedicsFromCollection = async (paramedicId: string) => {
    try {
        if (!paramedicId) {
            return { success: false, message: "El ID del paramedico es obligatorio." };
        }

        const paramedics = await paramedicModel.findOne(
            { paramedicId: paramedicId },
            {
                _id: 0,
                ambulanceId: 1,
                firstName: 1,
                lastName: 1,
                email: 1,
                fcmTokens: 1
            }
        );

        if (!paramedics) {
            return { success: false, message: "No se encontró un paramedico con ese ID." };
        }

        return { success: true, message: "Paramedico encontrado exitosamente.", paramedics };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al encontrar el paramedico: ${errorMessage}`);
        return { success: false, message: `Error al encontrar el paramedico: ${errorMessage}` };
    }

}

export const deleteParamedicsFromCollection = async (paramedicId: string) => {
    try {
        if (!paramedicId) {
            return { success: false, message: "El ID del paramedico es obligatorio." };
        }

        const existingParamedic = await paramedicModel.findOne({ paramedicId: paramedicId });
        if (!existingParamedic) {
            return { success: false, message: "No se encontró un paramedico con ese ID." };
        }

        await firebaseAdmin.deleteUser(paramedicId);

        await paramedicModel.deleteOne({ paramedicId: paramedicId });
        await rolesModel.deleteOne({ userId: paramedicId });

        return { success: true, message: "Paramedico eliminado exitosamente." };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al eliminar el paramedico: ${errorMessage}`);
        return { success: false, message: `Error al eliminar el paramedico: ${errorMessage}` };
    }
}

export const notifyParamedicAboutEmergency = async (
    emergencyId: string,
    ambulanceId: string
  ): Promise<{ success: boolean, message: string }> => {
    try {
      // 1. Obtener todos los paramedicos activos con tokens FCM registrados
      const activeParamedic = await paramedicModel.find({
        'ambulanceId': ambulanceId,
        'notificationPreferences.emergencies': true,
        'fcmTokens.0': { $exists: true } // paramedicos con al menos un token
      }).select('fcmTokens');
  
      if (activeParamedic.length === 0) {
        return { success: false, message: "No hay paramedicos disponibles para notificar." };
      }
  
      // 2. Preparar el mensaje de notificación
      const notificationPayload = {
        notification: {
          title: '🚨 Nueva Emergencia',
          body: `Tienes una nueva emergencia`
        },
        data: {
          type: 'NEW_EMERGENCY',
          emergencyId,
          timestamp: new Date().toISOString()
        }
      };
  
      // 3. Recoger todos los tokens FCM de los paramedicos
      const tokens = activeParamedic.flatMap(operator => 
        operator.fcmTokens.map(token => token.token)
      );
  
      // 4. Enviar notificaciones en lotes (límite de FCM: 500 por lote)
      const batchSize = 500;
      const batches = Math.ceil(tokens.length / batchSize);
      const results = [];
  
      for (let i = 0; i < batches; i++) {
        const batchTokens = tokens.slice(i * batchSize, (i + 1) * batchSize);
        const response = await firebaseMessaging.sendEachForMulticast({
          ...notificationPayload,
          tokens: batchTokens
        });
        results.push(response);
      }
  
      // 5. Manejar tokens inválidos o fallidos
      const failedTokens: string[] = [];
      results.forEach(result => {
        result.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
      });
  
      if (failedTokens.length > 0) {
        console.warn(`Tokens fallidos: ${failedTokens.length}`);
        await paramedicModel.updateMany({}, { $pull: { fcmTokens: { token: { $in: failedTokens } } } })
      }
  
      return { 
        success: true, 
        message: `Notificaciones enviadas a ${tokens.length - failedTokens.length} paramedicos. ${failedTokens.length} fallidos.` 
      };
  
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error(`Error al notificar paramedicos: ${errorMessage}`);
      return { success: false, message: `Error al notificar paramedicos: ${errorMessage}` };
    }
  };