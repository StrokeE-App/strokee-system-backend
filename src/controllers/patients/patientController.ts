import { Request, Response } from "express";
import { getAllPatientsFromCollection, addPatientIntoPatientCollection } from "../../services/patients/patientService";

export const registerPatient = async (req: Request, res: Response) => {
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
        await addPatientIntoPatientCollection(
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
        res.status(201).json({ message: "Paciente registrado con éxito." });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({
                message: "Error al registrar paciente.",
                error: error.message || "Error desconocido.",
            });
        } else {
            res.status(500).json({
                message: "Error al registrar paciente.",
                error: "Error desconocido.",
            });
        }
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
