import { sendEmailToRegisterEmergencyContact, registerEmergencyContactToActivateEmergencyIntoCollection, getEmergencyContactFromCollection, updateEmergencyContactFromCollection, deleteEmergencyContactFromCollection } from '../../services/patients/emergencyContactsService';
import patientModel from '../../models/usersModels/patientModel';
import rolesModel from '../../models/usersModels/rolesModel';
import { connectToRedis } from '../../boostrap';
import { validateEmergencyContact } from '../../services/utils';
//import { firebaseAdmin } from '../../config/firebase-config';
import patientEmergencyContactModel from '../../models/usersModels/patientEmergencyContact';
import { IEmergencyContact } from '../../models/usersModels/emergencyContactModel';
import jwt from 'jsonwebtoken';

jest.mock('../../models/usersModels/patientModel', () => ({
    findOne: jest.fn(),
    updateOne: jest.fn(),
}));
jest.mock('../../services/utils', () => ({
    validateEmergencyContact: jest.fn(),
}));
jest.mock('../../models/usersModels/patientEmergencyContact');
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mocked-uuid'),
}));
jest.mock('../../services/mail');
jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(),
}));
jest.mock('../../boostrap', () => ({
    connectToRedis: jest.fn(),
}));
// jest.mock('firebase-admin', () => ({
//     createUser: jest.fn(() => Promise.reject({ code: "auth/email-already-exists" })),
// }));


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

    describe('getEmergencyContactFromCollection', () => {
        const mockPatientId = '12345';
        const mockEmergencyContactId = '67890';
        const mockEmergencyContact = {
            emergencyContactId: mockEmergencyContactId,
            name: 'John Doe',
            phone: '123-456-7890',
            relationship: 'Father'
        };

        it('should return the emergency contact when found', async () => {
            (patientModel.findOne as jest.Mock).mockResolvedValue({ emergencyContact: [mockEmergencyContact] });

            const result = await getEmergencyContactFromCollection(mockPatientId, mockEmergencyContactId);

            expect(result).toEqual(mockEmergencyContact);
            expect(patientModel.findOne).toHaveBeenCalledWith(
                { patientId: mockPatientId, "emergencyContact.emergencyContactId": mockEmergencyContactId },
                { "emergencyContact.$": 1 }
            );
        });

        it('should return null when no emergency contact is found', async () => {
            (patientModel.findOne as jest.Mock).mockResolvedValue({ emergencyContact: [] });
            const result = await getEmergencyContactFromCollection(mockPatientId, mockEmergencyContactId);

            expect(result).toBeNull();
        });

        it('should handle errors and return null', async () => {
            (patientModel.findOne as jest.Mock).mockRejectedValue(new Error('Mock error'));
            const result = await getEmergencyContactFromCollection(mockPatientId, mockEmergencyContactId);

            expect(result).toBeNull();
        });
    });

    describe('updateEmergencyContactFromCollection', () => {
        const patientId = 'patient123';
        const emergencyContactId = 'contact123';
        const updatedContact: IEmergencyContact = {
            emergencyContactId: emergencyContactId, // Add this line
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            canActivateEmergency: true,
            relationship: 'Brother',
            phoneNumber: '1234567890',
        };

        const patientModel = {
            updateOne: jest.fn(),
        };

        const mockValidateEmergencyContact = validateEmergencyContact as jest.Mock;


        beforeEach(() => {
            jest.clearAllMocks();
        });

        // it('should return success when the emergency contact is updated', async () => {
        //     mockValidateEmergencyContact.mockImplementation(() => { }); // Mock validation success

        //     (patientModel.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

        //     const result = await updateEmergencyContactFromCollection(patientId, emergencyContactId, updatedContact);

        //     expect(result.success).toBe(true);
        //     expect(result.message).toBe('Contacto de emergencia actualizado exitosamente.');
        //     expect(patientModel.updateOne).toHaveBeenCalledWith(
        //         { patientId, "emergencyContact.emergencyContactId": emergencyContactId },
        //         { $set: { "emergencyContact.$[elem]": { ...updatedContact, emergencyContactId } } },
        //         { arrayFilters: [{ "elem.emergencyContactId": emergencyContactId }] }
        //     );
        // });

        it('should return failure when no contact is updated', async () => {
            mockValidateEmergencyContact.mockImplementation(() => { }); // Mock validation success
            (patientModel.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 0 });

            const result = await updateEmergencyContactFromCollection(patientId, emergencyContactId, updatedContact);

            expect(result.success).toBe(false);
            expect(result.message).toBe('No se pudo actualizar el contacto de emergencia.');
        });

        it('should return an error message if validation fails', async () => {
            mockValidateEmergencyContact.mockImplementation(() => { throw new Error('Invalid contact data'); });

            const result = await updateEmergencyContactFromCollection(patientId, emergencyContactId, updatedContact);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Error al actualizar el contacto de emergencia: Invalid contact data');
        });

        // it('should handle unexpected errors gracefully', async () => {
        //     mockValidateEmergencyContact.mockImplementation(() => { });
        //     jest.spyOn(patientModel, 'updateOne').mockRejectedValue(new Error('Database error'));

        //     try {
        //         await updateEmergencyContactFromCollection(patientId, emergencyContactId, updatedContact);
        //     } catch (error) {
        //         expect(error.message).toContain('Error al actualizar el contacto de emergencia: Database error');
        //     }
        // });
    });

    describe("deleteEmergencyContactFromCollection", () => {
        afterEach(() => {
            jest.clearAllMocks();
        });

        it("debería eliminar un contacto de emergencia correctamente", async () => {
            patientModel.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });

            const result = await deleteEmergencyContactFromCollection("patient123", "contact456");

            expect(patientModel.updateOne).toHaveBeenCalledWith(
                { patientId: "patient123", "emergencyContact.emergencyContactId": "contact456" },
                { $pull: { emergencyContact: { emergencyContactId: "contact456" } } }
            );
            expect(result.success).toBe(true);
            expect(result.message).toBe("Contacto de emergencia eliminado exitosamente.");
        });

        it("debería retornar un error si el contacto no existe", async () => {
            patientModel.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 0 });

            const result = await deleteEmergencyContactFromCollection("patient123", "contactNotFound");

            expect(result.success).toBe(false);
            expect(result.message).toBe("No se pudo eliminar el contacto de emergencia.");
        });

        it("debería manejar errores internos correctamente", async () => {
            patientModel.updateOne = jest.fn().mockRejectedValue(new Error("Error de conexión"));

            const result = await deleteEmergencyContactFromCollection("patient123", "contact456");

            expect(result.success).toBe(false);
            expect(result.message).toContain("Error al eliminar el contacto de emergencia: Error de conexión");
        });
    });

    // describe('sendEmailToRegisterEmergencyContact', () => {
    //     it('should return an error when email is missing', async () => {
    //         const result = await sendEmailToRegisterEmergencyContact('patient123', 'contact123', '');
    //         expect(result.success).toBe(false);
    //         expect(result.message).toBe("No se pudo enviar el correo de activación al contacto de emergencia.");
    //     });

    //     it('should return an error when patientId or contactId is missing', async () => {
    //         const result = await sendEmailToRegisterEmergencyContact('', 'contact123', 'test@example.com');
    //         expect(result.success).toBe(false);
    //         expect(result.message).toBe("No se pudo enviar el correo de activación al contacto de emergencia.");
    //     });
    // });

    // describe('registerEmergencyContactToActivateEmergencyIntoCollection', () => {
    //     it('should return an error if verification code is incorrect', async () => {
    //         (jwt.verify as jest.Mock).mockReturnValue({ patientId: 'patient123', contactId: 'contact123' });
    //         const redisMock = { get: jest.fn().mockResolvedValue(null) };
    //         (connectToRedis as jest.Mock).mockResolvedValue(redisMock);

    //         const result = await registerEmergencyContactToActivateEmergencyIntoCollection({
    //             verification_code: '123456',
    //             email: 'test@example.com',
    //             password: 'password123',
    //             firstName: 'John',
    //             lastName: 'Doe',
    //             phoneNumber: '1234567890',
    //             verificationToken: ''
    //         }, 'verificationToken');

    //         expect(result.success).toBe(false);
    //         expect(result.message).toBe("El código de verificación es incorrecto");
    //     });

    //     it('should return an error if email already exists in Firebase', async () => {
    //         (jwt.verify as jest.Mock).mockReturnValue({ patientId: 'patient123', contactId: 'contact123' });
    //         const redisMock = { get: jest.fn().mockResolvedValue('123456') };
    //         (connectToRedis as jest.Mock).mockResolvedValue(redisMock);
    //         (firebaseAdmin.createUser as jest.Mock<(...args: any[]) => Promise<any>>).mockImplementation(() => Promise.reject({ code: "auth/email-already-exists" }));            const result = await registerEmergencyContactToActivateEmergencyIntoCollection({
    //             verification_code: '123456',
    //             email: 'test@example.com',
    //             password: 'password123',
    //             firstName: 'John',
    //             lastName: 'Doe',
    //             phoneNumber: '1234567890',
    //             verificationToken: ''
    //         }, 'verificationToken');

    //         expect(result.success).toBe(false);
    //         expect(result.message).toBe("El correo ya está registrado. Intenta con otro.");
    //     });
    // });

});
