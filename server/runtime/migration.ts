import { Umzug, SequelizeStorage } from "umzug";
import path from "path";
import messages from "../constants/messages.json";

let umzug: Umzug<any>;

const MIGRATIONS_PATH = path.join(__dirname, "../migrations");
const MIGRATION_GLOB_PATTERN = "*.ts";

const silentLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

export async function initMigration(db: any) {
  const sequelize = db.sequelize;
  const Sequelize = db.Sequelize;

  umzug = new Umzug({
    migrations: {
      glob: path.join(MIGRATIONS_PATH, MIGRATION_GLOB_PATTERN),
      resolve: ({ name, path: migrationPath }) => {
        if (!migrationPath) {
          const errorMsg = messages.errors.MIGRATION_PATH_NOT_FOUND.replace(
            "{name}",
            name,
          );
          throw new Error(errorMsg);
        }
        const migration = require(migrationPath);
        return {
          name,
          up: async () =>
            migration.up(sequelize.getQueryInterface(), Sequelize),
          down: async () =>
            migration.down(sequelize.getQueryInterface(), Sequelize),
        };
      },
    },
    storage: new SequelizeStorage({ sequelize }),
    logger: silentLogger,
  });

  return umzug;
}

export async function runMigrations(db: any) {
  const migration = await initMigration(db);

  const pendingMigrations = await migration.pending();

  if (pendingMigrations.length === 0) {
    return;
  }

  const runningMsg = messages.migration.RUNNING.replace(
    "{count}",
    pendingMigrations.length.toString(),
  );
  console.log(`\n${messages.migration.ICON_RUNNING} ${runningMsg}`);
  pendingMigrations.forEach((m) => {
    const itemMsg = messages.migration.MIGRATION_ITEM.replace("{name}", m.name);
    console.log(itemMsg);
  });

  try {
    await migration.up();
    console.log(
      `${messages.migration.ICON_SUCCESS} ${messages.success.MIGRATIONS_COMPLETED}\n`,
    );
  } catch (error) {
    console.error(
      `${messages.migration.ICON_ERROR} ${messages.errors.MIGRATION_FAILED}:`,
      error,
    );
    throw error;
  }
}
