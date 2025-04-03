import { addHealthcenter, getHealthcenters, getHealthcenter, updateHealthcenter, deleteHealthcenter } from "../../services/healthCenterStaff/clinicService";
import healthcenterModel from "../../models/usersModels/clinicModel";
import { healthcenterUpdateSchema } from "../../validationSchemas/healthcenterModel";

// Mock del modelo de MongoDB
jest.mock("../../models/usersModels/clinicModel");

describe("Healthcenter Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("addHealthcenter", () => {
        it("should return error when healthcenterName is missing", async () => {
            const result = await addHealthcenter("");
            expect(result).toEqual({ success: false, message: "El nombre del centro de salud es obligatorio." });
        });

        it("should return error when healthcenter already exists", async () => {
            (healthcenterModel.findOne as jest.Mock).mockResolvedValue({ healthcenterName: "test" });

            const result = await addHealthcenter("test");
            expect(result).toEqual({ success: false, message: "El centro de salud con el nombre test ya existe." });
        });

        it("should successfully add a new healthcenter", async () => {
            (healthcenterModel.findOne as jest.Mock).mockResolvedValue(null);
            (healthcenterModel.create as jest.Mock).mockResolvedValue(true);

            const result = await addHealthcenter("New Healthcenter");
            expect(result).toEqual({ success: true, message: "El centro de salud ha sido agregado correctamente." });
        });

        it("should handle unexpected errors", async () => {
            (healthcenterModel.findOne as jest.Mock).mockRejectedValue(new Error("DB Error"));

            const result = await addHealthcenter("ErrorCase");
            expect(result).toEqual({ success: false, message: "Error al agregar el centro de salud." });
        });
    });

    describe("getHealthcenters", () => {
        it("should return all healthcenters", async () => {
            const mockData = [{ healthcenterId: "123", healthcenterName: "Clinic A" }];
            (healthcenterModel.find as jest.Mock).mockResolvedValue(mockData);

            const result = await getHealthcenters();
            expect(result).toEqual({ success: true, message: "Centros de salud obtenidos correctamente.", Healthcenters: mockData });
        });

        it("should handle errors when retrieving healthcenters", async () => {
            (healthcenterModel.find as jest.Mock).mockRejectedValue(new Error("DB Error"));

            const result = await getHealthcenters();
            expect(result).toEqual({ success: false, message: "Error al obtener los centros de salud." });
        });
    });

    describe("getHealthcenter", () => {
        it("should return a healthcenter when found", async () => {
            const mockData = { healthcenterId: "123", healthcenterName: "Clinic A" };
            (healthcenterModel.findOne as jest.Mock).mockResolvedValue(mockData);

            const result = await getHealthcenter("123");
            expect(result).toEqual({ success: true, message: "Centro de salud obtenido correctamente.", Healthcenter: mockData });
        });

        it("should return 404 when healthcenter is not found", async () => {
            (healthcenterModel.findOne as jest.Mock).mockResolvedValue(null);

            const result = await getHealthcenter("123");
            expect(result).toEqual({ success: true, message: "El centro de salud no existe.", code: 404 });
        });

        it("should handle errors", async () => {
            (healthcenterModel.findOne as jest.Mock).mockRejectedValue(new Error("DB Error"));

            const result = await getHealthcenter("123");
            expect(result).toEqual({ success: false, message: "Error al obtener el centro de salud." });
        });
    });

    describe("updateHealthcenter", () => {

        it("should return error if healthcenter does not exist", async () => {
            (healthcenterModel.findOne as jest.Mock).mockResolvedValue(null);

            const result = await updateHealthcenter("123", { healthcenterName: "Updated Clinic" });
            expect(result).toEqual({ success: false, message: "El centro de salud no existe." });
        });

        it("should successfully update the healthcenter", async () => {
            (healthcenterModel.findOne as jest.Mock).mockResolvedValue({ healthcenterId: "123" });
            (healthcenterModel.updateOne as jest.Mock).mockResolvedValue(true);

            const result = await updateHealthcenter("123", { healthcenterName: "Updated Clinic" });
            expect(result).toEqual({ success: true, message: "Centro de salud actualizado correctamente." });
        });

        it("should handle errors", async () => {
            (healthcenterModel.findOne as jest.Mock).mockRejectedValue(new Error("DB Error"));

            const result = await updateHealthcenter("123", { healthcenterName: "Updated Clinic" });
            expect(result).toEqual({ success: false, message: "Error al actualizar el centro de salud." });
        });
    });

    describe("deleteHealthcenter", () => {
        it("should return error if healthcenterId is missing", async () => {
            const result = await deleteHealthcenter("");
            expect(result).toEqual({ success: false, message: "El id del centro de salud es obligatorio." });
        });

        it("should return error if healthcenter does not exist", async () => {
            (healthcenterModel.findOne as jest.Mock).mockResolvedValue(null);

            const result = await deleteHealthcenter("123");
            expect(result).toEqual({ success: false, message: "El centro de salud no existe." });
        });

        it("should successfully delete the healthcenter", async () => {
            (healthcenterModel.findOne as jest.Mock).mockResolvedValue({ healthcenterId: "123" });
            (healthcenterModel.deleteOne as jest.Mock).mockResolvedValue(true);

            const result = await deleteHealthcenter("123");
            expect(result).toEqual({ success: true, message: "Centro de salud eliminado correctamente." });
        });

        it("should handle errors", async () => {
            (healthcenterModel.findOne as jest.Mock).mockRejectedValue(new Error("DB Error"));

            const result = await deleteHealthcenter("123");
            expect(result).toEqual({ success: false, message: "Error al eliminar el centro de salud." });
        });
    });
});
