# 🚀 Accountix - Complete Business Management System

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)](https://nextjs.org/)
[![Django](https://img.shields.io/badge/Django-5.0-green)](https://djangoproject.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-blue)](https://reactjs.org/)

> **🎥 [Watch Demo Video](https://drive.google.com/file/d/1oEsPwk1QBQqdz5n3Qr4sz8F52PjoxKUc/view?usp=sharing)**

A comprehensive business management system built with modern technologies, featuring real-time analytics, invoice generation, customer management, and complete accounting functionality.

## 🌟 Features

### 🔐 Authentication & Security
- *JWT-based Authentication* with refresh tokens
- *Role-based Access Control* (Admin, Invoicing User, Contact)
- *Secure API endpoints* with proper validation
- *Session management* with automatic token refresh

### 📊 Dashboard & Analytics
- *Real-time KPIs* with live data updates
- *Interactive Charts* using Recharts
- *Status Distribution* visualizations
- *Monthly Trends* and spending analysis
- *Connection Status* monitoring

### 👥 Customer Management
- *Complete Customer Profiles* with contact information
- *Advanced Filtering* and search capabilities
- *Bulk Operations* for efficient management
- *Customer Analytics* and insights
- *Geographic Distribution* tracking

### 💰 Sales Management
- *Sales Order Creation* with dynamic item management
- *Invoice Generation* with PDF export
- *Real-time Calculations* with tax handling
- *Status Tracking* (Draft, Confirmed, Delivered, etc.)
- *Customer Integration* for seamless workflows

### 🛒 Purchase Management
- *Purchase Order Management* with vendor integration
- *Real-time Updates* with live data refresh
- *Advanced Filtering* by status, vendor, date range
- *Bulk Operations* for efficient processing
- *Vendor Performance* analytics

### 📄 Invoice System
- *Automated Invoice Generation* from sales orders
- *PDF Export* functionality
- *Payment Tracking* and status management
- *Customer Invoice Management* with complete history
- *Professional Invoice Templates*

### 📦 Product Management
- *Product Catalog* with categories and pricing
- *Inventory Tracking* with stock levels
- *Tax Configuration* for different product types
- *SKU Management* and product variants

### 🧾 Accounting Features
- *Chart of Accounts* management
- *Tax Configuration* and calculations
- *Financial Reporting* and analytics
- *Ledger Entries* tracking
- *Payment Processing* integration

## 🛠 Technology Stack

### Frontend
- *Next.js 15.5.3* - React framework with App Router
- *TypeScript* - Type-safe development
- *Tailwind CSS* - Utility-first CSS framework
- *Recharts* - Data visualization library
- *Axios* - HTTP client for API calls
- *React Hook Form* - Form management
- *Zustand* - State management

### Backend
- *Django 5.0* - Python web framework
- *Django REST Framework* - API development
- *JWT Authentication* - Secure token-based auth
- *PostgreSQL/SQLite* - Database management
- *Django CORS Headers* - Cross-origin resource sharing
- *Django Signals* - Event handling

### Development Tools
- *Turbopack* - Fast bundling and development
- *ESLint* - Code linting
- *Prettier* - Code formatting
- *Git* - Version control

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.9+
- Git

### Installation

1. *Clone the repository*
   bash
   git clone https://github.com/yourusername/accountix.git
   cd accountix
   

2. *Backend Setup*
   bash
   cd backend
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver 8000
   

3. *Frontend Setup*
   bash
   cd frontend/accountix
   npm install
   npm run dev
   

4. *Access the Application*
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api/

### Sample Data
bash
# Create sample data
cd backend
python manage.py simple_seed
python manage.py create_sales_data
python manage.py create_purchase_data


## 📱 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Real-time+Dashboard+with+Analytics)

### Sales Management
![Sales](https://via.placeholder.com/800x400/10B981/FFFFFF?text=Sales+Order+Management+with+Invoice+Generation)

### Customer Management
![Customers](https://via.placeholder.com/800x400/F59E0B/FFFFFF?text=Customer+Management+with+Advanced+Filtering)

### Purchase Orders
![Purchases](https://via.placeholder.com/800x400/EF4444/FFFFFF?text=Purchase+Order+Management+with+Real-time+Updates)

## 🎯 Key Features Demo

### Real-time Analytics
- Live data updates every 30 seconds
- Connection status monitoring
- Interactive charts and graphs
- Responsive design for all devices

### Invoice Generation
- One-click invoice creation from sales orders
- Professional PDF templates
- Payment tracking and status updates
- Customer-specific invoice management

### Advanced Filtering
- Search across all modules
- Date range filtering
- Status-based filtering
- Bulk operations support

### Mobile Responsive
- Optimized for mobile devices
- Touch-friendly interface
- Collapsible navigation
- Responsive data tables

## 🗄 Database Schema

### Core Tables

#### Users & Authentication
sql
-- Custom User model with role-based permissions
users_user (
    id, username, email, first_name, last_name,
    role (admin|invoicing_user|contact),
    phone, address, is_verified,
    created_at, updated_at
)


#### Master Data
sql
-- Contacts (Customers & Vendors)
master_contact (
    id, name, contact_type (customer|vendor|both),
    email, phone, address, city, state, country, pincode,
    gst_number, pan_number, is_active,
    created_at, updated_at
)

-- Product Categories
master_product_category (
    id, name, description, is_active, created_at
)

-- Products
master_product (
    id, name, sku, description, category_id,
    hsn_code, unit_of_measure,
    sales_price, purchase_price,
    sales_tax_id, purchase_tax_id,
    current_stock, minimum_stock, is_active,
    created_at, updated_at
)

-- Tax Configuration
master_tax (
    id, name, tax_type (percentage|fixed),
    rate, applicable_on (sales|purchase|both),
    description, is_active, created_at, updated_at
)

-- Chart of Accounts
master_chart_of_accounts (
    id, name, code, account_type (asset|liability|equity|income|expense),
    parent_category, description, is_active,
    created_at, updated_at
)


#### Transaction Tables

##### Purchase Orders
sql
-- Purchase Orders
transactions_purchase_order (
    id, po_number, vendor_id, po_date, expected_delivery_date,
    status (draft|confirmed|partially_received|received|cancelled),
    subtotal, tax_amount, total_amount, notes,
    created_by_id, created_at, updated_at
)

-- Purchase Order Items
transactions_purchase_order_item (
    id, purchase_order_id, product_id, quantity, unit_price,
    tax_id, tax_amount, line_total, created_at, updated_at
)

-- Vendor Bills
transactions_vendor_bill (
    id, bill_number, vendor_id, purchase_order_id,
    invoice_date, due_date, subtotal, tax_amount, total_amount,
    paid_amount, balance_amount, notes,
    created_by_id, created_at, updated_at
)


##### Sales Orders
sql
-- Sales Orders
transactions_sales_order (
    id, so_number, customer_id, so_date, expected_delivery_date,
    status (draft|confirmed|partially_delivered|delivered|cancelled),
    subtotal, tax_amount, total_amount, notes,
    created_by_id, created_at, updated_at
)

-- Sales Order Items
transactions_sales_order_item (
    id, sales_order_id, product_id, quantity, unit_price,
    tax_id, tax_amount, line_total, created_at, updated_at
)

-- Customer Invoices
transactions_customer_invoice (
    id, invoice_number, customer_id, sales_order_id,
    invoice_date, due_date, subtotal, tax_amount, total_amount,
    paid_amount, balance_amount, payment_status (unpaid|partial|paid),
    notes, created_by_id, created_at, updated_at
)


##### Payment & Accounting
sql
-- Payments
transactions_payment (
    id, payment_number, customer_id, invoice_id,
    payment_date, amount, payment_method, reference_number,
    notes, created_by_id, created_at, updated_at
)

-- Stock Ledger
transactions_stock_ledger (
    id, product_id, transaction_type (in|out),
    quantity, unit_price, total_value, reference_type,
    reference_id, notes, created_at
)

-- Ledger Entries
transactions_ledger_entries (
    id, account_id, debit_amount, credit_amount,
    description, reference_type, reference_id,
    created_at, updated_at
)


### Database Relationships

mermaid
erDiagram
    User ||--o{ PurchaseOrder : creates
    User ||--o{ SalesOrder : creates
    User ||--o{ CustomerInvoice : creates
    
    Contact ||--o{ PurchaseOrder : vendor
    Contact ||--o{ SalesOrder : customer
    Contact ||--o{ CustomerInvoice : customer
    Contact ||--o{ Payment : customer
    
    Product ||--o{ PurchaseOrderItem : included_in
    Product ||--o{ SalesOrderItem : included_in
    Product ||--o{ StockLedger : tracked_in
    
    ProductCategory ||--o{ Product : categorizes
    Tax ||--o{ Product : sales_tax
    Tax ||--o{ Product : purchase_tax
    Tax ||--o{ PurchaseOrderItem : applied_to
    Tax ||--o{ SalesOrderItem : applied_to
    
    PurchaseOrder ||--o{ PurchaseOrderItem : contains
    PurchaseOrder ||--o{ VendorBill : generates
    
    SalesOrder ||--o{ SalesOrderItem : contains
    SalesOrder ||--o{ CustomerInvoice : generates
    
    CustomerInvoice ||--o{ Payment : receives
    ChartOfAccounts ||--o{ LedgerEntries : tracks


### Key Features of Database Design

#### 🔐 *Data Integrity*
- *Foreign Key Constraints* ensure referential integrity
- *Unique Constraints* prevent duplicate data (SKU, email, GST numbers)
- *Check Constraints* validate data ranges and formats
- *Cascade Rules* maintain data consistency on deletions

#### 📊 *Performance Optimization*
- *Indexed Fields* on frequently queried columns (email, SKU, dates)
- *Composite Indexes* for complex queries (status + date ranges)
- *Selective Queries* with proper joins and prefetching
- *Pagination Support* for large datasets

#### 🔄 *Audit Trail*
- *Created/Updated Timestamps* on all tables
- *Created By* tracking for user accountability
- *Soft Deletes* for data retention
- *Change Logging* for critical operations

#### 💰 *Financial Accuracy*
- *Decimal Fields* for precise monetary calculations
- *Automatic Calculations* via Django signals
- *Tax Calculations* with configurable rates
- *Balance Tracking* for payments and invoices

## 🔧 API Endpoints

### Authentication
- POST /api/users/login/ - User login
- POST /api/users/register/ - User registration
- POST /api/users/logout/ - User logout
- GET /api/users/profile/ - Get user profile

### Sales
- GET /api/transactions/sales-orders/ - List sales orders
- POST /api/transactions/sales-orders/ - Create sales order
- POST /api/transactions/sales-orders/{id}/generate_invoice/ - Generate invoice

### Purchases
- GET /api/transactions/purchase-orders/ - List purchase orders
- POST /api/transactions/purchase-orders/ - Create purchase order
- PUT /api/transactions/purchase-orders/{id}/ - Update purchase order

### Customers
- GET /api/master/contacts/ - List contacts
- POST /api/master/contacts/ - Create contact
- GET /api/master/contacts/?contact_type=customer - List customers

## 🏗 Project Structure


accountix/
├── backend/
│   ├── shiv_accounts_cloud/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── users/
│   │   ├── models.py
│   │   ├── views.py
│   │   └── serializers.py
│   ├── master/
│   │   ├── models.py
│   │   ├── views.py
│   │   └── management/commands/
│   └── transactions/
│       ├── models.py
│       ├── views.py
│       └── serializers.py
├── frontend/
│   └── accountix/
│       ├── src/
│       │   ├── app/
│       │   │   ├── dashboard/
│       │   │   ├── sales/
│       │   │   ├── purchases/
│       │   │   ├── customers/
│       │   │   └── invoices/
│       │   ├── components/
│       │   ├── lib/
│       │   └── services/
│       └── package.json
└── README.md


## 🎥 Demo Video

*🎬 [Watch the complete demo video here](https://drive.google.com/file/d/1oEsPwk1QBQqdz5n3Qr4sz8F52PjoxKUc/view?usp=sharing)*

The video demonstrates:
- Complete user authentication flow
- Dashboard with real-time analytics
- Sales order creation and invoice generation
- Customer management with advanced filtering
- Purchase order management with real-time updates
- Mobile responsiveness and user experience

## 🚀 Deployment

### Backend Deployment
bash
# Production settings
export DEBUG=False
export SECRET_KEY=your-secret-key
export DATABASE_URL=your-database-url

# Deploy to your preferred platform
# Heroku, Railway, DigitalOcean, etc.


### Frontend Deployment
bash
# Build for production
npm run build

# Deploy to Vercel, Netlify, or your preferred platform


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

*Your Name*
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Django team for the robust backend framework
- Tailwind CSS for the utility-first CSS framework
- Recharts for the beautiful data visualization components

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact us at support@accountix.com
- Check our documentation at [docs.accountix.com](https://docs.accountix.com)

---

*⭐ Star this repository if you found it helpful!*

*🎥 [Watch Demo Video](https://drive.google.com/file/d/1oEsPwk1QBQqdz5n3Qr4sz8F52PjoxKUc/view?usp=sharing)*
