import { DataTypes } from 'sequelize';
import sequelize from './../db.js';

// Modelo de Usuário
const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'users', timestamps: true });

sequelize.sync({ force: false })
    .then(() => console.log('Tabelas sincronizadas!'))
    .catch(error => console.error('Erro ao sincronizar:', error));

const handleError = (res, error, message) => res.status(500).json({ message, error });

const userActions = {
    fetchUsers: async (req, res) => {
 
            const { page = 1, perPage = 10, sort = 'id', order = 'ASC' } = req.query; // Suporte para paginação e ordenação
            const offset = (page - 1) * perPage;
            const limit = parseInt(perPage, 10);
    
            // Ordenação dinâmica
            const orderOption = [[sort, order.toUpperCase()]];
    
            // Obtenha os usuários com paginação e ordenação
            const { rows: users, count: total } = await User.findAndCountAll({
                offset,
                limit,
                order: orderOption,
            });
    
            // Mapeie os dados para remover metadados do Sequelize
            const formattedUsers = users.map(user => ({
                id: user.id, // Certifique-se de que o campo `id` está presente
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                // Remova ou inclua outros campos conforme necessário
            }));

            // Retorne os dados no formato esperado pelo React-Admin
            res.json({
                data: formattedUsers,
                total,
            });
    
    }, 
    
    
    
    createUser: async (req, res) => {
        try {
            const { name, email, password } = req.body;
            if (!name || !email || !password) {
                return res.status(400).json({ message: 'Campos obrigatórios ausentes.' });
            }
            const user = await User.create({ name, email, password });
            // React-Admin espera que o objeto criado seja retornado no campo `data`
            res.status(201).json({ data: user });
        } catch (error) {
            handleError(res, error, 'Erro ao criar usuário.');
        }
    },
    fetchUserById: async (req, res) => {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado.' });
            }
            // React-Admin espera o recurso único em `data`
            res.json({ data: user });
        } catch (error) {
            handleError(res, error, 'Erro ao buscar usuário.');
        }
    },
    updateUser: async (req, res) => {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado.' });
            }
            await user.update(req.body);
            // React-Admin espera o recurso atualizado em `data`
            res.json({ data: user });
        } catch (error) {
            handleError(res, error, 'Erro ao atualizar usuário.');
        }
    },
    deleteUser: async (req, res) => {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado.' });
            }
            await user.destroy();
            // React-Admin espera o ID do recurso deletado
            res.json({ data: { id: user.id } });
        } catch (error) {
            handleError(res, error, 'Erro ao deletar usuário.');
        }
    },
};


const userRoutesDatas = [
    { path: '/users', method: 'get', tags: ['Usuários'], summary: 'Lista usuários', authRequired: false, action: userActions.fetchUsers },
    { path: '/users', method: 'post', tags: ['Usuários'], summary: 'Cria usuário', authRequired: true, action: userActions.createUser, requestBody: {
        required: true, content: {
            'application/json': { schema: { type: 'object', properties: {
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john.doe@example.com' },
                password: { type: 'string', example: '123456' }
            }, required: ['name', 'email', 'password'] } }
        }
    } },
    { path: '/users/:id', method: 'get', tags: ['Usuários'], summary: 'Busca usuário', authRequired: true, action: userActions.fetchUserById, parameters: [
        { name: 'id', in: 'path', required: true, description: 'ID do usuário', schema: { type: 'integer' } }
    ] },
    { path: '/users/:id', method: 'put', tags: ['Usuários'], summary: 'Atualiza usuário', authRequired: true, action: userActions.updateUser, parameters: [
        { name: 'id', in: 'path', required: true, description: 'ID do usuário', schema: { type: 'integer' } }
    ] },
    { path: '/users/:id', method: 'delete', tags: ['Usuários'], summary: 'Deleta usuário', authRequired: true, action: userActions.deleteUser, parameters: [
        { name: 'id', in: 'path', required: true, description: 'ID do usuário', schema: { type: 'integer' } }
    ] }
];

export default userRoutesDatas;