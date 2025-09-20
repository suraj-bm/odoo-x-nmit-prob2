// Reports API services

import { apiClient } from '../api';

// Stock Ledger
export interface StockLedgerEntry {
  id: number;
  product: number;
  product_name?: string;
  product_sku?: string;
  transaction_type: 'purchase' | 'sale' | 'adjustment' | 'opening_balance';
  quantity: number;
  unit_price: number;
  total_value: number;
  balance_quantity: number;
  balance_value: number;
  purchase_order?: number;
  po_number?: string;
  sales_order?: number;
  so_number?: string;
  reference_number?: string;
  notes?: string;
  transaction_date: string;
  created_at: string;
}

// Ledger Entries
export interface LedgerEntry {
  id: number;
  account: number;
  account_name?: string;
  account_code?: string;
  entry_type: 'debit' | 'credit';
  amount: number;
  description: string;
  purchase_order?: number;
  po_number?: string;
  sales_order?: number;
  so_number?: string;
  payment?: number;
  payment_number?: string;
  reference_number?: string;
  transaction_date: string;
  created_at: string;
}

// Balance Sheet Report
export interface BalanceSheetItem {
  account_name: string;
  account_code: string;
  account_type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parent_category: string;
  debit_balance: number;
  credit_balance: number;
  net_balance: number;
}

// Profit & Loss Report
export interface ProfitLossItem {
  account_name: string;
  account_code: string;
  account_type: 'income' | 'expense';
  parent_category: string;
  amount: number;
}

// Stock Report
export interface StockReportItem {
  product_name: string;
  product_sku: string;
  current_stock: number;
  unit_price: number;
  total_value: number;
  minimum_stock: number;
  is_low_stock: boolean;
}

// Reports API functions
export const reportsApi = {
  // Stock Ledger
  async getStockLedger(params?: {
    page?: number;
    search?: string;
    product?: number;
    transaction_type?: string;
    transaction_date?: string;
    ordering?: string;
  }) {
    return apiClient.get<{
      count: number;
      next: string | null;
      previous: string | null;
      results: StockLedgerEntry[];
    }>('/reports/stock-ledger/', params);
  },

  // Ledger Entries
  async getLedgerEntries(params?: {
    page?: number;
    search?: string;
    account?: number;
    entry_type?: string;
    transaction_date?: string;
    ordering?: string;
  }) {
    return apiClient.get<{
      count: number;
      next: string | null;
      previous: string | null;
      results: LedgerEntry[];
    }>('/reports/ledger-entries/', params);
  },

  // Balance Sheet Report
  async getBalanceSheet(): Promise<BalanceSheetItem[]> {
    return apiClient.get<BalanceSheetItem[]>('/reports/reports/balance_sheet/');
  },

  // Profit & Loss Report
  async getProfitLoss(): Promise<ProfitLossItem[]> {
    return apiClient.get<ProfitLossItem[]>('/reports/reports/profit_loss/');
  },

  // Stock Report
  async getStockReport(): Promise<StockReportItem[]> {
    return apiClient.get<StockReportItem[]>('/reports/reports/stock_report/');
  },

  // Low Stock Products
  async getLowStockProducts(): Promise<StockReportItem[]> {
    return apiClient.get<StockReportItem[]>('/reports/reports/low_stock_products/');
  },

  // Out of Stock Products
  async getOutOfStockProducts(): Promise<StockReportItem[]> {
    return apiClient.get<StockReportItem[]>('/reports/reports/out_of_stock_products/');
  },
};
