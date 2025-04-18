
import operatorModel from '../models/usersModels/operatorModel';
import paramedicModel from '../models/usersModels/paramedicModel';
import healthCenterModel from '../models/usersModels/healthCenterModel';
import { console } from 'inspector';

export const registerToken = async (rol: string, userId: string, token: string, device: string) => {
    try {

        const allowedDevices = ['web', 'android', 'ios'];
        if (!allowedDevices.includes(device)) {
            return { success: false, message: "Dispositivo no permitido." };
        }
        console.log(token);

        if (rol === 'operator') {
            const result = await operatorModel.findOneAndUpdate(
                {
                    operatorId: userId,
                    "fcmTokens.token": { $ne: token }
                },
                {
                    $addToSet: {
                        fcmTokens: {
                            token,
                            device: device as 'web' | 'android' | 'ios',
                            createdAt: new Date()
                        },
                    },
                    $set: {
                        notificationPreferences: {
                            emergencies: true
                        }
                    }
                },
                {
                    new: true,
                    upsert: false
                }
            );

            console.log(result);

            if (!result) {
                // Caso 1: El operador no existe
                // Caso 2: El token ya existía
                const existingOperator = await operatorModel.findOne({ operatorId: userId });

                if (!existingOperator) {
                    return { success: false, message: "No se encontró un operador con ese ID." };
                }

                return {
                    success: true,
                    message: "El token ya estaba registrado para este operador."
                };
            }

            return { success: true, message: "Token registrado exitosamente." };
        }


        if (rol === 'paramedic') {
            const result = await paramedicModel.findOneAndUpdate(
                {
                    paramedicId: userId,
                    "fcmTokens.token": { $ne: token }
                },
                {
                    $addToSet: {
                        fcmTokens: {
                            token,
                            device: device as 'web' | 'android' | 'ios',
                            createdAt: new Date()
                        },
                    },
                    $set: {
                        notificationPreferences: {
                            emergencies: true
                        }
                    }
                },
                {
                    new: true,
                    upsert: false
                }
            );

            if (!result) {
                // Caso 1: El operador no existe
                // Caso 2: El token ya existía
                const existingParamedic = await paramedicModel.findOne({ paramedicId: userId });

                if (!existingParamedic) {
                    return { success: false, message: "No se encontró un paramédico con ese ID." };
                }

                return {
                    success: true,
                    message: "El token ya estaba registrado para este paramédico."
                };
            }
        }

        if (rol === 'healthCenter') {
            const result = await healthCenterModel.findOneAndUpdate(
                {
                    medicId: userId,
                    "fcmTokens.token": { $ne: token }
                },
                {
                    $addToSet: {
                        fcmTokens: {
                            token,
                            device: device as 'web' | 'android' | 'ios',
                            createdAt: new Date()
                        },
                    },
                    $set: {
                        notificationPreferences: {
                            emergencies: true
                        }
                    }
                },
                {
                    new: true,
                    upsert: false
                }
            )

            if (!result) {
                // Caso 1: El operador no existe
                // Caso 2: El token ya existía
                const existingHealthCenter = await healthCenterModel.findOne({ medicId: userId });

                if (!existingHealthCenter) {
                    return { success: false, message: "No se encontró un medico con ese ID." };
                }

                return {
                    success: true,
                    message: "El token ya estaba registrado para este medico."
                };
            }

        }

        return { success: true, message: "Token registrado exitosamente." };


    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al registrar el token: ${errorMessage}`);
        return { success: false, message: `Error al registrar el token: ${errorMessage}` };
    }
};

export const unregisterToken = async (role: string, userId: string, token: string) => {
    try {
        if (role === 'operator') {
            const existingOperator = await operatorModel.findOne({ operatorId: userId });
            if (!existingOperator) {
                return { success: false, message: "No se encontró un operador con ese ID." };
            }
            console.log(existingOperator);
            await operatorModel.updateOne({ operatorId: userId }, { $pull: { fcmTokens: { token } } });
        }

        if (role === 'paramedic') {
            const existingParamedic = await paramedicModel.findOne({ paramedicId: userId });
            if (!existingParamedic) {
                return { success: false, message: "No se encontró un paramédico con ese ID." };
            }
            await paramedicModel.updateOne({ paramedicId: userId }, { $pull: { fcmTokens: { token } } });
        }

        if (role === 'healthCenter') {
            const existingHealthCenter = await healthCenterModel.findOne({ healthcenterId: userId });
            if (!existingHealthCenter) {
                return { success: false, message: "No se encontró un centro de salud con ese ID." };
            }
            await healthCenterModel.updateOne({ healthcenterId: userId }, { $pull: { fcmTokens: { token } } });
        }

        return { success: true, message: "Token eliminado exitosamente." };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al eliminar el token: ${errorMessage}`);
        return { success: false, message: `Error al eliminar el token: ${errorMessage}` };
    }
};