import { registerAdminIntoCollection, deleteAdmin, getAdmin, updateAdmin, getAllUsers } from "../../services/admins/adminService";
import adminModel from "../../models/usersModels/adminModel";
import operatorModel from "../../models/usersModels/operatorModel";
import paramedicModel from "../../models/usersModels/paramedicModel";
import patientModel from "../../models/usersModels/patientModel";
import clinicModel from "../../models/usersModels/healthCenterModel";
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

    describe("getAllUsers", () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        it("debería obtener todos los usuarios correctamente", async () => {
            const mockUsers = [
                [{ adminId: "admin-1", firstName: "Admin", lastName: "One", email: "admin1@example.com", role: "Admin" }],
                [{ operatorId: "operator-1", firstName: "Operator", lastName: "One", email: "operator1@example.com", role: "Operator" }],
                [{ paramedicId: "paramedic-1", firstName: "Paramedic", lastName: "One", email: "paramedic1@example.com", role: "Paramedic" }],
                [{ patientId: "patient-1", firstName: "Patient", lastName: "One", email: "patient1@example.com", role: "Patient" }],
                [{ medicId: "clinic-1", firstName: "Doctor", lastName: "One", email: "doctor1@example.com", role: "Medic" }]
            ];
    
            adminModel.aggregate = jest.fn().mockResolvedValue(mockUsers[0]);
            operatorModel.aggregate = jest.fn().mockResolvedValue(mockUsers[1]);
            paramedicModel.aggregate = jest.fn().mockResolvedValue(mockUsers[2]);
            patientModel.aggregate = jest.fn().mockResolvedValue(mockUsers[3]);
            clinicModel.aggregate = jest.fn().mockResolvedValue(mockUsers[4]);
    
            const result = await getAllUsers();
    
            expect(result.success).toBe(true);
            expect(result.message).toBe("Usuarios obtenidos correctamente.");
            expect(result.users).toHaveLength(5);
            expect(result.users).toEqual(expect.arrayContaining(mockUsers.flat()));
        });
    
        it("debería manejar errores internos correctamente", async () => {
            adminModel.aggregate = jest.fn().mockRejectedValue(new Error("Error en la base de datos"));
    
            const result = await getAllUsers();
    
            expect(result.success).toBe(false);
            expect(result.message).toBe("Error al obtener los usuarios.");
        });
    });
});
