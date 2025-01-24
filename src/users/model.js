import { DataTypes } from 'sequelize';
import sequelize from './../../db.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'users',
    timestamps: true
});

const syncDatabase = async () => {
    try {
        await sequelize.sync({ force: false });
        console.log('Tabelas sincronizadas!');
    } catch (error) {
        console.error('Erro ao sincronizar:', error);
    }
};

syncDatabase();

export { User };
