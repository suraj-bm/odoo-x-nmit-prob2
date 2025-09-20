// Application configuration

export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  
  // App Configuration
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Shiv Accounts Cloud',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Pagination
  defaultPageSize: 20,
  
  // Date formats
  dateFormat: 'YYYY-MM-DD',
  dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
  
  // Currency
  currency: 'INR',
  currencySymbol: '₹',
  
  // Status colors
  statusColors: {
    draft: 'gray',
    confirmed: 'blue',
    sent: 'orange',
    paid: 'green',
    overdue: 'red',
    cancelled: 'gray',
    active: 'green',
    inactive: 'gray',
  },
  
  // User roles
  roles: {
    admin: 'Admin',
    invoicing_user: 'Invoicing User',
    contact: 'Contact',
  },
  
  // Contact types
  contactTypes: {
    customer: 'Customer',
    vendor: 'Vendor',
    both: 'Both',
  },
  
  // Payment methods
  paymentMethods: {
    cash: 'Cash',
    bank_transfer: 'Bank Transfer',
    cheque: 'Cheque',
    credit_card: 'Credit Card',
    upi: 'UPI',
    other: 'Other',
  },
} as const;
