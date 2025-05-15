import { getEmergencyFromCollection } from '../../services/emergencies/emeregencyService';
import emergencyModel from '../../models/emergencyModel';

describe('Emergency', () => {
it('should return an error when emergencyId is missing', async () => {
        const result = await getEmergencyFromCollection('');
        expect(result.success).toBe(false);
        expect(result.message).toBe('El id de la emergencia no es válido');
    });

    it('should return an error if the emergency is not found', async () => {
        emergencyModel.aggregate = jest.fn().mockResolvedValue([]); // No se encuentra la emergencia

        const result = await getEmergencyFromCollection('123');
        expect(result.success).toBe(true);
        expect(result.message).toBe('No se encontró la emergencia');
    });

    it('should return the emergency with patient details if found', async () => {
        const mockEmergency = {
            emergencyId: '123',
            status: 'ACTIVE',
            patientId: 'patient123',
            startDate: '2022-01-01',
            pickupDate: '2022-01-02',
            deliveredDate: '2022-01-03',
            patient: {
                age: 24,
                firstName: "John",
                height: 101,
                lastName: "Doe",
                phoneNumber: "3057479364",
                weight: 74.5
            }
        };

        emergencyModel.aggregate = jest.fn().mockResolvedValue([mockEmergency]);

        const result = await getEmergencyFromCollection('123');

        expect(result.success).toBe(true);
        expect(result.message).toBe('Emergencia encontrada');
        expect(result.data.patient).toBeDefined();
        expect(result.data.patient?.firstName).toBe('John');
        expect(result.data.patient.lastName).toBe('Doe');
    });

    it('should handle errors gracefully', async () => {
        const mockError = new Error('Database error');
        emergencyModel.aggregate = jest.fn().mockRejectedValue(mockError);

        const result = await getEmergencyFromCollection('123');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Error al consultar la emergencia: Database error');
    });
});