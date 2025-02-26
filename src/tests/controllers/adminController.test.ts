import { addAdmin, deleteAdminById, getAdminById, updateAdminById,getAllAppUsers } from "../../controllers/admins/adminController";
import { registerAdminIntoCollection, deleteAdmin, getAdmin, updateAdmin, getAllUsers } from "../../services/admins/adminService";
import { Request, Response, NextFunction } from "express";

jest.mock("../../services/admins/adminService", () => ({
  registerAdminIntoCollection: jest.fn(),
  deleteAdmin: jest.fn(),
  getAdmin: jest.fn(),
  updateAdmin: jest.fn(),
  getAllUsers: jest.fn(),
}));

describe("addAdmin Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      params: { adminId: "12345" },
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


  it("debería retornar 200 si la eliminación es exitosa", async () => {
    const result = { success: true, message: "Administrador eliminado correctamente." };
    (deleteAdmin as jest.Mock).mockResolvedValue(result);

    await deleteAdminById(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: result.message });
  });

  it("debería retornar 400 si la eliminación falla", async () => {
    const result = { success: false, message: "No se encontró el administrador." };
    (deleteAdmin as jest.Mock).mockResolvedValue(result);

    await deleteAdminById(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: result.message });
  });

  it("debería llamar a next con un error si deleteAdmin lanza una excepción", async () => {
    const errorMessage = "Error al eliminar el administrador.";
    (deleteAdmin as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await deleteAdminById(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error(errorMessage));
  });

  it("debería retornar 200 y la información del administrador si la consulta es exitosa", async () => {
    const result = { success: true, message: "Administrador encontrado.", admin: { id: "12345", email: "admin@example.com" } };
    (getAdmin as jest.Mock).mockResolvedValue(result);

    await getAdminById(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: result.message,
      admin: result.admin,
    });
  });

  it("debería retornar 400 si no se encuentra el administrador", async () => {
    const result = { success: false, message: "Administrador no encontrado." };
    (getAdmin as jest.Mock).mockResolvedValue(result);

    await getAdminById(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: result.message });
  });

  it("debería llamar a next con un error si getAdmin lanza una excepción", async () => {
    const errorMessage = "Error al obtener el administrador.";
    (getAdmin as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await getAdminById(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error(errorMessage));
  });

  it("debería retornar 200 si la actualización es exitosa", async () => {
    const result = { success: true, message: "Administrador actualizado correctamente." };
    (updateAdmin as jest.Mock).mockResolvedValue(result);

    await updateAdminById(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: result.message });
  });

  it("debería retornar 400 si la actualización falla", async () => {
    const result = { success: false, message: "No se pudo actualizar el administrador." };
    (updateAdmin as jest.Mock).mockResolvedValue(result);

    await updateAdminById(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: result.message });
  });

  it("debería llamar a next con un error si updateAdmin lanza una excepción", async () => {
    const errorMessage = "Error al actualizar el administrador.";
    (updateAdmin as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await updateAdminById(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error(errorMessage));
  });

  it("debería retornar 200 y la lista de usuarios si la consulta es exitosa", async () => {
    const result = {
      success: true,
      message: "Usuarios obtenidos correctamente.",
      users: [{ id: "123", name: "John Doe" }],
    };

    (getAllUsers as jest.Mock).mockResolvedValue(result);

    await getAllAppUsers(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: result.message,
      users: result.users,
    });
  });

  it("debería retornar 400 si la consulta de usuarios falla", async () => {
    const result = { success: false, message: "No se pudieron obtener los usuarios." };

    (getAllUsers as jest.Mock).mockResolvedValue(result);

    await getAllAppUsers(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: result.message });
  });

  it("debería llamar a next con un error si getAllUsers lanza una excepción", async () => {
    const errorMessage = "Error al obtener los usuarios.";
    (getAllUsers as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await getAllAppUsers(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error(errorMessage));
  });

});
