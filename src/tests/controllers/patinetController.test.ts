import { registerPatient, creatEmergency, updatePatient, deletePatient, getPatient } from '../../controllers/patients/patientController';
import { addPatientIntoPatientCollection, addEmergencyToCollection, updatePatientFromCollection, deletePatientFromCollection, getPatientFromCollection } from '../../services/patients/patientService';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../services/patients/patientService', () => ({
  addPatientIntoPatientCollection: jest.fn(),
  addEmergencyToCollection: jest.fn(),
  updatePatientFromCollection: jest.fn(),
  deletePatientFromCollection: jest.fn(),
  getPatientFromCollection: jest.fn(),
}));

describe('registerPatient Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      params: { patientId: "12345" },
      body: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        password: 'password123',
        phoneNumber: '1234567890',
        age: 30,
        birthDate: new Date('1995-01-01'),
        weight: 70,
        height: 175,
        medications: ['med1'],
        conditions: ['condition1'],
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 201 and the patientId if registration is successful', async () => {
    const result = { success: true, message: 'Paciente agregado exitosamente.', patientId: '12345' };
    (addPatientIntoPatientCollection as jest.Mock).mockResolvedValue(result);

    await registerPatient(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: result.message,
      patientId: result.patientId,
    });
  });

  it('should return 400 if the patient could not be registered', async () => {
    const result = { success: false, message: 'El email ya está registrado.' };
    (addPatientIntoPatientCollection as jest.Mock).mockResolvedValue(result);

    await registerPatient(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: result.message,
    });
  });

  it('should call next with an error if addPatientIntoPatientCollection throws an error', async () => {
    const errorMessage = 'Error al agregar al paciente.';
    (addPatientIntoPatientCollection as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await registerPatient(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error(errorMessage));
  });

  it('should return 201 and the emergencyId if creation is successful', async () => {
    const result = { success: true, message: 'Emergencia creada exitosamente.', emergencyId: 'mocked-uuid' };
    (addEmergencyToCollection as jest.Mock).mockResolvedValue(result);

    await creatEmergency(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: result.message,
      emergencyId: result.emergencyId,
    });
  });

  it('should return 400 if the emergency could not be created', async () => {
    const result = { success: false, message: 'No se encontró un paciente con ese ID.' };
    (addEmergencyToCollection as jest.Mock).mockResolvedValue(result);

    await creatEmergency(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: result.message,
    });
  });

  it('should call next with an error if addEmergencyToCollection throws an error', async () => {
    const errorMessage = 'Error al crear la emergencia.';
    (addEmergencyToCollection as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await creatEmergency(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error(errorMessage));
  });

  it("debería devolver 200 si la actualización del paciente es exitosa", async () => {
    const result = { success: true, message: "Paciente actualizado correctamente." };
    (updatePatientFromCollection as jest.Mock).mockResolvedValue(result);

    await updatePatient(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: result.message });
  });

  it("debería devolver 400 si la actualización falla", async () => {
    const result = { success: false, message: "No se encontró un paciente con ese ID." };
    (updatePatientFromCollection as jest.Mock).mockResolvedValue(result);

    await updatePatient(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: result.message });
  });

  it("debería llamar a next con un error si updatePatientFromCollection lanza una excepción", async () => {
    const errorMessage = "Error al actualizar el paciente.";
    (updatePatientFromCollection as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await updatePatient(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(new Error(errorMessage));
  });
});

describe('Patient Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      params: { patientId: '12345' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('getPatient', () => {
    it('debería devolver 200 y los datos del paciente si la búsqueda es exitosa', async () => {
      const result = { success: true, message: 'Paciente encontrado.', data: { id: '12345', name: 'John Doe' } };
      (getPatientFromCollection as jest.Mock).mockResolvedValue(result);

      await getPatient(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: result.message,
        data: result.data,
      });
    });

    it('debería devolver 400 si el paciente no se encuentra', async () => {
      const result = { success: false, message: 'Paciente no encontrado.' };
      (getPatientFromCollection as jest.Mock).mockResolvedValue(result);

      await getPatient(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: result.message,
      });
    });

    it('debería llamar a next con un error si getPatientFromCollection lanza una excepción', async () => {
      const errorMessage = 'Error al buscar el paciente.';
      (getPatientFromCollection as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await getPatient(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(new Error(errorMessage));
    });
  });

  describe('deletePatient', () => {
    it('debería devolver 200 si el paciente se elimina correctamente', async () => {
      const result = { success: true, message: 'Paciente eliminado correctamente.' };
      (deletePatientFromCollection as jest.Mock).mockResolvedValue(result);

      await deletePatient(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: result.message,
      });
    });

    it('debería devolver 400 si la eliminación falla', async () => {
      const result = { success: false, message: 'No se encontró un paciente con ese ID.' };
      (deletePatientFromCollection as jest.Mock).mockResolvedValue(result);

      await deletePatient(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: result.message,
      });
    });

    it('debería llamar a next con un error si deletePatientFromCollection lanza una excepción', async () => {
      const errorMessage = 'Error al eliminar el paciente.';
      (deletePatientFromCollection as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await deletePatient(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(new Error(errorMessage));
    });
  });
});
