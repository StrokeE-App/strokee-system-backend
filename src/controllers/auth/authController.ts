import { loginUserService, logoutUserService } from "../../services/auth/authService";
import { Request, Response, NextFunction } from "express";
import { authenticateUser, updateEmail, updatePassword } from "../../services/auth/authService";


export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body;
    const appIdentifier = req.headers["x-app-identifier"];

    if (!token) {
        res.status(400).json({ message: 'Token no válido o vacío' });
        return;
    }

    if (!appIdentifier) {
        res.status(400).json({ message: 'Identificador de aplicación no válido o vacío' });
        return;
    }

    try {
        const sessionData = await loginUserService(token, appIdentifier.toString());

        if (!sessionData) {
            res.status(401).json({ message: "Token inválido" });
            return;
        }

        if (sessionData.success === false) {
            res.status(401).json({ message: sessionData.message });
            return;
        } else {
            res.status(200).json({
                message: "Login exitoso.",
                userId: sessionData.userId,
                role: sessionData.role
            });
        }
    } catch (error) {
        next(error);
    }
};

export const logoutUser = async (req: Request, res: Response) => {
   const { token } = req.body;

    if (!token) {
        res.status(400).json({ message: 'Token no válido o vacío' });
        return;
    }

    try {
        const result = await logoutUserService(token);

        if (result.success) {
            res.status(200).json({ message: result.message });
        } else {
            res.status(400).json({ message: result.message });
        }
        
    } catch (error) {
        res.status(500).json({ message: "Error al cerrar sesión." });
    }
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

        res.status(200).json({ message: "Login exitoso.", token: idToken, refreshToken });
    } catch (error) {
        next(error);
    }

};

export const updateEmailController = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { newEmail, userType } = req.body;

    try {
        const result = await updateEmail(userId, newEmail, userType);
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

export const updatePasswordController = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { newPassword } = req.body;

    try {
        const result = await updatePassword(userId, newPassword);
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