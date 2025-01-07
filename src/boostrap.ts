import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger-config'; 
import patientsRoutes from './routes/patients/patientRoutes'
import indexRoute from './routes/indexRoute'
import errorHandler from "./middlewares/errorMiddleware"
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

connectToMongo()


app.use(errorHandler);
app.use(cookieParser());
app.use(cors({ credentials: true }));
app.use(bodyParser.json());
app.use(indexRoute)
app.use("/patient", patientsRoutes);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


export default app;