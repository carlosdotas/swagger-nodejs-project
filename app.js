import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import SwaggerConfig from './SwaggerConfig.js';

import authRoutesDatas from './routes/authRoutes.js';
import userRoutesDatas from './src/users/veiw.js';
import productRoutesDatas from './routes/productsRoutes.js';

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
swaggerConfig.configureRoutes(productRoutesDatas);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig.getSwaggerDefinition()));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
