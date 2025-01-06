"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Iniciar sesión de un usuario
 *     description: Autentica a un usuario con el email y la contraseña proporcionados y retorna un token de acceso.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@dominio.com"
 *               password:
 *                 type: string
 *                 example: "contraseña123"
 *     responses:
 *       201:
 *         description: Login exitoso. Se retorna un token de acceso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login exitoso."
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: El email y la contraseña son requeridos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El email y la contraseña son requeridos."
 *       500:
 *         description: Error interno en el servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al logguear usuario."
 *                 error:
 *                   type: string
 *                   example: "Error desconocido."
 */
exports.default = {};
