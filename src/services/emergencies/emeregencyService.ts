import emergencyModel from "../../models/emergencyModel";

export const getEmergencyFromCollection = async (emergencyId: string) => {
    try {
        if (!emergencyId) {
            return { success: false, message: "El id de la emergencia no es válido" };
        }

        const emergency = await emergencyModel.aggregate([
            {
                $match: {
                    emergencyId: emergencyId,
                }
            },
            {
                $lookup: {
                    from: "patients",
                    localField: "patientId",
                    foreignField: "patientId",
                    as: "patient"
                }
            },
            {
                $unwind: "$patient"
            },
            {
                $project: {
                    "_id": 0,
                    "emergencyId": 1,
                    "activatedBy": 1,
                    "status": 1,
                    "startDate": 1,
                    "pickupDate": 1,
                    "deliveredDate": 1,
                    "attendedDate": 1,
                    "patient.firstName": 1,
                    "patient.lastName": 1,
                    "patient.age": 1,
                    "patient.height": 1,
                    "patient.weight": 1,
                    "patient.phoneNumber": 1
                }
            }
        ]);

        if (!emergency || emergency.length === 0) {
            return { success: true, message: "No se encontró la emergencia" };
        }

        return { success: true, data: emergency[0], message: "Emergencia encontrada" };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al consultar emergencia: ${errorMessage}`);
        return { success: false, message: `Error al consultar la emergencia: ${errorMessage}` };
    }
};

export const getAllEmergencyFromCollection = async () => {
    try {

        const emergency = await emergencyModel.find({}, { _id: 0 });

        if (!emergency || emergency.length === 0) {
            return { success: true, message: "No se encontró ninguna emergencia" };
        }

        return { success: true, data: emergency, message: "Emergencias encontrada" };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error";
        console.error(`Error al consultar las emergencias: ${errorMessage}`);
        return { success: false, message: `Error al consultar las emergencias: ${errorMessage}` };
    }
};