import { addAdmin } from "../../controllers/admins/adminController";
import { registerAdminIntoCollection } from "../../services/admins/adminService";
import { Request, Response, NextFunction } from "express";

jest.mock("../../services/admins/adminService", () => ({
  registerAdminIntoCollection: jest.fn(),
}));

describe("addAdmin Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {
        email: "admin@example.com",
        password: "securepassword",
        firstName: "John",
        lastName: "Doe",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("debería retornar 201 y el adminId si el registro es exitoso", async () => {
    const result = { success: true, message: "Administrador registrado exitosamente.", adminId: "admin-12345" };
    (registerAdminIntoCollection as jest.Mock).mockResolvedValue(result);

    await addAdmin(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: result.message,
      adminId: result.adminId,
    });
  });

  it("debería retornar 400 si no se puede registrar el administrador", async () => {
    const result = { success: false, message: "El correo electrónico ya está registrado." };
    (registerAdminIntoCollection as jest.Mock).mockResolvedValue(result);

    await addAdmin(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: result.message,
    });
  });

  it("debería llamar a next con un error si registerAdminIntoCollection lanza una excepción", async () => {
    const errorMessage = "Error al registrar el administrador.";
    (registerAdminIntoCollection as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await addAdmin(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error(errorMessage));
  });
});
