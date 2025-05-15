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
                token: "valid-token",
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

        it("should call next with an error if an exception is thrown", async () => {
            const errorMessage = "Unexpected error";
            (addPatientIntoPatientCollection as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

            await registerPatient(req, res, next);

            expect(next).toHaveBeenCalledWith(new Error(errorMessage));
        });
    });
});
