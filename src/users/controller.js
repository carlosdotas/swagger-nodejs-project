import { Op } from 'sequelize';
import sequelize from './../../db.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { DataTypes } from 'sequelize';

dotenv.config();
const SALT_ROUNDS = 10;

class Model {
    constructor() {
        // Inicialização padrão
        this.modelName = null;
        this.tableName = null;
        this.inputs = null;
        this.Model = null; // Será definido quando setInputs for chamado
    }

    setModelName(name) {
        this.modelName = name;
    }

    setTable(tableName) {
        this.tableName = tableName;
    }

    setInputs(inputs) {
        this.inputs = inputs;
        this.Model = sequelize.define(this.modelName || 'Model', this.inputs, {
            tableName: this.tableName || 'models',
            timestamps: true,
            hooks: {
                beforeSave: async (modelInstance) => {
                    if (modelInstance.changed('password')) {
                        modelInstance.password = await bcrypt.hash(modelInstance.password, SALT_ROUNDS);
                    }
                }
            }
        });

        this.Model.prototype.checkPassword = function (password) {
            return bcrypt.compare(password, this.password);
        };
    }

    // Novo método getInputs
    getInputs() {
        if (!this.inputs) {
            throw new Error('Os inputs não foram definidos. Utilize o método setInputs para configurá-los.');
        }
        return this.inputs;
    }

    handleError(res, error, message) {
        return res.status(500).json({ message, error: error.message });
    }

    sendResponse(res, data, total = null, message = '') {
        return res.json({ data, total, message });
    }

    getPaginationAndSorting(query) {
        const { page = 1, perPage = 10, sort = 'id', order = 'ASC' } = query;
        return {
            offset: (page - 1) * perPage,
            limit: +perPage,
            order: [[sort, order.toUpperCase()]]
        };
    }

    async getList(req, res) {
        try {
            const { offset, limit, order } = this.getPaginationAndSorting(req.query);
            const filters = Object.fromEntries(
                Object.entries(req.query).filter(([key]) => !['page', 'perPage', 'sort', 'order'].includes(key))
                    .map(([key, value]) => [key, { [Op.like]: `%${value}%` }])
            );

            const { rows: models, count: total } = await this.Model.findAndCountAll({
                where: filters,
                offset,
                limit,
                order,
                attributes: { exclude: ['password'] }
            });

            this.sendResponse(res, models, total);
        } catch (error) {
            this.handleError(res, error, 'Erro ao buscar registros.');
        }
    }

    async getOne(req, res) {
        try {
            const modelInstance = await this.Model.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
            modelInstance ? this.sendResponse(res, modelInstance) : res.status(404).json({ message: 'Registro não encontrado.' });
        } catch (error) {
            this.handleError(res, error, 'Erro ao buscar registro.');
        }
    }

    async create(req, res) {
        try {
            const newInstance = await this.Model.create(req.body);
            this.sendResponse(res, newInstance, null, 'Registro criado com sucesso.');
        } catch (error) {
            this.handleError(res, error, 'Erro ao criar registro.');
        }
    }

    async update(req, res) {
        try {
            const modelInstance = await this.Model.findByPk(req.params.id);
            if (!modelInstance) return res.status(404).json({ message: 'Registro não encontrado.' });
            await modelInstance.update(req.body);
            this.sendResponse(res, modelInstance, null, 'Registro atualizado com sucesso.');
        } catch (error) {
            this.handleError(res, error, 'Erro ao atualizar registro.');
        }
    }

    async deleteOne(req, res) {
        try {
            const modelInstance = await this.Model.findByPk(req.params.id);
            if (!modelInstance) return res.status(404).json({ message: 'Registro não encontrado.' });
            await modelInstance.destroy();
            this.sendResponse(res, { id: modelInstance.id }, null, 'Registro deletado com sucesso.');
        } catch (error) {
            this.handleError(res, error, 'Erro ao deletar registro.');
        }
    }
}

const model = new Model();

export default model;

