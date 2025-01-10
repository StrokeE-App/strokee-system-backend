import { registerParamedic } from '../../controllers/paramedics/paramedicController';
import { addParamedicIntoCollection } from '../../services/paramedics/paramedicService';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../services/paramedics/paramedicService', () => ({
  addParamedicIntoCollection: jest.fn(),
}));

describe('registerParamedic Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {
        ambulanceId: 'AMB123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'password123',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 201 and the ambulanceId if registration is successful', async () => {
    const result = { success: true, message: 'Paramédico agregado exitosamente.', ambulanceId: 'AMB123' };
    (addParamedicIntoCollection as jest.Mock).mockResolvedValue(result);

    await registerParamedic(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: result.message,
      ambulanceId: result.ambulanceId,
    });
  });

  it('should return 400 if the paramedic could not be registered', async () => {
    const result = { success: false, message: 'El email ya está registrado.' };
    (addParamedicIntoCollection as jest.Mock).mockResolvedValue(result);

    await registerParamedic(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: result.message,
    });
  });

  it('should call next with an error if addParamedicIntoCollection throws an error', async () => {
    const errorMessage = 'Error desconocido al agregar al paramédico.';
    (addParamedicIntoCollection as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await registerParamedic(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error(errorMessage));
  });
});
