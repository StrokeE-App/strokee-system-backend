import { NextFunction, Request, Response } from "express";
import { getAllPatientsFromCollection, addPatientIntoPatientCollection, addEmergencyToCollection, getAllEmergencyContactFromCollection } from "../../services/patients/patientService";

export const registerPatient = async (req: Request, res: Response, next: NextFunction) => {
    const {
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        age,
        birthDate,
        weight,
        height,
        emergencyContact,
        medications,
        conditions,
    } = req.body;

    try {
        const result = await addPatientIntoPatientCollection(
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
            age,
            birthDate,
            weight,
            height,
            emergencyContact,
            medications,
            conditions
        );

        if (result.success) {
            res.status(201).json({
                message: result.message,
                patientId: result.patientId,
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
        const { patientId } = req.body

        const result = await addEmergencyToCollection(patientId)

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
    }catch (error) {
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
            if(!result.data) {
                res.status(404).json({ message: result.message });
                return
            }
            res.status(200).json({
                message: result.message,
                data: result.data
            })
            return
        }else{
            res.status(400).json({
                message: result.message,
            });
        }


    }catch (error) {
        next(error);
    }
}
