import { validateParamedicFields, addParamedicIntoCollection, getAllActiveEmergenciesFromCollection } from '../../services/paramedics/paramedicService';
import paramedicModel from '../../models/usersModels/paramedicModel';
import emergencyModel from '../../models/emergencyModel';
import { firebaseAdmin } from "../../config/firebase-config";

jest.mock('../../models/usersModels/paramedicModel');
jest.mock('../../models/emergencyModel');
jest.mock('../../models/usersModels/patientModel');
jest.mock('../../config/firebase-config');

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
        firebaseAdmin.setCustomUserClaims = jest.fn().mockResolvedValue(true);
        paramedicModel.updateOne = jest.fn().mockResolvedValue({ upsertedCount: 1 });

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

    it('should return success but with no changes when paramedic is already up-to-date', async () => {
        paramedicModel.findOne = jest.fn().mockResolvedValue(null);
        firebaseAdmin.createUser = jest.fn().mockResolvedValue({ uid: 'paramedic123' });
        firebaseAdmin.setCustomUserClaims = jest.fn().mockResolvedValue(true);
        paramedicModel.updateOne = jest.fn().mockResolvedValue({ upsertedCount: 0 });

        const result = await addParamedicIntoCollection(
            'ambulance123',
            'John',
            'Doe',
            'johndoe@example.com',
            'password123'
        );

        expect(result.success).toBe(false);
        expect(result.message).toBe('No se realizaron cambios en la base de datos.');
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

    it('should return an error when userId is missing', async () => {
        const result = await getAllActiveEmergenciesFromCollection('');
        expect(result.success).toBe(false);
        expect(result.message).toBe('El el userId es obligatorio');
    });

    it('should return an error message if userId is missing', async () => {
        const result = await getAllActiveEmergenciesFromCollection('');
        expect(result.success).toBe(false);
        expect(result.message).toBe('El el userId es obligatorio');
      });
    
      it('should return an error message if paramedic is not found', async () => {
        paramedicModel.findOne = jest.fn().mockResolvedValue(null); 
    
        const result = await getAllActiveEmergenciesFromCollection('ambulance123');
        expect(result.success).toBe(false);
        expect(result.message).toBe('Paramédico no encontrado.');
      });
    
      it('should return an empty message if no active emergencies are found', async () => {
        // Simulate paramedic found
        paramedicModel.findOne = jest.fn().mockResolvedValue({ ambulanceId: 'AMB123' });
        emergencyModel.aggregate = jest.fn().mockResolvedValue([]); 
    
        const result = await getAllActiveEmergenciesFromCollection('ambulance123');
        expect(result.success).toBe(true);
        expect(result.message).toBe('No se encontraron emergencias');
      });
    
      it('should return active emergencies with patient details if found', async () => {
        const mockEmergency = {
          emergencyId: '123',
          status: 'ACTIVE',
          patientId: 'patient123',
          startDate: '2022-01-01',
          pickupDate: '2022-01-02',
          deliveredDate: '2022-01-03',
          nihScale: 10,
          patient: {
            age: 24,
            firstName: "John",
            height: 101,
            lastName: "Doe",
            phoneNumber: "3057479364",
            weight: 74.5
          }
        };
    
        // Simulate paramedic found
        paramedicModel.findOne = jest.fn().mockResolvedValue({ ambulanceId: 'AMB123' });
        emergencyModel.aggregate = jest.fn().mockResolvedValue([mockEmergency]);
    
        const result = await getAllActiveEmergenciesFromCollection('ambulance123');
    
        expect(result.success).toBe(true);
        expect(result.message).toBe('Emergencias encontradas');
        expect(result.data).toHaveLength(1);
        expect(result.data).toBeDefined();
        expect(result.data?.[0].patient).toBeDefined();
      });
    
      it('should handle errors gracefully if an error occurs in the service', async () => {
        const mockError = new Error('Database error');
    
        paramedicModel.findOne = jest.fn().mockResolvedValue({ ambulanceId: 'AMB123' });
        emergencyModel.aggregate = jest.fn().mockRejectedValue(mockError); 
    
        const result = await getAllActiveEmergenciesFromCollection('ambulance123');
    
        expect(result.success).toBe(false);
        expect(result.message).toBe('Error al consultar las emergencias: Database error');
      });

});
