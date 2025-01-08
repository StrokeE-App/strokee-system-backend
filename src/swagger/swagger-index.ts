import path from "path";
import { readFileSync } from "fs";
import yaml from "js-yaml";

const loadSwaggerFile = (filename: string) => {
  const filePath = path.join(__dirname, filename);
  const fileContent = readFileSync(filePath, "utf-8");
  return yaml.load(fileContent);
};

const swaggerDocs = {
  openapi: "3.0.0",
  info: {
    title: "API de Ejemplo",
    version: "1.0.0",
    description: "Documentación de la API",
  },
  servers: [
    {
      url: "http://localhost:4000", // Cambia según tu configuración
    },
  ],
  paths: {
    ...(loadSwaggerFile("./auth/loginSwagger.yaml") as any).paths,
  },
};

export default swaggerDocs;
