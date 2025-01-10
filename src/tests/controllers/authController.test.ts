import { registerPatient } from "../../controllers/patients/patientController";
import { addPatientIntoPatientCollection } from "../../services/patients/patientService";

jest.mock("../../services/patients/patientService");

describe("Patient Controller", () => {
    let req: any;
    let res: any;
    let next: jest.Mock;

    beforeEach(() => {
        req = {
            body: {
                firstName: "John",
                lastName: "Doe",
                email: "johndoe@example.com",
                password: "securePassword",
                phoneNumber: "1234567890",
                age: 30,
                birthDate: "1993-01-01",
                weight: 70,
                height: 175,
                medications: ["med1", "med2"],
                conditions: ["condition1", "condition2"],
            },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        next = jest.fn();

        jest.clearAllMocks();
    });

    describe("registerPatient", () => {
        it("should return 201 and patientId on successful registration", async () => {
            const mockedResult = {
                success: true,
                message: "Patient registered successfully.",
                patientId: "12345",
            };

            (addPatientIntoPatientCollection as jest.Mock).mockResolvedValueOnce(mockedResult);

            await registerPatient(req, res, next);

            expect(addPatientIntoPatientCollection).toHaveBeenCalledWith(
                req.body.firstName,
                req.body.lastName,
                req.body.email,
                req.body.password,
                req.body.phoneNumber,
                req.body.age,
                req.body.birthDate,
                req.body.weight,
                req.body.height,
                req.body.emergencyContact,
                req.body.medications,
                req.body.conditions
            );

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: mockedResult.message,
                patientId: mockedResult.patientId,
            });
        });

        it("should return 400 if registration fails", async () => {
            const mockedResult = {
                success: false,
                message: "Email already exists.",
            };

            (addPatientIntoPatientCollection as jest.Mock).mockResolvedValueOnce(mockedResult);

            await registerPatient(req, res, next);

            expect(addPatientIntoPatientCollection).toHaveBeenCalledWith(
                req.body.firstName,
                req.body.lastName,
                req.body.email,
                req.body.password,
                req.body.phoneNumber,
                req.body.age,
                req.body.birthDate,
                req.body.weight,
                req.body.height,
                req.body.emergencyContact,
                req.body.medications,
                req.body.conditions
            );

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: mockedResult.message,
            });
        });

        it("should call next with an error if an exception is thrown", async () => {
            const errorMessage = "Unexpected error";
            (addPatientIntoPatientCollection as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

            await registerPatient(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error(errorMessage));
        });
    });
});
