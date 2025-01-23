import path from "path";
import { readFileSync } from "fs";
import yaml from "js-yaml";

const loadSwaggerFile = (filename: string) => {
  const filePath = path.join(__dirname, filename);
  const fileContent = readFileSync(filePath, "utf-8");
  return yaml.load(fileContent);
};

const loginSwagger = loadSwaggerFile("./auth/loginSwagger.yaml") as any;
const patients = loadSwaggerFile("./users/patients.yaml") as any;
const operators = loadSwaggerFile("./users/operators.yaml") as any;
const emergencyContacts = loadSwaggerFile("./users/emergencyContacts.yaml") as any;
const paramedics = loadSwaggerFile("./users/paramedics.yaml") as any;
const emergencies = loadSwaggerFile("./emergencies/emergencies.yaml") as any;

const swaggerDocs = {
  openapi: "3.0.0",
  info: {
    title: "StrokeE back-end API",
    version: "1.0.0",
    description: "Documentación de la API",
  },
  servers: [
    {
      url: "http://localhost:4000", 
    },
  ],
  paths: {
    ...loginSwagger.paths, 
    ...patients.paths, 
    ...emergencyContacts.paths,
    ...paramedics.paths,
    ...operators.paths,
    ...emergencies.paths,
  },
};

export default swaggerDocs;
