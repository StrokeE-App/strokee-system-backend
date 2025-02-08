import { addEmergencyContactIntoCollection } from '../../services/patients/emergencyContactsService';
import { addEmergencyContact } from '../../controllers/patients/emergencyContactsController';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../services/patients/emergencyContactsService', () => ({
    addEmergencyContactIntoCollection: jest.fn(),
}));

describe('addEmergencyContact Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            body: {
                patientId: 'PATIENT123',
                contact: {
                    firstName: 'Alice',
                    lastName: 'Smith',
                    email: 'alice@example.com',
                    phoneNumber: '5551234567',
                    relationship: 'Sister',
                    emergencyContactId: '',
                    isDeleted: false,
                },
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    it('should return 201 when emergency contact is added successfully', async () => {
        const result = { success: true, message: 'Contacto de emergencia agregado exitosamente.' };
        (addEmergencyContactIntoCollection as jest.Mock).mockResolvedValue(result);

        await addEmergencyContact(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: result.message,
        });
    });

    it('should return 400 if patient does not exist', async () => {
        const result = { success: false, message: 'El paciente con ID PATIENT123 no existe.' };
        (addEmergencyContactIntoCollection as jest.Mock).mockResolvedValue(result);

        await addEmergencyContact(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: result.message,
        });
    });

    it('should call next with an error if addEmergencyContactIntoCollection throws an error', async () => {
        const errorMessage = 'Database error';
        (addEmergencyContactIntoCollection as jest.Mock).mockRejectedValue(new Error(errorMessage));

        await addEmergencyContact(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(new Error(errorMessage));
    });
});
