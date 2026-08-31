import {
    Product,
    StockTransaction, PurchaseOrder,
    Alert,
    ForecastResult, AnalyticsSummary,
    StockTrendItem, TopRestockedItem, CategoryBreakdown
} from '../models/interfaces';

export const MOCK_PRODUCTS: Product[] = [
    { id: 1, name: 'Smart RFID Shelf Sensor Pro', sku: 'SSX-SENS-001', category: 'Sensors', vendor_id: 1, current_stock: 45, reorder_level: 15, unit_price: 129.99, expiry_date: '2027-12-31' },
    { id: 2, name: 'IoT Gateway Node Hub', sku: 'SSX-GATE-002', category: 'Hardware', vendor_id: 1, current_stock: 8, reorder_level: 10, unit_price: 249.50, expiry_date: '2028-06-30' },
    { id: 3, name: 'Barcode Scanner Handheld 2D', sku: 'SSX-SCAN-003', category: 'Peripherals', vendor_id: 2, current_stock: 22, reorder_level: 5, unit_price: 89.00, expiry_date: null },
    { id: 4, name: 'Smart Weight Scale Mat 50kg', sku: 'SSX-MAT-004', category: 'Sensors', vendor_id: 2, current_stock: 3, reorder_level: 8, unit_price: 199.99, expiry_date: null },
    { id: 5, name: 'Automated Restock Tag (Pack of 50)', sku: 'SSX-TAG-005', category: 'Supplies', vendor_id: 1, current_stock: 120, reorder_level: 30, unit_price: 49.99, expiry_date: null },
    { id: 6, name: 'Thermal Receipt Printer Wireless', sku: 'SSX-PRNT-006', category: 'Peripherals', vendor_id: 3, current_stock: 14, reorder_level: 5, unit_price: 159.00, expiry_date: null },
    { id: 7, name: 'High-Density Rack Battery Module', sku: 'SSX-BATT-007', category: 'Power', vendor_id: 3, current_stock: 2, reorder_level: 6, unit_price: 349.00, expiry_date: '2026-11-15' }
];

export const MOCK_SUMMARY: AnalyticsSummary = {
    totalProducts: 7,
    lowStockItems: 3,
    outOfStockItems: 0,
    pendingOrders: 2
};

export const MOCK_FORECASTS: ForecastResult[] = [
    { id: 101, product_id: 1, Product: MOCK_PRODUCTS[0], forecast_date: '2026-09-07', predicted_qty: 62, confidence: 94.5, risk_level: 'LOW', created_at: '2026-08-31' },
    { id: 102, product_id: 2, Product: MOCK_PRODUCTS[1], forecast_date: '2026-09-07', predicted_qty: 24, confidence: 89.2, risk_level: 'HIGH', created_at: '2026-08-31' },
    { id: 103, product_id: 4, Product: MOCK_PRODUCTS[3], forecast_date: '2026-09-07', predicted_qty: 18, confidence: 91.0, risk_level: 'CRITICAL', created_at: '2026-08-31' },
    { id: 104, product_id: 7, Product: MOCK_PRODUCTS[6], forecast_date: '2026-09-07', predicted_qty: 12, confidence: 87.8, risk_level: 'HIGH', created_at: '2026-08-31' }
];

export const MOCK_ORDERS: PurchaseOrder[] = [
    { id: 501, product_id: 2, Product: MOCK_PRODUCTS[1], vendor_id: 1, quantity: 20, status: 'PENDING', created_at: '2026-08-30' },
    { id: 502, product_id: 4, Product: MOCK_PRODUCTS[3], vendor_id: 2, quantity: 15, status: 'APPROVED', created_at: '2026-08-29' }
];

export const MOCK_ALERTS: Alert[] = [
    { id: 901, product_id: 2, Product: MOCK_PRODUCTS[1], type: 'LOW_STOCK', message: 'IoT Gateway Node Hub stock (8) is below reorder level (10)', is_read: false, created_at: '2026-08-31T08:00:00Z' },
    { id: 902, product_id: 4, Product: MOCK_PRODUCTS[3], type: 'RESTOCK_SUGGESTED', message: 'AI Forecast predicts demand spike for Smart Weight Scale Mat', is_read: false, created_at: '2026-08-31T09:15:00Z' }
];

export const MOCK_STOCK_TREND: StockTrendItem[] = [
    { month: 'Apr', type: 'IN', total: 120 },
    { month: 'Apr', type: 'OUT', total: 45 },
    { month: 'May', type: 'IN', total: 180 },
    { month: 'May', type: 'OUT', total: 90 },
    { month: 'Jun', type: 'IN', total: 200 },
    { month: 'Jun', type: 'OUT', total: 110 },
    { month: 'Jul', type: 'IN', total: 160 },
    { month: 'Jul', type: 'OUT', total: 130 },
    { month: 'Aug', type: 'IN', total: 210 },
    { month: 'Aug', type: 'OUT', total: 85 }
];

export const MOCK_TOP_RESTOCKED: TopRestockedItem[] = [
    { name: 'Smart RFID Shelf Sensor Pro', sku: 'SSX-SENS-001', total_restocked: 340 },
    { name: 'Automated Restock Tag (Pack of 50)', sku: 'SSX-TAG-005', total_restocked: 250 },
    { name: 'Barcode Scanner Handheld 2D', sku: 'SSX-SCAN-003', total_restocked: 110 }
];

export const MOCK_CATEGORY_BREAKDOWN: CategoryBreakdown[] = [
    { category: 'Sensors', count: 2, total_stock: 48 },
    { category: 'Hardware', count: 1, total_stock: 8 },
    { category: 'Peripherals', count: 2, total_stock: 36 },
    { category: 'Supplies', count: 1, total_stock: 120 },
    { category: 'Power', count: 1, total_stock: 2 }
];
