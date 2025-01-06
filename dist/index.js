"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = __importDefault(require("http"));
var boostrap_1 = __importDefault(require("./boostrap"));
var server = http_1.default.createServer(boostrap_1.default);
var port = process.env.PORT || 4000;
server.listen(port, function () {
    console.log('Server is running');
});
