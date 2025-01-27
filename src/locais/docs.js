import getPlaceDetails from './GetPlaceDetails.js';
import { DataTypes } from 'sequelize';
import sequelize from '../../db.js';


(async () => {
    const local = await getPlaceDetails('https://maps.app.goo.gl/HaHcAZVPBX4umESC7', 'AIzaSyAt3Lem8uwX9oCsuFjFacdsEtm9IU991oI');
    console.log(local);
})();

const Location = sequelize.define('Location', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    endereco: { type: DataTypes.STRING, allowNull: false },
    cidade: DataTypes.STRING,
    cep: DataTypes.STRING,
    place_id: DataTypes.STRING,
    rating: DataTypes.FLOAT,
    icon: DataTypes.STRING,
    icon_background_color: DataTypes.STRING,
    photos: DataTypes.STRING,
    url: DataTypes.STRING,
    types: DataTypes.STRING,
    qd_lt: DataTypes.STRING,
    street_number: DataTypes.STRING,
    Lagradouto: DataTypes.STRING,
    setor: DataTypes.STRING,
    estado: DataTypes.STRING,
    lat: DataTypes.DOUBLE,
    lng: DataTypes.DOUBLE,
    telefone: DataTypes.STRING,
    horarioFuncionamento: DataTypes.STRING,
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { sequelize, modelName: 'Location', tableName: 'locations', timestamps: true });

Location.sync({ alter: true }).then(() => console.log('Tabela de locais sincronizada com o banco de dados.'));

const handleError = (res, error, message) => res.status(500).json({ message, error });

const locationActions = {
    register: async (req, res) => {
        try {
            const { name, endereco, cidade, cep, place_id, rating, icon, icon_background_color, photos, url, types, qd_lt, street_number, Lagradouto, setor, estado, lat, lng, telefone, horarioFuncionamento } = req.body;
            if (!name || !endereco || lat === null || lng === null) return res.status(400).json({ message: 'Campos obrigatórios ausentes.' });
            const location = await Location.create({ name, endereco, cidade, cep, place_id, rating, icon, icon_background_color, photos, url, types, qd_lt, street_number, Lagradouto, setor, estado, lat, lng, telefone, horarioFuncionamento });
            res.status(201).json({ message: 'Local registrado com sucesso!', location });
        } catch (error) {
            handleError(res, error, 'Erro ao registrar local.');
        }
    },
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const location = await Location.findByPk(id);
            if (!location) return res.status(404).json({ message: 'Local não encontrado.' });
            const { name, endereco, cidade, cep, place_id, rating, icon, icon_background_color, photos, url, types, qd_lt, street_number, Lagradouto, setor, estado, lat, lng, telefone, horarioFuncionamento } = req.body;
            await location.update({ name, endereco, cidade, cep, place_id, rating, icon, icon_background_color, photos, url, types, qd_lt, street_number, Lagradouto, setor, estado, lat, lng, telefone, horarioFuncionamento });
            res.json({ message: 'Local atualizado com sucesso!', location });
        } catch (error) {
            handleError(res, error, 'Erro ao atualizar local.');
        }
    },
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const location = await Location.findByPk(id);
            if (!location) return res.status(404).json({ message: 'Local não encontrado.' });
            await location.destroy();
            res.json({ message: 'Local deletado com sucesso!' });
        } catch (error) {
            handleError(res, error, 'Erro ao deletar local.');
        }
    },
    getOne: async (req, res) => {
        try {
            const { id } = req.params;
            const location = await Location.findByPk(id);
            location ? res.json({ location }) : res.status(404).json({ message: 'Local não encontrado.' });
        } catch (error) {
            handleError(res, error, 'Erro ao buscar local.');
        }
    },
    getAll: async (req, res) => {
        try {
            const locations = await Location.findAll();
            res.json({ locations });
        } catch (error) {
            handleError(res, error, 'Erro ao buscar locais.');
        }
    },
    getPlaceDetails: async (req, res) => {
        try {
            const { placeId, apiKey } = req.params;
            const local = await getPlaceDetails(placeId, apiKey);
            res.json({ local });
        } catch (error) {
            handleError(res, error, 'Erro ao buscar detalhes do local.');
        }
        //('https://maps.app.goo.gl/HaHcAZVPBX4umESC7', 'AIzaSyAt3Lem8uwX9oCsuFjFacdsEtm9IU991oI')
    },
};

const locationRoutesDatas = [
    { path: '/locations/register', method: 'post', tags: ['Locais'], summary: 'Registra um novo local', action: locationActions.register, requestBody: {
        required: true, content: {
            'application/json': { schema: { type: 'object', properties: {
                name: { type: 'string', example: 'Parque Central' },
                endereco: { type: 'string', example: '123 Rua Principal' },
                cidade: { type: 'string', example: 'Goiânia' },
                cep: { type: 'string', example: '74000-000' },
                place_id: { type: 'string', example: 'ChIJN1t_tDeuEmsRUsoyG83frY4' },
                rating: { type: 'number', example: 4.5 },
                icon: { type: 'string', example: 'http://example.com/icon.png' },
                icon_background_color: { type: 'string', example: '#FFFFFF' },
                photos: { type: 'string', example: 'http://example.com/photo.jpg' },
                url: { type: 'string', example: 'http://example.com' },
                types: { type: 'string', example: 'park' },
                qd_lt: { type: 'string', example: 'Quadra 1 Lote 2' },
                street_number: { type: 'string', example: '123' },
                Lagradouto: { type: 'string', example: 'Av. Principal' },
                setor: { type: 'string', example: 'Setor Central' },
                estado: { type: 'string', example: 'GO' },
                lat: { type: 'number', example: -16.6869 },
                lng: { type: 'number', example: -49.2648 },
                telefone: { type: 'string', example: '+55 62 99999-9999' },
                horarioFuncionamento: { type: 'string', example: 'Seg-Sex: 8h-18h' }
            }, required: ['name', 'endereco', 'lat', 'lng'] } }
        }
    } },
    { path: '/locations/:id', method: 'put', tags: ['Locais'], summary: 'Atualiza um local', action: locationActions.update, requestBody: {
        required: true, content: {
            'application/json': { schema: { type: 'object', properties: {
                name: { type: 'string', example: 'Parque Central' },
                endereco: { type: 'string', example: '123 Rua Principal' },
                cidade: { type: 'string', example: 'Goiânia' },
                cep: { type: 'string', example: '74000-000' },
                place_id: { type: 'string', example: 'ChIJN1t_tDeuEmsRUsoyG83frY4' },
                rating: { type: 'number', example: 4.5 },
                icon: { type: 'string', example: 'http://example.com/icon.png' },
                icon_background_color: { type: 'string', example: '#FFFFFF' },
                photos: { type: 'string', example: 'http://example.com/photo.jpg' },
                url: { type: 'string', example: 'http://example.com' },
                types: { type: 'string', example: 'park' },
                qd_lt: { type: 'string', example: 'Quadra 1 Lote 2' },
                street_number: { type: 'string', example: '123' },
                Lagradouto: { type: 'string', example: 'Av. Principal' },
                setor: { type: 'string', example: 'Setor Central' },
                estado: { type: 'string', example: 'GO' },
                lat: { type: 'number', example: -16.6869 },
                lng: { type: 'number', example: -49.2648 },
                telefone: { type: 'string', example: '+55 62 99999-9999' },
                horarioFuncionamento: { type: 'string', example: 'Seg-Sex: 8h-18h' }
            } } }
        }
    } },
    { path: '/locations/:id', method: 'delete', tags: ['Locais'], summary: 'Deleta um local', action: locationActions.delete },
    { path: '/locations/:id', method: 'get', tags: ['Locais'], summary: 'Busca um local', action: locationActions.getOne },
    { path: '/locations', method: 'get', tags: ['Locais'], summary: 'Lista todos os locais', action: locationActions.getAll }
];

export default locationRoutesDatas;
