"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPatientsFromCollection = exports.refreshUserToken = exports.authenticatePatient = exports.cookiesForPatient = exports.addPatientIntoPatientCollection = void 0;
var patientModel_1 = __importDefault(require("../../models/usersModels/patientModel"));
var firebase_cofig_1 = require("../../config/firebase-cofig");
var auth_1 = require("firebase/auth");
var axios_1 = __importDefault(require("axios"));
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var validatePatientFields = function (firstName, lastName, email, password, phoneNumber, age, birthDate, weight, height, medications, conditions) {
    if (!firstName)
        return "firstName";
    if (!lastName)
        return "lastName";
    if (!email)
        return "email";
    if (!password)
        return "password";
    if (!phoneNumber)
        return "phoneNumber";
    if (!age)
        return "age";
    if (!birthDate)
        return "birthDate";
    if (!weight)
        return "weight";
    if (!height)
        return "height";
    if (medications.length === 0)
        return "medications";
    if (conditions.length === 0)
        return "conditions";
    return null;
};
var addPatientIntoPatientCollection = function (firstName, lastName, email, password, phoneNumber, age, birthDate, weight, height, medications, conditions) { return __awaiter(void 0, void 0, void 0, function () {
    var missingField, existingPatient, patientRecord, newPatient, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                missingField = validatePatientFields(firstName, lastName, email, password, phoneNumber, age, birthDate, weight, height, medications, conditions);
                if (missingField) {
                    throw new Error("El campo ".concat(missingField, " es requerido."));
                }
                return [4 /*yield*/, patientModel_1.default.findOne({ email: email })];
            case 1:
                existingPatient = _a.sent();
                if (existingPatient) {
                    throw new Error("El email ".concat(email, " ya est\u00E1 registrado."));
                }
                return [4 /*yield*/, firebase_cofig_1.authSDK.createUser({
                        email: email,
                        password: password,
                    })];
            case 2:
                patientRecord = _a.sent();
                if (!patientRecord.uid) {
                    throw new Error('No se pudo crear el usuario en Firebase.');
                }
                newPatient = new patientModel_1.default({
                    patientId: patientRecord.uid,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    phoneNumber: phoneNumber,
                    age: age,
                    birthDate: birthDate,
                    weight: weight,
                    height: height,
                    medications: medications,
                    conditions: conditions,
                    isDeleted: false
                });
                return [4 /*yield*/, patientModel_1.default.updateOne({ patientId: patientRecord.uid, isDeleted: false }, newPatient, { upsert: true })];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                if (error_1 instanceof Error) {
                    console.error("Error al agregar al paciente: ".concat(error_1.message));
                    throw new Error("Error al agregar al paciente: ".concat(error_1.message));
                }
                else {
                    console.error("Error desconocido al agregar al paciente.");
                    throw new Error("Error desconocido al agregar al paciente.");
                }
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.addPatientIntoPatientCollection = addPatientIntoPatientCollection;
var cookiesForPatient = function (token) { return __awaiter(void 0, void 0, void 0, function () {
    var decodedToken, sessionCookie, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, firebase_cofig_1.authSDK.verifyIdToken(token)];
            case 1:
                decodedToken = _a.sent();
                return [4 /*yield*/, firebase_cofig_1.authSDK.createSessionCookie(token, { expiresIn: 60 * 60 * 24 * 1000 })];
            case 2:
                sessionCookie = _a.sent();
                return [2 /*return*/, sessionCookie];
            case 3:
                e_1 = _a.sent();
                if (e_1 instanceof Error) {
                    if (e_1.message.includes('auth/user-not-found')) {
                        console.error("El usuario no existe. Por favor, verifica las credenciales.");
                    }
                    else if (e_1.message.includes('auth/wrong-password')) {
                        console.error("La contraseña es incorrecta. Inténtalo de nuevo.");
                    }
                    else if (e_1.message.includes('auth/invalid-id-token')) {
                        console.error("El token de ID proporcionado no es válido o ha expirado.");
                    }
                    else {
                        console.error("Ocurrió un error desconocido durante la autenticación:", e_1.message);
                    }
                }
                else {
                    console.error("Ocurrió un error inesperado durante la autenticación.");
                }
                return [2 /*return*/, null];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.cookiesForPatient = cookiesForPatient;
var authenticatePatient = function (email, password) { return __awaiter(void 0, void 0, void 0, function () {
    var patientRecord, idToken, refreshToken, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, (0, auth_1.signInWithEmailAndPassword)(firebase_cofig_1.auth, email, password)];
            case 1:
                patientRecord = _a.sent();
                return [4 /*yield*/, patientRecord.user.getIdToken()];
            case 2:
                idToken = _a.sent();
                refreshToken = patientRecord.user.refreshToken;
                return [2 /*return*/, { idToken: idToken, refreshToken: refreshToken }];
            case 3:
                e_2 = _a.sent();
                if (e_2 instanceof Error) {
                    if (e_2.message.includes('auth/user-not-found')) {
                        console.log("El usuario no existe.");
                    }
                    else if (e_2.message.includes('auth/wrong-password')) {
                        console.log("Contraseña incorrecta.");
                    }
                    else {
                        console.log("Error desconocido:", e_2.message);
                    }
                }
                else {
                    console.log("Error desconocido al autenticar.");
                }
                return [2 /*return*/, null];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.authenticatePatient = authenticatePatient;
var refreshUserToken = function (refreshToken) { return __awaiter(void 0, void 0, void 0, function () {
    var url, response, _a, id_token, expires_in, refresh_token, user_id, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                url = "https://securetoken.googleapis.com/v1/token?key=".concat(process.env.APIKEY);
                return [4 /*yield*/, axios_1.default.post(url, {
                        grant_type: "refresh_token",
                        refresh_token: refreshToken,
                    })];
            case 1:
                response = _b.sent();
                _a = response.data, id_token = _a.id_token, expires_in = _a.expires_in, refresh_token = _a.refresh_token, user_id = _a.user_id;
                return [2 /*return*/, {
                        message: "Token refrescado exitosamente.",
                        idToken: id_token,
                        expiresIn: expires_in,
                        refreshToken: refresh_token,
                        userId: user_id,
                    }];
            case 2:
                error_2 = _b.sent();
                console.error("Failed to refresh token |", error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.refreshUserToken = refreshUserToken;
var getAllPatientsFromCollection = function () { return __awaiter(void 0, void 0, void 0, function () {
    var listPatients, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, patientModel_1.default.find()];
            case 1:
                listPatients = _a.sent();
                return [2 /*return*/, listPatients];
            case 2:
                error_3 = _a.sent();
                console.log("No de logro obtener pacientes de la base de datos ");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getAllPatientsFromCollection = getAllPatientsFromCollection;
