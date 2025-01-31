import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { DataTypes } from 'sequelize';
import sequelize from '../../db.js';

//ok

// Modelo de Usuário com autenticação
const AuthUser = sequelize.define('AuthUser', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    userType: {
        type: DataTypes.ENUM('admin', 'moderator', 'user'),
        allowNull: false,
        validate: { notEmpty: { msg: 'O tipo de usuário não pode estar vazio.' } },
        defaultValue: 'user',
    },
    userGroup: {
        type: DataTypes.ENUM('finance', 'sales', 'support', 'development'),
        allowNull: false,
        validate: { notEmpty: { msg: 'O grupo de usuário não pode estar vazio.' } },
        defaultValue: 'sales',
    }
}, { tableName: 'users', timestamps: true });

AuthUser.sync({ alter: true }).then(() => console.log('Tabela de usuários sincronizada com o banco de dados.'));

// Modelo de Log de Autenticação
const AuthUserLog = sequelize.define('AuthUserLog', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    status: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    token: { type: DataTypes.STRING, allowNull: false },
    session_id: { type: DataTypes.STRING },
    expires_at: { type: DataTypes.DATE },
    ip: { type: DataTypes.STRING },
    user_agent: { type: DataTypes.STRING },
    login_date: { type: DataTypes.DATE },
    logout_date: { type: DataTypes.DATE },
    check_date: { type: DataTypes.DATE }
}, { tableName: 'auth_user_logs', timestamps: true });

AuthUserLog.sync({ alter: true }).then(() => console.log('Tabela de logs sincronizada com o banco de dados.'));

const SECRET_KEY = 'dotasSistemas2025'; // Chave secreta para JWT

const handleError = (res, error, message) => {
    console.error(message, error);
    res.status(500).json({ message, error: error.message });
};

const authActions = {
    register: async (req, res) => {
        try {
            const { name, phone, password, userType, userGroup } = req.body;
            if (!name || !phone || !password) {
                return res.status(400).json({ message: 'Campos obrigatórios ausentes.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await AuthUser.create({ name, phone, password: hashedPassword, userType, userGroup });

            res.status(201).json({ message: 'Usuário registrado com sucesso!', user });
        } catch (error) {
            handleError(res, error, 'Erro ao registrar usuário.');
        }
    },

    login: async (req, res) => {
        try {
            const { phone, password } = req.body;
            if (!phone || !password) {
                return res.status(400).json({ message: 'Phone e senha são obrigatórios.' });
            }

            const user = await AuthUser.findOne({ where: { phone } });
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado.' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Senha inválida.' });
            }

            const token = jwt.sign({ id: user.id, phone: user.phone, name: user.name, userGroup: user.userGroup, userType: user.userType }, SECRET_KEY, { expiresIn: '1y' });

            await AuthUserLog.create({
                session_id: req.headers['authorization'],
                status: 'active',
                ip: req.ip,
                user_agent: req.headers['user-agent'],
                expires_at: new Date(Date.now() + 3600000), // 1 hora de expiração
                name: user.name,
                user_id: user.id,
                token,
                login_date: new Date(),
            });

            res.json({ message: 'Login bem-sucedido!', token });
        } catch (error) {
            handleError(res, error, 'Erro ao fazer login.');
        }
    },

    logoff: async (req, res) => {
        try {
            // Obtém o token da query string ou do cabeçalho
            const token = req.query.token || req.headers['authorization'];
            if (!token) {
                return res.status(400).json({ message: 'Token não fornecido.' });
            }

            // Remove o prefixo 'Bearer ' do token, se presente
            const actualToken = token.split(' ')[1] || token;

            // Verifica se o token existe e está ativo no AuthUserLog
            const logEntry = await AuthUserLog.findOne({ where: { token: actualToken, status: 'active' } });
            if (!logEntry) {
                return res.status(400).json({ message: 'Token inválido ou já expirado.' });
            }

            // Atualiza o log para inativo e define a data de logout
            await AuthUserLog.update(
                { logout_date: new Date(), status: 'inactive' },
                { where: { token: actualToken } }
            );

            res.json({ message: 'Logoff bem-sucedido!' });
        } catch (error) {
            handleError(res, error, 'Erro ao fazer logoff.');
        }
    },

    authenticate: async (req, res, next) => {
        try {
            const token = req.headers['authorization'];
            if (!token) {
                return res.status(401).json({ message: 'Token não fornecido.' });
            }

            const actualToken = token.split(' ')[1];

            // Verifica se o token existe e está ativo no AuthUserLog
            const logEntry = await AuthUserLog.findOne({ where: { token: actualToken, status: 'active' } });
            if (!logEntry) {
                return res.status(401).json({ message: 'Token inválido ou já expirado.' });
            }

            // Verifica a validade do token usando a chave secreta
            jwt.verify(actualToken, SECRET_KEY, (err, decoded) => {
                if (err) {
                    console.error('Erro ao verificar o token:', err);
                    return res.status(401).json({ message: 'Token inválido.' });
                }
                req.user = decoded; // Adiciona o payload do token ao objeto `req`
                next();
            });
        } catch (error) {
            handleError(res, error, 'Erro ao autenticar.');
        }
    },

    check: async (req, res) => {
        try {
            const token = req.query.token || req.headers['x-access-token'] || req.headers['authorization'];
            if (!token) {
                return res.status(400).json({ message: 'Token não fornecido.' });
            }

            const actualToken = token.split(' ')[1] || token;

            // Verifica se o token existe e está ativo no AuthUserLog
            const logEntry = await AuthUserLog.findOne({ where: { token: actualToken, status: 'active' } });
            if (!logEntry) {
                return res.status(401).json({ message: 'Token inválido ou já expirado.' });
            }

            // Verifica a validade do token usando a chave secreta
            jwt.verify(actualToken, SECRET_KEY, async (err, decoded) => {
                if (err) {
                    console.error('Erro ao verificar o token:', err);
                    return res.status(401).json({ message: 'Token inválido.' });
                }

                // Atualiza a data de verificação no log de autenticação
                await AuthUserLog.update(
                    { check_date: new Date() },
                    { where: { token: actualToken } }
                );

                res.json({ message: 'Token válido.', user: decoded });
            });
        } catch (error) {
            handleError(res, error, 'Erro ao verificar o token.');
        }
    }
};

// Rotas de autenticação
const authRoutesDatas = [
    {
        path: '/auth/register',
        method: 'post',
        tags: ['Autenticação'],
        summary: 'Registra um novo usuário',
        action: authActions.register,
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            name: { type: 'string', example: 'John Doe' },
                            phone: { type: 'string', example: '62996157340' },
                            password: { type: 'string', example: '12345678' },
                            userType: { type: 'string', example: 'user' },
                            userGroup: { type: 'string', example: 'sales' }
                        },
                        required: ['name', 'phone', 'password']
                    }
                }
            }
        }
    },
    {
        path: '/auth/login',
        method: 'post',
        tags: ['Autenticação'],
        summary: 'Faz login de um usuário',
        action: authActions.login,
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            phone: { type: 'string', example: '62996157340' },
                            password: { type: 'string', example: '123456' }
                        },
                        required: ['phone', 'password']
                    }
                }
            }
        }
    },
    {
        path: '/auth/logoff', // Rota para logoff de usuário
        method: 'get', // Método HTTP
        tags: ['Autenticação'], // Tags para organização
        summary: 'Faz logoff de um usuário', // Descrição resumida da rota
        action: authActions.logoff, // Função que executa a ação
        parameters: [ // Parâmetros esperados via query string
            {
                name: 'token', // Nome do parâmetro
                in: 'query', // Localização do parâmetro (query string)
                description: 'Token JWT para fazer logoff', // Descrição do parâmetro
                required: true, // Indica que o parâmetro é obrigatório
                schema: {
                    type: 'string', // Tipo do parâmetro
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Exemplo de token
                }
            }
        ]
    },
    {
        path: '/auth/check', // Rota para verificar a validade do token
        method: 'get', // Método HTTP
        tags: ['Autenticação'], // Tags para organização
        summary: 'Verifica a validade do token', // Descrição resumida da rota
        action: authActions.check, // Função que executa a ação
        parameters: [ // Parâmetros esperados via query string
            {
                name: 'token', // Nome do parâmetro
                in: 'query', // Localização do parâmetro (query string)
                description: 'Token JWT para verificação', // Descrição do parâmetro
                required: true, // Indica que o parâmetro é obrigatório
                schema: {
                    type: 'string', // Tipo do parâmetro
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Exemplo de token
                }
            }
        ]
    }
];

export default authRoutesDatas;