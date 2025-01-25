import { getList, create, getOne, update, deleteOne, inputs } from './controller.js';

const tags = ['Usuários'];

const filterKeyExample = (obj, keysToFilter) => Object.fromEntries(
    Object.entries(obj)
        .map(([key, value]) => [
            key,
            Object.fromEntries(
                Object.entries(value).filter(([subKey]) => keysToFilter.includes(subKey))
            )
        ])
        .filter(([_, filteredValue]) => keysToFilter.every((key) => key in filteredValue))
);

const generatePathParams = (name, description) => [{
    name,
    in: 'path',
    required: true,
    description,
    schema: { type: 'integer' },
}];

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
                        properties: filterKeyExample(inputs, ['type', 'example']),
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
        parameters: generatePathParams('id', 'ID do usuário'),
    },
    {
        method: 'put',
        path: '/users/:id',
        tags,
        summary: 'Atualiza usuário',
        authRequired: false,
        action: update,
        parameters: generatePathParams('id', 'ID do usuário'),
    },
    {
        method: 'delete',
        path: '/users/:id',
        tags,
        summary: 'Deleta usuário',
        authRequired: false,
        action: deleteOne,
        parameters: generatePathParams('id', 'ID do usuário'),
    },
];

export default RoutesDatas;
