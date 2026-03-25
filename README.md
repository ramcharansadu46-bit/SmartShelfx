# SmartshelfX-AI-Based-Inventory-Management-and-Auto-Restock
SmartShelfX is a next-generation inventory management platform designed to optimize  stock levels using AI-powered demand forecasting. The system analyzes historical  sales, seasonal trends, and real-time data to recommend and automate restocking  operations. Built using Angular 19 for the frontend, Node.js (Express) for the backend,  and MySQL

✨ Features
🤖 AI & Forecasting
AI-powered demand forecasting using Python ML service
Predicts stock requirements for the next 7 days
Risk level classification: LOW / MEDIUM / HIGH / CRITICAL
Auto-triggers purchase orders for HIGH/CRITICAL risk products
Manual forecast run by Admin/Manager at any time

📦 Inventory Management
Full product CRUD with SKU, category, vendor, expiry date
Real-time stock tracking with IN/OUT transactions
Bulk product import via CSV, Excel (.xlsx), TSV, ODS files
Smart column auto-mapping on file import
Stock status filters: In Stock, Low, Critical, Out of Stock

🔔 Smart Alerts
Automatic LOW_STOCK, OUT_OF_STOCK, EXPIRY alerts
AI-generated RESTOCK_SUGGESTED alerts
Vendor-specific alert feed
Mark as read / dismiss alerts

📊 Analytics Dashboard
KPI summary: Total Products, Low Stock, Out of Stock, Pending Orders
Monthly Purchase vs Sales bar chart (6 months)
Stock by Category doughnut chart
Inventory Level Trend line chart
Top 10 most restocked products

🛒 Purchase Order Workflow
Auto-generated POs when stock is LOW/CRITICAL
Manual PO creation by Admin/Manager
Vendor approves or cancels POs
Status pipeline: PENDING → APPROVED → DISPATCHED → DELIVERED / CANCELLED
Email notifications to vendors on new POs
Email notifications to managers when vendor approves/rejects

🔐 Authentication & Roles
JWT-based authentication
Three role types: ADMIN, MANAGER, VENDOR
Separate Admin login portal (port 4201)
Role-based route protection

⏰ Background Scheduler
Runs every 2 minutes
Auto-scans all products for HIGH/CRITICAL stock levels
Auto-creates POs and emails vendors if no open PO exists

