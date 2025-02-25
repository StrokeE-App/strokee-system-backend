import { addHealthCenterIntoCollection } from "../../services/healthCenterStaff/healthCenterService";
import healthCenterModel from "../../models/usersModels/healthCenterModel";
import rolesModel from "../../models/usersModels/rolesModel";
import { firebaseAdmin } from "../../config/firebase-config";
import { healthCenterStaffSchema } from "../../validationSchemas/healthCenterStaff";

jest.mock("../../models/usersModels/healthCenterModel");
jest.mock("../../models/usersModels/rolesModel");
jest.mock("../../config/firebase-config");

const mockSave = jest.fn().mockResolvedValue({});
jest.mock("../../models/usersModels/healthCenterModel", () => {
  return jest.fn().mockImplementation((data) => ({
    ...data,
    save: mockSave,
  }));
});

describe("addHealthCenterIntoCollection", () => {
    afterEach(() => {
        jest.clearAllMocks();
    })
   
    it("debería retornar un error si los datos no son válidos", async () => {
        healthCenterStaffSchema.validate = jest.fn().mockReturnValue({
            error: { details: [{ message: "El campo email es requerido" }] },
        });

        const result = await addHealthCenterIntoCollection({
            email: "",
            firstName: "",
            lastName: "",
            password: ""
        });

        expect(result.success).toBe(false);
        expect(result.message).toBe("Error de validación: El campo email es requerido");
    });

    it("debería retornar un error si el email ya está registrado", async () => {
        healthCenterModel.findOne = jest.fn().mockResolvedValue({ email: "test@example.com" });
        healthCenterStaffSchema.validate = jest.fn().mockReturnValue({ error: null });


        const user = {
            email: "test@gmail.com",
            password: "password123",
            firstName: "John",
            lastName: "Doe",
        }

        const result = await addHealthCenterIntoCollection(user);

        expect(result.success).toBe(false);
        expect(result.message).toBe("El correo electrónico ya esta registrado.");
    });

    it("debería crear un nuevo usuario exitosamente", async () => {
        healthCenterModel.findOne = jest.fn().mockResolvedValue(null);
        firebaseAdmin.createUser = jest.fn().mockResolvedValue({ uid: "12345" }); 
        healthCenterModel.prototype.save = jest.fn().mockImplementation(() => Promise.resolve({ healthCenterId: "12345" }));
        rolesModel.create = jest.fn().mockResolvedValue({});
        
        
        const result = await addHealthCenterIntoCollection({
            email: "newuser@example.com",
            password: "password123",
            firstName: "Jane",
            lastName: "Doe",
        });
        
        healthCenterStaffSchema.validate = jest.fn().mockReturnValue({ error: null });

        expect(result.success).toBe(true);
        expect(result.message).toBe("Integrante de centro de salud agregado correctamente.");
        expect(result.healthCenterId).toBe("12345");
    });

    it("debería manejar errores internos correctamente", async () => {
        healthCenterModel.findOne = jest.fn().mockRejectedValue(new Error("Error de conexión"));

        const user = {
            email: "error@example.com",
            password: "password123",
            firstName: "Test",
            lastName: "User",
        }

        const result = await addHealthCenterIntoCollection(user);

        expect(result.success).toBe(false);
        expect(result.message).toContain("Error al agregar el integrante de centro de salud: Error de conexión");
    });
});
