import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './swagger/swagger-index';
import patientsRoutes from './routes/patients/patientRoutes'
import paramedicsRoutes from './routes/paramedics/paramedicRoutes'
import indexRoutes from './routes/indexRoute'
import indexRoute from './routes/indexRoute'
import errorHandler from "./middlewares/errorMiddleware"
import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();

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

const amqpUrl = process.env.RABBITMQ_URI!;

async function connectRabbitMQ(): Promise<void> {
  try {
    const connection: Connection = await amqp.connect(amqpUrl);
    const channel: Channel = await connection.createChannel();

    const queue = 'test_queue';

    await channel.assertQueue(queue, { durable: true });

    console.log(`Conectado a RabbitMQ y esperando mensajes en la cola: ${queue}`);

    channel.consume(queue, (msg: ConsumeMessage | null) => {
      if (msg) {
        console.log(`Mensaje recibido: ${msg.content.toString()}`);
        channel.ack(msg); 
      }
    });

  } catch (error) {
    console.error('Error al conectar con RabbitMQ:', error);
  }
}


connectToMongo()
connectRabbitMQ()


app.use(cookieParser());
app.use(cors({ credentials: true }));
app.use(bodyParser.json());
app.use(indexRoute)
app.use("/patient", patientsRoutes);
app.use("/paramedic", paramedicsRoutes);
app.use("/", indexRoutes);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware para manejar errores debe ser el último middleware
app.use(errorHandler);


export default app;