import { confirmEmergencyOperator, cancelEmergencyOperator } from '../../controllers/operator/operatorController';
import { updateEmergencyPickUpFromCollectionOperator, cancelEmergencyCollectionOperator } from '../../services/operators/operatorService';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../services/operators/operatorService', () => ({
  updateEmergencyPickUpFromCollectionOperator: jest.fn(),
  cancelEmergencyCollectionOperator: jest.fn(),
}));

describe('confirmEmergencyOperator Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 400 if emergencyId or ambulanceId is missing', async () => {
    req.body = {};

    await confirmEmergencyOperator(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Por favor, ingresar un emergencyId y un ambulanceId válido.',
    });
  });

  it('should return 404 if no emergency is found', async () => {
    req.body = { emergencyId: '123', ambulanceId: '456' };
    (updateEmergencyPickUpFromCollectionOperator as jest.Mock).mockResolvedValue({
      success: false,
      message: 'No se encontró una emergencia',
    });

    await confirmEmergencyOperator(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No se encontró una emergencia',
    });
  });

  it('should return 200 if operation is successful', async () => {
    req.body = { emergencyId: '123', ambulanceId: '456' };
    const result = { success: true, message: 'Pickup confirmed' };
    (updateEmergencyPickUpFromCollectionOperator as jest.Mock).mockResolvedValue(result);

    await confirmEmergencyOperator(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: result.message,
    });
  });

  it('should call next with an error if service throws an error', async () => {
    const errorMessage = 'Service error';
    req.body = { emergencyId: '123', ambulanceId: '456' };
    (updateEmergencyPickUpFromCollectionOperator as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await confirmEmergencyOperator(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error(errorMessage));
  });
});

describe('cancelEmergencyOperator Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 400 if emergencyId is missing', async () => {
    req.body = {};

    await cancelEmergencyOperator(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Por favor, ingresar un emergencyid',
    });
  });

  it('should return 404 if no emergency is found', async () => {
    req.body = { emergencyId: '123' };
    (cancelEmergencyCollectionOperator as jest.Mock).mockResolvedValue({
      success: false,
      message: 'No se encontró una emergencia',
    });

    await cancelEmergencyOperator(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No se encontró una emergencia',
    });
  });

  it('should return 200 if operation is successful', async () => {
    req.body = { emergencyId: '123' };
    const result = { success: true, message: 'Emergency canceled' };
    (cancelEmergencyCollectionOperator as jest.Mock).mockResolvedValue(result);

    await cancelEmergencyOperator(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: result.message,
    });
  });

  it('should call next with an error if service throws an error', async () => {
    const errorMessage = 'Service error';
    req.body = { emergencyId: '123' };
    (cancelEmergencyCollectionOperator as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await cancelEmergencyOperator(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error(errorMessage));
  });
});
