import jwt from 'jsonwebtoken';
import { DataTypes } from 'sequelize';
import sequelize from '../../db.js';

// Modelo de Local
const Location = sequelize.define('Location', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    category: {
        type: DataTypes.ENUM('restaurant', 'shop', 'park', 'museum'),
        defaultValue: 'shop',
    },
    latitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    longitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
    },
    type: {
        type: DataTypes.STRING,
    },
    details: {
        type: DataTypes.TEXT,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, { 
    sequelize,
    modelName: 'Location',
    tableName: 'locations', 
    timestamps: true 
});

Location.sync({ alter: true }).then(() => {
    console.log('Tabela de locais sincronizada com o banco de dados.');
});

const handleError = (res, error, message) => res.status(500).json({ message, error });

const locationActions = {
    register: async (req, res) => {
        try {
            const { name, address, category, latitude, longitude, image, type, details } = req.body;
            if (!name || !address || !latitude || !longitude) return res.status(400).json({ message: 'Campos obrigatórios ausentes.' });

            const location = await Location.create({ name, address, category, latitude, longitude, image, type, details });
            res.status(201).json({ message: 'Local registrado com sucesso!', location });
        } catch (error) { handleError(res, error, 'Erro ao registrar local.'); }
    },
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, address, category, latitude, longitude, image, type, details } = req.body;
            const location = await Location.findByPk(id);
            if (!location) return res.status(404).json({ message: 'Local não encontrado.' });

            await location.update({ name, address, category, latitude, longitude, image, type, details });
            res.json({ message: 'Local atualizado com sucesso!', location });
        } catch (error) { handleError(res, error, 'Erro ao atualizar local.'); }
    },
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const location = await Location.findByPk(id);
            if (!location) return res.status(404).json({ message: 'Local não encontrado.' });

            await location.destroy();
            res.json({ message: 'Local deletado com sucesso!' });
        } catch (error) { handleError(res, error, 'Erro ao deletar local.'); }
    },
    getOne: async (req, res) => {
        try {
            const { id } = req.params;
            const location = await Location.findByPk(id);
            location ? res.json({ location }) : res.status(404).json({ message: 'Local não encontrado.' });
        } catch (error) { handleError(res, error, 'Erro ao buscar local.'); }
    },
    getAll: async (req, res) => {
        try {
            const locations = await Location.findAll();
            res.json({ locations });
        } catch (error) { handleError(res, error, 'Erro ao buscar locais.'); }
    }
};

const locationRoutesDatas = [
    { path: '/locations/register', method: 'post', tags: ['Locais'], summary: 'Registra um novo local', action: locationActions.register, requestBody: {
        required: true, content: {
            'application/json': { schema: { type: 'object', properties: {
                name: { type: 'string', example: 'Parque Central' },
                address: { type: 'string', example: '123 Rua Principal' },
                category: { type: 'string', example: 'park' },
                latitude: { type: 'number', example: 10.1 },
                longitude: { type: 'number', example: 125.6 },
                image: { type: 'string', example: 'http://example.com/image.jpg' },
                type: { type: 'string', example: 'outdoor' },
                details: { type: 'string', example: 'Detalhes sobre o local' }
            }, required: ['name', 'address', 'latitude', 'longitude'] } }
        }
    } },
    { path: '/locations/:id', method: 'put', tags: ['Locais'], summary: 'Atualiza um local', action: locationActions.update, requestBody: {
        required: true, content: {
            'application/json': { schema: { type: 'object', properties: {
                name: { type: 'string', example: 'Parque Central' },
                address: { type: 'string', example: '123 Rua Principal' },
                category: { type: 'string', example: 'park' },
                latitude: { type: 'number', example: 10.1 },
                longitude: { type: 'number', example: 125.6 },
                image: { type: 'string', example: 'http://example.com/image.jpg' },
                type: { type: 'string', example: 'outdoor' },
                details: { type: 'string', example: 'Detalhes sobre o local' }
            } } }
        }
    } },
    { path: '/locations/:id', method: 'delete', tags: ['Locais'], summary: 'Deleta um local', action: locationActions.delete },
    { path: '/locations/:id', method: 'get', tags: ['Locais'], summary: 'Busca um local', action: locationActions.getOne },
    { path: '/locations', method: 'get', tags: ['Locais'], summary: 'Lista todos os locais', action: locationActions.getAll }
];

export default locationRoutesDatas;
