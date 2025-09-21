# Shiv Accounts Cloud - Backend

A production-grade Django backend for a cloud-based accounting system built with Django REST Framework, PostgreSQL, and JWT authentication.

## Features

- **Master Data Management**: Contacts, Products, Taxes, Chart of Accounts
- **Transaction Management**: Purchase Orders, Sales Orders, Invoices, Payments
- **Reporting**: Balance Sheet, Profit & Loss, Stock Reports
- **User Management**: Role-based authentication (Admin, Invoicing User, Contact)
- **API Documentation**: Swagger/OpenAPI documentation
- **Automated Business Logic**: Django signals for stock and ledger updates

## Tech Stack

- Django 5.0.8
- Django REST Framework 3.14.0
- PostgreSQL with psycopg2-binary
- JWT Authentication (SimpleJWT)
- Swagger Documentation (drf-yasg)
- Python 3.8+

## Installation

### Prerequisites

- Python 3.8 or higher
- PostgreSQL 12 or higher
- pip (Python package manager)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure PostgreSQL**
   - Create a PostgreSQL database named `shiv_accounts_cloud`
   - Update database settings in `shiv_accounts_cloud/settings.py` if needed

5. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Seed sample data (optional)**
   ```bash
   python manage.py seed_data
   ```

8. **Run development server**
   ```bash
   python manage.py runserver
   ```

## API Endpoints

### Authentication
- `POST /api/users/users/register/` - User registration
- `POST /api/users/users/login/` - User login
- `POST /api/users/users/logout/` - User logout
- `POST /api/users/users/refresh_token/` - Refresh JWT token

### Master Data
- `GET /api/master/contacts/` - List contacts
- `GET /api/master/products/` - List products
- `GET /api/master/taxes/` - List taxes
- `GET /api/master/chart-of-accounts/` - List chart of accounts

### Transactions
- `GET /api/transactions/purchase-orders/` - List purchase orders
- `GET /api/transactions/sales-orders/` - List sales orders
- `GET /api/transactions/vendor-bills/` - List vendor bills
- `GET /api/transactions/customer-invoices/` - List customer invoices
- `GET /api/transactions/payments/` - List payments

### Reports
- `GET /api/reports/reports/balance_sheet/` - Balance sheet report
- `GET /api/reports/reports/profit_loss/` - Profit & loss report
- `GET /api/reports/reports/stock_report/` - Stock report

## API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: `http://127.0.0.1:8000/swagger/`
- ReDoc: `http://127.0.0.1:8000/redoc/`

## User Roles

### Admin
- Full CRUD access to all resources
- User management
- System configuration

### Invoicing User
- CRUD access to transactions
- Read-only access to reports
- Limited master data access

### Contact
- Read-only access to their own invoices/bills
- Can make payments
- Limited profile management

## Database Schema

### Master Data
- **Contact**: Customers, vendors, or both
- **Product**: Products with pricing and tax information
- **Tax**: Tax rates and configurations
- **ChartOfAccounts**: Accounting chart of accounts

### Transactions
- **PurchaseOrder**: Purchase orders with items
- **SalesOrder**: Sales orders with items
- **VendorBill**: Bills from vendors
- **CustomerInvoice**: Invoices to customers
- **Payment**: Payments for bills/invoices

### Reporting
- **StockLedger**: Product movement tracking
- **LedgerEntries**: Accounting entries

## Business Logic

### Automated Updates
- Purchase order confirmation → Stock ledger entry (increase stock)
- Sales order confirmation → Stock ledger entry (decrease stock)
- Payment creation → Ledger entries (debit/credit)

### Stock Management
- Real-time stock tracking
- Low stock alerts
- Stock adjustments

### Accounting
- Double-entry bookkeeping
- Automated ledger entries
- Real-time financial reports

## Testing

Run tests with:
```bash
python manage.py test
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_NAME=shiv_accounts_cloud
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Django Configuration
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# JWT Configuration
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=10080
```

## Production Deployment

1. Set `DEBUG=False` in settings
2. Configure proper database credentials
3. Set up static file serving
4. Configure email settings
5. Use environment variables for sensitive data
6. Set up proper logging
7. Configure CORS settings for your frontend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
