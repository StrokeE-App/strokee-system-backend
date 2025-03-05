import {
    validateParamedicFields,
    addParamedicIntoCollection,
    updateEmergencyPickUpFromCollection,
    cancelEmergencyCollection,
    updateParamedicFromCollection,
    getParamedicsFromCollection,
    deleteParamedicsFromCollection
} from '../../services/paramedics/paramedicService';
import { getAllEmergencyContactFromCollection } from '../../services/patients/patientService';
import paramedicModel from '../../models/usersModels/paramedicModel';
import rolesModel from '../../models/usersModels/rolesModel';
import Patient from '../../models/usersModels/patientModel';
import emergencyModel from '../../models/emergencyModel';
import { sendNotification } from '../../services/mail';
import { firebaseAdmin } from "../../config/firebase-config";
import * as messagePublisher from '../../services/publisherService';

jest.mock('../../models/usersModels/paramedicModel');
jest.mock('../../models/usersModels/patientModel');
jest.mock('../../models/emergencyModel');
jest.mock('../../config/firebase-config');
jest.mock('../../models/usersModels/rolesModel', () => ({
    deleteOne: jest.fn(),
})); jest.mock('../../services/publisherService', () => ({
    ...jest.requireActual('../../services/publisherService'),
    publishToExchange: jest.fn() // Mock the specific method
}));

jest.mock('../../services/mail', () => ({
    sendNotification: jest.fn(),
}));
jest.mock('../../services/patients/patientService');

describe('Paramedic', () => {
    it('should return "ambulanceId" when ambulanceId is missing', () => {
        const result = validateParamedicFields('', 'John', 'Doe', 'john.doe@example.com', 'password123');
        expect(result).toBe('ambulanceId');
    });

    it('should return "firstName" when firstName is missing', () => {
        const result = validateParamedicFields('AMB123', '', 'Doe', 'john.doe@example.com', 'password123');
        expect(result).toBe('firstName');
    });

    it('should return "lastName" when lastName is missing', () => {
        const result = validateParamedicFields('AMB123', 'John', '', 'john.doe@example.com', 'password123');
        expect(result).toBe('lastName');
    });

    it('should return "email" when email is missing', () => {
        const result = validateParamedicFields('AMB123', 'John', 'Doe', '', 'password123');
        expect(result).toBe('email');
    });

    it('should return "password" when password is missing', () => {
        const result = validateParamedicFields('AMB123', 'John', 'Doe', 'john.doe@example.com', '');
        expect(result).toBe('password');
    });

    it('should return null when all fields are provided', () => {
        const result = validateParamedicFields('AMB123', 'John', 'Doe', 'john.doe@example.com', 'password123');
        expect(result).toBeNull();
    });

    it('should return an error when a required field is missing', async () => {
        const result = await addParamedicIntoCollection(
            '',
            'John',
            'Doe',
            'johndoe@example.com',
            'password123'
        );

        expect(result.success).toBe(false);
        expect(result.message).toBe('Error al agregar al paramedico: El campo ambulanceId es requerido.');
    });

    it('should return an error if the email is already registered', async () => {
        paramedicModel.findOne = jest.fn().mockResolvedValue({ email: 'johndoe@example.com' });

        const result = await addParamedicIntoCollection(
            'ambulance123',
            'John',
            'Doe',
            'johndoe@example.com',
            'password123'
        );

        expect(result.success).toBe(false);
        expect(result.message).toBe('El email johndoe@example.com ya está registrado.');
    });

    it('should return an error when Firebase user creation fails', async () => {
        paramedicModel.findOne = jest.fn().mockResolvedValue(null);
        firebaseAdmin.createUser = jest.fn().mockResolvedValue({});

        const result = await addParamedicIntoCollection(
            'ambulance123',
            'John',
            'Doe',
            'johndoe@example.com',
            'password123'
        );

        expect(result.success).toBe(false);
        expect(result.message).toBe('Error al agregar al paramedico: No se pudo crear el usuario en Firebase.');
    });

    it('should return success when the paramedic is added successfully', async () => {
        paramedicModel.findOne = jest.fn().mockResolvedValue(null);
        firebaseAdmin.createUser = jest.fn().mockResolvedValue({ uid: 'paramedic123' });
        paramedicModel.updateOne = jest.fn().mockResolvedValue({ upsertedCount: 1 });
        rolesModel.updateOne = jest.fn().mockResolvedValue({ upsertedCount: 1 });


        const result = await addParamedicIntoCollection(
            'ambulance123',
            'John',
            'Doe',
            'johndoe@example.com',
            'password123'
        );

        expect(result.success).toBe(true);
        expect(result.message).toBe('Paramedico agregado exitosamente.');
        expect(result.ambulanceId).toBe('paramedic123');
    });

    it('should return an error if the firstName exceeds character limits', async () => {
        paramedicModel.findOne = jest.fn().mockResolvedValue(null);

        const longName = 'J'.repeat(101);
        const result = await addParamedicIntoCollection(
            'ambulance123',
            longName,
            'Doe',
            'johndoe@example.com',
            'password123'
        );

        expect(result.success).toBe(false);
        expect(result.message).toBe(`Error al agregar al paramedico: El nombre ${longName} excede el límite de caracteres permitido.`);
    });

    it('should return an error if the email format is invalid', async () => {
        paramedicModel.findOne = jest.fn().mockResolvedValue(null);

        const invalidEmail = 'invalid-email';
        const result = await addParamedicIntoCollection(
            'ambulance123',
            'John',
            'Doe',
            invalidEmail,
            'password123'
        );

        expect(result.success).toBe(false);
        expect(result.message).toBe(`Error al agregar al paramedico: El correo electrónico ${invalidEmail} no tiene un formato válido.`);
    });

    describe('updateEmergencyPickUpFromCollection', () => {
        it('should return error if emergencyId is missing', async () => {
            const result = await updateEmergencyPickUpFromCollection('', '2025-01-01T10:00:00Z');
            expect(result.success).toBe(false);
            expect(result.message).toBe('El ID de emergencia es obligatorio.');
        });

        it('should return error if pickupDate is missing', async () => {
            const result = await updateEmergencyPickUpFromCollection('emergency123', '');
            expect(result.success).toBe(false);
            expect(result.message).toBe('La fecha de recogida es obligatoria.');
        });

        it('should return error if pickupDate is invalid', async () => {
            const result = await updateEmergencyPickUpFromCollection('emergency123', 'invalid-date');
            expect(result.success).toBe(false);
            expect(result.message).toBe('La fecha de recogida no es válida.');
        });

        it('should confirm emergency and send notifications when successful', async () => {
            (emergencyModel.findOneAndUpdate as jest.Mock).mockResolvedValue({ emergencyId: 'emergency123', patientId: 'patient123' });
            (Patient.findOne as jest.Mock).mockResolvedValue({ patientId: 'patient123', firstName: 'John', lastName: 'Doe' });
            (getAllEmergencyContactFromCollection as jest.Mock).mockResolvedValue({ data: [{ email: 'contact@example.com' }] });
            
            const result = await updateEmergencyPickUpFromCollection('emergency123', '2024-03-05T12:00:00Z');
            
            expect(result.success).toBe(true);
            expect(result.message).toBe('Emergencia confirmada y mensaje enviado.');
            expect(messagePublisher.publishToExchange).toHaveBeenCalledWith(
                'paramedic_exchange', 'paramedic_update_queue',
                { emergencyId: 'emergency123', pickupDate: '2024-03-05T12:00:00.000Z', status: 'CONFIRMED' }
            );
            expect(sendNotification).toHaveBeenCalledWith('contact@example.com', 'John', 'Doe');
        });
        
        it('should handle errors gracefully', async () => {
            const mockError = new Error('Database error');
            emergencyModel.findOneAndUpdate = jest.fn().mockRejectedValue(mockError);
        
            const result = await updateEmergencyPickUpFromCollection('emergency123', '2025-01-01T10:00:00Z');
        
            expect(result.success).toBe(false);
            expect(result.message).toBe('Error al actualizar la hora de recogida: Database error');
        });
    });

    describe('cancelEmergencyCollection', () => {
        it('should return error if emergencyId is missing', async () => {
            const result = await cancelEmergencyCollection('', '2025-01-01T10:00:00Z');
            expect(result.success).toBe(false);
            expect(result.message).toBe('El ID de emergencia es obligatorio.');
        });

        it('should return error if pickupDate is missing', async () => {
            const result = await cancelEmergencyCollection('emergency123', '');
            expect(result.success).toBe(false);
            expect(result.message).toBe('La fecha de recogida es obligatoria.');
        });

        it('should return error if pickupDate is invalid', async () => {
            const result = await cancelEmergencyCollection('emergency123', 'invalid-date');
            expect(result.success).toBe(false);
            expect(result.message).toBe('La fecha de recogida no es válida.');
        });

        it('should cancel the emergency collection successfully', async () => {
            const mockUpdate = jest.fn().mockResolvedValue({ nModified: 1 });
            emergencyModel.updateOne = mockUpdate;

            const result = await cancelEmergencyCollection('emergency123', '2025-01-01T10:00:00Z');
            expect(result.success).toBe(true);
            expect(result.message).toBe('Emergencia stroke descartada.');
            expect(mockUpdate).toHaveBeenCalledWith(
                { emergencyId: 'emergency123' },
                { $set: { pickupDate: '2025-01-01T10:00:00.000Z', status: 'CANCELLED' } },
                { upsert: false }
            );
        });

        it('should handle errors gracefully', async () => {
            const mockError = new Error('Database error');
            emergencyModel.updateOne = jest.fn().mockRejectedValue(mockError);

            const result = await cancelEmergencyCollection('emergency123', '2025-01-01T10:00:00Z');
            expect(result.success).toBe(false);
            expect(result.message).toBe('Error al descartar la emergencia: Database error');
        });
    });

    it('should update the paramedic successfully', async () => {
        (paramedicModel.findOne as jest.Mock).mockResolvedValue({ paramedicId: 'paramedic123' });
        (paramedicModel.updateOne as jest.Mock).mockResolvedValue({ nModified: 1 });

        const result = await updateParamedicFromCollection('paramedic123', { firstName: 'John', lastName: 'Doe', ambulanceId: 'AMB123' });

        expect(result.success).toBe(true);
        expect(result.message).toBe('paramedico actualizado correctamente');
        expect(paramedicModel.updateOne).toHaveBeenCalledWith(
            { paramedicId: 'paramedic123' },
            { $set: { firstName: 'John', lastName: 'Doe', ambulanceId: 'AMB123' } }
        );
    });

    it('should handle errors gracefully', async () => {
        const mockError = new Error('Database error');
        (paramedicModel.findOne as jest.Mock).mockRejectedValue(mockError);

        const result = await updateParamedicFromCollection('paramedic123', { firstName: 'John', lastName: 'Doe', ambulanceId: 'AMB123' });

        expect(result.success).toBe(false);
        expect(result.message).toBe('Error al actualizar el paramedico: Database error');
    });

    it('should return paramedic data successfully', async () => {
        const mockParamedic = {
            ambulanceId: 'AMB001',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
        };

        (paramedicModel.findOne as jest.Mock).mockResolvedValue(mockParamedic);

        const result = await getParamedicsFromCollection('paramedic123');

        expect(result.success).toBe(true);
        expect(result.message).toBe('Paramedico encontrado exitosamente.');
        expect(result.paramedics).toEqual(mockParamedic);
    });

    it('should handle errors gracefully', async () => {
        const mockError = new Error('Database error');
        (paramedicModel.findOne as jest.Mock).mockRejectedValue(mockError);

        const result = await getParamedicsFromCollection('paramedic123');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Error al encontrar el paramedico: Database error');
    });

    it("should return error if paramedicId is missing", async () => {
        const result = await deleteParamedicsFromCollection("");
        expect(result.success).toBe(false);
        expect(result.message).toBe("El ID del paramedico es obligatorio.");
    });

    it("should return error if paramedic does not exist", async () => {
        (paramedicModel.findOne as jest.Mock).mockResolvedValue(null);

        const result = await deleteParamedicsFromCollection("paramedic123");
        expect(result.success).toBe(false);
        expect(result.message).toBe("No se encontró un paciente con ese ID.");
    });

    it("should delete paramedic successfully", async () => {
        (paramedicModel.findOne as jest.Mock).mockResolvedValue({ paramedicId: "paramedic123" });
        (firebaseAdmin.deleteUser as jest.Mock).mockResolvedValue({});
        (paramedicModel.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });
        (rolesModel.deleteOne as jest.Mock).mockResolvedValue({});

        const result = await deleteParamedicsFromCollection("paramedic123");

        expect(result.success).toBe(true);
        expect(result.message).toBe("Paramedico eliminado exitosamente.");
        expect(firebaseAdmin.deleteUser).toHaveBeenCalledWith("paramedic123");
        expect(paramedicModel.deleteOne).toHaveBeenCalledWith({ paramedicId: "paramedic123" });
        expect(rolesModel.deleteOne).toHaveBeenCalledWith({ userId: "paramedic123" });
    });

    it("should handle errors gracefully", async () => {
        const mockError = new Error("Database error");
        (paramedicModel.findOne as jest.Mock).mockRejectedValue(mockError);

        const result = await deleteParamedicsFromCollection("paramedic123");

        expect(result.success).toBe(false);
        expect(result.message).toBe("Error al eliminar el paramedico: Database error");
    });

});
