import { createSessionCookie } from '../../services/auth/authService'
import { firebaseAdmin } from "../../config/firebase-cofig";

jest.mock('../../config/firebase-cofig', () => ({
    firebaseAdmin: {
        verifyIdToken: jest.fn(),
        createSessionCookie: jest.fn(),
    },
}));

describe('Auth Functions', () => {
    describe('createSessionCookie', () => {
        it('debe devolver un cookie de sesión válido', async () => {
            const token = 'valid-token';
            const mockedSessionCookie = 'session-cookie';

            (firebaseAdmin.verifyIdToken as jest.Mock).mockResolvedValueOnce({ uid: '12345' });
            (firebaseAdmin.createSessionCookie as jest.Mock).mockResolvedValueOnce(mockedSessionCookie);

            const result = await createSessionCookie(token);

            expect(firebaseAdmin.verifyIdToken).toHaveBeenCalledWith(token);
            expect(firebaseAdmin.createSessionCookie).toHaveBeenCalledWith(token, { expiresIn: 60 * 60 * 24 * 1000 });
            expect(result).toBe(mockedSessionCookie);
        });

        it('debe devolver null si el token es inválido', async () => {
            const token = 'invalid-token';

            (firebaseAdmin.verifyIdToken as jest.Mock).mockRejectedValueOnce(new Error('auth/invalid-id-token'));

            const result = await createSessionCookie(token);

            expect(firebaseAdmin.verifyIdToken).toHaveBeenCalledWith(token);
            expect(result).toBeNull();
        });
    });

});
