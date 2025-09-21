import { apiClient } from '../api';

export interface Invoice {
  id: number;
  invoice_number: string;
  sales_order: number | null;
  customer: number;
  customer_name: string;
  so_number: string | null;
  invoice_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  notes: string | null;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceRequest {
  sales_order: number;
  customer: number;
  invoice_date: string;
  due_date: string;
  notes?: string;
}

export interface InvoiceFilters {
  customer?: number;
  status?: string;
  invoice_date?: string;
  due_date?: string;
  search?: string;
}

export const invoiceApi = {
  // Get all invoices
  async getInvoices(filters?: InvoiceFilters): Promise<Invoice[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    const endpoint = queryString ? `/transactions/customer-invoices/?${queryString}` : '/transactions/customer-invoices/';
    return apiClient.get<Invoice[]>(endpoint);
  },

  // Get single invoice
  async getInvoice(id: number): Promise<Invoice> {
    return apiClient.get<Invoice>(`/transactions/customer-invoices/${id}/`);
  },

  // Create invoice
  async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    return apiClient.post<Invoice>('/transactions/customer-invoices/', data);
  },

  // Update invoice
  async updateInvoice(id: number, data: Partial<CreateInvoiceRequest>): Promise<Invoice> {
    return apiClient.put<Invoice>(`/transactions/customer-invoices/${id}/`, data);
  },

  // Delete invoice
  async deleteInvoice(id: number): Promise<void> {
    return apiClient.delete(`/transactions/customer-invoices/${id}/`);
  },

  // Mark invoice as paid
  async markPaid(id: number): Promise<Invoice> {
    return apiClient.post<Invoice>(`/transactions/customer-invoices/${id}/mark_paid/`);
  },

  // Generate PDF
  async generatePDF(id: number): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}/transactions/customer-invoices/${id}/pdf/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || localStorage.getItem('accessToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }
    
    return response.blob();
  },

  // Generate invoice from sales order
  async generateFromSalesOrder(salesOrderId: number): Promise<Invoice> {
    return apiClient.post<Invoice>(`/transactions/sales-orders/${salesOrderId}/generate_invoice/`);
  },

  // Get sales order invoice PDF
  async getSalesOrderInvoicePDF(salesOrderId: number): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}/transactions/sales-orders/${salesOrderId}/invoice_pdf/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || localStorage.getItem('accessToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }
    
    return response.blob();
  },
};
