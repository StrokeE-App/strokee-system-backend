import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './swagger/swagger-index';
import patientsRoutes from './routes/patientRoutes'
import paramedicsRoutes from './routes/paramedicRoutes'
import emergencyRoutes from './routes/emergencyRoutes'
import indexRoutes from './routes/indexRoute'
import indexRoute from './routes/indexRoute'
import errorHandler from "./middlewares/errorMiddleware"
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import amqp from 'amqplib'; 

dotenv.config();
const app = express();
const RABBITMQ_URL = process.env.RABBIT_MQ || 'amqp://localhost';

const connectToMongo = () => {
    
    const MONGO_URI = process.env.MONGOURI!
    
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


app.use(cookieParser());
app.use(cors({ credentials: true }));
app.use(bodyParser.json());
app.use(indexRoute)
app.use("/patient", patientsRoutes);
app.use("/paramedic", paramedicsRoutes);
app.use("/emergency", emergencyRoutes);
app.use("/", indexRoutes);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware para manejar errores debe ser el último middleware
app.use(errorHandler);


export default app;