import { addAmbulance, deleteAmbulance, editAmbulance, getAmbulance, getAllAmbulances } from "../../services/operators/ambulanceService";
import ambulanceModel from "../../models/usersModels/ambulanceModel";

jest.mock('../../models/usersModels/ambulanceModel', () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    deleteOne: jest.fn(),
    find: jest.fn()
}));

describe('Ambulance Service', () => {

    const mockAmbulanceId = 'amb-123';
    const mockAmbulance = {
        ambulanceId: mockAmbulanceId,
        status: 'active',
        location: 'Hospital Central'
    };
    const mockAmbulances = [
        { ambulanceId: 'amb-001' },
        { ambulanceId: 'amb-002' },
        { ambulanceId: 'amb-003' }
      ];

    it('should successfully add a new ambulance', async () => {
        // Mock implementations
        (ambulanceModel.findOne as jest.Mock).mockResolvedValue(null);
        (ambulanceModel.create as jest.Mock).mockResolvedValue({});

        // Execute
        const result = await addAmbulance('amb-123');

        // Assertions
        expect(result.success).toBe(true);
        expect(result.message).toBe('Ambulancia agregada correctamente.');
        expect(ambulanceModel.findOne).toHaveBeenCalledWith({ ambulanceId: 'amb-123' });
        expect(ambulanceModel.create).toHaveBeenCalledWith({ ambulanceId: 'amb-123' });
    });

    it('should successfully delete an existing ambulance', async () => {
        // Mock setup
        const mockAmbulance = { ambulanceId: 'amb-123' };
        (ambulanceModel.findOne as jest.Mock).mockResolvedValue(mockAmbulance);
        (ambulanceModel.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

        // Execute
        const result = await deleteAmbulance('amb-123');

        // Assertions
        expect(result.success).toBe(true);
        expect(result.message).toBe('Ambulancia eliminada correctamente.');
        expect(ambulanceModel.findOne).toHaveBeenCalledWith({ ambulanceId: 'amb-123' });
        expect(ambulanceModel.deleteOne).toHaveBeenCalledWith({ ambulanceId: 'amb-123' });
    });

    // 2. Non-existent Ambulance
    it('should return error when ambulance does not exist', async () => {
        // Mock setup
        (ambulanceModel.findOne as jest.Mock).mockResolvedValue(null);

        // Execute
        const result = await deleteAmbulance('non-existent-ambulance');

        // Assertions
        expect(result.success).toBe(false);
        expect(result.message).toBe('La ambulancia con ID non-existent-ambulance no existe.');
    });

    it('should successfully retrieve an existing ambulance', async () => {
        // Mock setup
        (ambulanceModel.findOne as jest.Mock).mockResolvedValue(mockAmbulance);

        // Execute
        const result = await getAmbulance(mockAmbulanceId);

        // Assertions
        expect(result.success).toBe(true);
        expect(result.message).toBe('Ambulancia obtenida correctamente.');
        expect(result.ambulance).toEqual(mockAmbulance);
        expect(ambulanceModel.findOne).toHaveBeenCalledWith(
            { ambulanceId: mockAmbulanceId },
            { ambulanceId: 1, _id: 0 }
        );
    });

    it('should successfully retrieve all ambulances', async () => {
        // Mock setup
        (ambulanceModel.find as jest.Mock).mockResolvedValue(mockAmbulances);

        // Execute
        const result = await getAllAmbulances();

        // Assertions
        expect(result.success).toBe(true);
        expect(result.message).toBe('Ambulancias obtenidas correctamente.');
        expect(result.ambulances).toEqual(mockAmbulances);
        expect(ambulanceModel.find).toHaveBeenCalledWith(
            {},
            { ambulanceId: 1, _id: 0 }
        );
    });

})