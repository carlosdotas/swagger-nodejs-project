import { DataTypes } from 'sequelize';
import sequelize from './../db.js';

// Modelo de Produto
const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'products', timestamps: true });

sequelize.sync({ force: false })
    .then(() => console.log('Tabelas sincronizadas!'))
    .catch(error => console.error('Erro ao sincronizar:', error));

const handleError = (res, error, message) => res.status(500).json({ message, error });

const productActions = {
    fetchProducts: async (req, res) => {
        try {
            const products = await Product.findAll();
            res.json({ data: products });
        } 
        catch (error) { handleError(res, error, 'Erro ao buscar produtos.'); }
    },
    createProduct: async (req, res) => {
        try {
            const { name, description, price, stock } = req.body;
            if (!name || price == null || stock == null) return res.status(400).json({ message: 'Campos obrigatórios ausentes.' });
            res.status(201).json({ message: 'Produto criado!', product: await Product.create({ name, description, price, stock }) });
        } catch (error) { handleError(res, error, 'Erro ao criar produto.'); }
    },
    fetchProductById: async (req, res) => {
        try {
            const product = await Product.findByPk(req.params.id);
            product ? res.json(product) : res.status(404).json({ message: 'Produto não encontrado.' });
        } catch (error) { handleError(res, error, 'Erro ao buscar produto.'); }
    },
    updateProduct: async (req, res) => {
        try {
            const product = await Product.findByPk(req.params.id);
            if (!product) return res.status(404).json({ message: 'Produto não encontrado.' });
            await product.update(req.body);
            res.json({ message: 'Produto atualizado!', product });
        } catch (error) { handleError(res, error, 'Erro ao atualizar produto.'); }
    },
    deleteProduct: async (req, res) => {
        try {
            const product = await Product.findByPk(req.params.id);
            if (!product) return res.status(404).json({ message: 'Produto não encontrado.' });
            await product.destroy();
            res.json({ message: 'Produto deletado!' });
        } catch (error) { handleError(res, error, 'Erro ao deletar produto.'); }
    },
};

const productRoutesDatas = [
    { path: '/products', method: 'get', tags: ['Produtos'], summary: 'Lista produtos', action: productActions.fetchProducts },
    { path: '/products', method: 'post', tags: ['Produtos'], summary: 'Cria produto', action: productActions.createProduct, requestBody: {
        required: true, content: {
            'application/json': { schema: { type: 'object', properties: {
                name: { type: 'string', example: 'Produto A' },
                description: { type: 'string', example: 'Descrição do produto A' },
                price: { type: 'number', example: 100.50 },
                stock: { type: 'integer', example: 20 }
            }, required: ['name', 'price', 'stock'] } }
        }
    } },
    { path: '/products/:id', method: 'get', tags: ['Produtos'], summary: 'Busca produto', action: productActions.fetchProductById, parameters: [
        { name: 'id', in: 'path', required: true, description: 'ID do produto', schema: { type: 'integer' } }
    ] },
    { path: '/products/:id', method: 'put', tags: ['Produtos'], summary: 'Atualiza produto', action: productActions.updateProduct, parameters: [
        { name: 'id', in: 'path', required: true, description: 'ID do produto', schema: { type: 'integer' } }
    ] },
    { path: '/products/:id', method: 'delete', tags: ['Produtos'], summary: 'Deleta produto', action: productActions.deleteProduct, parameters: [
        { name: 'id', in: 'path', required: true, description: 'ID do produto', schema: { type: 'integer' } }
    ] }
];

export default productRoutesDatas;
