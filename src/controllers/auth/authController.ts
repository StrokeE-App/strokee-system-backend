import { createSessionCookie } from "../../services/auth/authService";
import { Request, Response, NextFunction } from "express";
import { authenticateUser } from "../../services/auth/authService";


export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body;

    if (!token) {
        res.status(400).json({ message: 'Token no valido o vacío' });
    }

    try {
        const sessionCookie  = await createSessionCookie(token);

        if (!sessionCookie ) {
            res.status(401).json({ message: "Token invalido" });
            return
        }

        res.cookie('session_token', sessionCookie , {
            httpOnly: true,  
            secure: process.env.NODE_ENV === 'production', 
        });

        res.status(200).json({ message: "Login exitoso."});
    } catch (error) {
        next(error);
    }

}

export const logoutUser = (req: Request, res: Response) => {
    res.clearCookie('session_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
    });

    res.status(200).json({ message: 'Desconectado correctamente' });
};

export const getToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'El email y la contraseña son requeridos' });
    }

    try {
        const tokens = await authenticateUser(email, password);

        if (!tokens) {
            res.status(401).json({ message: "Credenciales inválidas" });
            return
        }

        const { idToken, refreshToken } = tokens;

        res.status(200).json({ message: "Login exitoso.", token : idToken, refreshToken });
    } catch (error) {
        next(error);
    }

};
