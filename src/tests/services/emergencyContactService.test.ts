import { addEmergencyContactsIntoCollection } from '../../services/patients/emergencyContactsService';
import patientModel from '../../models/usersModels/patientModel';
import { firebaseAdmin } from '../../config/firebase-config';

jest.mock('../../config/firebase-config', () => ({
    firebaseAdmin: {
        getUser: jest.fn(),
        verifySessionCookie: jest.fn(),
    },
}));

jest.mock('../../models/usersModels/patientModel', () => ({
    findOne: jest.fn(),
    updateOne: jest.fn(),
}));

describe('addEmergencyContactsIntoCollection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('debería agregar contactos de emergencia exitosamente', async () => {
        (firebaseAdmin.verifySessionCookie as jest.Mock).mockResolvedValue({
            uid: 'existingPatientId',
        });

        (firebaseAdmin.getUser as jest.Mock).mockResolvedValue({
            uid: 'existingPatientId',
        });

        (patientModel.findOne as jest.Mock).mockResolvedValue({
            patientId: 'existingPatientId',
            emergencyContact: [],
        });

        (patientModel.updateOne as jest.Mock).mockResolvedValue({});

        const newContacts = [
            {
                firstName: 'Jane',
                lastName: 'Doe',
                phoneNumber: '1234567890',
                email: 'jane.doe@example.com',
                relationship: 'sister',
                isDeleted: false,
            },
        ];

        const result = await addEmergencyContactsIntoCollection('existingPatientId', newContacts);

        expect(firebaseAdmin.verifySessionCookie).toHaveBeenCalledWith('existingPatientId', true);
        expect(firebaseAdmin.getUser).toHaveBeenCalledWith('existingPatientId');
        expect(patientModel.findOne).toHaveBeenCalledWith({ patientId: 'existingPatientId' });
        expect(patientModel.updateOne).toHaveBeenCalledWith(
            { patientId: 'existingPatientId' },
            { $addToSet: { emergencyContact: { $each: newContacts } } },
            { upsert: true }
        );
        expect(result).toEqual({
            success: true,
            message: 'Contactos de emergencia agregados exitosamente.',
            duplicateEmails: [],
            duplicatePhones: [],
        });
    });

    it('debería retornar error si el paciente no existe', async () => {
        (firebaseAdmin.verifySessionCookie as jest.Mock).mockResolvedValue({
            uid: 'nonExistentPatientId',
        });

        (firebaseAdmin.getUser as jest.Mock).mockRejectedValue({ code: 'auth/user-not-found' });

        const result = await addEmergencyContactsIntoCollection('nonExistentPatientId', []);

        expect(firebaseAdmin.verifySessionCookie).toHaveBeenCalledWith('nonExistentPatientId', true);
        expect(firebaseAdmin.getUser).toHaveBeenCalledWith('nonExistentPatientId');
        expect(result).toEqual({
            success: false,
            message: 'El paciente con ID nonExistentPatientId no existe.',
            duplicateEmails: [],
            duplicatePhones: [],
        });
    });

    it('debería retornar error si hay contactos duplicados', async () => {
        (firebaseAdmin.verifySessionCookie as jest.Mock).mockResolvedValue({
            uid: 'existingPatientId',
        });

        (firebaseAdmin.getUser as jest.Mock).mockResolvedValue({
            uid: 'existingPatientId',
        });

        (patientModel.findOne as jest.Mock).mockResolvedValue({
            patientId: 'existingPatientId',
            emergencyContact: [
                {
                    firstName: 'Jane',
                    lastName: 'Doe',
                    phoneNumber: '1234567890',
                    email: 'jane.doe@example.com',
                    relationship: 'sister',
                    isDeleted: false,
                },
            ],
        });

        const newContacts = [
            {
                firstName: 'Jane',
                lastName: 'Doe',
                phoneNumber: '1234567890',
                email: 'jane.doe@example.com',
                relationship: 'sister',
                isDeleted: false,
            },
        ];

        const result = await addEmergencyContactsIntoCollection('existingPatientId', newContacts);

        expect(result).toEqual({
            success: false,
            message: 'Algunos contactos ya existen con el mismo número de teléfono o correo electrónico.',
            duplicateEmails: ['jane.doe@example.com'],
            duplicatePhones: ['1234567890'],
        });
    });
});
