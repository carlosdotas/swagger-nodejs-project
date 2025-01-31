import getPlaceDetails from './GetPlaceDetails.js';
import { DataTypes } from 'sequelize';
import sequelize from '../../db.js';

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

const Cidades = sequelize.define('Cidades', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },

}, { sequelize, modelName: 'Cidades', tableName: 'cidades', timestamps: true });

Cidades.sync({ alter: true }).then(() => console.log('Tabela de cidades sincronizada com o banco de dados.'));




const handleError = (res, error, message) => res.status(500).json({ message, error });







const locationActions = {

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
            
            const urlQuery = req.query.url;
            if (!urlQuery) return res.status(400).json({ message: 'URL não fornecida.' });
            
            const locationfindOne = await Location.findOne({ where: { url: urlQuery } });
            if (locationfindOne) return res.status(400).json({ message: 'Url já registrado.', location: locationfindOne });

            const local = await getPlaceDetails(urlQuery, 'AIzaSyAt3Lem8uwX9oCsuFjFacdsEtm9IU991oI');
            if (!local) return res.status(404).json({ message: 'Local não encontrado.' });

            const { name, endereco, cidade, cep, place_id, rating, icon, icon_background_color, photos, url, types, qd_lt, street_number, Lagradouto, setor, estado, lat, lng, telefone, horarioFuncionamento } = local[0];

            const locationfindOneplace_id = await Location.findOne({ where: { place_id } });
            if (locationfindOneplace_id) return res.status(400).json({ message: 'place_id já registrado.', location: locationfindOneplace_id });

            const cidadeFindOne = await Cidades.findOne({ where: { name: cidade } });
            if (!cidadeFindOne) {
                const cidadeFindOneCreate = await Cidades.create({name: cidade});
            }

            const location = await Location.create({ name, endereco, cidade, cep, place_id, rating, icon, icon_background_color, photos, url, types, qd_lt, street_number, Lagradouto, setor, estado, lat, lng, telefone, horarioFuncionamento });

            
            res.status(201).json({ message: 'Local registrado com sucesso!', location });

        } catch (error) {
            handleError(res, error, 'Erro ao buscar detalhes do local.');
        }
        //('https://maps.app.goo.gl/HaHcAZVPBX4umESC7', 'AIzaSyAt3Lem8uwX9oCsuFjFacdsEtm9IU991oI')
    },
};

const locationRoutesDatas = [
    { path: '/locations/:id', method: 'delete', tags: ['Locais'], summary: 'Deleta um local', action: locationActions.delete },
    { path: '/locations/:id', method: 'get', tags: ['Locais'], summary: 'Busca um local', action: locationActions.getOne },
    { path: '/locations', method: 'get', tags: ['Locais'], summary: 'Lista todos os locais', action: locationActions.getAll },
    { path: '/placeurl', method: 'get', tags: ['Locais'], summary: 'Busca detalhes de um local', action: locationActions.getPlaceDetails,  parameters: [{ name: 'url', in: 'query', required: true, description: 'URL do local a ser buscado (exemplo: https://maps.app.goo.gl/KReXvhfaSaAt9sdw7)', schema: { type: 'string' } }] },
];

export default locationRoutesDatas;
