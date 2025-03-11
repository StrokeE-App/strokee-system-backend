import { NextFunction, Request, Response } from "express";
import {
    validateEmergencyContactData,
    addEmergencyContactIntoCollection,
    getEmergencyContactFromCollection,
    updateEmergencyContactFromCollection,
    deleteEmergencyContactFromCollection,
    sendEmailToRegisterEmergencyContact,
    registerEmergencyContactToActivateEmergencyIntoCollection,
    getEmergencyContactUserFromCollection,
    verifyEmergencyContact
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

export const sendActivationEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, patientId, emergencyContactId } = req.body;
        const result = await sendEmailToRegisterEmergencyContact(patientId, emergencyContactId, email);
        if (result.success) {
            res.status(200).json({ message: result.message });
        } else {
            res.status(400).json({ message: result.message });
        }
    } catch (error) {
        next(error);
    }
}

export const registerEmergencyContactToStartEmergency = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { firstName, lastName, email, password, phoneNumber, verification_code } = req.body;
        const body = { firstName, lastName, email, phoneNumber, verification_code, password };

        const result = await registerEmergencyContactToActivateEmergencyIntoCollection(body);

        if (result.success) {
            res.status(200).json({ message: result.message });
        } else {
            res.status(400).json({ message: result.message });
        }
    } catch (error) {
        next(error);
    }
}

export const getEmergencyContactUser = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    try {
        const result = await getEmergencyContactUserFromCollection(userId);
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

export const addNewPatientForEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, code } = req.body;
        const result = await verifyEmergencyContact(userId, code);
        if (result.success) {
            res.status(200).json({
                message: result.message
            })
        } else {
            res.status(400).json({
                message: result.message
            })
        }
    } catch (error) {
        next(error);
    }
}