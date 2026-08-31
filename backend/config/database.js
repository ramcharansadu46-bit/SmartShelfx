const { Sequelize } = require('sequelize');
const dbUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
let sequelize;
const dialectOptions = {};
if (process.env.DB_SSL === 'true' || (process.env.NODE_ENV === 'production' && process.env.DB_SSL !== 'false')) {
    dialectOptions.ssl = {
        require: true,
        rejectUnauthorized: false
    };
}
if (dbUrl) {
    sequelize = new Sequelize(dbUrl, {
        dialect: 'mysql',
        logging: false,
        dialectOptions,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci'
        }
    });
} else {
    sequelize = new Sequelize(
        process.env.DB_NAME || 'smartshelfx',
        process.env.DB_USER || 'root',
        process.env.DB_PASS || '',
        {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 3306,
            dialect: 'mysql',
            logging: false,
            dialectOptions,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            define: {
                charset: 'utf8mb4',
                collate: 'utf8mb4_unicode_ci'
            }
        }
    );
}
module.exports = { sequelize };
