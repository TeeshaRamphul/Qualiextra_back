
import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize-client.js";

export class User extends Model {}

User.init({
  firstname: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  lastname: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true // Assure que l'email est unique
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'member'), // ENUM limite le role: soit admin ou member
    allowNull: false,
    defaultValue: 'member' // Le rôle par défaut est 'member'
  }

}, {
  sequelize,
  tableName: "user"
});
