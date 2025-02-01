import { filterKey } from '../../utils/funcoes.js';
import { DataTypes } from 'sequelize';
import ModelControllerClass from '../../utils/ModelController.js';

const ModelController = new ModelControllerClass();

const inputs = {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: { msg: 'O nome não pode estar vazio.' } }, example: 'Finance Group' },
    description: { type: DataTypes.STRING, allowNull: true, example: 'Group responsible for financial operations' }, // Added description
};

ModelController.setModelName('UserGroup');
ModelController.setTable('user_groups'); // Changed table name
ModelController.setInputs(inputs);
ModelController.createTables(false);

const tags = ['Grupos de Usuários']; // Changed tag

const RoutesDatas = [
    {
        method: 'get',
        path: '/user-groups', // Changed path
        tags,
        summary: 'Lista grupos de usuários', // Changed summary
        authRequired: false,
        action: ModelController.getList,
    },
    {
        method: 'post',
        path: '/user-groups', // Changed path
        tags,
        summary: 'Cria grupo de usuário', // Changed summary
        authRequired: false,
        action: ModelController.create,
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: filterKey(inputs, ['type', 'example']),
                    },
                },
            },
        },
    },
    {
        method: 'get',
        path: '/user-groups/:id', // Changed path
        tags,
        summary: 'Busca grupo de usuário', // Changed summary
        authRequired: false,
        action: ModelController.getOne,
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                description: 'ID do grupo de usuário', // Changed description
                schema: { type: 'integer' },
            },
        ],
    },
    {
        method: 'put',
        path: '/user-groups/:id', // Changed path
        tags,
        summary: 'Atualiza grupo de usuário', // Changed summary
        authRequired: false,
        action: ModelController.update,
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                description: 'ID do grupo de usuário', // Changed description
                schema: { type: 'integer' },
            },
        ],
    },
    {
        method: 'delete',
        path: '/user-groups/:id', // Changed path
        tags,
        summary: 'Deleta grupo de usuário', // Changed summary
        authRequired: false,
        action: ModelController.deleteOne,
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                description: 'ID do grupo de usuário', // Changed description
                schema: { type: 'integer' },
            },
        ],
    },
];

export default RoutesDatas;