import { addPatientIntoPatientCollection, addEmergencyToCollection } from '../../services/patients/patientService';
import Patient from '../../models/usersModels/patientModel';
import rolesModel from '../../models/usersModels/rolesModel';
import emergencyModel from '../../models/emergencyModel';
import { publishToExchange } from '../../services/publisherService';
import { firebaseAdmin } from "../../config/firebase-config";
import { v4 as uuidv4 } from 'uuid';

jest.mock('../../models/usersModels/patientModel');
jest.mock('../../models/emergencyModel');
jest.mock('../../services/publisherService', () => ({
    publishToExchange: jest.fn().mockResolvedValue(undefined), // Simula que no falla
}));
jest.mock('../../config/firebase-config');
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mocked-uuid')  // Mockea la función para que siempre devuelva 'mocked-uuid'
}));

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

    it("should return success when the patient is added successfully", async () => {
        Patient.findOne = jest.fn().mockResolvedValue(null);
        
        firebaseAdmin.createUser = jest.fn().mockResolvedValue({ uid: "patient123" });
    
        Patient.updateOne = jest.fn().mockResolvedValue({ upsertedCount: 1 });
    
        rolesModel.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 0 });
    
        const result = await addPatientIntoPatientCollection(
            "John",
            "Doe",
            "johndoe@example.com",
            "password123",
            "123456789",
            30,
            new Date("1995-05-15"),
            70,
            175,
            [],
            ["medication1"],
            ["condition1"]
        );
    
        expect(result.success).toBe(true);
        expect(result.message).toBe("Paciente actualizado exitosamente.");
        expect(result.patientId).toBe("patient123");
    });

    it('should return success but with no changes when patient is already up-to-date', async () => {
        Patient.findOne = jest.fn().mockResolvedValue(null); // No existing patient
        firebaseAdmin.createUser = jest.fn().mockResolvedValue({ uid: 'patient123' }); // Firebase user created with UID
    
        Patient.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 }); // Mock no changes made

        rolesModel.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 0 });
    
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
        expect(result.message).toBe('Paciente actualizado exitosamente.');
    });

    describe('addEmergencyToCollection', () => {
        it('should return an error if patientId is missing', async () => {
            const result = await addEmergencyToCollection('');
            expect(result.success).toBe(false);
            expect(result.message).toBe('El ID del paciente es obligatorio.');
        });
    
        it('should return an error if the patient does not exist', async () => {
            Patient.findOne = jest.fn().mockResolvedValue(null);
            const result = await addEmergencyToCollection('patient123');
            expect(result.success).toBe(false);
            expect(result.message).toBe('No se encontró un paciente con ese ID.');
        });
    
        it('should create an emergency and return success', async () => {
            const mockPatient = {
                firstName: 'John',
                lastName: 'Doe',
                height: 180,
                weight: 75,
                phoneNumber: '123456789',
            };
    
            Patient.findOne = jest.fn().mockResolvedValue(mockPatient);
    
            const saveMock = jest.fn().mockResolvedValue({
                emergencyId: 'mocked-uuid',
            });
            emergencyModel.prototype.save = saveMock; 
    
            const result = await addEmergencyToCollection('patient123');
    
            expect(result.success).toBe(true);
            expect(result.message).toBe('Emergencia creada exitosamente.');
            expect(result.emergencyId).toBe('mocked-uuid');
    
            expect(publishToExchange).toHaveBeenCalledWith('patient_exchange', 'patient_report_queue', {
                emergencyId: 'mocked-uuid',
                status: 'PENDING',
            });
    
            expect(saveMock).toHaveBeenCalled();
        });
    
        it('should return an error if an exception occurs', async () => {
            Patient.findOne = jest.fn().mockRejectedValue(new Error('Database error'));
            const result = await addEmergencyToCollection('patient123');
            expect(result.success).toBe(false);
            expect(result.message).toContain('Error al agregar la emergencia: Database error');
        });
    });

});
