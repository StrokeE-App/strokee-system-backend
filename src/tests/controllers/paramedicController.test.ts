import { registerParamedic, cancelEmergency, confirmEmergency } from '../../controllers/paramedics/paramedicController';
import { addParamedicIntoCollection, cancelEmergencyCollection, updateEmergencyPickUpFromCollection } from '../../services/paramedics/paramedicService';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../services/paramedics/paramedicService', () => ({
  addParamedicIntoCollection: jest.fn(),
  updateEmergencyPickUpFromCollection: jest.fn(),
  cancelEmergencyCollection: jest.fn(),
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
      const errorMessage = 'Error al agregar al paramédico.';
      (addParamedicIntoCollection as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await registerParamedic(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(new Error(errorMessage));
    });
  });

  describe('confirmEmergency Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        body: {
          emergencyId: 'EMG123',
          pickupDate: '2025-01-22T10:00:00Z',
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should return 200 and the confirmation message when pickup is confirmed', async () => {
      const result = { success: true, message: 'Emergencia confirmada exitosamente' };
      (updateEmergencyPickUpFromCollection as jest.Mock).mockResolvedValue(result);

      await confirmEmergency(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: result.message,
      });
    });

    it('should return 400 if missing emergencyId or pickupDate in the request body', async () => {
      req.body = {}; // Empty request body

      await confirmEmergency(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Por favor, ingresar un emergencyid y un pickdate valido',
      });
    });

    it('should return 404 if no emergency is found with the given emergencyId', async () => {
      const result = { success: false, message: 'No se encontraron emergencias con ese Id' };
      (updateEmergencyPickUpFromCollection as jest.Mock).mockResolvedValue(result);

      await confirmEmergency(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: result.message,
      });
    });

    it('should call next with an error if updateEmergencyPickUpFromCollection throws an error', async () => {
      const errorMessage = 'Error al confirmar la emergencia.';
      (updateEmergencyPickUpFromCollection as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await confirmEmergency(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(new Error(errorMessage));
    });
  });

  describe('cancelEmergency Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = {
        body: {
          emergencyId: 'EMG123',
          pickupDate: '2025-01-22T10:00:00Z',
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should return 200 and the cancellation message when emergency is canceled', async () => {
      const result = { success: true, message: 'Emergencia cancelada exitosamente' };
      (cancelEmergencyCollection as jest.Mock).mockResolvedValue(result);

      await cancelEmergency(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: result.message,
      });
    });

    it('should return 400 if missing emergencyId or pickupDate in the request body', async () => {
      req.body = {}; // Empty request body

      await cancelEmergency(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Por favor, ingresar un emergencyid y un pickdate valido',
      });
    });

    it('should return 404 if no emergency is found with the given emergencyId', async () => {
      const result = { success: false, message: 'No se encontraron emergencias con ese Id' };
      (cancelEmergencyCollection as jest.Mock).mockResolvedValue(result);

      await cancelEmergency(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: result.message,
      });
    });

    it('should call next with an error if cancelEmergencyCollection throws an error', async () => {
      const errorMessage = 'Error al cancelar la emergencia.';
      (cancelEmergencyCollection as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await cancelEmergency(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(new Error(errorMessage));
    });
  });
});
