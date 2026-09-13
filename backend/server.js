require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Database is initialized at module load time
const { sequelize } = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const transactionRoutes = require('./routes/transaction.routes');
const forecastRoutes = require('./routes/forecast.routes');
const orderRoutes = require('./routes/order.routes');
const alertRoutes = require('./routes/alert.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const { startPOScheduler } = require('./utils/poScheduler');
const { autoSeed } = require('./utils/autoSeed');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: false
}));
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'SmartShelfX API is running' });
});

let dbReady = false;
let dbError = null;

app.get('/api/health', (req, res) => {
    res.json({
        status: dbReady ? 'ok' : (dbError ? 'db_error' : 'connecting'),
        database: dbReady ? `connected (${sequelize.getDialect()})` : (dbError || 'connecting'),
        service: 'SmartShelfX API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((err, req, res, next) => {
    console.error('[ERROR]', err.message);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});
app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ SmartShelfX API running on http://0.0.0.0:${PORT}`);
    console.log(`   Health: http://0.0.0.0:${PORT}/api/health`);
    console.log(`   DB dialect: ${sequelize.getDialect()}`);
    startPOScheduler();
});

const startDB = async () => {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[DB] Connection attempt ${attempt}/${maxRetries} (${sequelize.getDialect()})...`);
            await sequelize.authenticate();
            console.log('✅ Database authenticated.');
            // Use alter:false for safety - just sync missing tables, don't alter existing
            await sequelize.sync({ force: false, alter: false });
            console.log('✅ Models synced.');
            dbReady = true;
            await autoSeed();
            console.log('✅ System fully ready for production.');
            return;
        } catch (err) {
            console.error(`❌ DB attempt ${attempt} failed:`, err.message);
            if (attempt === maxRetries) {
                dbError = err.message;
                console.error('❌ All database connection attempts exhausted.');
            } else {
                // Wait 2s before retry
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    }
};

startDB();
