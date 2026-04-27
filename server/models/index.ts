import fs from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, "../config/config.json"))[env];

let sequelize: Sequelize;
if (config.use_env_variable) {
  const databaseUrl = process.env[config.use_env_variable];
  if (!databaseUrl) {
    throw new Error(
      `Environment variable ${config.use_env_variable} is not set`,
    );
  }
  sequelize = new Sequelize(databaseUrl, config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
  );
}

const db: any = {};

const files = fs.readdirSync(__dirname).filter((file: string) => {
  return (
    file.indexOf(".") !== 0 &&
    file !== basename &&
    (file.slice(-3) === ".ts" || file.slice(-3) === ".js") &&
    file.indexOf(".test.ts") === -1
  );
});

files.forEach((file: string) => {
  const modelPath = path.join(__dirname, file);
  const model = require(modelPath)(sequelize, DataTypes);
  db[model.name] = model;
});

Object.keys(db).forEach((modelName: string) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
