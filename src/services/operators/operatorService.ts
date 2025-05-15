import operatorModel from "../../models/usersModels/operatorModel";
import { getMessaging } from 'firebase-admin/messaging';
import rolesModel from "../../models/usersModels/rolesModel";
import { publishToExchange } from "../publisherService";
import emergencyModel from "../../models/emergencyModel";
import { firebaseAdmin, firebaseMessaging } from "../../config/firebase-config";
import { notifyParamedicAboutEmergency } from "../paramedics/paramedicService";
import { UpdateOperator } from "./operator.dto";
import { operatorSchema, operatorRegisterSchema } from "../../validationSchemas/operatorSchema";

export const validateOperatorFields = (
    firstName: string,
    lastName: string,
    email: string,
    password: string
): string | null => {
    if (!firstName) return "firstName";
    if (!lastName) return "lastName";
    if (!email) return "email";
    if (!password) return "password";
    return null;
};

export const addOperatorIntoCollection = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
): Promise<{ success: boolean, message: string, operatorId?: string }> => {
    try {

        const { error } = operatorRegisterSchema.validate({ firstName, lastName, email, password });

        if (error) {
            return {
                success: false,
                message: error.message,
            };
        }

        const existinOperator = await operatorModel.findOne({ email });
        if (existinOperator) {
            return {
                success: false,
                message: `El email ${email} ya está registrado.`,
            };
        }

        const operatorRecord = await firebaseAdmin.createUser({ email, password });
        if (!operatorRecord.uid) {
            throw new Error('No se pudo crear el usuario en Firebase.');
        }

        const newOperator = {
            operatorId: operatorRecord.uid,
            firstName,
            lastName,
            email,
        };

        const result = await operatorModel.updateOne(
            { operatorId: operatorRecord.uid },
            newOperator,
            { upsert: true }
        );

        const newRole = {
            userId: operatorRecord.uid,
            role: "operator",
            allowedApps: ["operators"],
        }

        const addRole = await rolesModel.updateOne(
            { userId: operatorRecord.uid },
            newRole,
            { upsert: true }
        );

        if (result.upsertedCount > 0 && addRole.upsertedCount > 0) {
            return { success: true, message: 'Operador agregado exitosamente.', operatorId: operatorRecord.uid };
        } else {
            return { success: false, message: 'No se realizaron cambios en la base de datos.' };
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al agregar al Operador: ${errorMessage}`);
        return { success: false, message: `Error al agregar al Operador: ${errorMessage}` };
    }
};

export const updateEmergencyPickUpFromCollectionOperator = async (
    emergencyId: string, ambulanceId: string
) => {
    try {
        if (!emergencyId) {
            return { success: false, message: "El ID de emergencia es obligatorio." };
        }

        if (!ambulanceId) {
            return { success: false, message: "El ID de la ambulancia es obligatoria." };
        }

        const existingAssignment = await emergencyModel.findOne({
            ambulanceId: ambulanceId,
            status: { $in: ["TO_AMBULANCE", "CONFIRMED"] }
        });

        if (existingAssignment) {
            return { success: false, message: `La ambulancia con ID ${ambulanceId} ya está asignada a otra emergencia.` };
        }

        const updateResult = await emergencyModel.updateOne(
            { emergencyId },
            { $set: { status: "TO_AMBULANCE", ambulanceId: ambulanceId } },
            { upsert: false }
        );

        if (updateResult.matchedCount === 0) {
            return { success: false, message: "No se encontró una emergencia con ese ID." };
        }

        if (updateResult.modifiedCount === 0) {
            return { success: false, message: "No se realizaron cambios en la emergencia." };
        }

        const message = {
            emergencyId,
            status: "TO_AMBULANCE",
            ambulanceId
        };

        await notifyParamedicAboutEmergency(
            emergencyId,
            ambulanceId
        );

        await publishToExchange("operator_exchange", "emergency_started_queue", message);
        await publishToExchange("patient_exchange", "patient_report_queue", message);

        return { success: true, message: "Emergencia confirmada y mensaje enviado." };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al actualizar la emergencia [ID: ${emergencyId}]: ${errorMessage}`);
        return { success: false, message: `Error al actualizar la emergencia: ${errorMessage}` };
    }
};

export const cancelEmergencyCollectionOperator = async (emergencyId: string) => {
    try {
        if (!emergencyId) {
            return { success: false, message: "El ID de emergencia es obligatorio." };
        }

        const updateResult = await emergencyModel.updateOne(
            { emergencyId },
            { $set: { status: "CANCELLED" } },
            { upsert: false }
        );

        if (updateResult.matchedCount === 0) {
            return { success: false, message: "No se encontró una emergencia con ese ID." };
        }

        if (updateResult.modifiedCount === 0) {
            return { success: false, message: "No se realizaron cambios en la emergencia." };
        }

        const message = {
            emergencyId,
            status: "CANCELLED_BY_OPERATOR"
        };

        await publishToExchange("patient_exchange", "patient_report_queue", message);

        return { success: true, message: "Emergencia stroke descartada." };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al descartar la emergencia de stroke [ID: ${emergencyId}]: ${errorMessage}`);
        return { success: false, message: `Error al descartar la emergencia: ${errorMessage}` };
    }
};

export const updateOperatorFromCollection = async (operatorId: string, operatorData: UpdateOperator) => {
    try {
        if (!operatorId) {
            return { success: false, message: "El ID del operador es obligatorio." };
        }

        const { error } = operatorSchema.validate(operatorData);

        if (error) {
            return { success: false, message: `Error de validación: ${error.details[0].message}` };
        }

        const updateResult = await operatorModel.updateOne(
            { operatorId },
            { $set: operatorData },
            { upsert: false }
        );

        if (updateResult.matchedCount === 0) {
            return { success: false, message: "No se encontró un operador con ese ID." };
        }

        if (updateResult.modifiedCount === 0) {
            return { success: false, message: "No se realizaron cambios en el operador." };
        }

        return { success: true, message: "Operador actualizado exitosamente." };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al actualizar el operador: ${errorMessage}`);
        return { success: false, message: `Error al actualizar el operador: ${errorMessage}` };
    }
};

export const getOperatorFromCollection = async (operatorId: string) => {
    try {
        if (!operatorId) {
            return { success: false, message: "El ID del operador es obligatorio." };
        }

        const operator = await operatorModel.findOne({ operatorId }, { _id: 0, firstName: 1, lastName: 1, email: 1 });

        if (!operator) {
            return { success: false, message: "No se encontró un operador con ese ID." };
        }

        return { success: true, message: "Operador obtenido exitosamente.", operator };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al obtener el operador: ${errorMessage}`);
        return { success: false, message: `Error al obtener el operador: ${errorMessage}` };
    }
};

export const deleteOperatorFromCollection = async (operatorId: string) => {
    try {
        if (!operatorId) {
            return { success: false, message: "El ID del operador es obligatorio." };
        }

        const exsistingOperator = await operatorModel.findOne({ operatorId });

        if (!exsistingOperator) {
            return { success: false, message: "No se encontró un operador con ese ID." };
        }

        await firebaseAdmin.deleteUser(operatorId);

        await operatorModel.deleteOne({ operatorId });
        await rolesModel.deleteOne({ userId: operatorId });

        return { success: true, message: "Operador eliminado exitosamente." };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al eliminar el operador: ${errorMessage}`);
        return { success: false, message: `Error al eliminar el operador: ${errorMessage}` };
    }
}

export const notifyOperatorsAboutEmergency = async (
    emergencyId: string,
    patientId: string,
    patientName: string
  ): Promise<{ success: boolean, message: string }> => {
    try {
      // 1. Obtener todos los operadores activos con tokens FCM registrados
      const activeOperators = await operatorModel.find({
        'notificationPreferences.emergencies': true,
        'fcmTokens.0': { $exists: true } // Operadores con al menos un token
      }).select('fcmTokens');
  
      if (activeOperators.length === 0) {
        return { success: false, message: "No hay operadores disponibles para notificar." };
      }
  
      // 2. Preparar el mensaje de notificación
      const notificationPayload = {
        notification: {
          title: '🚨 Nueva Emergencia',
          body: `Paciente ${patientName} (ID: ${patientId}) ha activado una emergencia`
        },
        data: {
          type: 'NEW_EMERGENCY',
          emergencyId,
          patientId,
          patientName,
          timestamp: new Date().toISOString()
        }
      };
  
      // 3. Recoger todos los tokens FCM de los operadores
      const tokens = activeOperators.flatMap(operator => 
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
        await operatorModel.updateMany({}, { $pull: { fcmTokens: { token: { $in: failedTokens } } } })
      }
  
      return { 
        success: true, 
        message: `Notificaciones enviadas a ${tokens.length - failedTokens.length} operadores. ${failedTokens.length} fallidos.` 
      };
  
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error(`Error al notificar operadores: ${errorMessage}`);
      return { success: false, message: `Error al notificar operadores: ${errorMessage}` };
    }
  };
