import { NextFunction, Request, Response } from "express";
import { addEmergencyContactsIntoCollection, validateEmergencyContactData } from "../../services/patients/emergencyContactsService";

const validateEmergencyContactDataController = (contacts: any[]): string | null => {

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
        return "Faltan contactos válidos o el formato es incorrecto.";
    }
    return null;
};

export const registerEmergencyContacts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { contacts } = req.body;

    const token = req.cookies.session_token;

    if (!token) {
        res.status(401).json({ message: 'No autorizado: cookie no encontrada' });
        return;
    }

    const validationError = validateEmergencyContactDataController(contacts);
    if (validationError) {
        res.status(400).json({
            message: validationError,
        });
        return;
    }

    try {
        const result = await addEmergencyContactsIntoCollection(token, contacts);

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
