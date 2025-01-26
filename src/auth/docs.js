import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { DataTypes } from 'sequelize';
import sequelize from '../../db.js';

// Modelo de Usuário com autenticação
const AuthUser = sequelize.define('AuthUser', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false, unique: true }, // Atualizado para 'phone'
    password: { type: DataTypes.STRING, allowNull: false },    
    userType: {
        type: DataTypes.ENUM('admin', 'moderator', 'user'), // Define tipos predefinidos
        allowNull: false,
        validate: { notEmpty: { msg: 'O tipo de usuário não pode estar vazio.' } },
        example: 'admin',
        defaultValue: 'user', // Define o valor padrão
    },
    userGroup: {
        type: DataTypes.ENUM('finance', 'sales', 'support', 'development'), // Define grupos predefinidos
        allowNull: false,
        validate: { notEmpty: { msg: 'O grupo de usuário não pode estar vazio.' } },
        example: 'finance',
        defaultValue: 'sales', // Define o valor padrão
    }
}, { tableName: 'users', timestamps: true });


const SECRET_KEY = 'sua_chave_secreta';

const handleError = (res, error, message) => res.status(500).json({ message, error });

const activeTokens = new Set();

const authActions = {
    register: async (req, res) => {
        try {
            const { name, phone, password, userType, userGroup } = req.body;
            if (!name || !phone || !password) return res.status(400).json({ message: 'Campos obrigatórios ausentes.' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await AuthUser.create({ name, phone, password: hashedPassword, userType, userGroup });

            res.status(201).json({ message: 'Usuário registrado com sucesso!', user });
        } catch (error) { handleError(res, error, 'Erro ao registrar usuário.'); }
    },
    login: async (req, res) => {
        try {
            const { phone, password } = req.body;
            if (!phone || !password) return res.status(400).json({ message: 'phone e senha são obrigatórios.' });

            const user = await AuthUser.findOne({ where: { phone } });
            if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) return res.status(401).json({ message: 'Senha inválida.' });

            const token = jwt.sign({ id: user.id, phone: user.phone }, SECRET_KEY, { expiresIn: '1h' });
            activeTokens.add(token);
            res.json({ message: 'Login bem-sucedido!', token });
        } catch (error) { handleError(res, error, 'Erro ao fazer login.'); }
    },
    logoff: (req, res) => {
        const token = req.headers['authorization'];
        if (!token) return res.status(400).json({ message: 'Token não fornecido.' });

        const actualToken = token.split(' ')[1];
        if (activeTokens.has(actualToken)) {
            activeTokens.delete(actualToken);
            res.json({ message: 'Logoff bem-sucedido!' });
        } else {
            res.status(400).json({ message: 'Token inválido ou já expirado.' });
        }
    },
    authenticate: (req, res, next) => {
        const token = req.headers['authorization'];
        if (!token) return res.status(401).json({ message: 'Token não fornecido.' });

        const actualToken = token.split(' ')[1];
        if (!activeTokens.has(actualToken)) return res.status(401).json({ message: 'Token inválido ou já expirado.' });

        jwt.verify(actualToken, SECRET_KEY, (err, decoded) => {
            if (err) return res.status(401).json({ message: 'Token inválido.' });
            req.user = decoded;
            next();
        });
    },
    check: (req, res) => {
        const token = req.headers['authorization'];
        if (!token) return res.status(400).json({ message: 'Token não fornecido.' });

        const actualToken = token.split(' ')[1];
        if (!activeTokens.has(actualToken)) return res.status(401).json({ message: 'Token inválido ou já expirado.' });

        jwt.verify(actualToken, SECRET_KEY, (err, decoded) => {
            if (err) return res.status(401).json({ message: 'Token inválido.' });
            res.json({ message: 'Token válido.', user: decoded });
        });
    },
    generateUserToken: (req, res) => {
        try {
            const { userId, duration } = req.body;
            if (!userId || !duration) return res.status(400).json({ message: 'Parâmetros obrigatórios ausentes.' });

            const token = jwt.sign({ userId }, SECRET_KEY, { expiresIn: duration });
            res.json({ message: 'Token gerado com sucesso.', token });
        } catch (error) {
            handleError(res, error, 'Erro ao gerar o token.');
        }
    }
};

const authRoutesDatas = [
    { path: '/auth/register', method: 'post', tags: ['Autenticação'], summary: 'Registra um novo usuário', action: authActions.register, requestBody: {
        required: true, content: {
            'application/json': { schema: { type: 'object', properties: {
                name: { type: 'string', example: 'John Doe' },
                phone: { type: 'string', example: '62996157340' },
                password: { type: 'string', example: '12345678' },
                userType: { type: 'string', example: 'user' },
                userGroup: { type: 'string', example: 'sales' }
            }, required: ['name', 'phone', 'password'] } }
        }
    } },
    { path: '/auth/login', method: 'post', tags: ['Autenticação'], summary: 'Faz login de um usuário', action: authActions.login, requestBody: {
        required: true, content: {
            'application/json': { schema: { type: 'object', properties: {
                phone: { type: 'string', example: '62996157340'  },
                password: { type: 'string', example: '123456' }
            }, required: ['phone', 'password'] } }
        }
    } },
    { path: '/auth/logoff', method: 'post', tags: ['Autenticação'], summary: 'Faz logoff de um usuário', action: authActions.logoff },
    { path: '/auth/check', method: 'get', tags: ['Autenticação'], summary: 'Verifica a validade do token', action: authActions.check },
    { path: '/auth/generate-token', method: 'post', tags: ['Autenticação'], summary: 'Gera um token personalizado para um usuário', action: authActions.generateUserToken, requestBody: {
        required: true, content: {
            'application/json': { schema: { type: 'object', properties: {
                userId: { type: 'integer', example: 1 },
                duration: { type: 'string', example: '1h' }
            }, required: ['userId', 'duration'] } }
        }
    } }
];

export default authRoutesDatas;
