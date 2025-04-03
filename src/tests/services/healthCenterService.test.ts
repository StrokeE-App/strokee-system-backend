import {
    addHealthCenterIntoCollection,
    deleteHealthCenterStaff,
    updateHealthCenterStaff,
    getHealthCenterStaff,
    getPatientAttendedByHealthCenter,
    sendEmailToRegisterPatient,
    notifyHealthCenterAboutEmergency
} from "../../services/healthCenterStaff/healthCenterService"
import clinicModel from "../../models/usersModels/clinicModel";
import healthCenterModel from "../../models/usersModels/healthCenterModel";
import rolesModel from "../../models/usersModels/rolesModel";
import modelVerificationCode from "../../models/verificationCode";
import emergencyModel from "../../models/emergencyModel";
import { firebaseAdmin, firebaseMessaging } from "../../config/firebase-config";
import { publishToExchange } from "../../services/publisherService";
import { healthCenterStaffSchema } from "../../validationSchemas/healthCenterStaff";
import { sendPatientRegistrationEmail } from "../../services/mail";

jest.mock("../../models/usersModels/clinicModel"); // Mock de clinicModel
jest.mock("../../models/usersModels/healthCenterModel"); // Mock de healthCenterModel
jest.mock("../../models/usersModels/healthCenterModel"); // Mock de healthCenterModel
jest.mock("../../models/verificationCode"); // Mock de modelVerificationCode
jest.mock("../../models/usersModels/rolesModel"); // Mock de rolesModel
jest.mock("../../config/firebase-config", () => ({
    firebaseAdmin: {
        createUser: jest.fn(), // Mock de la función createUser de Firebase
    }
}));

jest.mock("../../validationSchemas/healthCenterStaff", () => ({
    healthCenterStaffSchema: {
        validate: jest.fn().mockReturnValue({ error: null }),
    },
    updateHealthCenterStaffSchema: {
        validate: jest.fn().mockReturnValue({ error: null }),
    },
}));

jest.mock('../../services/publisherService', () => ({
    ...jest.requireActual('../../services/publisherService'),
    publishToExchange: jest.fn() // Mock the specific method
}));


jest.mock('../../services/mail', () => ({
    sendPatientRegistrationEmail: jest.fn().mockResolvedValue(true),
}));

describe("addHealthCenterIntoCollection", () => {
    afterEach(() => {
        jest.clearAllMocks(); // Limpia los mocks después de cada prueba
    });

    const mockedSendPatientRegistrationEmail = jest.mocked(sendPatientRegistrationEmail);

    it("should successfully create health center staff when all data is valid", async () => {
        // Mock data
        const mockStaff = {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            password: "securePassword123",
            healthcenterId: "12345"
        };

        // Mock dependencies
        clinicModel.findOne = jest.fn().mockResolvedValue({}); // Clinic exists
        healthCenterModel.findOne = jest.fn().mockResolvedValue(null); // Email not taken
        firebaseAdmin.createUser = jest.fn().mockResolvedValue({ uid: "firebase-uid" });
        healthCenterModel.prototype.save = jest.fn().mockResolvedValue({ medicId: "firebase-uid" });
        rolesModel.create = jest.fn().mockResolvedValue({});

        // Execute
        const result = await addHealthCenterIntoCollection(mockStaff);

        // Assertions
        expect(result.success).toBe(true);
        expect(result.message).toContain("correctamente");
        expect(clinicModel.findOne).toHaveBeenCalledWith({ healthcenterId: mockStaff.healthcenterId });
        expect(healthCenterModel.findOne).toHaveBeenCalledWith({ email: mockStaff.email });
        expect(firebaseAdmin.createUser).toHaveBeenCalled();

    });

    it("should successfully delete health center staff when user exists", async () => {
        // Mock data
        const userId = "valid-user-id";
        const mockStaff = { medicId: userId };

        // Mock dependencies
        healthCenterModel.findOne = jest.fn().mockResolvedValue(mockStaff);
        healthCenterModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
        firebaseAdmin.deleteUser = jest.fn().mockResolvedValue(true);
        rolesModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });

        // Execute
        const result = await deleteHealthCenterStaff(userId);

        // Assertions
        expect(result.success).toBe(true);
        expect(result.message).toContain("correctamente");
        expect(healthCenterModel.findOne).toHaveBeenCalledWith({ medicId: userId });
        expect(healthCenterModel.deleteOne).toHaveBeenCalledWith({ medicId: userId });
        expect(firebaseAdmin.deleteUser).toHaveBeenCalledWith(userId);
        expect(rolesModel.deleteOne).toHaveBeenCalledWith({ userId });
    });

    it("should successfully update health center staff when data is valid", async () => {
        // Mock data
        const userId = "valid-user-id";
        const updateData = {
            firstName: "Updated",
            lastName: "Name"
        };
        const mockUpdatedStaff = {
            medicId: userId,
            firstName: "Updated",
            lastName: "Name",
            email: "original@example.com"
        };

        // Mock dependencies
        healthCenterModel.findOneAndUpdate = jest.fn().mockResolvedValue(mockUpdatedStaff);

        // Execute
        const result = await updateHealthCenterStaff(userId, updateData);
        console.log(result);

        // Assertions
        expect(result.success).toBe(true);
        expect(result.message).toContain("correctamente");
        expect(healthCenterModel.findOneAndUpdate).toHaveBeenCalledWith(
            { medicId: userId },
            {
                $set: {
                    firstName: updateData.firstName,
                    lastName: updateData.lastName
                }
            },
            { new: true }
        );
        expect(result.updatedHealthCenterStaff).toEqual(mockUpdatedStaff);
    });

    it("should successfully retrieve health center staff when user exists", async () => {
        // Mock data
        const userId = "valid-user-id";
        const mockStaff = {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            healthcenterId: "12345"
        };

        // Mock dependencies
        healthCenterModel.findOne = jest.fn().mockResolvedValue(mockStaff);

        // Execute
        const result = await getHealthCenterStaff(userId);

        // Assertions
        expect(result.success).toBe(true);
        expect(result.message).toContain("correctamente");
        expect(healthCenterModel.findOne).toHaveBeenCalledWith(
            { medicId: userId },
            { _id: 0, medicId: 0, createdAt: 0, updatedAt: 0 }
        );
        expect(result.healthCenterStaff).toEqual(mockStaff);
    });

    it("should successfully mark emergency as attended", async () => {
        // Mock data
        const emergencyId = "emergency-123";
        const attendedDate = new Date();
        const mockEmergency = {
            emergencyId,
            ambulanceId: "ambulance-456",
            status: "ATTENDED",
            attendedDate
        };

        // Mock dependencies
        emergencyModel.findOneAndUpdate = jest.fn().mockResolvedValue(mockEmergency);
        (publishToExchange as jest.Mock).mockResolvedValue({});

        // Execute
        const result = await getPatientAttendedByHealthCenter(emergencyId, attendedDate);

        // Assertions
        expect(result.success).toBe(true);
        expect(result.code).toBe(200);
        expect(emergencyModel.findOneAndUpdate).toHaveBeenCalledWith(
            { emergencyId },
            { $set: { status: "ATTENDED", attendedDate: expect.any(Date) } },
            { returnDocument: "after" }
        );
        expect(publishToExchange).toHaveBeenCalledTimes(2);
        expect(publishToExchange).toHaveBeenCalledWith(
            "paramedic_exchange",
            "paramedic_update_queue",
            {
                ambulanceId: mockEmergency.ambulanceId,
                emergencyId,
                status: "ATTENDED"
            }
        );
    });

    it("should successfully send registration email when all data is valid", async () => {
        // Mock data
        const email = "test@example.com";
        const medicId = "medic-123";
        const code = "123456";
        const mockStaff = { medicId, email: "staff@clinic.com" };

        // Mock dependencies
        healthCenterModel.findOne = jest.fn().mockResolvedValue(mockStaff);
        modelVerificationCode.findOneAndUpdate = jest.fn().mockResolvedValue({});
        mockedSendPatientRegistrationEmail.mockResolvedValue(Promise.resolve());
        jest.spyOn(Math, 'random').mockReturnValue(0.123); // Fixed code generation

        // Execute
        const result = await sendEmailToRegisterPatient(email, medicId);

        // Assertions
        expect(result.success).toBe(true);
        expect(result.message).toContain("Se envió un correo");
        expect(healthCenterModel.findOne).toHaveBeenCalledWith({ medicId });

    });

});
