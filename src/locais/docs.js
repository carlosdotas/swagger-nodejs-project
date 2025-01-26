import jwt from 'jsonwebtoken';
import { DataTypes } from 'sequelize';
import sequelize from '../../db.js';

// Modelo de Local
const Location = sequelize.define('Location', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false, unique: true },
    category: {
        type: DataTypes.ENUM('restaurant', 'shop', 'park', 'museum'),
        allowNull: false,
        validate: { notEmpty: { msg: 'A categoria do local não pode estar vazia.' } },
        example: 'restaurant',
        defaultValue: 'shop',
    },
    coordinates: { type: DataTypes.GEOMETRY('POINT'), allowNull: false },
    image: { type: DataTypes.STRING, allowNull: true },
    icons: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true },
    type: { type: DataTypes.STRING, allowNull: true },
    details: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'locations', timestamps: true });

const handleError = (res, error, message) => res.status(500).json({ message, error });

const locationActions = {
    register: async (req, res) => {
        try {
            const { name, address, category, coordinates, image, icons, type, details } = req.body;
            if (!name || !address || !coordinates) return res.status(400).json({ message: 'Campos obrigatórios ausentes.' });

            const location = await Location.create({ name, address, category, coordinates, image, icons, type, details });
            res.status(201).json({ message: 'Local registrado com sucesso!', location });
        } catch (error) { handleError(res, error, 'Erro ao registrar local.'); }
    },
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, address, category, coordinates, image, icons, type, details } = req.body;
            const location = await Location.findByPk(id);
            if (!location) return res.status(404).json({ message: 'Local não encontrado.' });

            await location.update({ name, address, category, coordinates, image, icons, type, details });
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
                coordinates: { type: 'object', example: { type: 'Point', coordinates: [125.6, 10.1] } },
                image: { type: 'string', example: 'http://example.com/image.jpg' },
                icons: { type: 'array', items: { type: 'string' }, example: ['icon1', 'icon2'] },
                type: { type: 'string', example: 'outdoor' },
                details: { type: 'string', example: 'Detalhes sobre o local' }
            }, required: ['name', 'address', 'coordinates'] } }
        }
    } },
    { path: '/locations/:id', method: 'put', tags: ['Locais'], summary: 'Atualiza um local', action: locationActions.update, requestBody: {
        required: true, content: {
            'application/json': { schema: { type: 'object', properties: {
                name: { type: 'string', example: 'Parque Central' },
                address: { type: 'string', example: '123 Rua Principal' },
                category: { type: 'string', example: 'park' },
                coordinates: { type: 'object', example: { type: 'Point', coordinates: [125.6, 10.1] } },
                image: { type: 'string', example: 'http://example.com/image.jpg' },
                icons: { type: 'array', items: { type: 'string' }, example: ['icon1', 'icon2'] },
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
