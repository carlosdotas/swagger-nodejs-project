import { User } from "./model.js";

// Função auxiliar para lidar com erros
function handleError(res, error, defaultMessage) {
    console.error(error);
    res.status(500).json({ message: defaultMessage, error: error.message });
}

// Função auxiliar para enviar respostas padronizadas
function sendResponse(res, data, total = null, message = "") {
    const response = { data };
    if (total !== null) response.total = total;
    if (message) response.message = message;
    res.json(response);
}

// Função genérica para aplicar paginação e ordenação
function getPaginationAndSorting(query) {
    const { page = 1, perPage = 10, sort = 'id', order = 'ASC' } = query;
    const offset = (parseInt(page, 10) - 1) * parseInt(perPage, 10);
    const limit = parseInt(perPage, 10);
    const orderOption = [[sort, order.toUpperCase()]];

    return { offset, limit, order: orderOption };
}

// Buscar usuários com paginação, ordenação e filtragem dinâmicas
async function getList(req, res) {
    const { offset, limit, order } = getPaginationAndSorting(req.query);

    try {
        const filters = {}; // Adicione lógica para filtros dinâmicos, se necessário
        const { rows: users, count: total } = await User.findAndCountAll({
            where: filters,
            offset,
            limit,
            order,
        });

        const formattedUsers = users.map(({ id, name, email, createdAt, updatedAt }) => ({
            id,
            name,
            email,
            createdAt,
            updatedAt,
        }));

        sendResponse(res, formattedUsers, total);
    } catch (error) {
        handleError(res, error, "Erro ao buscar usuários.");
    }
}

// Criar um novo usuário
async function create(req, res) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Campos obrigatórios ausentes." });
    }

    try {
        const user = await User.create({ name, email, password });
        sendResponse(res, { id: user.id, name: user.name, email: user.email }, null, "Usuário criado com sucesso.");
    } catch (error) {
        handleError(res, error, "Erro ao criar usuário.");
    }
}

// Buscar usuário por ID
async function getOne(req, res) {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
        sendResponse(res, { id: user.id, name: user.name, email: user.email });
    } catch (error) {
        handleError(res, error, "Erro ao buscar usuário.");
    }
}

// Atualizar usuário por ID
async function update(req, res) {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
        await user.update(req.body);
        sendResponse(res, { id: user.id, name: user.name, email: user.email }, null, "Usuário atualizado com sucesso.");
    } catch (error) {
        handleError(res, error, "Erro ao atualizar usuário.");
    }
}

// Deletar usuário por ID
async function deleteOne(req, res) {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
        await user.destroy();
        sendResponse(res, { id: user.id }, null, "Usuário deletado com sucesso.");
    } catch (error) {
        handleError(res, error, "Erro ao deletar usuário.");
    }
}

export { getList, create, getOne, update, deleteOne };
