// SwaggerConfig.js
class SwaggerConfig {
    constructor(PORT, router, express, cors) { 
        this.router = router;
        this.cors = cors;
        this.express = express;
        this.swaggerDefinition = {
            openapi: '3.0.0',
            info: {
                title: 'Swagger NodeJS Project',
                version: '1.0.0',
                description: 'API documentation gerada automaticamente com Swagger.',
                contact: {
                    name: 'Support Team',
                    email: 'support@example.com',
                    url: 'https://example.com'
                },
            },
            servers: [
                {
                    url: `http://localhost:${PORT}`,
                    description: 'Servidor local',
                },
                {
                    url: 'https://api.example.com',
                    description: 'Servidor de produção',
                },
            ],
            paths: {},
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                        description: 'Use um token JWT para autenticação.'
                    },
                },
                responses: {
                    InternalServerError: {
                        description: 'Erro interno do servidor.',
                    },
                    NotFound: {
                        description: 'Recurso não encontrado.',
                    },
                    OK: {
                        description: 'Requisição bem-sucedida',
                    },
                    Unauthorized: {
                        description: 'Não autorizado. O token JWT está ausente ou inválido.'
                    },
                },

            },
            security: [
                {
                    BearerAuth: []
                }
            ],
        };
    }
    

    // Function to configure routes
    configureRoutes(routesData) {
        routesData.forEach(route => {
            const swaggerPath = route.path.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
            this.swaggerDefinition.paths[swaggerPath] = this.swaggerDefinition.paths[swaggerPath] || {};
            this.swaggerDefinition.paths[swaggerPath][route.method] = {
                tags: route.tags,
                summary: route.summary,
                description: route.description,
                parameters: route.parameters || [],
                requestBody: route.requestBody  || {},
                security: route.authRequired ? [{ BearerAuth: [] }] : [],
                responses: {
                    200: {
                        description: this.swaggerDefinition.components.responses.OK.description,
                        content: {
                            'application/json': {
                                schema: route.schema
                            }
                        }
                    },
                    401: this.swaggerDefinition.components.responses.Unauthorized,
                    404: this.swaggerDefinition.components.responses.NotFound,
                    500: this.swaggerDefinition.components.responses.InternalServerError,
                },
            };
        });

         routesData.forEach (route => {


            const corsOptions = {
                origin: '*',
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                allowedHeaders: ['Content-Type', 'Authorization'],
            };

            this.router.use(this.cors(corsOptions));            
            this.router.use(this.express.json()); 
            
            if (route.authRequired) {
                this.router[route.method](route.path, this.verifyToken, route.action);
            } else {
                this.router[route.method](route.path, route.action);
            }
        });
    }

    // Middleware to verify JWT token
    verifyToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token não fornecido ou inválido.' });
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Token inválido.' });
        }
    }

    // Function to get the Swagger definition
    getSwaggerDefinition() {
        return this.swaggerDefinition;
    }
}

// Exporting the class for external use
export default SwaggerConfig;
