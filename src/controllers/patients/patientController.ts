import { Request, Response } from "express";
import { getAllPatientsFromCollection, addPatientIntoPatientCollection, authenticatePatient, refreshUserToken, cookiesForPatient } from "../../services/patients/patientService";

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

export const getToken = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'El email y la contraseña son requeridos' });
    }

    try {
        const tokens = await authenticatePatient(email, password);

        if (!tokens) {
            res.status(401).json({ message: "Credenciales inválidas" });
            return
        }

        const { idToken, refreshToken } = tokens;

        res.status(200).json({ message: "Login exitoso.", token : idToken, refreshToken });
    } catch (error) {

        if (error instanceof Error) {
            res.status(500).json({
                message: "Error al logguear usuario.",
                error: error.message || "Error desconocido.",
            });
        } else {
            res.status(500).json({
                message: "Error al logguear usuario.",
                error: "Error desconocido.",
            });
        }
    }

};

export const loginPatient = async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
        res.status(400).json({ message: 'Token y el Refresh token son obligatorios' });
    }

    try {
        const sessionCookie  = await cookiesForPatient(token);

        if (!sessionCookie ) {
            res.status(401).json({ message: "Credenciales inválidas" });
            return
        }

        res.cookie('session_token', sessionCookie , {
            httpOnly: true,  
            secure: process.env.NODE_ENV === 'production', 
        });

        res.status(200).json({ message: "Login exitoso."});
    } catch (error) {

        if (error instanceof Error) {
            res.status(500).json({
                message: "Error al logguear usuario.",
                error: error.message || "Error desconocido.",
            });
        } else {
            res.status(500).json({
                message: "Error al logguear usuario.",
                error: "Error desconocido.",
            });
        }
    }

}

export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    try {
        const token = await refreshUserToken(refreshToken)
        res.status(200).send(token)
    } catch (error: unknown) {

        if (error instanceof Error) {
            res.status(500).json({
                message: "Error al refrescar el token.",
                error: error.message,
            });
        }

    }
}

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

export const logoutPatient = (req: Request, res: Response) => {
    res.clearCookie('session_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
    });

    res.status(200).json({ message: 'Desconectado correctamente' });
};