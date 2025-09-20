# Shiv Accounts Cloud - Frontend

A modern Next.js frontend for the Shiv Accounts Cloud accounting system, built with TypeScript, Tailwind CSS, and integrated with Django REST API.

## Features

- **Modern UI**: Built with Next.js 15, React 19, and Tailwind CSS
- **TypeScript**: Full type safety throughout the application
- **API Integration**: Complete integration with Django backend APIs
- **Authentication**: JWT-based authentication with role-based access
- **Responsive Design**: Mobile-first responsive design
- **Real-time Updates**: Live data from backend APIs
- **Charts & Analytics**: Data visualization with Recharts

## Tech Stack

- **Framework**: Next.js 15.5.3
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts 3.2.1
- **State Management**: React Context + Custom Hooks
- **API Client**: Custom fetch-based client with error handling

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Running Django backend (see backend README)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_APP_NAME=Shiv Accounts Cloud
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── products/          # Products management
│   ├── contacts/          # Contacts management
│   ├── purchases/         # Purchase orders
│   ├── sales/             # Sales orders
│   ├── reports/           # Reports and analytics
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
├── lib/                   # Utilities and configurations
│   ├── api.ts            # API client configuration
│   ├── config.ts         # App configuration
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   └── services/         # API service functions
└── styles/               # Global styles
```

## API Integration

The frontend is fully integrated with the Django backend APIs:

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Role-based access control
- Protected routes

### API Services
- **Auth**: Login, register, profile management
- **Contacts**: Customer and vendor management
- **Products**: Product catalog and inventory
- **Transactions**: Purchase orders, sales orders, invoices
- **Reports**: Balance sheet, P&L, stock reports

### Custom Hooks
- `useApi`: Generic API call hook with loading/error states
- `usePaginatedApi`: Paginated data management
- `useMutation`: Create/update/delete operations
- `useAuth`: Authentication state management

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Authentication

The app supports three user roles:

1. **Admin**: Full access to all features
2. **Invoicing User**: Transaction management and read-only reports
3. **Contact**: Read-only access to own invoices/bills

### Demo Credentials
- **Admin**: `admin` / `admin123`
- **Invoicing User**: `invoicing` / `invoicing123`

## API Endpoints

The frontend connects to these backend endpoints:

- `GET /api/master/contacts/` - List contacts
- `GET /api/master/products/` - List products
- `GET /api/transactions/purchase-orders/` - Purchase orders
- `GET /api/transactions/sales-orders/` - Sales orders
- `GET /api/reports/reports/balance_sheet/` - Balance sheet
- And many more...

## Development

### Adding New Pages
1. Create a new directory in `src/app/`
2. Add a `page.tsx` file
3. Use the API services from `src/lib/services/`
4. Implement with custom hooks for state management

### Adding New API Services
1. Define types in the appropriate service file
2. Add API functions using the `apiClient`
3. Export from the service file
4. Use in components with custom hooks

### Styling
- Uses Tailwind CSS for styling
- Custom components in `src/components/`
- Responsive design patterns
- Dark/light mode support (configurable)

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_APP_NAME=Shiv Accounts Cloud
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.