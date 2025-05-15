import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './swagger/swagger-index';
import patientsRoutes from './routes/patientRoutes'
import paramedicsRoutes from './routes/paramedicRoutes'
import emergencyContactRoutes from './routes/emergencyContactRoute'
import pushNotificationsRoutes from './routes/pushNotificationsRoute'
import clinicRoutes from './routes/clinicRoute'
import emergencyRoutes from './routes/emergencyRoutes'
import operatorRoutes from './routes/operatorRoutes'
import healthCenterRoutes from './routes/healthCenterRoute'
import ambulanceRoutes from './routes/ambulanceRoute'
import adminRoutes from './routes/adminRoute'
import indexRoutes from './routes/indexRoute'
import indexRoute from './routes/indexRoute'
import creentialsRoute from './routes/creedentialsRoute'
import errorHandler from "./middlewares/errorMiddleware"
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import amqp from 'amqplib';
import path = require('path');



dotenv.config();
const app = express();
const RABBITMQ_URL = process.env.RABBIT_MQ || 'amqp://localhost';
console.log(RABBITMQ_URL)

const connectToMongo = () => {

  const MONGO_URI = process.env.MONGOURI || 'mongodb://localhost:27017';
  console.log(MONGO_URI)

  mongoose.Promise = Promise;
  mongoose.connect(MONGO_URI)
  mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
  }
  );

  mongoose.connection.on('error', (err) => {
    console.log('Error connecting to MongoDB', err);
  }
  );

}

const connectToRabbitMQ = async () => {
  try {
    await amqp.connect(RABBITMQ_URL);
    console.log('Connected to RabbitMQ');

  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
  }
};

connectToMongo()
connectToRabbitMQ()


app.use(express.static(path.join(__dirname, "../public")));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.json());
app.use(indexRoute)
app.use("/strokeebackend/api/patient", patientsRoutes);
app.use("/strokeebackend/api/push-notifications", pushNotificationsRoutes);
app.use("/strokeebackend/api/healthCenter", healthCenterRoutes);
app.use("/strokeebackend/api/clinic", clinicRoutes);
app.use("/strokeebackend/api/emergency-contact", emergencyContactRoutes);
app.use("/strokeebackend/api/ambulance", ambulanceRoutes);
app.use("/strokeebackend/api/admin", adminRoutes);
app.use("/strokeebackend/api/paramedic", paramedicsRoutes);
app.use("/strokeebackend/api/emergency", emergencyRoutes);
app.use("/strokeebackend/api/operator", operatorRoutes)
app.use("/strokeebackend/api/credentials", creentialsRoute)
app.use("/strokeebackend/api/", indexRoutes);
app.use('/strokeebackend/api/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware para manejar errores debe ser el último middleware
app.use(errorHandler);


export default app;