"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authSDK = exports.auth = void 0;
var firebase_admin_1 = __importDefault(require("firebase-admin"));
var app_1 = require("firebase/app");
var auth_1 = require("firebase/auth");
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var fireBaseApp = (0, app_1.initializeApp)({
    apiKey: process.env.APIKEY,
    authDomain: process.env.AUTHDOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGEBUCKET,
    messagingSenderId: process.env.MESSAGESENDERID,
    appId: process.env.APPID,
    measurementId: process.env.MEASUREMENTID
});
exports.auth = (0, auth_1.getAuth)(fireBaseApp);
var credentials = process.env.CREEDENTIALSDK;
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(JSON.parse(credentials)),
});
console.log("Connected to Firebase");
exports.authSDK = firebase_admin_1.default.auth();
