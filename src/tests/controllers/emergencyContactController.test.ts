import { registerEmergencyContacts } from '../../controllers/patients/emergencyContactsController';
import { addEmergencyContactsIntoCollection } from '../../services/patients/emergencyContactsService';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../services/patients/emergencyContactsService', () => ({
  addEmergencyContactsIntoCollection: jest.fn(),
}));

interface CustomRequest extends Request {
  userId: string;
  cookies: { session_token?: string };
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
      cookies: { session_token: 'mockToken' }, // Mock de la cookie
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('debería devolver 201 y mensaje de éxito si los contactos se agregan correctamente', async () => {
    const result = { success: true, message: 'Contactos de emergencia agregados exitosamente.', duplicateEmails: [], duplicatePhones: [] };
    (addEmergencyContactsIntoCollection as jest.Mock).mockResolvedValue(result);

    await registerEmergencyContacts(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: result.message,
    });
  });

  it('debería devolver 400 y mensaje de error si los contactos no se agregan por duplicados', async () => {
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

  it('debería llamar a next con un error si addEmergencyContactsIntoCollection lanza un error', async () => {
    const errorMessage = 'Error desconocido al agregar contactos de emergencia.';
    (addEmergencyContactsIntoCollection as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await registerEmergencyContacts(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error(errorMessage));
  });

  it('debería devolver 400 si el formato de los contactos es incorrecto', async () => {
    req.body.contacts = [];

    await registerEmergencyContacts(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Faltan contactos válidos o el formato es incorrecto.',
    });
  });

  it('debería devolver 401 si no se encuentra la cookie de sesión', async () => {
    req.cookies = {}; // Eliminamos la cookie para simular que no existe

    await registerEmergencyContacts(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No autorizado: cookie no encontrada',
    });
  });
});
