import { getList, create, getOne, update, deleteOne } from './controller.js';

const tags = ['Usuários'];

const createRoute = (method, path, action, summary, authRequired, requestBody = {}, parameters = []) => ({
    method,
    path,
    tags,
    summary,
    authRequired,
    action,
    requestBody,
    parameters,
});

const userRoutesDatas = [
    createRoute('get', `/users`, getList, 'Lista usuários', false),
    createRoute('post', `/users`, create, 'Cria usuário', false, {
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
    }),
    createRoute('get', `/users/:id`, getOne, 'Busca usuário', false, {}, [
        {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID do usuário',
            schema: { type: 'integer' },
        },
    ]),
    createRoute('put', `/users/:id`, update, 'Atualiza usuário', false, {}, [
        {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID do usuário',
            schema: { type: 'integer' },
        },
    ]),
    createRoute('delete', `/users/:id`, deleteOne, 'Deleta usuário', false, {}, [
        {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID do usuário',
            schema: { type: 'integer' },
        },
    ]),
];

export default userRoutesDatas;