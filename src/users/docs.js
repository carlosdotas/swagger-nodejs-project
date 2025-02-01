import { filterKey } from '../../utils/funcoes.js';
import { DataTypes } from 'sequelize';
import ModelControllerClass from '../../utils/ModelController.js';

const ModelController = new ModelControllerClass();

const inputs = {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: { msg: 'O nome não pode estar vazio.' } }, example: 'John Doe' },
    userGroupId: { type: DataTypes.INTEGER },
    phone: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true,
        validate: { 
            notEmpty: { msg: 'O telefone não pode estar vazio.' }, 
            is: {
                args: /^[0-9]{10,11}$/, // Regex como argumento
                msg: 'O telefone precisa ser válido. Deve conter entre 10 e 11 dígitos.'
            }
        },
        example: '1234567890' 
    },
    password: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        validate: { 
            notEmpty: { msg: 'A senha não pode estar vazia.' }, 
            len: [8, 100] 
        }, 
        example: 'password123' 
    },
    userType: {
        type: DataTypes.ENUM('admin', 'moderator', 'user'), // Define tipos predefinidos
        allowNull: false,
        validate: { notEmpty: { msg: 'O tipo de usuário não pode estar vazio.' } },
        example: 'admin',
        defaultValue: 'user', // Define o valor padrão
    },
    userGroup: {
        type: DataTypes.ENUM('finance', 'sales', 'support', 'development'), // Define grupos predefinidos
        allowNull: false,
        validate: { notEmpty: { msg: 'O grupo de usuário não pode estar vazio.' } },
        example: 'finance',
        defaultValue: 'sales', // Define o valor padrão
    }
};

ModelController.setModelName('User');    
ModelController.setTable('users');
ModelController.setInputs(inputs);
ModelController.createTables(false);

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
                        properties: filterKey(inputs, ['type','example']),
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
