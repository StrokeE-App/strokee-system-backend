import {
    addPatientIntoPatientCollection,
    getAllPatientsFromCollection,
    addEmergencyToCollection,
    getAllEmergencyContactFromCollection,
    getEmergencyContactFromCollection,
    updatePatientFromCollection,
    getPatientFromCollection,
    deletePatientFromCollection
} from "../../services/patients/patientService";
import { patientUpadteSchema } from "../../validationSchemas/patientShemas";
import { notifyOperatorsAboutEmergency } from "../../services/operators/operatorService";
import { publishToExchange } from "../../services/publisherService";
import { sendMessage } from "../../services/whatsappService";
import patientModel from "../../models/usersModels/patientModel";
import rolesModel from "../../models/usersModels/rolesModel";
import emergencyModel from "../../models/emergencyModel";
import patientEmergencyContactModel from "../../models/usersModels/patientEmergencyContact";
import verificationCodeModel from "../../models/verificationCode";
import { validateVerificationCodePatient } from "../../services/utils";
import { firebaseAdmin } from "../../config/firebase-config";
import { v4 as uuidv4 } from "uuid";

jest.mock("../../models/usersModels/patientModel");
jest.mock("../../models/usersModels/rolesModel");
jest.mock("../../models/usersModels/patientEmergencyContact");
jest.mock("../../models/verificationCode");
jest.mock("../../models/emergencyModel");
jest.mock("../../validationSchemas/patientShemas", () => ({
    patientSchema: {
        validate: jest.fn().mockReturnValue({ error: null }), 
    },
    patientUpadteSchema: {
        validate: jest.fn(), 
    },
}))
jest.mock("../../services/whatsappService");
jest.mock("../../services/utils");
jest.mock("uuid");
jest.mock("../../config/firebase-config");
jest.mock('../../services/publisherService', () => ({
    ...jest.requireActual('../../services/publisherService'),
    publishToExchange: jest.fn() // Mock the specific method
}));
jest.mock("../../services/operators/operatorService", () => ({
    notifyOperatorsAboutEmergency: jest.fn(),
}));

describe("Patient", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("debe agregar correctamente un paciente si todo es válido", async () => {
        (validateVerificationCodePatient as jest.Mock).mockResolvedValue({ medicId: "12345" });
        (patientModel.findOne as jest.Mock).mockResolvedValue(null);
        (firebaseAdmin.createUser as jest.Mock).mockResolvedValue({ uid: "firebase123" });
        (patientModel.prototype.save as jest.Mock).mockResolvedValue({});
        (rolesModel.updateOne as jest.Mock).mockResolvedValue({});
        (verificationCodeModel.deleteOne as jest.Mock).mockResolvedValue({});

        const data = {
            firstName: "John",
            lastName: "Doe",
            email: "test@example.com",
            password: "securePassword",
            phoneNumber: "1234567890",
            age: 30,
            birthDate: "1993-05-10",
            weight: 70,
            height: 175,
            emergencyContact: [{ firstName: "Jane", lastName: "Smith", email: "jane@gmail.com", phoneNumber: "0987654321", relationship: "Sister" }],
            medications: [],
            conditions: [],
            token: "valid-token",
            registerDate: "2023-01-01",
            termsAndConditions: true,
        };

        const result = await addPatientIntoPatientCollection(data);

        expect(result).toEqual({
            success: true,
            message: "Paciente agregado exitosamente.",
            patientId: "firebase123",
        });

        expect(patientModel.prototype.save).toHaveBeenCalled();
        expect(firebaseAdmin.createUser).toHaveBeenCalledWith({ email: "test@example.com", password: "securePassword" });
        expect(rolesModel.updateOne).toHaveBeenCalledWith(
            { userId: "firebase123" },
            { $set: { userId: "firebase123", role: "patient", allowedApps: ["patients"] } },
            { upsert: true }
        );
        expect(verificationCodeModel.deleteOne).toHaveBeenCalledWith({ email: "test@example.com", type: "REGISTER_PATIENT" });
    });

    it("debe retornar la lista de pacientes cuando la consulta es exitosa", async () => {
        const mockPatients = [
            {
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com"
            },
            {
                firstName: "Jane",
                lastName: "Smith",
                email: "jane@example.com"
            }
        ];

        (patientModel.find as jest.Mock).mockResolvedValue(mockPatients);

        const result = await getAllPatientsFromCollection();

        expect(result).toEqual(mockPatients);
        expect(patientModel.find).toHaveBeenCalledTimes(1);
        expect(patientModel.find).toHaveBeenCalledWith();
    });

    it("debe crear una emergencia exitosamente para un paciente", async () => {
        const mockPatient = {
            patientId: "12345",
            firstName: "Juan",
            lastName: "Pérez",
            phoneNumber: "123456789",
            height: 170,
            weight: 70
        };

        (patientModel.findOne as jest.Mock).mockResolvedValue(mockPatient);
        (emergencyModel.findOne as jest.Mock).mockResolvedValue(null);
        (uuidv4 as jest.Mock).mockReturnValue("mocked-emergency-id");
        (emergencyModel.prototype.save as jest.Mock).mockResolvedValue({ emergencyId: "mocked-emergency-id" });
        (notifyOperatorsAboutEmergency as jest.Mock).mockResolvedValue({});
        (publishToExchange as jest.Mock).mockResolvedValue({});
        (sendMessage as jest.Mock).mockResolvedValue({});

        const result = await addEmergencyToCollection("12345", "patient");

        expect(result).toEqual({
            success: true,
            message: "Emergencia creada exitosamente.",
            emergencyId: "mocked-emergency-id"
        });

        expect(patientModel.findOne).toHaveBeenCalledWith(
            { patientId: "12345" },
            { firstName: 1, lastName: 1, height: 1, weight: 1, phoneNumber: 1 }
        );
        expect(emergencyModel.findOne).toHaveBeenCalledWith({
            patientId: "12345",
            status: { $in: ["PENDING", "TO_AMBULANCE", "CONFIRMED"] }
        });
        expect(emergencyModel.prototype.save).toHaveBeenCalled();
        expect(notifyOperatorsAboutEmergency).toHaveBeenCalledWith(
            "mocked-emergency-id",
            "12345",
            "Juan Pérez"
        );
        expect(publishToExchange).toHaveBeenCalledWith(
            "patient_exchange",
            "patient_report_queue",
            { emergencyId: "mocked-emergency-id", status: "PENDING" }
        );
        expect(sendMessage).toHaveBeenCalledWith("Juan", "Pérez", "123456789");
    });

    it("debe devolver contactos de emergencia si el paciente los tiene", async () => {
        const mockPatient = {
            emergencyContact: [{ email: "contacto1@example.com" }, { email: "contacto2@example.com" }],
        };
        (patientModel.findOne as jest.Mock).mockResolvedValue(mockPatient);

        const response = await getAllEmergencyContactFromCollection("12345");
        expect(response).toEqual({
            success: true,
            message: "Contactos de emergencia obtenidos exitosamente.",
            data: mockPatient.emergencyContact,
        });
    });

    it("debe devolver contactos de emergencia si el paciente los tiene", async () => {
        const mockPatient = {
            emergencyContact: [{ email: "contacto1@example.com" }, { email: "contacto2@example.com" }],
        };
        (patientModel.findOne as jest.Mock).mockResolvedValue(mockPatient);

        const response = await getEmergencyContactFromCollection("12345");
        expect(response).toEqual({
            success: true,
            message: "Contactos de emergencia obtenidos exitosamente.",
            data: mockPatient.emergencyContact,
        });
    });

    it("debe actualizar el paciente correctamente", async () => {
        const mockPatient = {
            firstName: "Old Name",
            lastName: "Old LastName",
            phoneNumber: "0000000000",
            age: 30,
            birthDate: "1993-01-01",
            weight: 70,
            height: 175,
            medications: [],
            conditions: [],
            save: jest.fn().mockResolvedValue(undefined), // Simula que la función save() se ejecuta correctamente
        };
    
        (patientUpadteSchema.validate as jest.Mock).mockReturnValue({ error: null });
        (patientModel.findOne as jest.Mock).mockResolvedValue(mockPatient);
    
        const patientData = { 
            firstName: "John", 
            lastName: "Doe", 
            phoneNumber: "1234567890",
            age: 35,
            birthDate: "1988-01-01",
            weight: 80,
            height: 180,
            medications: ["aspirin"],
            conditions: ["hypertension"]
        };
    
        const response = await updatePatientFromCollection("12345", patientData);
    
        expect(mockPatient.firstName).toEqual("John");
        expect(mockPatient.lastName).toEqual("Doe");
        expect(mockPatient.phoneNumber).toEqual("1234567890");
        expect(mockPatient.age).toEqual(35);
        expect(mockPatient.birthDate).toEqual("1988-01-01");
        expect(mockPatient.weight).toEqual(80);
        expect(mockPatient.height).toEqual(180);
        expect(mockPatient.medications).toEqual(["aspirin"]);
        expect(mockPatient.conditions).toEqual(["hypertension"]);
        expect(mockPatient.save).toHaveBeenCalled(); // Asegura que se guardó el paciente
        expect(response).toEqual({
            success: true,
            message: "Paciente actualizado correctamente",
        });
    });

    it("debería retornar el paciente si se encuentra en la base de datos", async () => {
        const mockPatient = { firstName: "Juan", lastName: "Pérez", age: 30 };

        (patientModel.findOne as jest.Mock).mockResolvedValue(mockPatient);

        const result = await getPatientFromCollection("123");

        expect(result).toEqual({
            success: true,
            message: "Paciente obtenido exitosamente.",
            data: mockPatient
        });

        expect(patientModel.findOne).toHaveBeenCalledWith(
            { patientId: "123" },
            { _id: 0, createdAt: 0, updatedAt: 0 }
        );
    });

    it("debería eliminar correctamente al paciente", async () => {
        const mockPatient = { patientId: "123" };

        (patientModel.findOne as jest.Mock).mockResolvedValue(mockPatient);
        (patientModel.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });
        (rolesModel.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });
        (patientEmergencyContactModel.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

        const result = await deletePatientFromCollection("123");

        expect(result).toEqual({
            success: true,
            message: "Paciente eliminado exitosamente."
        });

        expect(patientModel.findOne).toHaveBeenCalledWith({ patientId: "123" });
        expect(firebaseAdmin.deleteUser).toHaveBeenCalledWith("123");
        expect(patientModel.deleteOne).toHaveBeenCalledWith({ patientId: "123" });
        expect(rolesModel.deleteOne).toHaveBeenCalledWith({ userId: "123" });
        expect(patientEmergencyContactModel.updateMany).toHaveBeenCalledWith(
            { "patients.patientId": "123" },
            { $pull: { patients: { patientId: "123" } } }
        );
    });
});
