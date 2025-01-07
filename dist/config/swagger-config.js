"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
var path_1 = __importDefault(require("path"));
var options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Autenticación',
            version: '1.0.0',
            description: 'Documentación de la API para la autenticación de usuarios',
        },
    },
    apis: [
        process.env.NODE_ENV === 'production'
            ? path_1.default.join(__dirname, './swagger/**/*.js') // Para la carpeta dist
            : path_1.default.join(__dirname, './src/swagger/**/*.ts'), // Para el desarrollo
    ],
};
var swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
