import {
    addAmbulanceController,
    deleteAmbulanceController,
    editAmbulanceController,
    getAmbulanceController,
    getAllAmbulancesController
  } from "../../controllers/operator/ambulanceController";
  
  import {
    addAmbulance,
    deleteAmbulance,
    editAmbulance,
    getAmbulance,
    getAllAmbulances
  } from "../../services/operators/ambulanceService";
  
  import { Request, Response, NextFunction } from "express";
  
  // Mock the service layer
  jest.mock("../../services/operators/ambulanceService");
  
  describe("Ambulance Controllers", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      req = {
        body: {},
        params: {}
      };
  
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      next = jest.fn();
    });
  
    it("should return 201 when ambulance is added successfully", async () => {
      req.body = { ambulanceId: "amb-123" };
      (addAmbulance as jest.Mock).mockResolvedValue({
        success: true,
        message: "Ambulance added successfully"
      });
  
      await addAmbulanceController(req as Request, res as Response, next);
  
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "Ambulance added successfully" });
    });
  
    it("should return 400 when adding ambulance fails", async () => {
      req.body = { ambulanceId: "amb-123" };
      (addAmbulance as jest.Mock).mockResolvedValue({
        success: false,
        message: "Failed to add ambulance"
      });
  
      await addAmbulanceController(req as Request, res as Response, next);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Failed to add ambulance" });
    });
  
    it("should return 200 when ambulance is deleted successfully", async () => {
      req.params = { ambulanceId: "amb-123" };
      (deleteAmbulance as jest.Mock).mockResolvedValue({
        success: true,
        message: "Ambulance deleted successfully"
      });
  
      await deleteAmbulanceController(req as Request, res as Response, next);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Ambulance deleted successfully" });
    });
  
    it("should return 400 when deleting ambulance fails", async () => {
      req.params = { ambulanceId: "amb-123" };
      (deleteAmbulance as jest.Mock).mockResolvedValue({
        success: false,
        message: "Failed to delete ambulance"
      });
  
      await deleteAmbulanceController(req as Request, res as Response, next);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Failed to delete ambulance" });
    });
  
    it("should return 200 when ambulance is edited successfully", async () => {
      req.body = { ambulanceId: "amb-123", updateData: { status: "available" } };
      (editAmbulance as jest.Mock).mockResolvedValue({
        success: true,
        message: "Ambulance updated successfully"
      });
  
      await editAmbulanceController(req as Request, res as Response, next);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Ambulance updated successfully" });
    });
  
    it("should return 400 when editing ambulance fails", async () => {
      req.body = { ambulanceId: "amb-123", updateData: { status: "available" } };
      (editAmbulance as jest.Mock).mockResolvedValue({
        success: false,
        message: "Failed to update ambulance"
      });
  
      await editAmbulanceController(req as Request, res as Response, next);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Failed to update ambulance" });
    });
  
    it("should return 200 when getting an ambulance successfully", async () => {
      req.params = { ambulanceId: "amb-123" };
      (getAmbulance as jest.Mock).mockResolvedValue({
        success: true,
        message: "Ambulance found",
        ambulance: { id: "amb-123", status: "available" }
      });
  
      await getAmbulanceController(req as Request, res as Response, next);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Ambulance found",
        ambulance: { id: "amb-123", status: "available" }
      });
    });
  
    it("should return 400 when ambulance is not found", async () => {
      req.params = { ambulanceId: "amb-123" };
      (getAmbulance as jest.Mock).mockResolvedValue({
        success: false,
        message: "Ambulance not found"
      });
  
      await getAmbulanceController(req as Request, res as Response, next);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Ambulance not found" });
    });
  
    it("should return 200 when retrieving all ambulances successfully", async () => {
      (getAllAmbulances as jest.Mock).mockResolvedValue({
        success: true,
        message: "All ambulances retrieved",
        ambulances: [{ id: "amb-123" }, { id: "amb-456" }]
      });
  
      await getAllAmbulancesController(req as Request, res as Response, next);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "All ambulances retrieved",
        ambulances: [{ id: "amb-123" }, { id: "amb-456" }]
      });
    });
  
    it("should return 400 when retrieving ambulances fails", async () => {
      (getAllAmbulances as jest.Mock).mockResolvedValue({
        success: false,
        message: "Failed to retrieve ambulances"
      });
  
      await getAllAmbulancesController(req as Request, res as Response, next);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Failed to retrieve ambulances" });
    });
  
    it("should call next with error when an exception occurs", async () => {
      req.body = { ambulanceId: "amb-123" };
      (addAmbulance as jest.Mock).mockRejectedValue(new Error("Unexpected error"));
  
      await addAmbulanceController(req as Request, res as Response, next);
  
      expect(next).toHaveBeenCalledWith(new Error("Unexpected error"));
    });
  });
  