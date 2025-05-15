import {
    addParamedicIntoCollection,
    updateEmergencyPickUpFromCollection,
    cancelEmergencyCollection,
    updateParamedicFromCollection,
    getParamedicsFromCollection,
    deleteParamedicsFromCollection,
    getPatientDeliverdToHealthCenter
} from '../../services/paramedics/paramedicService';
import { getAllEmergencyContactFromCollection } from '../../services/patients/patientService';
import paramedicModel from '../../models/usersModels/paramedicModel';
import clinicModel from '../../models/usersModels/healthCenterModel';
import rolesModel from '../../models/usersModels/rolesModel';
import Patient from '../../models/usersModels/patientModel';
import emergencyModel from '../../models/emergencyModel';
import { sendNotification } from '../../services/mail';
import { firebaseAdmin } from "../../config/firebase-config";
import { publishToExchange } from "../../services/publisherService";
import { notifyHealthCenterAboutEmergency } from '../../services/healthCenterStaff/healthCenterService';

jest.mock('../../models/usersModels/paramedicModel');
jest.mock('../../models/usersModels/healthCenterModel');
jest.mock('../../models/usersModels/patientModel');
jest.mock('../../models/emergencyModel');
jest.mock('../../config/firebase-config');
jest.mock('../../models/usersModels/rolesModel', () => ({
    deleteOne: jest.fn(),
}));
jest.mock('../../services/publisherService', () => ({
    ...jest.requireActual('../../services/publisherService'),
    publishToExchange: jest.fn() // Mock the specific method
}));

jest.mock('../../services/mail', () => ({
    sendNotification: jest.fn(),
}));
jest.mock('../../services/patients/patientService');

jest.mock('../../services/healthCenterStaff/healthCenterService', () => ({
    notifyHealthCenterAboutEmergency: jest.fn(),
}));
jest.mock('../../services/patients/patientService', () => ({
    getAllEmergencyContactFromCollection: jest.fn(),
}));

describe('Paramedic', () => {

    it('should successfully mark emergency as delivered', async () => {
        // Mock data
        const mockEmergency = {
          emergencyId: 'emergency-123',
          ambulanceId: 'ambulance-456',
          status: 'DELIVERED',
          deliveredDate: new Date('2023-01-01T12:00:00Z')
        };
    
        // Mock implementations
        (emergencyModel.findOneAndUpdate as jest.Mock).mockResolvedValue(mockEmergency);    
        // Execute
        const result = await getPatientDeliverdToHealthCenter(
          'emergency-123',
          new Date('2023-01-01T12:00:00Z')
        );
    
        // Assertions
        expect(result.success).toBe(true);
        expect(result.code).toBe(200);
        expect(emergencyModel.findOneAndUpdate).toHaveBeenCalledWith(
          { emergencyId: 'emergency-123' },
          { 
            $set: { 
              status: 'DELIVERED',
              deliveredDate: expect.any(Date)
            } 
          },
          { returnDocument: 'after' }
        );
        expect(notifyHealthCenterAboutEmergency).toHaveBeenCalled();
        expect(publishToExchange).toHaveBeenCalledWith(
          'paramedic_exchange',
          'paramedic_update_queue',
          expect.objectContaining({
            status: 'DELIVERED'
          })
        );
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
