import { getEmergencyFromCollection } from '../../services/emergencies/emeregencyService';
import { getEmergency } from '../../controllers/emergencies/emergencyController';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../services/emergencies/emeregencyService', () => ({
    getEmergencyFromCollection: jest.fn(), 
  }));

describe('getEmergency Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            params: {
                emergencyId: 'EMG123',
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    it('should return 200 with emergency data when the emergency is found', async () => {
        const result = { success: true, message: 'Emergencia encontrada', data: { emergencyId: 'EMG123', status: 'ACTIVE' } };
        (getEmergencyFromCollection as jest.Mock).mockResolvedValue(result);

        await getEmergency(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: result.message,
            data: result.data,
        });
    });

    it('should return 404 if no emergency is found with the given id', async () => {
        const result = { success: true, message: 'No se encontró la emergencia' };
        (getEmergencyFromCollection as jest.Mock).mockResolvedValue(result);

        await getEmergency(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: 'No se encontró la emergencia con el id proporcionado.',
        });
    });

    it('should return 400 if the getEmergencyFromCollection service fails', async () => {
        const result = { success: false, message: 'Error al consultar la emergencia' };
        (getEmergencyFromCollection as jest.Mock).mockResolvedValue(result);

        await getEmergency(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: result.message,
        });
    });

    it('should call next with an error if getEmergencyFromCollection throws an error', async () => {
        const errorMessage = 'Error al consultar la emergencia.';
        (getEmergencyFromCollection as jest.Mock).mockRejectedValue(new Error(errorMessage));

        await getEmergency(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(new Error(errorMessage));
    });

});