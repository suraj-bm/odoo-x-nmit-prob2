// Transactions API services

import { apiClient, PaginatedResponse } from '../api';

// Purchase Orders
export interface PurchaseOrder {
  id: number;
  po_number: string;
  vendor: number;
  vendor_name?: string;
  po_date: string;
  expected_delivery_date?: string;
  status: 'draft' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: number;
  purchase_order: number;
  product: number;
  product_name?: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  tax?: number;
  tax_name?: string;
  tax_amount: number;
  line_total: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePurchaseOrderRequest {
  vendor: number;
  po_date: string;
  expected_delivery_date?: string;
  notes?: string;
  items: Omit<PurchaseOrderItem, 'id' | 'purchase_order' | 'created_at' | 'updated_at' | 'line_total' | 'tax_amount'>[];
}

// Sales Orders
export interface SalesOrder {
  id: number;
  so_number: string;
  customer: number;
  customer_name?: string;
  so_date: string;
  expected_delivery_date?: string;
  status: 'draft' | 'confirmed' | 'partially_delivered' | 'delivered' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface SalesOrderItem {
  id: number;
  sales_order: number;
  product: number;
  product_name?: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  tax?: number;
  tax_name?: string;
  tax_amount: number;
  line_total: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSalesOrderRequest {
  customer: number;
  so_date: string;
  expected_delivery_date?: string;
  notes?: string;
  items: Omit<SalesOrderItem, 'id' | 'sales_order' | 'created_at' | 'updated_at' | 'line_total' | 'tax_amount'>[];
}

// Vendor Bills
export interface VendorBill {
  id: number;
  bill_number: string;
  purchase_order?: number;
  po_number?: string;
  vendor: number;
  vendor_name?: string;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  notes?: string;
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

// Customer Invoices
export interface CustomerInvoice {
  id: number;
  invoice_number: string;
  sales_order?: number;
  so_number?: string;
  customer: number;
  customer_name?: string;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  notes?: string;
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

// Payments
export interface Payment {
  id: number;
  payment_number: string;
  payment_type: 'vendor_payment' | 'customer_payment';
  vendor_bill?: number;
  vendor_name?: string;
  bill_number?: string;
  customer_invoice?: number;
  customer_name?: string;
  invoice_number?: string;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'credit_card' | 'upi' | 'other';
  payment_date: string;
  reference_number?: string;
  notes?: string;
  created_by: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentRequest {
  payment_type: 'vendor_payment' | 'customer_payment';
  vendor_bill?: number;
  customer_invoice?: number;
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'credit_card' | 'upi' | 'other';
  payment_date: string;
  reference_number?: string;
  notes?: string;
}

// Purchase Orders API
export const purchaseOrdersApi = {
  async getPurchaseOrders(params?: {
    page?: number;
    search?: string;
    vendor?: number;
    status?: string;
    po_date?: string;
    ordering?: string;
  }): Promise<PaginatedResponse<PurchaseOrder>> {
    return apiClient.get<PaginatedResponse<PurchaseOrder>>('/transactions/purchase-orders/', params);
  },

  async getPurchaseOrder(id: number): Promise<PurchaseOrder> {
    return apiClient.get<PurchaseOrder>(`/transactions/purchase-orders/${id}/`);
  },

  async createPurchaseOrder(orderData: CreatePurchaseOrderRequest): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>('/transactions/purchase-orders/', orderData);
  },

  async updatePurchaseOrder(id: number, orderData: Partial<CreatePurchaseOrderRequest>): Promise<PurchaseOrder> {
    return apiClient.put<PurchaseOrder>(`/transactions/purchase-orders/${id}/`, orderData);
  },

  async deletePurchaseOrder(id: number): Promise<void> {
    return apiClient.delete<void>(`/transactions/purchase-orders/${id}/`);
  },

  async confirmPurchaseOrder(id: number): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>(`/transactions/purchase-orders/${id}/confirm/`);
  },

  async cancelPurchaseOrder(id: number): Promise<PurchaseOrder> {
    return apiClient.post<PurchaseOrder>(`/transactions/purchase-orders/${id}/cancel/`);
  },
};

// Sales Orders API
export const salesOrdersApi = {
  async getSalesOrders(params?: {
    page?: number;
    search?: string;
    customer?: number;
    status?: string;
    so_date?: string;
    ordering?: string;
  }): Promise<PaginatedResponse<SalesOrder>> {
    return apiClient.get<PaginatedResponse<SalesOrder>>('/transactions/sales-orders/', params);
  },

  async getSalesOrder(id: number): Promise<SalesOrder> {
    return apiClient.get<SalesOrder>(`/transactions/sales-orders/${id}/`);
  },

  async createSalesOrder(orderData: CreateSalesOrderRequest): Promise<SalesOrder> {
    return apiClient.post<SalesOrder>('/transactions/sales-orders/', orderData);
  },

  async updateSalesOrder(id: number, orderData: Partial<CreateSalesOrderRequest>): Promise<SalesOrder> {
    return apiClient.put<SalesOrder>(`/transactions/sales-orders/${id}/`, orderData);
  },

  async deleteSalesOrder(id: number): Promise<void> {
    return apiClient.delete<void>(`/transactions/sales-orders/${id}/`);
  },

  async confirmSalesOrder(id: number): Promise<SalesOrder> {
    return apiClient.post<SalesOrder>(`/transactions/sales-orders/${id}/confirm/`);
  },

  async cancelSalesOrder(id: number): Promise<SalesOrder> {
    return apiClient.post<SalesOrder>(`/transactions/sales-orders/${id}/cancel/`);
  },
};

// Vendor Bills API
export const vendorBillsApi = {
  async getVendorBills(params?: {
    page?: number;
    search?: string;
    vendor?: number;
    status?: string;
    invoice_date?: string;
    due_date?: string;
    ordering?: string;
  }): Promise<PaginatedResponse<VendorBill>> {
    return apiClient.get<PaginatedResponse<VendorBill>>('/transactions/vendor-bills/', params);
  },

  async getVendorBill(id: number): Promise<VendorBill> {
    return apiClient.get<VendorBill>(`/transactions/vendor-bills/${id}/`);
  },

  async createVendorBill(billData: Omit<VendorBill, 'id' | 'created_at' | 'updated_at' | 'subtotal' | 'tax_amount' | 'total_amount' | 'balance_amount'>): Promise<VendorBill> {
    return apiClient.post<VendorBill>('/transactions/vendor-bills/', billData);
  },

  async updateVendorBill(id: number, billData: Partial<VendorBill>): Promise<VendorBill> {
    return apiClient.put<VendorBill>(`/transactions/vendor-bills/${id}/`, billData);
  },

  async deleteVendorBill(id: number): Promise<void> {
    return apiClient.delete<void>(`/transactions/vendor-bills/${id}/`);
  },

  async markVendorBillPaid(id: number): Promise<VendorBill> {
    return apiClient.post<VendorBill>(`/transactions/vendor-bills/${id}/mark_paid/`);
  },
};

// Customer Invoices API
export const customerInvoicesApi = {
  async getCustomerInvoices(params?: {
    page?: number;
    search?: string;
    customer?: number;
    status?: string;
    invoice_date?: string;
    due_date?: string;
    ordering?: string;
  }): Promise<PaginatedResponse<CustomerInvoice>> {
    return apiClient.get<PaginatedResponse<CustomerInvoice>>('/transactions/customer-invoices/', params);
  },

  async getCustomerInvoice(id: number): Promise<CustomerInvoice> {
    return apiClient.get<CustomerInvoice>(`/transactions/customer-invoices/${id}/`);
  },

  async createCustomerInvoice(invoiceData: Omit<CustomerInvoice, 'id' | 'created_at' | 'updated_at' | 'subtotal' | 'tax_amount' | 'total_amount' | 'balance_amount'>): Promise<CustomerInvoice> {
    return apiClient.post<CustomerInvoice>('/transactions/customer-invoices/', invoiceData);
  },

  async updateCustomerInvoice(id: number, invoiceData: Partial<CustomerInvoice>): Promise<CustomerInvoice> {
    return apiClient.put<CustomerInvoice>(`/transactions/customer-invoices/${id}/`, invoiceData);
  },

  async deleteCustomerInvoice(id: number): Promise<void> {
    return apiClient.delete<void>(`/transactions/customer-invoices/${id}/`);
  },

  async markCustomerInvoicePaid(id: number): Promise<CustomerInvoice> {
    return apiClient.post<CustomerInvoice>(`/transactions/customer-invoices/${id}/mark_paid/`);
  },
};

// Payments API
export const paymentsApi = {
  async getPayments(params?: {
    page?: number;
    search?: string;
    payment_type?: string;
    payment_method?: string;
    payment_date?: string;
    ordering?: string;
  }): Promise<PaginatedResponse<Payment>> {
    return apiClient.get<PaginatedResponse<Payment>>('/transactions/payments/', params);
  },

  async getPayment(id: number): Promise<Payment> {
    return apiClient.get<Payment>(`/transactions/payments/${id}/`);
  },

  async createPayment(paymentData: CreatePaymentRequest): Promise<Payment> {
    return apiClient.post<Payment>('/transactions/payments/', paymentData);
  },

  async updatePayment(id: number, paymentData: Partial<CreatePaymentRequest>): Promise<Payment> {
    return apiClient.put<Payment>(`/transactions/payments/${id}/`, paymentData);
  },

  async deletePayment(id: number): Promise<void> {
    return apiClient.delete<void>(`/transactions/payments/${id}/`);
  },
};
