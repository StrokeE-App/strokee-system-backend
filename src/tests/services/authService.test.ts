import { loginUserService } from "../../services/auth/authService";
import { firebaseAdmin } from "../../config/firebase-config";
import  rolesModel  from "../../models/usersModels/rolesModel"; // Import rolesModel to mock it

jest.mock("../../config/firebase-config", () => ({
    firebaseAdmin: {
        verifyIdToken: jest.fn(),
    },
}));

jest.mock("../../models/usersModels/rolesModel", () => ({
    findOne: jest.fn()
}));

describe("Auth Functions", () => {
    describe("loginUserService", () => {
        it("should return userId if token is valid and user has permission", async () => {
            const token = "valid-token";
            const appIdentifier = "paramedics";
            const mockedUserId = "user-id-12345";

            (firebaseAdmin.verifyIdToken as jest.Mock).mockResolvedValueOnce({
                user_id: mockedUserId,
            });

            (rolesModel.findOne as jest.Mock).mockResolvedValueOnce({
                allowedApps: ["paramedics", "patients"],
            });

            const result = await loginUserService(token, appIdentifier);

            expect(firebaseAdmin.verifyIdToken).toHaveBeenCalledWith(token);
            expect(rolesModel.findOne).toHaveBeenCalledWith({ userId: mockedUserId, isDeleted: false });
            expect(result).toEqual({ userId: mockedUserId });
        });

        it("should return null if token is invalid", async () => {
            const token = "invalid-token";
            const appIdentifier = "paramedics";

            (firebaseAdmin.verifyIdToken as jest.Mock).mockRejectedValueOnce(new Error("auth/invalid-id-token"));

            const result = await loginUserService(token, appIdentifier);

            expect(firebaseAdmin.verifyIdToken).toHaveBeenCalledWith(token);
            expect(result).toBeNull();
        });

        it("should return an error message if appIdentifier is invalid", async () => {
            const token = "valid-token";
            const appIdentifier = "unknown-app";
            const mockedUserId = "user-id-12345";

            (firebaseAdmin.verifyIdToken as jest.Mock).mockResolvedValueOnce({
                user_id: mockedUserId,
            });

            const result = await loginUserService(token, appIdentifier);

            expect(firebaseAdmin.verifyIdToken).toHaveBeenCalledWith(token);
            expect(result).toEqual({
                success: false,
                message: "Identificador de aplicación no válido.",
            });
        });

        it("should return an error message if user does not have a role assigned", async () => {
            const token = "valid-token";
            const appIdentifier = "paramedics";
            const mockedUserId = "user-id-12345";

            (firebaseAdmin.verifyIdToken as jest.Mock).mockResolvedValueOnce({
                user_id: mockedUserId,
            });

            (rolesModel.findOne as jest.Mock).mockResolvedValueOnce(null);

            const result = await loginUserService(token, appIdentifier);

            expect(firebaseAdmin.verifyIdToken).toHaveBeenCalledWith(token);
            expect(result).toEqual({
                success: false,
                message: "El usuario no tiene un rol asignado o no tiene aplicaciones permitidas.",
            });
        });

        it("should return an error message if user does not have access to the app", async () => {
            const token = "valid-token";
            const appIdentifier = "clinics";
            const mockedUserId = "user-id-12345";

            (firebaseAdmin.verifyIdToken as jest.Mock).mockResolvedValueOnce({
                user_id: mockedUserId,
            });

            (rolesModel.findOne as jest.Mock).mockResolvedValueOnce({
                allowedApps: ["paramedics", "patients"],
            });

            const result = await loginUserService(token, appIdentifier);

            expect(firebaseAdmin.verifyIdToken).toHaveBeenCalledWith(token);
            expect(result).toEqual({
                success: false,
                message: "El usuario no tiene permiso para acceder a esta aplicación.",
            });
        });

        it("should return null if an unexpected error occurs", async () => {
            const token = "valid-token";
            const appIdentifier = "paramedics";

            (firebaseAdmin.verifyIdToken as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"));

            const result = await loginUserService(token, appIdentifier);

            expect(firebaseAdmin.verifyIdToken).toHaveBeenCalledWith(token);
            expect(result).toBeNull();
        });
    });
});
