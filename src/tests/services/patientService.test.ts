import { addPatientIntoPatientCollection, addEmergencyToCollection, updatePatientFromCollection, getPatientFromCollection, deletePatientFromCollection } from '../../services/patients/patientService';
import Patient from '../../models/usersModels/patientModel';
import rolesModel from '../../models/usersModels/rolesModel';
import patientEmergencyContactModel from '../../models/usersModels/patientEmergencyContact';
import emergencyModel from '../../models/emergencyModel';
import { publishToExchange } from '../../services/publisherService';
import { firebaseAdmin } from "../../config/firebase-config";

jest.mock('../../models/usersModels/patientModel');
jest.mock('../../models/usersModels/patientEmergencyContact');
jest.mock('../../models/emergencyModel');
jest.mock('../../services/publisherService', () => ({
    publishToExchange: jest.fn().mockResolvedValue(undefined), // Simula que no falla
}));
jest.mock('../../config/firebase-config');
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mocked-uuid')  // Mockea la función para que siempre devuelva 'mocked-uuid'
}));

jest.mock('mongoose', () => {
    const actualMongoose = jest.requireActual('mongoose');
    return {
        ...actualMongoose,
        startSession: jest.fn().mockResolvedValue({
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn(),
        }),
    };
});

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
        Patient.findOne = jest.fn().mockImplementation(() => ({
            session: jest.fn().mockResolvedValue({ email: 'johndoe@example.com' })
        }));    
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
                    emergencyContactId: "contact1",
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

        Patient.findOne = jest.fn().mockImplementation(() => ({
            session: jest.fn().mockResolvedValue(null)
        }));    
        firebaseAdmin.createUser = jest.fn().mockImplementation(() => ({
            session: jest.fn().mockResolvedValue({})
        }));    
    
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
        Patient.findOne = jest.fn().mockImplementation(() => ({
            session: jest.fn().mockResolvedValue(null)
        }));    
    
        firebaseAdmin.createUser = jest.fn().mockResolvedValue({ uid: "patient123" });
    
        Patient.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });
        rolesModel.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });
    
        patientEmergencyContactModel.prototype.save = jest.fn().mockResolvedValue({});
    
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
        expect(result.message).toBe("Paciente agregado exitosamente.");
        expect(result.patientId).toBe("patient123");
    });

    it('should return success but with no changes when patient is already up-to-date', async () => {
        Patient.findOne = jest.fn().mockImplementation(() => ({
            session: jest.fn().mockResolvedValue(null)
        }));    
    
        firebaseAdmin.createUser = jest.fn().mockResolvedValue({ uid: "patient123" });
    
        Patient.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });
        rolesModel.updateOne = jest.fn().mockResolvedValue({ modifiedCount: 0 });
    
        patientEmergencyContactModel.prototype.save = jest.fn().mockResolvedValue({});
    
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

    it("debe devolver un error si el ID del paciente no se proporciona", async () => {
        const result = await updatePatientFromCollection("", {
            firstName: "John",
            lastName: "Doe",
            phoneNumber: "123456789",
            age: 30,
            birthDate: '1995-05-15',
            weight: 70,
            height: 175,
            medications: ["medication1"],
            conditions: ["condition1"],
        });

        expect(result.success).toBe(false);
        expect(result.message).toBe("El ID del paciente es obligatorio.");
    });

    it("debe devolver un error si el paciente no existe", async () => {
        (Patient.findOne as jest.Mock).mockResolvedValue(null);

        const result = await updatePatientFromCollection("12345", {
            firstName: "John",
            lastName: "Doe",
            phoneNumber: "1234567890",
            age: 30,
            birthDate: '01/05/2020',
            weight: 70,
            height: 175,
            medications: ["medication1"],
            conditions: ["condition1"]
        });

        expect(result.success).toBe(false);
        expect(result.message).toBe("No se encontró un paciente con ese ID.");
    });

    it("debe actualizar correctamente un paciente existente", async () => {
        const mockPatient = {
            _id: "12345",
            firstName: "Old Name",
            lastName: "Old Last",
            phoneNumber: "000000000",
            age: 25,
            birthDate: '01/05/2020',
            weight: 65,
            height: 170,
            medications: [],
            conditions: [],
            isDeleted: false,
            save: jest.fn().mockResolvedValue(true), // Simulamos la función de Mongoose
        };

        (Patient.findOne as jest.Mock).mockResolvedValue(mockPatient);

        const result = await updatePatientFromCollection("12345", {
            firstName: "John",
            lastName: "Doe",
            phoneNumber: "1234567890",
            age: 30,
            birthDate: '01/05/2020',
            weight: 70,
            height: 175,
            medications: ["medication1"],
            conditions: ["condition1"], 
        });

        expect(result.success).toBe(true);
        expect(result.message).toBe("Paciente actualizado correctamente");
        expect(mockPatient.save).toHaveBeenCalled();
    });
    describe('getPatientFromCollection', () => {
    
        it('debe devolver un error si el ID del paciente no se proporciona', async () => {
            const result = await getPatientFromCollection("");
    
            expect(result.success).toBe(false);
            expect(result.message).toBe("El ID del paciente es obligatorio.");
        });
    
        it('debe devolver un error si el paciente no existe', async () => {
            (Patient.findOne as jest.Mock).mockResolvedValue(null);
    
            const result = await getPatientFromCollection("12345");
    
            expect(result.success).toBe(false);
            expect(result.message).toBe("No se encontró un paciente con ese ID.");
        });
    
        it('debe devolver el paciente si existe', async () => {
            const mockPatient = { patientId: "12345", firstName: "John", lastName: "Doe" };
            (Patient.findOne as jest.Mock).mockResolvedValue(mockPatient);
    
            const result = await getPatientFromCollection("12345");
    
            expect(result.success).toBe(true);
            expect(result.message).toBe("Paciente obtenido exitosamente.");
            expect(result.data).toEqual(mockPatient);
        });
    
        it('debe manejar errores inesperados', async () => {
            (Patient.findOne as jest.Mock).mockRejectedValue(new Error("Database error"));
    
            const result = await getPatientFromCollection("12345");
    
            expect(result.success).toBe(false);
            expect(result.message).toContain("Error encontrar paciente: Database error");
        });
    });
    
    describe('deletePatientFromCollection', () => {
        
        it('debe devolver un error si el ID del paciente no se proporciona', async () => {
            const result = await deletePatientFromCollection("");
    
            expect(result.success).toBe(false);
            expect(result.message).toBe("El ID del paciente es obligatorio.");
        });
    
        it('debe devolver un error si el paciente no existe', async () => {
            (Patient.findOne as jest.Mock).mockResolvedValue(null);
    
            const result = await deletePatientFromCollection("12345");
    
            expect(result.success).toBe(false);
            expect(result.message).toBe("No se encontró un paciente con ese ID.");
        });
    
        it('debe eliminar el paciente si existe', async () => {
            const mockPatient = { patientId: "12345" };
            (Patient.findOne as jest.Mock).mockResolvedValue(mockPatient);
    
            firebaseAdmin.deleteUser = jest.fn().mockResolvedValue(undefined);
            (Patient.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });
            rolesModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
            (patientEmergencyContactModel.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });
    
            const result = await deletePatientFromCollection("12345");
    
            expect(result.success).toBe(true);
            expect(result.message).toBe("Paciente eliminado exitosamente.");
        });
    
        it('debe manejar errores inesperados', async () => {
            (Patient.findOne as jest.Mock).mockRejectedValue(new Error("Database error"));
    
            const result = await deletePatientFromCollection("12345");
    
            expect(result.success).toBe(false);
            expect(result.message).toContain("Error al eliminar el paciente: Database error");
        });
    
    });

});
