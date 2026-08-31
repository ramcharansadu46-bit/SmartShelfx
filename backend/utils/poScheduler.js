const { Product, PurchaseOrder, User, Alert } = require('../models');
const { sendPurchaseOrderEmail } = require('./mailer');
const INTERVAL_MS = 2 * 60 * 1000;
const runPOCheck = async () => {
    try {
        console.log('[Scheduler] Running PO check...');
        const products = await Product.findAll({
            include: [{ model: User, as: 'vendor', attributes: ['id', 'name', 'email'] }]
        });
        let created = 0;
        for (const product of products) {
            const { id, name, sku, current_stock, reorder_level, vendor_id, vendor } = product;
            if (!vendor_id) continue;
            const isCritical = current_stock === 0 || current_stock <= reorder_level * 0.5;
            const isHigh = current_stock <= reorder_level;
            if (!isCritical && !isHigh) continue;
            const riskLevel = isCritical ? 'CRITICAL' : 'HIGH';
            const existing = await PurchaseOrder.findOne({
                where: { product_id: id, status: ['PENDING', 'APPROVED'] }
            });
            if (existing) continue;
            const quantity = Math.max(reorder_level * 2, 10);
            const po = await PurchaseOrder.create({
                product_id: id,
                vendor_id,
                quantity,
                status: 'PENDING',
                notes: `[Scheduler] Auto-generated: ${name} (${sku}) is ${riskLevel}. Stock: ${current_stock}, Reorder: ${reorder_level}.`
            });
            console.log(`[Scheduler] ✅ PO #${po.id} created → ${name} | ${riskLevel} | vendor: ${vendor?.name || vendor_id}`);
            created++;
            try {
                await Alert.destroy({ where: { product_id: id, type: 'LOW_STOCK', is_read: false } });
                await Alert.destroy({ where: { product_id: id, type: 'OUT_OF_STOCK', is_read: false } });
                await Alert.create({
                    product_id: id,
                    vendor_id,
                    type: current_stock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
                    message: `${name} (${sku}): Stock is ${riskLevel}. Only ${current_stock} units left (reorder level: ${reorder_level}). PO #${po.id} auto-generated.`,
                    is_read: false
                });
            } catch (alertErr) {
                console.error(`[Scheduler] Alert create failed for ${name}:`, alertErr.message);
            }
            if (vendor && vendor.email) {
                try {
                    await sendPurchaseOrderEmail({
                        vendorEmail: vendor.email,
                        vendorName: vendor.name,
                        productName: name,
                        productSku: sku,
                        quantity,
                        orderId: po.id,
                        notes: `Stock status: ${riskLevel}. Current stock: ${current_stock} units.`
                    });
                } catch (mailErr) {
                    console.error(`[Scheduler] Email failed for PO #${po.id}:`, mailErr.message);
                }
            }
        }
        if (created === 0) {
            console.log('[Scheduler] No new POs needed.');
        } else {
            console.log(`[Scheduler] Done — ${created} new PO(s) created.`);
        }
    } catch (err) {
        console.error('[Scheduler] Error during PO check:', err.message);
    }
};
const startPOScheduler = () => {
    console.log(`[Scheduler] PO auto-check started — runs every 2 minutes.`);
    runPOCheck();
    setInterval(runPOCheck, INTERVAL_MS);
};
module.exports = { startPOScheduler };
