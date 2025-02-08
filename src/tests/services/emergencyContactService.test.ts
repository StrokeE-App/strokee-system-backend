import { addEmergencyContactIntoCollection } from '../../services/patients/emergencyContactsService';
import patientModel from '../../models/usersModels/patientModel';
import patientEmergencyContactModel from '../../models/usersModels/patientEmergencyContact';
import { IEmergencyContact } from '../../models/usersModels/emergencyContactModel';

jest.mock('../../models/usersModels/patientModel');
jest.mock('../../models/usersModels/patientEmergencyContact');
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mocked-uuid'),
}));

describe('addEmergencyContactIntoCollection', () => {
    it('should return an error if the patient does not exist', async () => {
        (patientModel.findOne as jest.Mock).mockResolvedValue(null);
    
        const result = await addEmergencyContactIntoCollection('invalid_patient_id', {
            firstName: 'Alice',
            lastName: 'Smith',
            email: 'alice@example.com',
            phoneNumber: '5551234567',
            relationship: 'Sister',
            emergencyContactId: '',
            isDeleted: false, 
        });
    
        expect(result.success).toBe(false);
        expect(result.message).toBe('El paciente con ID invalid_patient_id no existe.');
    });

    it('should add an emergency contact successfully', async () => {
        (patientModel.findOne as jest.Mock).mockResolvedValue({ patientId: 'valid_patient_id' });
        (patientEmergencyContactModel.updateOne as jest.Mock).mockResolvedValue({ acknowledged: true });

        const newContact: IEmergencyContact = {
            firstName: 'Alice',
            lastName: 'Smith',
            email: 'alice@example.com',
            phoneNumber: '5551234567',
            relationship: 'Sister',
            emergencyContactId: '',
            isDeleted: false, // Add this property
        };

        const result = await addEmergencyContactIntoCollection('valid_patient_id', newContact);

        expect(patientEmergencyContactModel.updateOne).toHaveBeenCalledWith(
            { patientId: 'valid_patient_id' },
            { $push: { emergencyContact: { ...newContact, emergencyContactId: 'mocked-uuid' } } },
            { upsert: true }
        );

        expect(result.success).toBe(true);
        expect(result.message).toBe('Contacto de emergencia agregado exitosamente.');
    });
});
