import { addHealthCenterIntoCollection, deleteHealthCenterStaff, updateHealthCenterStaff, getHealthCenterStaff } from "../../services/healthCenterStaff/healthCenterService";
import healthCenterModel from "../../models/usersModels/healthCenterModel";
import rolesModel from "../../models/usersModels/rolesModel";
import { firebaseAdmin } from "../../config/firebase-config";
import { healthCenterStaffSchema, updateHealthCenterStaffSchema  } from "../../validationSchemas/healthCenterStaff";

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
        expect(result.message).toBe("El correo electrónico ya está registrado.");
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

    describe("deleteHealthCenterStaff", () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        it("debería eliminar un integrante del centro de salud correctamente", async () => {
            healthCenterModel.findOne = jest.fn().mockResolvedValue({ medicId: "12345" }); // Simula que el integrante existe
            healthCenterModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
            firebaseAdmin.deleteUser = jest.fn().mockResolvedValue({});
            rolesModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
        
            const result = await deleteHealthCenterStaff("12345");
        
            expect(healthCenterModel.findOne).toHaveBeenCalledWith({ medicId: "12345", isDeleted: false });
            expect(healthCenterModel.deleteOne).toHaveBeenCalledWith({ medicId: "12345", isDeleted: false });
            expect(firebaseAdmin.deleteUser).toHaveBeenCalledWith("12345");
            expect(rolesModel.deleteOne).toHaveBeenCalledWith({ userId: "12345" });
        
            expect(result.success).toBe(true);
            expect(result.message).toBe("Integrante de centro de salud eliminado correctamente.");
        });
    
        it("debería retornar un error si el integrante no se encuentra", async () => {
            healthCenterModel.findOne = jest.fn().mockResolvedValue(null); // Simula que no se encuentra el usuario
        
            const result = await deleteHealthCenterStaff("notfound");
        
            expect(healthCenterModel.findOne).toHaveBeenCalledWith({ medicId: "notfound", isDeleted: false });
        
            expect(result.success).toBe(false);
            expect(result.message).toBe("No se encontró el integrante del centro de salud o ya fue eliminado.");
        });
    });
    
    describe("updateHealthCenterStaff", () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        it("debería actualizar los datos de un integrante correctamente", async () => {
            updateHealthCenterStaffSchema.validate = jest.fn().mockReturnValue({ error: null });
    
            healthCenterModel.findOneAndUpdate = jest.fn().mockResolvedValue({
                medicId: "12345",
                firstName: "Updated",
                lastName: "User",
                email: "updated@example.com",
            });
    
            const result = await updateHealthCenterStaff("12345", { firstName: "Updated" });
    
            expect(result.success).toBe(true);
            expect(result.message).toBe("Integrante de centro de salud actualizado correctamente.");
            expect(result.updatedHealthCenterStaff?.firstName).toBe("Updated");
        });
    
        it("debería retornar un error si la validación falla", async () => {
            updateHealthCenterStaffSchema.validate = jest.fn().mockReturnValue({
                error: { details: [{ message: "El campo email es requerido" }] },
            });
    
            const result = await updateHealthCenterStaff("12345", { email: "" });
    
            expect(result.success).toBe(false);
            expect(result.message).toBe("Error de validación: El campo email es requerido");
        });
    
        it("debería retornar un error si el integrante no se encuentra", async () => {
            updateHealthCenterStaffSchema.validate = jest.fn().mockReturnValue({ error: null });
            healthCenterModel.findOneAndUpdate = jest.fn().mockResolvedValue(null);
    
            const result = await updateHealthCenterStaff("notfound", { firstName: "Test" });
    
            expect(result.success).toBe(false);
            expect(result.message).toBe("No se encontró el integrante del centro de salud o ya fue eliminado.");
        });
    
        it("debería manejar errores internos correctamente", async () => {
            updateHealthCenterStaffSchema.validate = jest.fn().mockReturnValue({ error: null });
            healthCenterModel.findOneAndUpdate = jest.fn().mockRejectedValue(new Error("Error de conexión"));
    
            const result = await updateHealthCenterStaff("error", { firstName: "Test" });
    
            expect(result.success).toBe(false);
            expect(result.message).toBe("Error al actualizar el integrante del centro de salud.");
        });
    });
    
    describe("getHealthCenterStaff", () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        it("debería obtener un integrante del centro de salud correctamente", async () => {
            healthCenterModel.findOne = jest.fn().mockResolvedValue({
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
            });
    
            const result = await getHealthCenterStaff("12345");
    
            expect(result.success).toBe(true);
            expect(result.message).toBe("Integrante de centro de salud obtenido correctamente.");
            expect(result.healthCenterStaff?.email).toBe("john.doe@example.com");
        });
    
        it("debería retornar un error si el integrante no se encuentra", async () => {
            healthCenterModel.findOne = jest.fn().mockResolvedValue(null);
    
            const result = await getHealthCenterStaff("notfound");
    
            expect(result.success).toBe(false);
            expect(result.message).toBe("No se encontró el integrante del centro de salud.");
        });
    
        it("debería manejar errores internos correctamente", async () => {
            healthCenterModel.findOne = jest.fn().mockRejectedValue(new Error("Error de conexión"));
    
            const result = await getHealthCenterStaff("error");
    
            expect(result.success).toBe(false);
            expect(result.message).toBe("Error al buscar el integrante del centro de salud.");
        });
    });
});
