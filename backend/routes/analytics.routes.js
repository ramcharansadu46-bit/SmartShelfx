const express = require('express');
const { Op } = require('sequelize');
const { sequelize, Product, StockTransaction, PurchaseOrder, Alert } = require('../models');
const { authenticate } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(authenticate);

// Helper for cross-dialect date formatting (MySQL vs SQLite)
const getDateFormatFn = (columnName, formatStr) => {
    const isSqlite = sequelize.getDialect() === 'sqlite';
    if (isSqlite) {
        // SQLite format tokens are identical for %Y-%m, %Y-%m-%d, %Y
        return sequelize.fn('strftime', formatStr, sequelize.col(columnName));
    }
    return sequelize.fn('DATE_FORMAT', sequelize.col(columnName), formatStr);
};

router.get('/summary', async (req, res) => {
    try {
        const totalProducts = await Product.count();
        const lowStockItems = await Product.count({
            where: {
                current_stock: { [Op.gt]: 0 },
                [Op.and]: [sequelize.literal('current_stock <= reorder_level')]
            }
        });
        const outOfStockItems = await Product.count({
            where: { current_stock: 0 }
        });
        const pendingOrders = await PurchaseOrder.count({
            where: { status: 'PENDING', vendor_id: { [Op.ne]: null } }
        });

        res.json({ totalProducts, lowStockItems, outOfStockItems, pendingOrders });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/stock-trend', async (req, res) => {
    try {
        const dateGroup = getDateFormatFn('timestamp', '%Y-%m');
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const rows = await StockTransaction.findAll({
            attributes: [
                [dateGroup, 'month'],
                'type',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'total']
            ],
            where: {
                timestamp: {
                    [Op.gte]: sixMonthsAgo
                }
            },
            group: [dateGroup, 'type'],
            order: [[dateGroup, 'ASC']],
            raw: true
        });

        res.json(rows);
    } catch (err) {
        console.error('[GET /analytics/stock-trend] error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

router.get('/top-restocked', async (req, res) => {
    try {
        const rows = await StockTransaction.findAll({
            attributes: [
                'product_id',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'total_restocked']
            ],
            where: { type: 'IN' },
            include: [{
                model: Product,
                as: 'Product',
                attributes: ['name', 'sku']
            }],
            group: ['product_id', 'Product.id'],
            order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
            limit: 10,
            raw: false
        });

        const result = rows.map(r => ({
            name: r.Product ? r.Product.name : `Product #${r.product_id}`,
            sku: r.Product ? r.Product.sku : '',
            total_restocked: Number(r.dataValues.total_restocked) || 0
        }));

        res.json(result);
    } catch (err) {
        console.error('[GET /analytics/top-restocked] error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

router.get('/category-breakdown', async (req, res) => {
    try {
        const rows = await Product.findAll({
            attributes: [
                'category',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('current_stock')), 'total_stock']
            ],
            group: ['category'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            raw: true
        });

        res.json(rows);
    } catch (err) {
        console.error('[GET /analytics/category-breakdown] error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

router.get('/low-stock', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const products = await Product.findAll({
            where: {
                [Op.or]: [
                    { current_stock: 0 },
                    sequelize.literal('current_stock <= reorder_level')
                ]
            },
            order: [['current_stock', 'ASC']],
            limit: Number(limit)
        });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/stock-movement', async (req, res) => {
    try {
        const period = req.query.period || 'month';
        const fmtMap = {
            day: '%Y-%m-%d',
            month: '%Y-%m',
            year: '%Y'
        };
        const fmt = fmtMap[period] || '%Y-%m';
        const sinceMap = { day: 30, month: 6, year: 5 };
        const daysBack = (sinceMap[period] || 6);
        const since = new Date();

        if (period === 'day') since.setDate(since.getDate() - daysBack);
        else if (period === 'month') since.setMonth(since.getMonth() - daysBack);
        else since.setFullYear(since.getFullYear() - daysBack);

        const dateGroup = getDateFormatFn('timestamp', fmt);

        const rows = await StockTransaction.findAll({
            attributes: [
                [dateGroup, 'label'],
                'type',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'total']
            ],
            where: { timestamp: { [Op.gte]: since } },
            group: [dateGroup, 'type'],
            order: [[dateGroup, 'ASC']],
            raw: true
        });

        const map = {};
        for (const r of rows) {
            const label = r.label || 'N/A';
            if (!map[label]) map[label] = { label, purchases: 0, sales: 0 };
            if (r.type === 'IN') map[label].purchases += Number(r.total) || 0;
            else map[label].sales += Number(r.total) || 0;
        }

        res.json(Object.values(map));
    } catch (err) {
        console.error('[GET /analytics/stock-movement] error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
