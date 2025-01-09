import { NextFunction, Request, Response } from "express";
import { addEmergencyContactsIntoCollection } from "../../services/patients/emergencyContactsService";

const validateEmergencyContactData = (patientId: string, contacts: any[]): string | null => {
    if (!patientId) {
        return "Falta el patientId.";
    }
    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
        return "Faltan contactos válidos o el formato es incorrecto.";
    }
    return null;
};

export const registerEmergencyContacts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { patientId, contacts } = req.body;

    const validationError = validateEmergencyContactData(patientId, contacts);
    if (validationError) {
        res.status(400).json({
            message: validationError,
        });
        return;
    }

    try {
        const result = await addEmergencyContactsIntoCollection(patientId, contacts);

        if (result.success) {
            res.status(201).json({
                message: result.message,
            });
        } else {
            res.status(400).json({
                message: result.message,
                duplicateEmails: result.duplicateEmails,
                duplicatePhones: result.duplicatePhones,
            });
        }
    } catch (error) {
        next(error);
    }
};
