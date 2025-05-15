import healthCenterModel from "../../models/usersModels/healthCenterModel";
import emergencyModel from "../../models/emergencyModel";
import rolesModel from "../../models/usersModels/rolesModel";
import clinicModel from "../../models/usersModels/clinicModel";
import { firebaseAdmin, firebaseMessaging } from "../../config/firebase-config";
import { AddHealthCenterStaff } from "./healthCenter.dto";
import { healthCenterStaffSchema, updateHealthCenterStaffSchema } from "../../validationSchemas/healthCenterStaff";
import { sendPatientRegistrationEmail } from "../mail";
import { hashEmail } from "../utils";
import { publishToExchange } from "../publisherService";
import modelVerificationCode from "../../models/verificationCode";
import Patient from "../../models/usersModels/patientModel";

export async function addHealthCenterIntoCollection(healthCenterStaff: AddHealthCenterStaff) {
    try {
        console.log(healthCenterStaff);
        const { error } = healthCenterStaffSchema.validate(healthCenterStaff);

        if (error) {
            return { success: false, message: `Error de validación: ${error.details[0].message}` };
        }

        const existingClinic = await clinicModel.findOne({ healthcenterId: healthCenterStaff.healthcenterId });
        if (!existingClinic) {
            return { success: false, message: "El centro de salud no existe." };
        }
        const healthCenterStaffExists = await healthCenterModel.findOne({ email: healthCenterStaff.email });
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
            healthcenterId: healthCenterStaff.healthcenterId,
        });

        await newHealthCenter.save();
        await rolesModel.create({
            userId: newHealthCenter.medicId,
            role: "clinic",
            allowedApps: ["clinics"],
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

        const exisistingHealthCenterStaff = await healthCenterModel.findOne({ medicId: userId });

        if (!exisistingHealthCenterStaff) {
            return { success: false, message: "No se encontró el integrante del centro de salud o ya fue eliminado." };
        }

        await healthCenterModel.deleteOne({ medicId: userId });

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
            { medicId: userId },
            {
                $set: {
                    firstName: updateData.firstName,
                    lastName: updateData.lastName
                }
            },
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
        const healthCenterStaff = await healthCenterModel.findOne({ medicId: userId }, { _id: 0, medicId: 0, createdAt: 0, updatedAt: 0 });

        if (!healthCenterStaff) {
            return { success: false, message: "No se encontró el integrante del centro de salud." };
        }

        return { success: true, message: "Integrante de centro de salud obtenido correctamente.", healthCenterStaff };
    } catch (error) {
        console.error(`Error al buscar el integrante: ${error}`);
        return { success: false, message: "Error al buscar el integrante del centro de salud." };
    }
}

export async function getPatientAttendedByHealthCenter(emergencyId: string, attendedDate: Date) {
    try {
        if (!emergencyId) {
            return { success: false, code: 400, message: "El ID de la emergencia es obligatorio." };
        }

        const parsedAttendedDate = new Date(attendedDate);
        if (isNaN(parsedAttendedDate.getTime())) {
            return { success: false, code: 400, message: "La fecha de entrega no es válida." };
        }

        const emergencyDelivered = await emergencyModel.findOneAndUpdate(
            { emergencyId },
            { $set: { status: "ATTENDED", attendedDate: parsedAttendedDate } },
            { returnDocument: "after" }
        );

        if (!emergencyDelivered) {
            return { success: false, code: 404, message: "No se encontró una emergencia con ese ID." };
        }

        const message = {
            ambulanceId: emergencyDelivered.ambulanceId,
            emergencyId,
            status: "ATTENDED",
        }

        await publishToExchange("paramedic_exchange", "paramedic_update_queue", message);
        await publishToExchange("paramedic_exchange", "paramedic_update_queue", message)

        return { success: true, code: 200, message: "Emergencia entregada correctamente." };
    } catch (error) {
        console.error(`Error al entregar la emergencia: ${error}`);
        return { success: false, code: 500, message: "Error interno del servidor." };
    }
}

export const sendEmailToRegisterPatient = async (email: string, medicId: string) => {
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
        await modelVerificationCode.findOneAndUpdate(
            { email },
            {
                $set: {
                    email,
                    code,
                    type: "REGISTER_PATIENT",
                    data: {
                        medicId
                    }
                }
            },
            { upsert: true, new: true }
        )
        await sendPatientRegistrationEmail(email, code);

        return { success: true, message: "Se envió un correo de activación al contacto de emergencia" };
    } catch (error) {
        console.error("Error al agregar contacto de emergencia:", error);
        return { success: false, message: `Error: ${(error as any).message || "Error"}` };
    }
}

export const notifyHealthCenterAboutEmergency = async (
    emergencyId: string,
    message: string
  ): Promise<{ success: boolean, message: string }> => {
    try {
      // 1. Obtener todos los centro medico activos con tokens FCM registrados
      const activeHealthCenter = await healthCenterModel.find({
        'notificationPreferences.emergencies': true,
        'fcmTokens.0': { $exists: true } // centro medico con al menos un token
      }).select('fcmTokens');
  
      if (activeHealthCenter.length === 0) {
        return { success: false, message: "No hay centro medico disponibles para notificar." };
      }
  
      // 2. Preparar el mensaje de notificación
      const notificationPayload = {
        notification: {
          title: '🚨 Nueva Emergencia',
          body: message
        },
        data: {
          type: 'NEW_EMERGENCY',
          emergencyId,
          timestamp: new Date().toISOString()
        }
      };
  
      // 3. Recoger todos los tokens FCM de los centro medico
      const tokens = activeHealthCenter.flatMap(operator => 
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
        await healthCenterModel.updateMany({}, { $pull: { fcmTokens: { token: { $in: failedTokens } } } })
      }
  
      return { 
        success: true, 
        message: `Notificaciones enviadas a ${tokens.length - failedTokens.length} centro medico. ${failedTokens.length} fallidos.` 
      };
  
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error(`Error al notificar centro medico: ${errorMessage}`);
      return { success: false, message: `Error al notificar centro medico: ${errorMessage}` };
    }
  };


