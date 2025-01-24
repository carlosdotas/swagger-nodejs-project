import { getList, create, getOne, update, deleteOne } from './controller.js';

const tags = ['Usuários'];

const RoutesDatas = [
    {
        method: 'get',
        path: '/users',
        tags,
        summary: 'Lista usuários',
        authRequired: false,
        action: getList,
    },
    {
        method: 'post',
        path: '/users',
        tags,
        summary: 'Cria usuário',
        authRequired: false,
        action: create,
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            name: { type: 'string', example: 'John Doe' },
                            email: { type: 'string', example: 'john.doe@example.com' },
                            password: { type: 'string', example: '123456' },
                        },
                        required: ['name', 'email', 'password'],
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
        action: getOne,
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
        action: update,
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
        action: deleteOne,
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