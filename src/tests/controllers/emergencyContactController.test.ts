import { getEmergencyContact, updateEmergencyContact, deleteEmergencyContact } from '../../controllers/patients/emergencyContactsController';
import { getEmergencyContactFromCollection, updateEmergencyContactFromCollection, deleteEmergencyContactFromCollection } from '../../services/patients/emergencyContactsService';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../services/patients/emergencyContactsService', () => ({
    getEmergencyContactFromCollection: jest.fn(),
    updateEmergencyContactFromCollection: jest.fn(),
    deleteEmergencyContactFromCollection: jest.fn(),
}));

describe('Emergency Contacts Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    describe('getEmergencyContact', () => {
        beforeEach(() => {
            req.params = { patientId: 'PATIENT123', contactId: 'CONTACT123' };
        });

        it('should return 200 and the emergency contact when found', async () => {
            const contactMock = { firstName: 'Alice', lastName: 'Smith', phoneNumber: '5551234567' };
            (getEmergencyContactFromCollection as jest.Mock).mockResolvedValue(contactMock);

            await getEmergencyContact(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Contacto de emergencia obtenido exitosamente.',
                data: contactMock,
            });
        });

        it('should return 400 if the contact is not found', async () => {
            (getEmergencyContactFromCollection as jest.Mock).mockResolvedValue(null);

            await getEmergencyContact(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'No se pudo obtener el contacto de emergencia.',
            });
        });

        it('should call next with an error if service throws an error', async () => {
            const error = new Error('Database error');
            (getEmergencyContactFromCollection as jest.Mock).mockRejectedValue(error);

            await getEmergencyContact(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('updateEmergencyContact', () => {
        beforeEach(() => {
            req.params = { patientId: 'PATIENT123', contactId: 'CONTACT123' };
            req.body = { contact: { firstName: 'Bob', lastName: 'Jones', phoneNumber: '5559876543' } };
        });

        it('should return 200 when the emergency contact is updated successfully', async () => {
            (updateEmergencyContactFromCollection as jest.Mock).mockResolvedValue({ success: true, message: 'Contacto de emergencia actualizado exitosamente.' });

            await updateEmergencyContact(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Contacto de emergencia actualizado exitosamente.',
            });
        });

        it('should return 400 if the update fails', async () => {
            (updateEmergencyContactFromCollection as jest.Mock).mockResolvedValue({ success: false, message: 'No se pudo actualizar el contacto de emergencia.' });

            await updateEmergencyContact(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'No se pudo actualizar el contacto de emergencia.',
            });
        });

        it('should call next with an error if service throws an error', async () => {
            const error = new Error('Database error');
            (updateEmergencyContactFromCollection as jest.Mock).mockRejectedValue(error);

            await updateEmergencyContact(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('deleteEmergencyContact', () => {
        beforeEach(() => {
            req.params = { contactId: 'CONTACT123' };
        });

        it('should return 200 when the emergency contact is deleted successfully', async () => {
            (deleteEmergencyContactFromCollection as jest.Mock).mockResolvedValue({ success: true, message: 'Contacto de emergencia eliminado exitosamente.' });

            await deleteEmergencyContact(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Contacto de emergencia eliminado exitosamente.',
            });
        });

        it('should return 400 if the deletion fails', async () => {
            (deleteEmergencyContactFromCollection as jest.Mock).mockResolvedValue({ success: false, message: 'No se pudo eliminar el contacto de emergencia.' });

            await deleteEmergencyContact(req as Request, res as Response, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'No se pudo eliminar el contacto de emergencia.',
            });
        });

        it('should call next with an error if service throws an error', async () => {
            const error = new Error('Database error');
            (deleteEmergencyContactFromCollection as jest.Mock).mockRejectedValue(error);

            await deleteEmergencyContact(req as Request, res as Response, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
