import { NextFunction, Request, Response } from "express";
import { addAmbulance, deleteAmbulance, editAmbulance, getAmbulance, getAllAmbulances } from "../../services/operators/ambulanceService";

export const addAmbulanceController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ambulanceId = req.body.ambulanceId;
        const result = await addAmbulance(ambulanceId);
        if (result.success) {
            res.status(201).json({
                message: result.message,
            });
        } else {
            res.status(400).json({
                message: result.message,
            });
        }
    } catch (error) {
        next(error);
    }
};

export const deleteAmbulanceController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ambulanceId = req.params.ambulanceId;
        const result = await deleteAmbulance(ambulanceId);
        if (result.success) {
            res.status(200).json({
                message: result.message,
            });
        } else {
            res.status(400).json({
                message: result.message,
            });
        }
    } catch (error) {
        next(error);
    }
};

export const editAmbulanceController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ambulanceId = req.body.ambulanceId;
        const updateData = req.body.updateData;
        const result = await editAmbulance(ambulanceId, updateData);
        if (result.success) {
            res.status(200).json({
                message: result.message,
            });
        } else {
            res.status(400).json({
                message: result.message,
            });
        }
    } catch (error) {
        next(error);
    }
};

export const getAmbulanceController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ambulanceId = req.params.ambulanceId;
        const result = await getAmbulance(ambulanceId);
        if (result.success) {
            res.status(200).json({
                message: result.message,
                ambulance: result.ambulance,
            });
        } else {
            res.status(400).json({
                message: result.message,
            });
        }
    } catch (error) {
        next(error);
    }
};

export const getAllAmbulancesController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await getAllAmbulances();
        if (result.success) {
            res.status(200).json({
                message: result.message,
                ambulances: result.ambulances,
            });
        } else {
            res.status(400).json({
                message: result.message,
            });
        }
    } catch (error) {
        next(error);
    }
};