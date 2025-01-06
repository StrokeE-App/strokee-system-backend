"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var cors_1 = __importDefault(require("cors"));
var mongoose_1 = __importDefault(require("mongoose"));
var swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
var swagger_config_1 = __importDefault(require("./config/swagger-config"));
var patientRoutes_1 = __importDefault(require("./routes/patients/patientRoutes"));
var indexRoute_1 = __importDefault(require("./routes/indexRoute"));
var errorMiddleware_1 = __importDefault(require("./middlewares/errorMiddleware"));
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var app = (0, express_1.default)();
var connectToMongo = function () {
    var MONGO_URI = process.env.MONGOURI;
    mongoose_1.default.Promise = Promise;
    mongoose_1.default.connect(MONGO_URI);
    mongoose_1.default.connection.on('connected', function () {
        console.log('Connected to MongoDB');
    });
    mongoose_1.default.connection.on('error', function (err) {
        console.log('Error connecting to MongoDB', err);
    });
};
connectToMongo();
app.use(errorMiddleware_1.default);
app.use((0, cors_1.default)({ credentials: true }));
app.use(body_parser_1.default.json());
app.use(indexRoute_1.default);
app.use("/dev", patientRoutes_1.default);
app.use('/swagger', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_config_1.default));
exports.default = app;
