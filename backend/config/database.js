const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

function createSqliteConnection(inMemory = false) {
    if (inMemory) {
        console.log('[DB] Using in-memory SQLite (fallback)');
        return new Sequelize({
            dialect: 'sqlite',
            storage: ':memory:',
            logging: false
        });
    }
    const dataDir = path.join(__dirname, '../data');
    try {
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    } catch (e) {
        console.warn('[DB] Cannot create data dir, falling back to in-memory SQLite:', e.message);
        return new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
    }
    const storagePath = path.join(dataDir, 'smartshelfx.sqlite');
    console.log('[DB] Using file-based SQLite at:', storagePath);
    return new Sequelize({
        dialect: 'sqlite',
        storage: storagePath,
        logging: false
    });
}

function createMySQLConnection(urlOrConfig) {
    const dialectOptions = { connectTimeout: 6000 };
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

const isRender = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID || process.env.VERCEL);
const dbUrl = process.env.MYSQL_URL;

let sequelize;

if (dbUrl && (dbUrl.startsWith('mysql') || dbUrl.startsWith('mysql2'))) {
    console.log('[DB] Connecting via MYSQL_URL...');
    sequelize = createMySQLConnection(dbUrl);
} else if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1') {
    console.log('[DB] Connecting via remote DB_HOST:', process.env.DB_HOST);
    sequelize = createMySQLConnection({});
} else if (!isRender && (process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1') && process.env.DB_NAME) {
    // Local development ONLY when DB_HOST=localhost is explicitly set in .env
    console.log('[DB] Local development: using MySQL on localhost...');
    sequelize = createMySQLConnection({ host: 'localhost' });
} else {
    // Cloud / Production / Render default / Fallback → SQLite
    console.log('[DB] Using SQLite for zero-config persistence...');
    sequelize = createSqliteConnection();
}

module.exports = { sequelize, createSqliteConnection };

