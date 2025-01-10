import { registerEmergencyContacts } from '../../controllers/patients/emergencyContactsController';
import { addEmergencyContactsIntoCollection } from '../../services/patients/emergencyContactsService';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../services/patients/emergencyContactsService', () => ({
  addEmergencyContactsIntoCollection: jest.fn(),
}));

interface CustomRequest extends Request {
  userId: string;
}

describe('registerEmergencyContacts Controller', () => {
  let req: Partial<CustomRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {
        contacts: [
          {
            firstName: 'Jane',
            lastName: 'Doe',
            phoneNumber: '1234567890',
            email: 'jane.doe@example.com',
            relationship: 'sister',
          },
        ],
      },
      userId: 'mockUserId', 
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 201 and success message if contacts are added successfully', async () => {
    const result = { success: true, message: 'Contactos de emergencia agregados exitosamente.', duplicateEmails: [], duplicatePhones: [] };
    (addEmergencyContactsIntoCollection as jest.Mock).mockResolvedValue(result);

    await registerEmergencyContacts(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: result.message,
    });
  });

  it('should return 400 and error message if contacts are not added due to duplicates', async () => {
    const result = { success: false, message: 'Algunos contactos ya existen.', duplicateEmails: ['jane.doe@example.com'], duplicatePhones: [] };
    (addEmergencyContactsIntoCollection as jest.Mock).mockResolvedValue(result);

    await registerEmergencyContacts(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: result.message,
      duplicateEmails: result.duplicateEmails,
      duplicatePhones: result.duplicatePhones,
    });
  });

  it('should call next with an error if addEmergencyContactsIntoCollection throws an error', async () => {
    const errorMessage = 'Error desconocido al agregar contactos de emergencia.';
    (addEmergencyContactsIntoCollection as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await registerEmergencyContacts(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error(errorMessage));
  });

  it('should return 400 if contacts format is incorrect', async () => {
    req.body.contacts = [];

    await registerEmergencyContacts(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Faltan contactos válidos o el formato es incorrecto.',
    });
  });
});
