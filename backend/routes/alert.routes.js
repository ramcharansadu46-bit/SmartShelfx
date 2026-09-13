const express = require('express');
const { Op } = require('sequelize');
const { Alert, Product, User } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
    try {
        const { type, is_read, product_id, page = 1, limit = 50 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const where = {};

        // Vendors only see alerts relevant to them; Admin/Manager see all
        if (req.user.role === 'VENDOR') {
            where.vendor_id = Number(req.user.id);
        }

        if (type) where.type = type;
        if (product_id) where.product_id = Number(product_id);
        if (is_read !== undefined && is_read !== '') {
            where.is_read = is_read === 'true' || is_read === true;
        }

        const { count, rows } = await Alert.findAndCountAll({
            where,
            include: [{
                model: Product,
                as: 'Product',
                attributes: ['id', 'name', 'sku', 'category', 'current_stock', 'reorder_level']
            }],
            order: [['created_at', 'DESC']],
            limit: Number(limit),
            offset
        });

        const unreadWhere = { is_read: false };
        if (req.user.role === 'VENDOR') {
            unreadWhere.vendor_id = Number(req.user.id);
        }

        const unread = await Alert.count({ where: unreadWhere });

        res.json({ total: count, unread, page: Number(page), data: rows });
    } catch (err) {
        console.error('[GET /alerts] error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

router.put('/read-all', async (req, res) => {
    try {
        const where = { is_read: false };
        if (req.user.role === 'VENDOR') {
            where.vendor_id = Number(req.user.id);
        }
        await Alert.update({ is_read: true }, { where });
        res.json({ success: true, message: 'All alerts marked as read' });
    } catch (err) {
        console.error('[PUT /alerts/read-all] error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id/read', async (req, res) => {
    try {
        const alert = await Alert.findByPk(req.params.id);
        if (!alert) return res.status(404).json({ error: 'Alert not found' });
        if (req.user.role === 'VENDOR' && Number(alert.vendor_id) !== Number(req.user.id)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        await alert.update({ is_read: true });
        res.json({ success: true });
    } catch (err) {
        console.error('[PUT /alerts/:id/read] error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const alert = await Alert.findByPk(req.params.id);
        if (!alert) return res.status(404).json({ error: 'Alert not found' });
        if (req.user.role === 'VENDOR' && Number(alert.vendor_id) !== Number(req.user.id)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        await alert.destroy();
        res.json({ success: true });
    } catch (err) {
        console.error('[DELETE /alerts/:id] error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
