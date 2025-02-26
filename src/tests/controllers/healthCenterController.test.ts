import { addHealthCenter, getHealthCenter, deleteHealthCenter, updateHealthCenter } from "../../controllers/healthCenterStaff/healthCenterController";
import { addHealthCenterIntoCollection, deleteHealthCenterStaff, getHealthCenterStaff, updateHealthCenterStaff } from "../../services/healthCenterStaff/healthCenterService";
import { Request, Response, NextFunction } from "express";

jest.mock("../../services/healthCenterStaff/healthCenterService", () => ({
  addHealthCenterIntoCollection: jest.fn(),
  deleteHealthCenterStaff: jest.fn(),
  getHealthCenterStaff: jest.fn(),
  updateHealthCenterStaff: jest.fn(),
}));

describe("addHealthCenter Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {
        email: "healthcenter@example.com",
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

  it("debería retornar 201 y el healthCenterId si el registro es exitoso", async () => {
    const result = { success: true, message: "Centro de salud agregado correctamente.", healthCenterId: "12345" };
    (addHealthCenterIntoCollection as jest.Mock).mockResolvedValue(result);

    await addHealthCenter(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: result.message,
      healthCenterId: result.healthCenterId,
    });
  });

  it("debería retornar 400 si no se puede registrar el centro de salud", async () => {
    const result = { success: false, message: "El email ya está registrado." };
    (addHealthCenterIntoCollection as jest.Mock).mockResolvedValue(result);

    await addHealthCenter(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: result.message,
    });
  });

  it("debería llamar a next con un error si addHealthCenterIntoCollection lanza una excepción", async () => {
    const errorMessage = "Error al agregar el centro de salud.";
    (addHealthCenterIntoCollection as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await addHealthCenter(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error(errorMessage));
  });


  describe("HealthCenter Controller", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
  
    beforeEach(() => {
      req = {
        params: { medicId: "medic-123" },
        body: { name: "New Health Center", address: "123 Main St" },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    describe("getHealthCenter", () => {
      it("debería retornar 200 y los datos del centro de salud si la consulta es exitosa", async () => {
        const result = { success: true, message: "Centro de salud obtenido correctamente.", healthCenterStaff: { name: "Health Center" } };
        (getHealthCenterStaff as jest.Mock).mockResolvedValue(result);
  
        await getHealthCenter(req as Request, res as Response, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          message: result.message,
          healthCenterStaff: result.healthCenterStaff,
        });
      });
  
      it("debería retornar 400 si no se encuentra el centro de salud", async () => {
        const result = { success: false, message: "No se encontró el centro de salud." };
        (getHealthCenterStaff as jest.Mock).mockResolvedValue(result);
  
        await getHealthCenter(req as Request, res as Response, next);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: result.message });
      });
  
      it("debería llamar a next con un error si getHealthCenterStaff lanza una excepción", async () => {
        const errorMessage = "Error en la base de datos.";
        (getHealthCenterStaff as jest.Mock).mockRejectedValue(new Error(errorMessage));
  
        await getHealthCenter(req as Request, res as Response, next);
  
        expect(next).toHaveBeenCalledWith(new Error(errorMessage));
      });
    });
  
    describe("updateHealthCenter", () => {
      it("debería retornar 200 si el centro de salud se actualiza correctamente", async () => {
        const result = { success: true, message: "Centro de salud actualizado correctamente." };
        (updateHealthCenterStaff as jest.Mock).mockResolvedValue(result);
  
        await updateHealthCenter(req as Request, res as Response, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: result.message });
      });
  
      it("debería retornar 400 si la actualización falla", async () => {
        const result = { success: false, message: "Error al actualizar el centro de salud." };
        (updateHealthCenterStaff as jest.Mock).mockResolvedValue(result);
  
        await updateHealthCenter(req as Request, res as Response, next);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: result.message });
      });
  
      it("debería llamar a next con un error si updateHealthCenterStaff lanza una excepción", async () => {
        const errorMessage = "Error interno del servidor.";
        (updateHealthCenterStaff as jest.Mock).mockRejectedValue(new Error(errorMessage));
  
        await updateHealthCenter(req as Request, res as Response, next);
  
        expect(next).toHaveBeenCalledWith(new Error(errorMessage));
      });
    });
  
    describe("deleteHealthCenter", () => {
      it("debería retornar 200 si el centro de salud se elimina correctamente", async () => {
        const result = { success: true, message: "Centro de salud eliminado correctamente." };
        (deleteHealthCenterStaff as jest.Mock).mockResolvedValue(result);
  
        await deleteHealthCenter(req as Request, res as Response, next);
  
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: result.message });
      });
  
      it("debería retornar 400 si el centro de salud no se encuentra o ya fue eliminado", async () => {
        const result = { success: false, message: "No se encontró el centro de salud o ya fue eliminado." };
        (deleteHealthCenterStaff as jest.Mock).mockResolvedValue(result);
  
        await deleteHealthCenter(req as Request, res as Response, next);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: result.message });
      });
  
      it("debería llamar a next con un error si deleteHealthCenterStaff lanza una excepción", async () => {
        const errorMessage = "Error al eliminar el centro de salud.";
        (deleteHealthCenterStaff as jest.Mock).mockRejectedValue(new Error(errorMessage));
  
        await deleteHealthCenter(req as Request, res as Response, next);
  
        expect(next).toHaveBeenCalledWith(new Error(errorMessage));
      });
    });
  });
});
