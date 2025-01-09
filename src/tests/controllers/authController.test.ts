import { loginUser, logoutUser } from "../../controllers/auth/authController";
import { createSessionCookie } from "../../services/auth/authService";

jest.mock("../../services/auth/authService");

describe("Auth Controller", () => {
    let req: any;
    let res: any;
    let next: jest.Mock;

    beforeEach(() => {
        req = {
            body: {},
            cookies: {},
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            clearCookie: jest.fn(),
        };

        next = jest.fn();

        jest.clearAllMocks();
    });

    describe("loginUser", () => {
        it("debe devolver 400 si el token está vacío", async () => {
            req.body = { token: "" };

            await loginUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Token no valido o vacío" });
        });

        it("debe devolver 401 si createSessionCookie retorna null", async () => {
            req.body = { token: "invalid-token" };
            (createSessionCookie as jest.Mock).mockResolvedValueOnce(null);

            await loginUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "Token invalido" });
        });

        it("debe devolver 200 y setear la cookie si createSessionCookie es exitoso", async () => {
            req.body = { token: "valid-token" };
            const sessionCookie = "mocked-session-cookie";
            (createSessionCookie as jest.Mock).mockResolvedValueOnce(sessionCookie);

            await loginUser(req, res, next);

            expect(res.cookie).toHaveBeenCalledWith("session_token", sessionCookie, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Login exitoso." });
        });

        it("debe devolver 500 si ocurre un error en createSessionCookie", async () => {
            req.body = { token: "valid-token" };
            const errorMessage = "Unexpected error";
            (createSessionCookie as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

            await loginUser(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error(errorMessage));
        });

        it("debe manejar errores inesperados y devolver 500", async () => {
            req.body = { token: "valid-token" };
            const errorMessage = "Error desconocido";
            (createSessionCookie as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

            await loginUser(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error(errorMessage));
        });
    });

    describe("logoutUser", () => {
        it("debe limpiar la cookie y devolver 200", () => {
            logoutUser(req, res);

            expect(res.clearCookie).toHaveBeenCalledWith("session_token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Desconectado correctamente" });
        });
    });
});
