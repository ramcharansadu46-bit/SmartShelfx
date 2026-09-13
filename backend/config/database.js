const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

function createSqliteConnection() {
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const storagePath = path.join(dataDir, 'smartshelfx.sqlite');
    return new Sequelize({
        dialect: 'sqlite',
        storage: storagePath,
        logging: false
    });
}

function createMySQLConnection(urlOrConfig) {
    const dialectOptions = {
        connectTimeout: 6000
    };
    if (process.env.DB_SSL === 'true' || (process.env.NODE_ENV === 'production' && process.env.DB_SSL !== 'false')) {
        dialectOptions.ssl = { require: true, rejectUnauthorized: false };
    }
    if (typeof urlOrConfig === 'string') {
        return new Sequelize(urlOrConfig, {
            dialect: 'mysql',
            logging: false,
            dialectOptions,
            pool: { max: 5, min: 0, acquire: 6000, idle: 10000 },
            define: { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
        });
    }
    return new Sequelize(
        urlOrConfig.db || process.env.DB_NAME || 'smartshelfx',
        urlOrConfig.user || process.env.DB_USER || 'root',
        urlOrConfig.pass || process.env.DB_PASS || '',
        {
            host: urlOrConfig.host || process.env.DB_HOST || 'localhost',
            port: Number(urlOrConfig.port || process.env.DB_PORT) || 3306,
            dialect: 'mysql',
            logging: false,
            dialectOptions,
            pool: { max: 5, min: 0, acquire: 6000, idle: 10000 },
            define: { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
        }
    );
}

const dbUrl = process.env.MYSQL_URL;
const isProd = process.env.NODE_ENV === 'production';
const hasRemoteHost = process.env.DB_HOST && process.env.DB_HOST !== 'localhost';

let sequelize;
if (dbUrl && dbUrl.startsWith('mysql')) {
    sequelize = createMySQLConnection(dbUrl);
} else if (hasRemoteHost) {
    sequelize = createMySQLConnection({ host: process.env.DB_HOST });
} else if (!isProd && (process.env.DB_HOST === 'localhost' || !isProd)) {
    sequelize = createMySQLConnection({ host: 'localhost' });
} else {
    sequelize = createSqliteConnection();
}

module.exports = { sequelize, createSqliteConnection };
