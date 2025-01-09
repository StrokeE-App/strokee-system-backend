import { NextFunction, Request, Response } from "express";
import { getAllPatientsFromCollection, addPatientIntoPatientCollection } from "../../services/patients/patientService";

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
                error: error.message || "Error desconocido.",
            });
        } else {
            res.status(500).json({
                message: "Error no fue posible obtener todos los pacientes",
                error: "Error desconocido.",
            });
        }
    }
}
