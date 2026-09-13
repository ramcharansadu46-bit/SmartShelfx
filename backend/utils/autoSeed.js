const bcrypt = require('bcryptjs');
const { User, Product, StockTransaction, ForecastResult, Alert, PurchaseOrder, sequelize } = require('../models');

const DEFAULT_PASSWORD = 'Admin@123';

const DEMO_USERS = [
    {
        name: 'System Administrator',
        username: 'admin',
        email: 'admin@smartshelfx.com',
        role: 'ADMIN'
    },
    {
        name: 'Warehouse Manager',
        username: 'manager',
        email: 'manager@smartshelfx.com',
        role: 'MANAGER'
    },
    {
        name: 'Operations Staff',
        username: 'staff',
        email: 'staff@smartshelfx.com',
        role: 'MANAGER'
    },
    {
        name: 'Heritage & Amul Dairy Suppliers',
        username: 'vendor_dairy',
        email: 'vendor.dairy@smartshelfx.com',
        role: 'VENDOR'
    },
    {
        name: 'National Groceries & Staples Ltd',
        username: 'vendor_groceries',
        email: 'vendor.groceries@smartshelfx.com',
        role: 'VENDOR'
    },
    {
        name: 'Apex Beverages & FMCG Dist.',
        username: 'vendor_beverages',
        email: 'vendor.beverages@smartshelfx.com',
        role: 'VENDOR'
    }
];

const INITIAL_PRODUCTS = [
    // Dairy
    { name: 'Amul Butter 500g', sku: 'SKU-DAI-001', category: 'Dairy', current_stock: 45, reorder_level: 25, unit_price: 275.00, vendorKey: 'vendor.dairy@smartshelfx.com' },
    { name: 'Amul Taaza Milk 1L', sku: 'SKU-DAI-002', category: 'Dairy', current_stock: 12, reorder_level: 30, unit_price: 68.00, vendorKey: 'vendor.dairy@smartshelfx.com' },
    { name: 'Mother Dairy Paneer 200g', sku: 'SKU-DAI-003', category: 'Dairy', current_stock: 8, reorder_level: 20, unit_price: 95.00, vendorKey: 'vendor.dairy@smartshelfx.com' },
    { name: 'Nestle Everyday Dairy Whitener 1kg', sku: 'SKU-DAI-004', category: 'Dairy', current_stock: 60, reorder_level: 15, unit_price: 520.00, vendorKey: 'vendor.dairy@smartshelfx.com' },

    // Groceries
    { name: 'Fortune Sunlite Refined Oil 1L', sku: 'SKU-GRO-001', category: 'Groceries', current_stock: 85, reorder_level: 30, unit_price: 145.00, vendorKey: 'vendor.groceries@smartshelfx.com' },
    { name: 'Aashirvaad Shudh Chakki Atta 5kg', sku: 'SKU-GRO-002', category: 'Groceries', current_stock: 15, reorder_level: 25, unit_price: 245.00, vendorKey: 'vendor.groceries@smartshelfx.com' },
    { name: 'India Gate Basmati Rice Feast 5kg', sku: 'SKU-GRO-003', category: 'Groceries', current_stock: 4, reorder_level: 15, unit_price: 480.00, vendorKey: 'vendor.groceries@smartshelfx.com' },
    { name: 'Tata Salt Iodized 1kg', sku: 'SKU-GRO-004', category: 'Groceries', current_stock: 120, reorder_level: 40, unit_price: 28.00, vendorKey: 'vendor.groceries@smartshelfx.com' },
    { name: 'Tata Sampann Toor Dal 1kg', sku: 'SKU-GRO-005', category: 'Groceries', current_stock: 18, reorder_level: 20, unit_price: 185.00, vendorKey: 'vendor.groceries@smartshelfx.com' },

    // Snacks
    { name: 'Maggi 2-Minute Masala Noodles 70g', sku: 'SKU-SNA-001', category: 'Snacks', current_stock: 0, reorder_level: 50, unit_price: 14.00, vendorKey: 'vendor.beverages@smartshelfx.com' },
    { name: 'Lay\'s India\'s Magic Masala 50g', sku: 'SKU-SNA-002', category: 'Snacks', current_stock: 14, reorder_level: 35, unit_price: 20.00, vendorKey: 'vendor.beverages@smartshelfx.com' },
    { name: 'Britannia Good Day Butter Cookies 200g', sku: 'SKU-SNA-003', category: 'Snacks', current_stock: 65, reorder_level: 30, unit_price: 45.00, vendorKey: 'vendor.beverages@smartshelfx.com' },
    { name: 'Haldiram\'s Bhujia Sev 400g', sku: 'SKU-SNA-004', category: 'Snacks', current_stock: 28, reorder_level: 20, unit_price: 130.00, vendorKey: 'vendor.beverages@smartshelfx.com' },

    // Beverages
    { name: 'Red Label Tea 500g', sku: 'SKU-BEV-001', category: 'Beverages', current_stock: 50, reorder_level: 25, unit_price: 260.00, vendorKey: 'vendor.beverages@smartshelfx.com' },
    { name: 'Nescafe Classic Instant Coffee 100g', sku: 'SKU-BEV-002', category: 'Beverages', current_stock: 9, reorder_level: 20, unit_price: 340.00, vendorKey: 'vendor.beverages@smartshelfx.com' },
    { name: 'Coca-Cola 1.5L PET Bottle', sku: 'SKU-BEV-003', category: 'Beverages', current_stock: 40, reorder_level: 20, unit_price: 75.00, vendorKey: 'vendor.beverages@smartshelfx.com' },
    { name: 'Sprite 2L Bottle', sku: 'SKU-BEV-004', category: 'Beverages', current_stock: 6, reorder_level: 20, unit_price: 90.00, vendorKey: 'vendor.beverages@smartshelfx.com' },

    // Personal Care
    { name: 'Dettol Original Liquid Handwash 750ml', sku: 'SKU-PC-001', category: 'Personal Care', current_stock: 32, reorder_level: 15, unit_price: 119.00, vendorKey: 'vendor.groceries@smartshelfx.com' },
    { name: 'Colgate Strong Teeth Toothpaste 300g', sku: 'SKU-PC-002', category: 'Personal Care', current_stock: 5, reorder_level: 20, unit_price: 165.00, vendorKey: 'vendor.groceries@smartshelfx.com' },
    { name: 'Head & Shoulders Shampoo 340ml', sku: 'SKU-PC-003', category: 'Personal Care', current_stock: 22, reorder_level: 15, unit_price: 360.00, vendorKey: 'vendor.groceries@smartshelfx.com' },

    // Household
    { name: 'Surf Excel Quick Wash Detergent 1kg', sku: 'SKU-HH-001', category: 'Household', current_stock: 35, reorder_level: 20, unit_price: 215.00, vendorKey: 'vendor.groceries@smartshelfx.com' },
    { name: 'Vim Dishwash Liquid Gel 750ml', sku: 'SKU-HH-002', category: 'Household', current_stock: 18, reorder_level: 20, unit_price: 170.00, vendorKey: 'vendor.groceries@smartshelfx.com' }
];

async function autoSeed() {
    try {
        console.log('[AutoSeed] Checking database seed state...');

        // 1. Seed or Verify Users
        const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
        const userMap = {};

        for (const u of DEMO_USERS) {
            let existing = await User.findOne({ where: { email: u.email } });
            if (!existing) {
                existing = await User.create({
                    name: u.name,
                    username: u.username,
                    email: u.email,
                    password: passwordHash,
                    role: u.role
                });
                console.log(`[AutoSeed] Created demo user: ${u.email} (${u.role})`);
            }
            userMap[u.email] = existing.id;
        }

        // Also ensure admin has latest hash if needed
        const adminUser = await User.findOne({ where: { email: 'admin@smartshelfx.com' } });
        const adminId = adminUser ? adminUser.id : (Object.values(userMap)[0] || 1);

        // 2. Check Products
        const productCount = await Product.count();
        if (productCount === 0) {
            console.log('[AutoSeed] Seeding 22 core inventory products...');
            const createdProducts = [];

            for (const p of INITIAL_PRODUCTS) {
                const vendorId = userMap[p.vendorKey] || null;
                const prod = await Product.create({
                    name: p.name,
                    sku: p.sku,
                    category: p.category,
                    current_stock: p.current_stock,
                    reorder_level: p.reorder_level,
                    unit_price: p.unit_price,
                    vendor_id: vendorId,
                    expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
                });
                createdProducts.push(prod);
            }

            console.log(`[AutoSeed] Seeded ${createdProducts.length} products.`);

            // 3. Seed Stock Transactions (Past 60 days)
            console.log('[AutoSeed] Generating realistic transaction history (60 days)...');
            const transactions = [];
            const now = Date.now();
            const dayMs = 24 * 60 * 60 * 1000;

            for (const prod of createdProducts) {
                // Initial restock 45-60 days ago
                transactions.push({
                    product_id: prod.id,
                    type: 'IN',
                    quantity: Math.max(prod.reorder_level * 3, 50),
                    handled_by: adminId,
                    timestamp: new Date(now - (50 + Math.floor(Math.random() * 10)) * dayMs),
                    notes: 'Initial bulk supplier intake'
                });

                // Multiple outbound sales across past 40 days
                for (let day = 40; day >= 2; day -= Math.floor(Math.random() * 4) + 2) {
                    const qty = Math.floor(Math.random() * 8) + 2;
                    transactions.push({
                        product_id: prod.id,
                        type: 'OUT',
                        quantity: qty,
                        handled_by: adminId,
                        timestamp: new Date(now - day * dayMs - Math.floor(Math.random() * 36000000)),
                        notes: 'Store POS sales batch'
                    });
                }

                // Mid-month replenishment for some products
                if (prod.current_stock > prod.reorder_level) {
                    transactions.push({
                        product_id: prod.id,
                        type: 'IN',
                        quantity: Math.floor(prod.reorder_level * 1.5),
                        handled_by: adminId,
                        timestamp: new Date(now - 14 * dayMs),
                        notes: 'Mid-month scheduled replenishment'
                    });
                }
            }

            await StockTransaction.bulkCreate(transactions);
            console.log(`[AutoSeed] Seeded ${transactions.length} historical stock transactions.`);

            // 4. Seed Initial Forecasts
            console.log('[AutoSeed] Generating initial AI forecast baseline...');
            const forecasts = [];
            const alerts = [];
            const orders = [];

            for (const prod of createdProducts) {
                const isCrit = prod.current_stock === 0 || prod.current_stock <= prod.reorder_level * 0.5;
                const isHigh = prod.current_stock <= prod.reorder_level;
                const risk = isCrit ? 'CRITICAL' : (isHigh ? 'HIGH' : (prod.current_stock <= prod.reorder_level * 1.5 ? 'MEDIUM' : 'LOW'));
                const predictedQty = Math.round(Math.max(prod.reorder_level * 0.8, prod.current_stock * 0.3 + 5) * 10) / 10;
                const confidence = 0.85;

                forecasts.push({
                    product_id: prod.id,
                    forecast_date: new Date(now + 7 * dayMs).toISOString().split('T')[0],
                    predicted_qty: predictedQty,
                    confidence: confidence,
                    risk_level: risk
                });

                if (['HIGH', 'CRITICAL'].includes(risk)) {
                    alerts.push({
                        product_id: prod.id,
                        vendor_id: prod.vendor_id,
                        type: prod.current_stock === 0 ? 'OUT_OF_STOCK' : (isCrit ? 'LOW_STOCK' : 'RESTOCK_SUGGESTED'),
                        message: `Auto-Alert: ${prod.name} (${prod.sku}) is at ${risk} risk. Stock: ${prod.current_stock}, Predicted demand: ${predictedQty} units.`,
                        is_read: false
                    });

                    if (prod.vendor_id) {
                        const poQty = Math.max(prod.reorder_level * 2, Math.ceil(predictedQty));
                        orders.push({
                            product_id: prod.id,
                            vendor_id: prod.vendor_id,
                            quantity: poQty,
                            status: prod.current_stock === 0 ? 'PENDING' : (Math.random() > 0.5 ? 'APPROVED' : 'PENDING'),
                            notes: `Auto-generated by AI forecast. Stock: ${prod.current_stock}, Reorder level: ${prod.reorder_level}.`
                        });
                    }
                }
            }

            await ForecastResult.bulkCreate(forecasts);
            if (alerts.length > 0) await Alert.bulkCreate(alerts);
            if (orders.length > 0) await PurchaseOrder.bulkCreate(orders);

            console.log(`[AutoSeed] Seeded ${forecasts.length} forecasts, ${alerts.length} alerts, ${orders.length} initial POs.`);
        } else {
            console.log(`[AutoSeed] Products already present (${productCount} items). Checking forecasts & alerts...`);
            const forecastCount = await ForecastResult.count();
            if (forecastCount === 0) {
                const products = await Product.findAll();
                const forecasts = [];
                const dayMs = 24 * 60 * 60 * 1000;
                for (const prod of products) {
                    const isCrit = prod.current_stock === 0 || prod.current_stock <= prod.reorder_level * 0.5;
                    const isHigh = prod.current_stock <= prod.reorder_level;
                    const risk = isCrit ? 'CRITICAL' : (isHigh ? 'HIGH' : 'LOW');
                    forecasts.push({
                        product_id: prod.id,
                        forecast_date: new Date(Date.now() + 7 * dayMs).toISOString().split('T')[0],
                        predicted_qty: Math.max(prod.reorder_level, 10),
                        confidence: 0.82,
                        risk_level: risk
                    });
                }
                await ForecastResult.bulkCreate(forecasts);
                console.log(`[AutoSeed] Populated initial forecasts for ${forecasts.length} existing products.`);
            }
        }

        console.log('[AutoSeed] ✅ Database seeding check complete. System ready for production.');
    } catch (err) {
        console.error('[AutoSeed] ❌ Seeding error:', err.message);
    }
}

module.exports = { autoSeed };
