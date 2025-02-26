import { registerAdminIntoCollection, deleteAdmin, getAdmin, updateAdmin } from "../../services/admins/adminService";
import adminModel from "../../models/usersModels/adminModel";
import rolesModel from "../../models/usersModels/rolesModel";
import { firebaseAdmin } from "../../config/firebase-config";
import { adminSchema, updateAdminSchema } from "../../validationSchemas/adminSchema";

jest.mock("../../models/usersModels/adminModel");
jest.mock("../../models/usersModels/rolesModel");
jest.mock("../../config/firebase-config");

describe("registerAdminIntoCollection", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("debería retornar un error si los datos no son válidos", async () => {
        adminSchema.validate = jest.fn().mockReturnValue({
            error: { details: [{ message: "El campo email es requerido" }] },
        });

        const result = await registerAdminIntoCollection({
            email: "",
            password: "",
            firstName: "",
            lastName: "",
        });

        expect(result.success).toBe(false);
        expect(result.message).toBe("Error de validación: El campo email es requerido");
    });

    it("debería retornar un error si el email ya está registrado", async () => {
        adminModel.findOne = jest.fn().mockResolvedValue({ email: "test@example.com" });
        adminSchema.validate = jest.fn().mockReturnValue({ error: null });

        const result = await registerAdminIntoCollection({
            email: "test@example.com",
            password: "password123",
            firstName: "John",
            lastName: "Doe",
        });

        expect(result.success).toBe(false);
        expect(result.message).toBe("El correo electrónica ya esta registrado.");
    });

    it("debería crear un nuevo administrador exitosamente", async () => {
        adminModel.findOne = jest.fn().mockResolvedValue(null);
        firebaseAdmin.createUser = jest.fn().mockResolvedValue({ uid: "admin-12345" });
        adminModel.prototype.save = jest.fn().mockImplementation(() => Promise.resolve({ adminId: "admin-12345" }));
        rolesModel.create = jest.fn().mockResolvedValue({});
        adminSchema.validate = jest.fn().mockReturnValue({ error: null });

        const result = await registerAdminIntoCollection({
            email: "newadmin@example.com",
            password: "password123",
            firstName: "Jane",
            lastName: "Doe",
        });

        expect(result.success).toBe(true);
        expect(result.message).toBe("Administrador registrado exitosamente.");
        expect(result.adminId).toBe("admin-12345");
    });

    it("debería manejar errores internos correctamente", async () => {
        adminModel.findOne = jest.fn().mockRejectedValue(new Error("Error de conexión"));

        const result = await registerAdminIntoCollection({
            email: "error@example.com",
            password: "password123",
            firstName: "Test",
            lastName: "User",
        });

        expect(result.success).toBe(false);
        expect(result.message).toContain("Error al registrar el administrador: Error de conexión");
    });

    describe("updateAdmin", () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        it("debería retornar un error si los datos no son válidos", async () => {
            updateAdminSchema.validate = jest.fn().mockReturnValue({
                error: { details: [{ message: "El campo email no es válido" }] },
            });
    
            const result = await updateAdmin("admin-123", { email: "invalidemail" });
    
            expect(result.success).toBe(false);
            expect(result.message).toBe("Error de validación: El campo email no es válido");
        });
    
        it("debería retornar un error si el administrador no existe", async () => {
            updateAdminSchema.validate = jest.fn().mockReturnValue({ error: null });
            adminModel.findOneAndUpdate = jest.fn().mockResolvedValue(null);
    
            const result = await updateAdmin("admin-123", { firstName: "NuevoNombre" });
    
            expect(result.success).toBe(false);
            expect(result.message).toBe("No se encontró el administrador o ya fue eliminado.");
        });
    
        it("debería actualizar un administrador correctamente", async () => {
            updateAdminSchema.validate = jest.fn().mockReturnValue({ error: null });
            adminModel.findOneAndUpdate = jest.fn().mockResolvedValue({
                adminId: "admin-123",
                firstName: "NuevoNombre",
                lastName: "Apellido",
                email: "admin@example.com",
            });
    
            const result = await updateAdmin("admin-123", { firstName: "NuevoNombre" });
    
            expect(result.success).toBe(true);
            expect(result.message).toBe("Administrador actualizado correctamente.");
            expect(result.updatedAdmin?.firstName).toBe("NuevoNombre");
        });
    });

    describe("deleteAdmin", () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        it("debería retornar un error si el administrador no existe", async () => {
            adminModel.findOne = jest.fn().mockResolvedValue(null);
    
            const result = await deleteAdmin("admin-123");
    
            expect(result.success).toBe(false);
            expect(result.message).toBe("No se encontró el administrador o ya fue eliminado.");
        });
    
        it("debería eliminar un administrador correctamente", async () => {
            adminModel.findOne = jest.fn().mockResolvedValue({ adminId: "admin-123" });
            adminModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
            firebaseAdmin.deleteUser = jest.fn().mockResolvedValue({});
            rolesModel.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
    
            const result = await deleteAdmin("admin-123");
    
            expect(result.success).toBe(true);
            expect(result.message).toBe("Administrador eliminado correctamente.");
        });
    
        it("debería manejar errores internos correctamente", async () => {
            adminModel.findOne = jest.fn().mockRejectedValue(new Error("Error de base de datos"));
    
            const result = await deleteAdmin("admin-123");
    
            expect(result.success).toBe(false);
            expect(result.message).toBe("Error al eliminar el administrador.");
        });
    });

    describe("getAdmin", () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        it("debería retornar un error si el administrador no existe", async () => {
            adminModel.findOne = jest.fn().mockResolvedValue(null);
    
            const result = await getAdmin("admin-123");
    
            expect(result.success).toBe(false);
            expect(result.message).toBe("No se encontró el administrador.");
        });
    
        it("debería obtener un administrador correctamente", async () => {
            adminModel.findOne = jest.fn().mockResolvedValue({
                firstName: "Admin",
                lastName: "User",
                email: "admin@example.com",
            });
    
            const result = await getAdmin("admin-123");
    
            expect(result.success).toBe(true);
            expect(result.message).toBe("Administrador obtenido correctamente.");
            expect(result.admin?.firstName).toBe("Admin");
        });
    
        it("debería manejar errores internos correctamente", async () => {
            adminModel.findOne = jest.fn().mockRejectedValue(new Error("Error de base de datos"));
    
            const result = await getAdmin("admin-123");
    
            expect(result.success).toBe(false);
            expect(result.message).toBe("Error al buscar el administrador.");
        });
    });
});
