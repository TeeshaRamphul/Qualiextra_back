import { Sequelize } from 'sequelize';
import 'dotenv/config';

const sequelize = new Sequelize(process.env.DB_URL, {
  define: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true,
  },
  dialect: 'postgres', // Assure-toi que le dialecte est bien 'postgres'
  logging: console.log,
});

sequelize.authenticate()
  .then(() => console.log('Connexion à la base de données réussie!'))
  .catch(err => console.error('Impossible de se connecter à la base de données:', err));

export { sequelize };
