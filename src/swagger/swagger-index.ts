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
const userEmergencyContacts = loadSwaggerFile("./users/userEmergencyContact.yaml") as any;
const paramedics = loadSwaggerFile("./users/paramedics.yaml") as any;
const admins = loadSwaggerFile("./users/admin.yaml") as any;
const clinics = loadSwaggerFile("./users/clinic.yaml") as any;
const healthCenter = loadSwaggerFile("./users/healthCenter.yaml") as any;
const emergencies = loadSwaggerFile("./emergencies/emergencies.yaml") as any;
const credentials = loadSwaggerFile("./users/credentials.yaml") as any;
const ambulance = loadSwaggerFile("./users/ambulance.yaml") as any;

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
    ...credentials.paths,
    ...patients.paths, 
    ...emergencyContacts.paths,
    ...userEmergencyContacts.paths,
    ...paramedics.paths,
    ...operators.paths,
    ...clinics.paths,
    ...healthCenter.paths,
    ...admins.paths,
    ...emergencies.paths,
    ...ambulance.paths

  },
};

export default swaggerDocs;
