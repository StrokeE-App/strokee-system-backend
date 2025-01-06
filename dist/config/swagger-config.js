"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
var options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Autenticación',
            version: '1.0.0',
            description: 'Documentación de la API para la autenticación de usuarios',
        },
    },
    apis: ['./src/swagger/**/*.ts'],
};
var swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
