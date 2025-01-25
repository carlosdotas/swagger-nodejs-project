import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { DataTypes } from 'sequelize';
import sequelize from '../../db.js';

// Modelo de Usuário com autenticação
const AuthUser = sequelize.define('AuthUser', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'users', timestamps: true });

const SECRET_KEY = 'sua_chave_secreta';

const handleError = (res, error, message) => res.status(500).json({ message, error });

const activeTokens = new Set();

const authActions = {
    register: async (req, res) => {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) return res.status(400).json({ message: 'Campos obrigatórios ausentes.' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await AuthUser.create({ name, email, password: hashedPassword });

            res.status(201).json({ message: 'Usuário registrado com sucesso!', user });
        } catch (error) { handleError(res, error, 'Erro ao registrar usuário.'); }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) return res.status(400).json({ message: 'Email e senha são obrigatórios.' });

            const user = await AuthUser.findOne({ where: { email } });
            if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) return res.status(401).json({ message: 'Senha inválida.' });

            const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
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
    }
};

const authRoutesDatas = [
    { path: '/auth/register', method: 'post', tags: ['Autenticação'], summary: 'Registra um novo usuário', action: authActions.register, requestBody: {
        required: true, content: {
            'application/json': { schema: { type: 'object', properties: {
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john.doe@example.com' },
                password: { type: 'string', example: '123456' }
            }, required: ['name', 'email', 'password'] } }
        }
    } },
    { path: '/auth/login', method: 'post', tags: ['Autenticação'], summary: 'Faz login de um usuário', action: authActions.login, requestBody: {
        required: true, content: {
            'application/json': { schema: { type: 'object', properties: {
                email: { type: 'string', example: 'john.doe@example.com' },
                password: { type: 'string', example: '123456' }
            }, required: ['email', 'password'] } }
        }
    } },
    { path: '/auth/logoff', method: 'post', tags: ['Autenticação'], summary: 'Faz logoff de um usuário', action: authActions.logoff },
    { path: '/auth/check', method: 'get', tags: ['Autenticação'], summary: 'Verifica a validade do token', action: authActions.check }
];

export default authRoutesDatas;
