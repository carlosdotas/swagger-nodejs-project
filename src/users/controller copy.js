import { Op } from 'sequelize';
import sequelize from './../../db.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { DataTypes } from 'sequelize';

dotenv.config();
const SALT_ROUNDS = 10;

const inputs = {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: { msg: 'O nome não pode estar vazio.' } }, example: 'John Doe' },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: { msg: 'O e-mail precisa ser válido.' } }, example: 'john.doe@example.com' },
    password: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: { msg: 'A senha não pode estar vazia.' }, len: [8, 100] }, example: 'password123' }
};




const User = sequelize.define('User', inputs, {
    tableName: 'users',
    timestamps: true,
    hooks: {
        beforeSave: async (user) => {
            if (user.changed('password')) user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
        }
    }
});

User.prototype.checkPassword = function (password) {
    return bcrypt.compare(password, this.password);
};

const handleError = (res, error, message) => res.status(500).json({ message, error: error.message });
const sendResponse = (res, data, total = null, message = '') => res.json({ data, total, message });

const getPaginationAndSorting = ({ page = 1, perPage = 10, sort = 'id', order = 'ASC' }) => ({
    offset: (page - 1) * perPage,
    limit: +perPage,
    order: [[sort, order.toUpperCase()]]
});

const getList = async (req, res) => {
    try {
        const { offset, limit, order } = getPaginationAndSorting(req.query);
        const filters = Object.fromEntries(
            Object.entries(req.query).filter(([key]) => !['page', 'perPage', 'sort', 'order'].includes(key))
                .map(([key, value]) => [key, { [Op.like]: `%${value}%` }])
        );

        const { rows: users, count: total } = await User.findAndCountAll({ where: filters, offset, limit, order, attributes: { exclude: ['password'] } });
        sendResponse(res, users, total);
    } catch (error) {
        handleError(res, error, 'Erro ao buscar usuários.');
    }
};

const getOne = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
        user ? sendResponse(res, user) : res.status(404).json({ message: 'Usuário não encontrado.' });
    } catch (error) {
        handleError(res, error, 'Erro ao buscar usuário.');
    }
};

const create = async (req, res) => {
    try {
        const { id, name, email } = await User.create(req.body);
        sendResponse(res, { id, name, email }, null, 'Usuário criado com sucesso.');
    } catch (error) {
        handleError(res, error, 'Erro ao criar usuário.');
    }
};

const update = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
        await user.update(req.body);
        sendResponse(res, user, null, 'Usuário atualizado com sucesso.');
    } catch (error) {
        handleError(res, error, 'Erro ao atualizar usuário.');
    }
};

const deleteOne = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
        await user.destroy();
        sendResponse(res, { id: user.id }, null, 'Usuário deletado com sucesso.');
    } catch (error) {
        handleError(res, error, 'Erro ao deletar usuário.');
    }
};

export  { getList, getOne, create, update, deleteOne ,inputs };
