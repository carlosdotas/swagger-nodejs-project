import { filterKey } from '../../utils/funcoes.js';
import { DataTypes } from 'sequelize';
import ModelController from '../../utils/ModelController.js';

const inputs = {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: { msg: 'O nome não pode estar vazio.' } }, example: 'John Doe' },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: { msg: 'O e-mail precisa ser válido.' } }, example: 'john.doe@example.com' },
    password: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: { msg: 'A senha não pode estar vazia.' }, len: [8, 100] }, example: 'password123' }
};

ModelController.setModelName('User');    
ModelController.setTable('users');
ModelController.setInputs(inputs);
ModelController.createTables();

const tags = ['Usuários'];

const RoutesDatas = [
    {
        method: 'get',
        path: '/users',
        tags,
        summary: 'Lista usuários',
        authRequired: false,
        action: ModelController.getList,
    },
    {
        method: 'post',
        path: '/users',
        tags,
        summary: 'Cria usuário',
        authRequired: false,
        action: ModelController.create,
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: filterKey(inputs, ['type','example'])
                    },
                },
            },
        },
    },
    {
        method: 'get',
        path: '/users/:id',
        tags,
        summary: 'Busca usuário',
        authRequired: false,
        action: ModelController.getOne,
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                description: 'ID do usuário',
                schema: { type: 'integer' },
            },
        ],
    },
    {
        method: 'put',
        path: '/users/:id',
        tags,
        summary: 'Atualiza usuário',
        authRequired: false,
        action: ModelController.update,
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                description: 'ID do usuário',
                schema: { type: 'integer' },
            },
        ],
    },
    {
        method: 'delete',
        path: '/users/:id',
        tags,
        summary: 'Deleta usuário',
        authRequired: false,
        action: ModelController.deleteOne,
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                description: 'ID do usuário',
                schema: { type: 'integer' },
            },
        ],
    },
];

export default RoutesDatas;