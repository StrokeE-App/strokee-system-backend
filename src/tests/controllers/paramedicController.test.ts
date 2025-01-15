import { registerParamedic, getActiveEmergencies } from '../../controllers/paramedics/paramedicController';
import { addParamedicIntoCollection, getAllActiveEmergenciesFromCollection } from '../../services/paramedics/paramedicService';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../services/paramedics/paramedicService', () => ({
  addParamedicIntoCollection: jest.fn(),
  getAllActiveEmergenciesFromCollection: jest.fn(),
}));

interface CustomRequest extends Request {
  userId: string;
}

describe('Paramedic tests', () => {
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

  describe('getEmergency Controller', () => {
    let req: Partial<CustomRequest>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        userId: 'user123', 
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should return 200 with active emergencies when found', async () => {
      const result = { success: true, message: 'Emergencias activas encontradas', data: [{ emergencyId: 'EMG123', status: 'ACTIVE' }] };
      (getAllActiveEmergenciesFromCollection as jest.Mock).mockResolvedValue(result);

      await getActiveEmergencies(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: result.message,
        data: result.data,
      });
    });

    it('should return 404 if no active emergencies are found', async () => {
      const result = { success: true, message: 'No se encontraron emergencias activas' };
      (getAllActiveEmergenciesFromCollection as jest.Mock).mockResolvedValue(result);

      await getActiveEmergencies(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No se encontraron emergencias activas',
      });
    });

    it('should return 400 if getActiveEmergenciesFromCollection service fails', async () => {
      const result = { success: false, message: 'Error al consultar las emergencias activas' };
      (getAllActiveEmergenciesFromCollection as jest.Mock).mockResolvedValue(result);

      await getActiveEmergencies(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: result.message,
      });
    });

    it('should call next with an error if getActiveEmergenciesFromCollection throws an error', async () => {
      const errorMessage = 'Error desconocido al consultar las emergencias activas.';
      (getAllActiveEmergenciesFromCollection as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await getActiveEmergencies(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(new Error(errorMessage));
    });
  });
});
