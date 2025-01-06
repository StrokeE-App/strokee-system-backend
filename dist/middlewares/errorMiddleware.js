"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errorHandler = function (err, req, res, next) {
    console.error(err.stack); // Registra el error en la consola
    res.status(err.status || 500).json({
        error: {
            message: err.message || "Error interno del servidor",
        },
    });
};
exports.default = errorHandler;
