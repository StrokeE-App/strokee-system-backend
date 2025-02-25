import { addHealthCenter } from "../../controllers/healthCenterStaff/healthCenterController";
import { addHealthCenterIntoCollection } from "../../services/healthCenterStaff/healthCenterService";
import { Request, Response, NextFunction } from "express";

jest.mock("../../services/healthCenterStaff/healthCenterService", () => ({
  addHealthCenterIntoCollection: jest.fn(),
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
});
