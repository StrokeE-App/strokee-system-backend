import { addEmergencyContactIntoCollection, getEmergencyContactFromCollection, updateEmergencyContactFromCollection, deleteEmergencyContactFromCollection  } from '../../services/patients/emergencyContactsService';
import patientModel from '../../models/usersModels/patientModel';
import patientEmergencyContactModel from '../../models/usersModels/patientEmergencyContact';
import { IEmergencyContact } from '../../models/usersModels/emergencyContactModel';

jest.mock('../../models/usersModels/patientModel');
jest.mock('../../models/usersModels/patientEmergencyContact');
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mocked-uuid'),
}));

describe('addEmergencyContactIntoCollection', () => {
    // it('should return an error if the patient does not exist', async () => {
    //     (patientModel.findOne as jest.Mock).mockResolvedValue(null);

    //     const result = await addEmergencyContactIntoCollection('invalid_patient_id', {
    //         firstName: 'Alice',
    //         lastName: 'Smith',
    //         email: 'alice@example.com',
    //         phoneNumber: '5551234567',
    //         relationship: 'Sister',
    //         emergencyContactId: '',
    //         isDeleted: false,
    //     });

    //     expect(result.success).toBe(false);
    //     expect(result.message).toBe('El paciente con ID invalid_patient_id no existe.');
    // });

    // it('should add an emergency contact successfully', async () => {
    //     (patientModel.findOne as jest.Mock).mockResolvedValue({ patientId: 'valid_patient_id' });
    //     (patientEmergencyContactModel.updateOne as jest.Mock).mockResolvedValue({ acknowledged: true });

    //     const newContact: IEmergencyContact = {
    //         firstName: 'Alice',
    //         lastName: 'Smith',
    //         email: 'alice@example.com',
    //         phoneNumber: '5551234567',
    //         relationship: 'Sister',
    //         emergencyContactId: '',
    //         isDeleted: false, // Add this property
    //     };

    //     const result = await addEmergencyContactIntoCollection('valid_patient_id', newContact);

    //     expect(patientEmergencyContactModel.updateOne).toHaveBeenCalledWith(
    //         { patientId: 'valid_patient_id' },
    //         { $push: { emergencyContact: { ...newContact, emergencyContactId: 'mocked-uuid' } } },
    //         { upsert: true }
    //     );

    //     expect(result.success).toBe(true);
    //     expect(result.message).toBe('Contacto de emergencia agregado exitosamente.');
    // });

    it('should return the emergency contact if found', async () => {
        const mockContact = {
            emergencyContactId: '5a56349c-17da-4681-bbfe-a85795543b3b',
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '123456789',
            relationship: 'Brother'
        };

        (patientEmergencyContactModel.aggregate as jest.Mock).mockResolvedValue([mockContact]);

        const result = await getEmergencyContactFromCollection('mocked-patientId', '5a56349c-17da-4681-bbfe-a85795543b3b');

        expect(result).toEqual(mockContact);
    });

    it('should return null if an error occurs', async () => {
        (patientEmergencyContactModel.aggregate as jest.Mock).mockRejectedValue(new Error('DB Error'));

        const result = await getEmergencyContactFromCollection('invalid-patientId', 'invalid-id');

        expect(result).toBeNull();
    });

    it('should update an emergency contact successfully', async () => {
        (patientEmergencyContactModel.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

        const updatedContact = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@example.com',
            phoneNumber: '1234767890',
            relationship: 'Brother',
            emergencyContactId: '',
            canActivateEmergency: true
        };

        const result = await updateEmergencyContactFromCollection('mocked-patientId', '5a56349c-17da-4681-bbfe-a85795543b3b', updatedContact);

        expect(result.success).toBe(true);
        expect(result.message).toBe('Contacto de emergencia actualizado exitosamente.');
    });

    it('should return an error message if the update fails', async () => {
        (patientEmergencyContactModel.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 0 });

        const updatedContact = {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'janedoe@example.com',
            phoneNumber: '1234767890',
            relationship: 'Sister',
            emergencyContactId: '',
            canActivateEmergency: true
        };

        const result = await updateEmergencyContactFromCollection('mocked-patientId', 'invalid-id', updatedContact);

        expect(result.success).toBe(false);
        expect(result.message).toBe('No se pudo actualizar el contacto de emergencia.');
    });

    it('debería eliminar un contacto de emergencia exitosamente', async () => {
        (patientEmergencyContactModel.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

        const response = await deleteEmergencyContactFromCollection('12345', '12345');

        expect(response).toEqual({
            success: true,
            message: 'Contacto de emergencia eliminado exitosamente.',
        });

        expect(patientEmergencyContactModel.updateOne).toHaveBeenCalledWith(
            { patientId: '12345',"emergencyContact.emergencyContactId": '12345' },
            { $pull: { emergencyContact: { emergencyContactId: '12345' } } }
        );
    });

    it('debería retornar un error si no se encuentra el contacto de emergencia', async () => {
        (patientEmergencyContactModel.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 0 });

        const response = await deleteEmergencyContactFromCollection('12345','12345');

        expect(response).toEqual({
            success: false,
            message: 'No se pudo eliminar el contacto de emergencia.',
        });

        expect(patientEmergencyContactModel.updateOne).toHaveBeenCalledWith(
            { patientId: '12345', "emergencyContact.emergencyContactId": '12345' },
            { $pull: { emergencyContact: { emergencyContactId: '12345' } } }
        );
    });

    it('debería manejar errores inesperados', async () => {
        (patientEmergencyContactModel.updateOne as jest.Mock).mockRejectedValue(new Error('Error de base de datos'));

        const response = await deleteEmergencyContactFromCollection('12345', '12345');

        expect(response).toEqual({
            success: false,
            message: 'Error al eliminar el contacto de emergencia: Error de base de datos',
        });
    });
});
