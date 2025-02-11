import { NextFunction, Request, Response } from "express";
import {
    validateEmergencyContactData,
    addEmergencyContactIntoCollection,
    getEmergencyContactFromCollection,
    updateEmergencyContactFromCollection,
    deleteEmergencyContactFromCollection
} from "../../services/patients/emergencyContactsService";

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

export const getEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
    const { patientId, contactId } = req.params;
    try {
        const result = await getEmergencyContactFromCollection(patientId, contactId);
        if (result) {
            res.status(200).json({
                message: 'Contacto de emergencia obtenido exitosamente.',
                data: result,
            });
        } else {
            res.status(400).json({
                message: 'No se pudo obtener el contacto de emergencia.',
            });
        }
    } catch (error) {
        next(error);
    }
}

export const updateEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
    const { contactId, patientId } = req.params;
    const { contact } = req.body;
    try {
        const result = await updateEmergencyContactFromCollection(patientId, contactId, contact);
        if (result.success) {
            res.status(200).json({
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

export const deleteEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
    const { patientId, contactId } = req.params;
    try {
        const result = await deleteEmergencyContactFromCollection(patientId, contactId);
        if (result.success) {
            res.status(200).json({
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
