import { addPatientIntoPatientCollection } from '../../services/patients/patientService';
import Patient from '../../models/usersModels/patientModel';
import { firebaseAdmin } from "../../config/firebase-config";

jest.mock('../../models/usersModels/patientModel');
jest.mock('../../config/firebase-config');

describe('addPatientIntoPatientCollection', () => {

    it('should return an error when a required field is missing', async () => {
        const result = await addPatientIntoPatientCollection(
            '',  // firstName is missing
            'Doe',
            'johndoe@example.com',
            'password123',
            '123456789',
            30,
            new Date('1995-05-15'),
            70,
            175,
            [], 
            ['medication1'],
            ['condition1']
        );
    
        expect(result.success).toBe(false);
        expect(result.message).toBe('Error al agregar al paciente: El campo firstName es requerido.');
    });

    it('should return an error if the email is already registered', async () => {
        Patient.findOne = jest.fn().mockResolvedValue({ email: 'johndoe@example.com' }); // Mocked existing patient
    
        const result = await addPatientIntoPatientCollection(
            'John',
            'Doe',
            'johndoe@example.com',
            'password123',
            '123456789',
            30,
            new Date('1995-05-15'),
            70,
            175,
            [
                {
                    firstName: "Jane",
                    lastName: "caceres",
                    email: "jane.doe@example.com",
                    phoneNumber: "1234567990",
                    relationship: "Friend",
                    isDeleted: false
                }
            ],
            ['medication1'],
            ['condition1']
        );
    
        expect(result.success).toBe(false);
        expect(result.message).toBe('El email johndoe@example.com ya está registrado.');
    });

    it('should return an error when Firebase user creation fails', async () => {
        Patient.findOne = jest.fn().mockResolvedValue(null); // No existing patient
        firebaseAdmin.createUser = jest.fn().mockResolvedValue({}); // Firebase creates user but without UID
    
        const result = await addPatientIntoPatientCollection(
            'John',
            'Doe',
            'johndoe@example.com',
            'password123',
            '123456789',
            30,
            new Date('1995-05-15'),
            70,
            175,
            [],
            ['medication1'],
            ['condition1']
        );
    
        expect(result.success).toBe(false);
        expect(result.message).toBe('Error al agregar al paciente: No se pudo crear el usuario en Firebase.');
    });

    it('should return success when the patient is added successfully', async () => {
        Patient.findOne = jest.fn().mockResolvedValue(null); // No existing patient
        firebaseAdmin.createUser = jest.fn().mockResolvedValue({ uid: 'patient123' }); // Firebase user created with UID
    
        Patient.updateOne = jest.fn().mockResolvedValue({ upsertedCount: 1 }); // Mock successful insert
    
        const result = await addPatientIntoPatientCollection(
            'John',
            'Doe',
            'johndoe@example.com',
            'password123',
            '123456789',
            30,
            new Date('1995-05-15'),
            70,
            175,
            [],
            ['medication1'],
            ['condition1']
        );
    
        expect(result.success).toBe(true);
        expect(result.message).toBe('Paciente agregado exitosamente.');
        expect(result.patientId).toBe('patient123');
    });

    it('should return success but with no changes when patient is already up-to-date', async () => {
        Patient.findOne = jest.fn().mockResolvedValue(null); // No existing patient
        firebaseAdmin.createUser = jest.fn().mockResolvedValue({ uid: 'patient123' }); // Firebase user created with UID
    
        Patient.updateOne = jest.fn().mockResolvedValue({ upsertedCount: 0 }); // Mock no changes made
    
        const result = await addPatientIntoPatientCollection(
            'John',
            'Doe',
            'johndoe@example.com',
            'password123',
            '123456789',
            30,
            new Date('1995-05-15'),
            70,
            175,
            [],
            ['medication1'],
            ['condition1']
        );
    
        expect(result.success).toBe(false);
        expect(result.message).toBe('No se realizaron cambios en la base de datos.');
    });

});
