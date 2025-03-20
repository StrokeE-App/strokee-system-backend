import { NextFunction, Request, Response } from "express";
import {
    getAllPatientsFromCollection,
    addPatientIntoPatientCollection,
    addEmergencyToCollection,
    getAllEmergencyContactFromCollection,
    updatePatientFromCollection,
    getPatientFromCollection,
    deletePatientFromCollection
} from "../../services/patients/patientService";
import jwt from "jsonwebtoken";
import path from "path";
import dotenv from "dotenv";
dotenv.config();


export const registerPatient = async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;

    try {
        const result = await addPatientIntoPatientCollection(data);

        if (result.success) {
            res.status(201).json({
                message: result.message,
                patientId: result.patientId,
            });
        } else {
            res.status(400).json({
                message: result.message
            });
        }
    } catch (error) {
        next(error);
    }
};

export const getAllPatients = async (req: Request, res: Response) => {
    try {

        const listOfPatients = await getAllPatientsFromCollection()
        res.status(200).json({ data: listOfPatients });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({
                message: "No fue posible obtener todos los pacientes",
                error: error.message || "Error.",
            });
        } else {
            res.status(500).json({
                message: "Error no fue posible obtener todos los pacientes",
                error: "Error.",
            });
        }
    }
}

export const creatEmergency = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { patientId, role, phoneNumber } = req.body

        const result = await addEmergencyToCollection(patientId, role, phoneNumber)

        if (result.success) {
            res.status(201).json({
                message: result.message,
                emergencyId: result.emergencyId,
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

export const getPatientEmergencyContacts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { patientId } = req.params

        if (!patientId) {
            res.status(400).json({
                message: "Por favor, ingresar un patientId",
            });
        }

        const result = await getAllEmergencyContactFromCollection(patientId)

        console.log(result)

        if (result.success) {
            if (!result.data) {
                res.status(404).json({ message: result.message });
                return
            }
            res.status(200).json({
                message: result.message,
                data: result.data
            })
            return
        } else {
            res.status(400).json({
                message: result.message,
            });
        }


    } catch (error) {
        next(error);
    }
}

export const updatePatient = async (req: Request, res: Response, next: NextFunction) => {
    const { patientId } = req.params;
    const patientData = req.body;
    try {
        const result = await updatePatientFromCollection(patientId, patientData);
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

export const getPatient = async (req: Request, res: Response, next: NextFunction) => {
    const { patientId } = req.params;
    try {
        const result = await getPatientFromCollection(patientId);
        if (result.success) {
            res.status(200).json({
                message: result.message,
                data: result.data,
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

export const deletePatient = async (req: Request, res: Response, next: NextFunction) => {
    const { patientId } = req.params;
    try {
        const result = await deletePatientFromCollection(patientId);
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

export const registerEmergencyContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    
    try {
        res.sendFile(path.join(__dirname, "../../../public/registerEmergencyContact.html"));
    } catch (error) {
        console.error("Token inválido:", error);
        res.status(401).send("Url inválida o expirada.");
    }
};