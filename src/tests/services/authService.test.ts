import { createSessionCookie } from "../../services/auth/authService";
import { firebaseAdmin } from "../../config/firebase-cofig";

jest.mock("../../config/firebase-cofig", () => ({
    firebaseAdmin: {
        verifyIdToken: jest.fn(),
        createSessionCookie: jest.fn(),
    },
}));

describe("Auth Functions", () => {
    describe("createSessionCookie", () => {
        it("should return a valid session cookie and userId if token is valid", async () => {
            const token = "valid-token";
            const mockedSessionCookie = "session-cookie";
            const mockedUserId = "user-id-12345";

            (firebaseAdmin.verifyIdToken as jest.Mock).mockResolvedValueOnce({
                user_id: mockedUserId,
            });
            (firebaseAdmin.createSessionCookie as jest.Mock).mockResolvedValueOnce(mockedSessionCookie);

            const result = await createSessionCookie(token);

            expect(firebaseAdmin.verifyIdToken).toHaveBeenCalledWith(token);
            expect(firebaseAdmin.createSessionCookie).toHaveBeenCalledWith(token, {
                expiresIn: 60 * 60 * 24 * 1000,
            });
            expect(result).toEqual({
                sessionCookie: mockedSessionCookie,
                userId: mockedUserId,
            });
        });

        it("should return null if token is invalid", async () => {
            const token = "invalid-token";

            (firebaseAdmin.verifyIdToken as jest.Mock).mockRejectedValueOnce(
                new Error("auth/invalid-id-token")
            );

            const result = await createSessionCookie(token);

            expect(firebaseAdmin.verifyIdToken).toHaveBeenCalledWith(token);
            expect(result).toBeNull();
        });

        it("should handle auth/user-not-found error and return null", async () => {
            const token = "valid-token";

            (firebaseAdmin.verifyIdToken as jest.Mock).mockRejectedValueOnce(
                new Error("auth/user-not-found")
            );

            const result = await createSessionCookie(token);

            expect(firebaseAdmin.verifyIdToken).toHaveBeenCalledWith(token);
            expect(result).toBeNull();
        });

        it("should handle auth/wrong-password error and return null", async () => {
            const token = "valid-token";

            (firebaseAdmin.verifyIdToken as jest.Mock).mockRejectedValueOnce(
                new Error("auth/wrong-password")
            );

            const result = await createSessionCookie(token);

            expect(firebaseAdmin.verifyIdToken).toHaveBeenCalledWith(token);
            expect(result).toBeNull();
        });

        it("should handle auth/id-token-expired error and return null", async () => {
            const token = "valid-token";

            (firebaseAdmin.verifyIdToken as jest.Mock).mockRejectedValueOnce(
                new Error("auth/id-token-expired")
            );

            const result = await createSessionCookie(token);

            expect(firebaseAdmin.verifyIdToken).toHaveBeenCalledWith(token);
            expect(result).toBeNull();
        });

        it("should handle unexpected errors and return null", async () => {
            const token = "valid-token";

            (firebaseAdmin.verifyIdToken as jest.Mock).mockRejectedValueOnce(
                new Error("Unexpected error")
            );

            const result = await createSessionCookie(token);

            expect(firebaseAdmin.verifyIdToken).toHaveBeenCalledWith(token);
            expect(result).toBeNull();
        });
    });
});
