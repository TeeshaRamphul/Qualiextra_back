import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
    process.env.DB_URL,
    {
        define: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            timestamps: true
        },
        logging: console.log, 
    },
);

export { sequelize };