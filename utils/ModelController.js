import { Op } from 'sequelize';
import sequelize from '../db.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();
const SALT_ROUNDS = 10;

class ModelControllerClass {
    constructor() {
        this.modelName = null;
        this.tableName = null;
        this.inputs = null;
        this.Model = null;

        // Vinculando os métodos para preservar o contexto de `this`
        this.handleError = this.handleError.bind(this);
        this.sendResponse = this.sendResponse.bind(this);
        this.getList = this.getList.bind(this);
        this.getOne = this.getOne.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.deleteOne = this.deleteOne.bind(this);
        this.createTables = this.createTables.bind(this);
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

        this.Model.prototype.checkPassword = async function (password) {
            return await bcrypt.compare(password, this.password);
        };
    }

    async createTables(alter = false) {
        if (!this.Model) {
            throw new Error('O modelo ainda não foi definido. Use o método setInputs para configurá-lo.');
        }
        try {
            await this.Model.sync({ alter: true }); // `alter: true` atualiza a tabela para coincidir com o modelo
            console.log(`Tabela "${this.tableName || 'models'}" criada ou atualizada com sucesso.`);
        } catch (error) {
            console.error('Erro ao criar ou atualizar as tabelas:', error.message);
        }
    }

    getInputs() {
        if (!this.inputs) {
            throw new Error('Os inputs não foram definidos. Utilize o método setInputs para configurá-los.');
        }
        return this.inputs;
    }

    handleError(res, error, message) {
        return res.status(500).json({ success: false, message, error: error.message }); // Corrigido para false
    }

    sendResponse(res, data, total = null, message = '') {
        return res.json({ success: true, data, total, message });
    }

    getPaginationAndSorting(query) {
        const { page = 1, perPage = 100000, sort = 'id', order = 'DESC' } = query;
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
            modelInstance ? this.sendResponse(res, modelInstance) : res.status(404).json({ success: false, message: 'Registro não encontrado.' }); // Corrigido para false
        } catch (error) {
            this.handleError(res, error, 'Erro ao buscar registro.');
        }
    }

    async create(req, res) {
        try {
            const newInstance = await this.Model.create(req.body);
            this.sendResponse(res, newInstance, null, 'Registro criado com sucesso.');
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                const fields = Object.keys(error.fields).join(', ');
                return res.status(400).json({
                    success: false, // Corrigido para false
                    message: `Erro de duplicidade: o(s) campo(s) ${fields} já existe(m).`
                });
            }
            if (error.name === 'SequelizeValidationError') {
                const validationErrors = error.errors.map(err => err.message).join(', ');
                return res.status(400).json({
                    success: false, // Corrigido para false
                    message: `Erro de validação: ${validationErrors}`
                });
            }
            this.handleError(res, error, 'Erro ao criar registro.');
        }
    }

    async update(req, res) {
        try {
            const modelInstance = await this.Model.findByPk(req.params.id);
            if (!modelInstance) return res.status(404).json({ success: false, message: 'Registro não encontrado.' }); // Corrigido para false
            await modelInstance.update(req.body);
            this.sendResponse(res, modelInstance, null, 'Registro atualizado com sucesso.');
        } catch (error) {
            this.handleError(res, error, 'Erro ao atualizar registro.');
        }
    }

    async deleteOne(req, res) {
        try {
            const modelInstance = await this.Model.findByPk(req.params.id);
            if (!modelInstance) return res.status(404).json({ success: false, message: 'Registro não encontrado.' }); // Corrigido para false
            await modelInstance.destroy();
            this.sendResponse(res, { id: modelInstance.id }, null, 'Registro deletado com sucesso.');
        } catch (error) {
            this.handleError(res, error, 'Erro ao deletar registro.');
        }
    }
}



export default ModelControllerClass;