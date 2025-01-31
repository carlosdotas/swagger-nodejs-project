
import path from 'path';
import multer from 'multer'; // Importar multer
import { DataTypes } from 'sequelize';
import sequelize from '../../db.js';

//Upload OK

const pasta = './uploads/';

// Configuração do multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, pasta); // Pasta onde os arquivos serão armazenados
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Nome do arquivo
    }
});

const upload = multer({ storage }); // Inicializa o multer com a configuração de armazenamento

const FileUpload = sequelize.define('FileUpload', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    path: { type: DataTypes.STRING, allowNull: false }
}, { sequelize, modelName: 'FileUpload', tableName: 'file_uploads', timestamps: true });

FileUpload.sync({ alter: true }).then(() => console.log('Tabela de arquivos sincronizada com o banco de dados.'));

const tags = ['Upload'];

const uploadRoutesDatas = [
    {
        method: 'post',
        path: '/upload',
        tags,
        summary: 'Faz upload de um arquivo',
        authRequired: false,
        action: (req, res) => {
            upload.single('file')(req, res, async (err) => {
                if (err) {
                    return res.status(500).send({ message: 'Erro ao fazer upload', error: err });
                }
                if (!req.file) {
                    return res.status(400).send({ message: 'Nenhum arquivo foi enviado' });
                }

                const file = await FileUpload.create({
                    name: req.file.originalname,
                    path: pasta
                });

                res.status(200).send({ 
                    message: 'Upload realizado com sucesso!',
                    filename: file.name,
                    path: pasta
                });
            });
        },
        requestBody: {
            required: true,
            content: {
                'multipart/form-data': {
                    schema: {
                        type: 'object',
                        properties: {
                            file: { type: 'string', format: 'binary' }
                        },
                        required: ['file']
                    }
                }
            }
        }
    },
    {
        method: 'get',
        path: '/files',
        tags,
        summary: 'Lista arquivos em um diretório específico',
        authRequired: false,
        action: async (req, res) => {
            try {
                const files = await FileUpload.findAll({ attributes: ['id', 'name', 'path'] });
                res.json(files);
            } catch (error) {
                res.status(500).send({ message: 'Erro ao listar arquivos', error });
            }
        }
    },
    {
        method: 'get',
        path: '/download/:id',
        tags,
        summary: 'Faz o download de um arquivo pelo ID',
        authRequired: false,
        action: async (req, res) => {
            try {
                const { id } = req.params;
                const file = await FileUpload.findByPk(id);
                if (!file) {
                    return res.status(404).send({ message: 'Arquivo não encontrado' });
                }
                const filePath = path.join(process.cwd(), file.path, file.name);

                res.download(filePath, file.name);
            } catch (error) {
                res.status(500).send({ message: 'Erro ao fazer download do arquivo', error });
            }
        }
    }
];

export default uploadRoutesDatas;
