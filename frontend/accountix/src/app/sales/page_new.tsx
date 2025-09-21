'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import InvoiceModal from '@/components/InvoiceModal';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/contexts/AuthContext';
import { invoiceApi, Invoice } from '@/lib/services/invoices';

interface Customer {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  sales_price: number;
}

interface Tax {
  id: number;
  name: string;
  rate: number;
}

interface SalesOrderItem {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  tax: number;
  tax_name: string;
  tax_amount: number;
  line_total: number;
}

interface SalesOrder {
  id: number;
  so_number: string;
  customer: number;
  customer_name: string;
  status: string;
  so_date: string;
  expected_delivery_date?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  items?: SalesOrderItem[];
  has_invoice?: boolean;
  invoice_id?: number;
}

const SalesPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [form, setForm] = useState({
    customer: '',
    so_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    notes: '',
    items: [] as SalesOrderItem[],
  });

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchSalesOrders();
      fetchCustomers();
      fetchProducts();
      fetchTaxes();
    }
  }, [isAuthenticated, authLoading]);

  const fetchSalesOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
      if (token) {
        apiClient.setToken(token);
      }
      const res = await apiClient.get<SalesOrder[]>('/transactions/sales-orders/');
      setSalesOrders(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch sales orders.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
      if (token) {
        apiClient.setToken(token);
      }
      const res = await apiClient.get<Customer[]>('/master/contacts/?contact_type=customer');
      setCustomers(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
      if (token) {
        apiClient.setToken(token);
      }
      const res = await apiClient.get<Product[]>('/master/products/');
      setProducts(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTaxes = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
      if (token) {
        apiClient.setToken(token);
      }
      const res = await apiClient.get<Tax[]>('/master/taxes/');
      setTaxes(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateInvoice = async (salesOrderId: number) => {
    try {
      const invoice = await invoiceApi.generateFromSalesOrder(salesOrderId);
      setSelectedInvoice(invoice);
      setShowInvoiceModal(true);
      fetchSalesOrders(); // Refresh to show invoice status
    } catch (err) {
      console.error('Failed to generate invoice:', err);
      setError('Failed to generate invoice.');
    }
  };

  const handleViewInvoice = async (invoiceId: number) => {
    try {
      const invoice = await invoiceApi.getInvoice(invoiceId);
      setSelectedInvoice(invoice);
      setShowInvoiceModal(true);
    } catch (err) {
      console.error('Failed to fetch invoice:', err);
      setError('Failed to fetch invoice.');
    }
  };

  const handleGeneratePDF = async (invoiceId: number) => {
    try {
      const blob = await invoiceApi.generatePDF(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setError('Failed to generate PDF.');
    }
  };

  const handleMarkPaid = async (invoiceId: number) => {
    try {
      await invoiceApi.markPaid(invoiceId);
      setShowInvoiceModal(false);
      fetchSalesOrders(); // Refresh to show updated status
    } catch (err) {
      console.error('Failed to mark invoice as paid:', err);
      setError('Failed to mark invoice as paid.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'partially_delivered': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="flex h-screen bg-gray-50 font-sans">
        <Sidebar activePage="sales" />
        <main className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen bg-gray-50 font-sans">
        <Sidebar activePage="sales" />
        <main className="flex-1 p-8 overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Please log in to access this page.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar activePage="sales" />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Sales Orders</h1>
            <p className="text-gray-600">Manage your sales orders and invoices.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + New Sales Order
          </button>
        </header>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.so_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(order.so_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.has_invoice ? (
                        <button
                          onClick={() => handleViewInvoice(order.invoice_id!)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          View Invoice
                        </button>
                      ) : (
                        <span className="text-gray-400">No Invoice</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {!order.has_invoice && ['confirmed', 'partially_delivered', 'delivered'].includes(order.status) && (
                        <button
                          onClick={() => handleGenerateInvoice(order.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Generate Invoice
                        </button>
                      )}
                      <button
                        onClick={() => setEditingOrder(order)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Invoice Modal */}
        <InvoiceModal
          invoice={selectedInvoice}
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          onMarkPaid={handleMarkPaid}
          onGeneratePDF={handleGeneratePDF}
        />
      </main>
    </div>
  );
};

export default SalesPage;
