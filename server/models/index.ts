import fs from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, "../config/config.json"))[env];

console.log(`[Database] NODE_ENV: ${env}`);
console.log(`[Database] Config type: ${config.use_env_variable ? "env-variable" : "hardcoded"}`);

let sequelize: Sequelize;
if (config.use_env_variable) {
  const databaseUrl = process.env[config.use_env_variable];
  console.log(`[Database] Using DATABASE_URL: ${databaseUrl ? databaseUrl.replace(/:[^:]*@/, ":***@") : "NOT SET"}`);
  if (!databaseUrl) {
    throw new Error(
      `Environment variable ${config.use_env_variable} is not set`,
    );
  }
  sequelize = new Sequelize(databaseUrl, config);
} else {
  console.log(`[Database] Using host: ${config.host}, port: ${config.port}, database: ${config.database}`);
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

sequelize.authenticate().then(() => {
  console.log("[Database] Connection authenticated successfully");
}).catch((err: any) => {
  console.error("[Database] Authentication failed:", err.message);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
