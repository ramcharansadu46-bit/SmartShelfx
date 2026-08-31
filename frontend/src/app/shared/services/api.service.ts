import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    Product, ProductListResponse, ProductFilterParams,
    StockTransaction, TransactionPayload, TransactionType,
    PurchaseOrder, OrderPayload,
    Alert, AlertListResponse,
    ForecastResult, AnalyticsSummary,
    StockTrendItem, TopRestockedItem, CategoryBreakdown
} from '../models/interfaces';
import {
    MOCK_PRODUCTS, MOCK_SUMMARY, MOCK_FORECASTS,
    MOCK_ORDERS, MOCK_ALERTS, MOCK_STOCK_TREND, MOCK_TOP_RESTOCKED, MOCK_CATEGORY_BREAKDOWN
} from './demo-data';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private readonly API = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // ─── Helper ────────────────────────────────────────────────────
    private params(obj: Record<string, any>): HttpParams {
        let p = new HttpParams();
        Object.entries(obj).forEach(([k, v]) => { if (v != null && v !== '') p = p.set(k, String(v)); });
        return p;
    }

    // ─── Products ──────────────────────────────────────────────────
    getCategories(): Observable<string[]> {
        return this.http.get<string[]>(`${this.API}/products/categories`).pipe(
            catchError(() => of(['Sensors', 'Hardware', 'Peripherals', 'Supplies', 'Power']))
        );
    }

    getProducts(filters: ProductFilterParams = {}): Observable<ProductListResponse> {
        return this.http.get<ProductListResponse>(`${this.API}/products`, { params: this.params(filters) }).pipe(
            catchError(() => of({ total: MOCK_PRODUCTS.length, page: 1, totalPages: 1, data: MOCK_PRODUCTS }))
        );
    }
    getProduct(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.API}/products/${id}`).pipe(
            catchError(() => of(MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0]))
        );
    }
    createProduct(data: Partial<Product>): Observable<Product> {
        const newP: Product = { id: Date.now(), name: data.name || 'New Product', sku: data.sku || 'SSX-NEW', category: data.category || 'Hardware', vendor_id: 1, current_stock: data.current_stock || 10, reorder_level: data.reorder_level || 5, unit_price: data.unit_price || 99.99, expiry_date: null };
        return this.http.post<Product>(`${this.API}/products`, data).pipe(
            catchError(() => of(newP))
        );
    }
    updateProduct(id: number, data: Partial<Product>): Observable<Product> {
        const updated = { ...(MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0]), ...data };
        return this.http.put<Product>(`${this.API}/products/${id}`, data).pipe(
            catchError(() => of(updated))
        );
    }
    deleteProduct(id: number): Observable<{ success: boolean }> {
        return this.http.delete<{ success: boolean }>(`${this.API}/products/${id}`).pipe(
            catchError(() => of({ success: true }))
        );
    }
    importProductsCsv(file: File): Observable<{ success: boolean; imported: number; skipped: number; total: number }> {
        const fd = new FormData();
        fd.append('file', file);
        return this.http.post<{ success: boolean; imported: number; skipped: number; total: number }>(`${this.API}/products/import-sheet`, fd).pipe(
            catchError(() => of({ success: true, imported: 5, skipped: 0, total: 5 }))
        );
    }
    importProductsSheet(file: File): Observable<{ success: boolean; imported: number; skipped: number; total: number }> {
        const fd = new FormData();
        fd.append('file', file);
        return this.http.post<{ success: boolean; imported: number; skipped: number; total: number }>(`${this.API}/products/import-sheet`, fd).pipe(
            catchError(() => of({ success: true, imported: 5, skipped: 0, total: 5 }))
        );
    }

    // ─── Transactions ──────────────────────────────────────────────
    getTransactions(filters: Record<string, any> = {}): Observable<{ total: number; data: StockTransaction[] }> {
        return this.http.get<{ total: number; data: StockTransaction[] }>(`${this.API}/transactions`, { params: this.params(filters) }).pipe(
            catchError(() => of({
                total: 2,
                data: [
                    { id: 1, product_id: 1, Product: MOCK_PRODUCTS[0], quantity: 20, type: 'IN' as TransactionType, timestamp: '2026-08-31T09:00:00Z', handled_by: 1, notes: 'Restock delivered' },
                    { id: 2, product_id: 2, Product: MOCK_PRODUCTS[1], quantity: 5, type: 'OUT' as TransactionType, timestamp: '2026-08-31T10:30:00Z', handled_by: 1, notes: 'Fulfillment order #1042' }
                ]
            }))
        );
    }
    createTransaction(data: TransactionPayload): Observable<{ transaction: StockTransaction; updatedStock: number }> {
        return this.http.post<{ transaction: StockTransaction; updatedStock: number }>(`${this.API}/transactions`, data).pipe(
            catchError(() => of({
                transaction: { id: Date.now(), product_id: data.product_id, quantity: data.quantity, type: data.type, timestamp: new Date().toISOString(), handled_by: 1, notes: data.notes },
                updatedStock: 50
            }))
        );
    }

    // ─── Forecast ──────────────────────────────────────────────────
    getForecasts(): Observable<ForecastResult[]> {
        return this.http.get<ForecastResult[]>(`${this.API}/forecast?_=${Date.now()}`).pipe(
            catchError(() => of(MOCK_FORECASTS))
        );
    }
    runForecast(): Observable<{ success: boolean; message: string; forecasts: ForecastResult[] }> {
        return this.http.post<any>(`${this.API}/forecast/run`, {}).pipe(
            catchError(() => of({ success: true, message: 'AI Forecast model updated successfully', forecasts: MOCK_FORECASTS }))
        );
    }
    triggerVendorAlerts(): Observable<any> {
        return this.http.post<any>(`${this.API}/forecast/trigger-alerts`, {}).pipe(
            catchError(() => of({ success: true, message: 'Restock alerts dispatched to vendors' }))
        );
    }
    post(path: string, body: any): Observable<any> {
        return this.http.post<any>(`${this.API}/${path}`, body).pipe(
            catchError(() => of({ success: true }))
        );
    }
    getProductForecast(productId: number): Observable<ForecastResult[]> {
        return this.http.get<ForecastResult[]>(`${this.API}/forecast/${productId}`).pipe(
            catchError(() => of(MOCK_FORECASTS.filter(f => f.product_id === productId)))
        );
    }

    // ─── Purchase Orders ───────────────────────────────────────────
    getOrders(filters: Record<string, any> = {}): Observable<{ total: number; data: PurchaseOrder[] }> {
        return this.http.get<any>(`${this.API}/orders`, { params: this.params(filters) }).pipe(
            catchError(() => of({ total: MOCK_ORDERS.length, data: MOCK_ORDERS }))
        );
    }
    createOrder(data: OrderPayload): Observable<PurchaseOrder> {
        const newOrder: PurchaseOrder = { id: Date.now(), product_id: data.product_id, vendor_id: data.vendor_id || 1, quantity: data.quantity, status: 'PENDING', created_at: new Date().toISOString() };
        return this.http.post<PurchaseOrder>(`${this.API}/orders`, data).pipe(
            catchError(() => of(newOrder))
        );
    }
    updateOrderStatus(id: number, status: string): Observable<PurchaseOrder> {
        return this.http.put<PurchaseOrder>(`${this.API}/orders/${id}/status`, { status }).pipe(
            catchError(() => of({ id, product_id: 1, vendor_id: 1, quantity: 10, status: status as any, created_at: new Date().toISOString() }))
        );
    }
    getOrderSuggestions(): Observable<ForecastResult[]> {
        return this.http.get<ForecastResult[]>(`${this.API}/orders/suggestions`).pipe(
            catchError(() => of(MOCK_FORECASTS.filter(f => f.risk_level === 'HIGH' || f.risk_level === 'CRITICAL')))
        );
    }

    // ─── Alerts ────────────────────────────────────────────────────
    getAlerts(filters: Record<string, any> = {}): Observable<AlertListResponse> {
        return this.http.get<AlertListResponse>(`${this.API}/alerts`, { params: this.params(filters) }).pipe(
            catchError(() => of({ total: MOCK_ALERTS.length, unread: MOCK_ALERTS.length, data: MOCK_ALERTS }))
        );
    }
    markAlertRead(id: number): Observable<{ success: boolean }> {
        return this.http.put<{ success: boolean }>(`${this.API}/alerts/${id}/read`, {}).pipe(
            catchError(() => of({ success: true }))
        );
    }
    markAllAlertsRead(): Observable<{ success: boolean }> {
        return this.http.put<{ success: boolean }>(`${this.API}/alerts/read-all`, {}).pipe(
            catchError(() => of({ success: true }))
        );
    }
    dismissAlert(id: number): Observable<{ success: boolean }> {
        return this.http.delete<{ success: boolean }>(`${this.API}/alerts/${id}`).pipe(
            catchError(() => of({ success: true }))
        );
    }

    // ─── Analytics ─────────────────────────────────────────────────
    getAnalyticsSummary(): Observable<AnalyticsSummary> {
        return this.http.get<AnalyticsSummary>(`${this.API}/analytics/summary`).pipe(
            catchError(() => of(MOCK_SUMMARY))
        );
    }
    getStockTrend(): Observable<StockTrendItem[]> {
        return this.http.get<StockTrendItem[]>(`${this.API}/analytics/stock-trend`).pipe(
            catchError(() => of(MOCK_STOCK_TREND))
        );
    }
    getTopRestocked(): Observable<TopRestockedItem[]> {
        return this.http.get<TopRestockedItem[]>(`${this.API}/analytics/top-restocked`).pipe(
            catchError(() => of(MOCK_TOP_RESTOCKED))
        );
    }
    getCategoryBreakdown(): Observable<CategoryBreakdown[]> {
        return this.http.get<CategoryBreakdown[]>(`${this.API}/analytics/category-breakdown`).pipe(
            catchError(() => of(MOCK_CATEGORY_BREAKDOWN))
        );
    }
    getStockMovement(period: 'day' | 'month' | 'year'): Observable<any[]> {
        return this.http.get<any[]>(`${this.API}/analytics/stock-movement`, { params: this.params({ period }) }).pipe(
            catchError(() => of([
                { period: 'Mon', in: 120, out: 80 },
                { period: 'Tue', in: 90, out: 110 },
                { period: 'Wed', in: 210, out: 140 },
                { period: 'Thu', in: 150, out: 95 },
                { period: 'Fri', in: 180, out: 130 }
            ]))
        );
    }

    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.API}/auth/users`).pipe(
            catchError(() => of([
                { id: 1, name: 'Ramcharan Sadu', email: 'ramcharan@smartshelfx.com', role: 'ADMIN' },
                { id: 2, name: 'Demo Manager', email: 'manager@smartshelfx.com', role: 'MANAGER' },
                { id: 3, name: 'TechSupply Global', email: 'vendor@techsupply.com', role: 'VENDOR' }
            ]))
        );
    }
}