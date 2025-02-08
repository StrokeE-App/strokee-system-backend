import { NextFunction, Request, Response } from "express";
import { validateEmergencyContactData, addEmergencyContactIntoCollection } from "../../services/patients/emergencyContactsService";

const validateEmergencyContactDataController = (contacts: any[]): string | null => {

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
        return "Faltan contactos válidos o el formato es incorrecto.";
    }
    return null;
};

export const validateListofEmergencyContacts = (req: Request, res: Response, next: NextFunction) => {
    const { contacts } = req.body;

    if (!contacts || !Array.isArray(contacts)) {
        res.status(400).json({
            message: "Faltan contactos válidos o el formato es incorrecto.",
        });
    }

    try {
        const result = validateEmergencyContactData(contacts);

        if (result.success) {
            res.status(201).json({
                message: result.message,
            });
        } else {
            res.status(400).json({
                message: result.message,
                duplicateEmails: result.duplicateEmails ? result.duplicateEmails : [],
                duplicatePhones: result.duplicatePhones ? result.duplicatePhones : [],
            });
        }
    } catch (error) {
        next(error);
    }
}

export const addEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
    const { patientId, contact } = req.body;

    try {
        const result = await addEmergencyContactIntoCollection(patientId, contact);
        if (result.success) {
            res.status(201).json({
                message: result.message,
            });
        } else {
            res.status(400).json({
                message: result.message,
            });
        }
    } catch (error) {
        next(error);
    }
}
