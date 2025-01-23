import { registerOperator } from '../../controllers/operator/operatorController'
import { addOperatorIntoCollection } from '../../services/operators/operatorService';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../services/operators/operatorService', () => ({
  addOperatorIntoCollection: jest.fn(),
}));

describe('registerOperator Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {
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

  it('should return 201 and the operatorId if registration is successful', async () => {
    const result = { success: true, message: 'Operador agregado exitosamente.', operatorId: 'operator123' };
    (addOperatorIntoCollection as jest.Mock).mockResolvedValue(result);

    await registerOperator(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: result.message,
      operatorId: result.operatorId,
    });
  });

  it('should return 400 if the operator could not be registered', async () => {
    const result = { success: false, message: 'El email ya está registrado.' };
    (addOperatorIntoCollection as jest.Mock).mockResolvedValue(result);

    await registerOperator(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: result.message,
    });
  });

  it('should call next with an error if addOperatorIntoCollection throws an error', async () => {
    const errorMessage = 'Error desconocido al agregar al operador.';
    (addOperatorIntoCollection as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await registerOperator(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error(errorMessage));
  });
});
