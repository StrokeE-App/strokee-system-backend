import { confirmEmergencyOperator, cancelEmergencyOperator, updateOperator, getOperator, deleteOperator } from '../../controllers/operator/operatorController';
import {
  updateEmergencyPickUpFromCollectionOperator,
  cancelEmergencyCollectionOperator,
  updateOperatorFromCollection,
  getOperatorFromCollection,
  deleteOperatorFromCollection
} from '../../services/operators/operatorService';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../services/operators/operatorService', () => ({
  updateEmergencyPickUpFromCollectionOperator: jest.fn(),
  cancelEmergencyCollectionOperator: jest.fn(),
  updateOperatorFromCollection: jest.fn(),
  getOperatorFromCollection: jest.fn(),
  deleteOperatorFromCollection: jest.fn()
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
  
    describe('updateOperator Controller', () => {
      let req: Partial<Request>;
      let res: Partial<Response>;
      let next: NextFunction;
  
      beforeEach(() => {
        req = { params: {}, body: {} };
        res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        next = jest.fn();
      });
  
      it('should return 400 if validation fails', async () => {
        req.params = { operatorId: 'operator123' };
        req.body = { name: 'Invalid Data' };
        (updateOperatorFromCollection as jest.Mock).mockResolvedValue({
          success: false,
          message: 'Error de validación: Campo inválido',
        });
  
        await updateOperator(req as Request, res as Response, next);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Error de validación: Campo inválido',
        });
      });
  
      it('should return 400 if no operator is found', async () => {
        req.params = { operatorId: 'operator123' };
        req.body = { name: 'John Doe' };
        (updateOperatorFromCollection as jest.Mock).mockResolvedValue({
          success: false,
          message: 'No se encontró un operador con ese ID.',
        });
  
        await updateOperator(req as Request, res as Response, next);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: 'No se encontró un operador con ese ID.',
        });
      });
  
      it('should return 200 if operation is successful', async () => {
        req.params = { operatorId: 'operator123' };
        req.body = { name: 'John Doe' };
        const result = { success: true, message: 'Operador actualizado exitosamente.' };
        (updateOperatorFromCollection as jest.Mock).mockResolvedValue(result);
  
        await updateOperator(req as Request, res as Response, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          message: result.message,
        });
      });
  
      it('should call next with an error if service throws an error', async () => {
        const errorMessage = 'Service error';
        req.params = { operatorId: 'operator123' };
        req.body = { name: 'John Doe' };
        (updateOperatorFromCollection as jest.Mock).mockRejectedValue(new Error(errorMessage));
  
        await updateOperator(req as Request, res as Response, next);
  
        expect(next).toHaveBeenCalledWith(new Error(errorMessage));
      });
    });

    describe('getOperator Controller', () => {
      let req: Partial<Request>;
      let res: Partial<Response>;
      let next: NextFunction;
    
      beforeEach(() => {
        req = { params: {} }; // Initialize the request object
        res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        next = jest.fn();
      });
    
      it('should return 400 if operatorId is not found', async () => {
        req.params = { operatorId: 'nonexistentOperatorId' };
        (getOperatorFromCollection as jest.Mock).mockResolvedValue({
          success: false,
          message: 'No operator found with the given ID.',
        });
    
        await getOperator(req as Request, res as Response, next);
    
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: 'No operator found with the given ID.',
        });
      });
    
      it('should return 200 if operator data is successfully retrieved', async () => {
        req.params = { operatorId: 'operator123' };
        const result = {
          success: true,
          message: 'Operator found successfully.',
          operator: { id: 'operator123', name: 'John Doe' },
        };
        (getOperatorFromCollection as jest.Mock).mockResolvedValue(result);
    
        await getOperator(req as Request, res as Response, next);
    
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          message: result.message,
          operator: result.operator,
        });
      });
    
      it('should return 400 if there is an issue with the operation', async () => {
        req.params = { operatorId: 'operator123' };
        const result = {
          success: false,
          message: 'Validation error: Invalid operator data.',
        };
        (getOperatorFromCollection as jest.Mock).mockResolvedValue(result);
    
        await getOperator(req as Request, res as Response, next);
    
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Validation error: Invalid operator data.',
        });
      });
    
      it('should call next with an error if service throws an error', async () => {
        const errorMessage = 'Service error';
        req.params = { operatorId: 'operator123' };
        (getOperatorFromCollection as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
        await getOperator(req as Request, res as Response, next);
    
        expect(next).toHaveBeenCalledWith(new Error(errorMessage));
      });
    });
  });

  describe('deleteOperator Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { params: {} };  // Initialize the request object
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    it('should return 400 if no operator is found', async () => {
        req.params = { operatorId: 'operator123' };
        (deleteOperatorFromCollection as jest.Mock).mockResolvedValue({
            success: false,
            message: 'No se encontró un operador con ese ID.',
        });

        await deleteOperator(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'No se encontró un operador con ese ID.',
        });
    });

    it('should return 200 if the operator is deleted successfully', async () => {
        req.params = { operatorId: 'operator123' };
        const result = { success: true, message: 'Operador eliminado exitosamente.' };
        (deleteOperatorFromCollection as jest.Mock).mockResolvedValue(result);

        await deleteOperator(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: result.message,
        });
    });

    it('should call next with an error if deleteOperatorFromCollection throws an error', async () => {
        const errorMessage = 'Service error';
        req.params = { operatorId: 'operator123' };
        (deleteOperatorFromCollection as jest.Mock).mockRejectedValue(new Error(errorMessage));

        await deleteOperator(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(new Error(errorMessage));
    });
});
});

