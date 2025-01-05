import { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack); // Registra el error en la consola
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Error interno del servidor",
    },
  });
};

export default errorHandler;
