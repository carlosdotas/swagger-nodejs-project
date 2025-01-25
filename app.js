import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import SwaggerConfig from './SwaggerConfig.js';

import authRoutesDatas from './src/auth/docs.js';
import userRoutesDatas from './src/users/docs.js';

const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const swaggerConfig = new SwaggerConfig(PORT, app, express,cors);

swaggerConfig.configureRoutes(authRoutesDatas);
swaggerConfig.configureRoutes(userRoutesDatas);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig.getSwaggerDefinition()));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
