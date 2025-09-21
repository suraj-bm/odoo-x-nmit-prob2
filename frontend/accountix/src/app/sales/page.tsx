'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '@/components/sidebar';
import InvoiceModal from '@/components/InvoiceModal';
import SalesOrderForm from '@/components/SalesOrderForm';
import SalesDashboard from '@/components/SalesDashboard';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/contexts/AuthContext';
import { invoiceApi, Invoice } from '@/lib/services/invoices';

// Enhanced interfaces with more fields
interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  sales_price: number;
  description?: string;
  category?: string;
  stock_quantity?: number;
}

interface Tax {
  id: number;
  name: string;
  rate: number;
  type: 'percentage' | 'fixed';
}

interface SalesOrderItem {
  id: number;
  product: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  tax: number;
  tax_name: string;
  tax_rate: number;
  tax_amount: number;
  line_total: number;
}

interface SalesOrder {
  id: number;
  so_number: string;
  customer: number;
  customer_name: string;
  customer_email?: string;
  status: 'draft' | 'confirmed' | 'partially_delivered' | 'delivered' | 'cancelled';
  so_date: string;
  expected_delivery_date?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  items?: SalesOrderItem[];
  has_invoice?: boolean;
  invoice_id?: number;
  created_at: string;
  updated_at: string;
}

// Filter and sort options
interface FilterOptions {
  status: string;
  customer: string;
  dateRange: {
    start: string;
    end: string;
  };
  search: string;
}

interface SortOptions {
  field: keyof SalesOrder;
  direction: 'asc' | 'desc';
}

// Pagination
interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

const SalesPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // Data states
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Filter and search states
  const [filters, setFilters] = useState<FilterOptions>({
    status: '',
    customer: '',
    dateRange: {
      start: '',
      end: ''
    },
    search: ''
  });
  
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'created_at',
    direction: 'desc'
  });
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });
  
  // Bulk operations
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // View mode
  const [viewMode, setViewMode] = useState<'dashboard' | 'table'>('dashboard');

  // Memoized filtered and sorted data
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = salesOrders.filter(order => {
      // Status filter
      if (filters.status && order.status !== filters.status) return false;
      
      // Customer filter
      if (filters.customer && order.customer !== parseInt(filters.customer)) return false;
      
      // Date range filter
      if (filters.dateRange.start && new Date(order.so_date) < new Date(filters.dateRange.start)) return false;
      if (filters.dateRange.end && new Date(order.so_date) > new Date(filters.dateRange.end)) return false;
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          order.so_number.toLowerCase().includes(searchLower) ||
          order.customer_name.toLowerCase().includes(searchLower) ||
          order.notes?.toLowerCase().includes(searchLower) ||
          order.items?.some(item => 
            item.product_name.toLowerCase().includes(searchLower) ||
            item.product_sku.toLowerCase().includes(searchLower)
          )
        );
      }
      
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortOptions.field];
      const bValue = b[sortOptions.field];
      
      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortOptions.direction === 'asc' ? 1 : -1;
      if (bValue === undefined) return sortOptions.direction === 'asc' ? -1 : 1;
      
      if (aValue < bValue) return sortOptions.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOptions.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [salesOrders, filters, sortOptions]);

  // Paginated data
  const paginatedOrders = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredAndSortedOrders.slice(startIndex, endIndex);
  }, [filteredAndSortedOrders, pagination]);

  // Update pagination when filtered data changes
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalItems: filteredAndSortedOrders.length,
      currentPage: 1 // Reset to first page when filters change
    }));
  }, [filteredAndSortedOrders]);

  // Data fetching with caching
  const fetchSalesOrders = useCallback(async () => {
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
  }, []);

  const fetchCustomers = useCallback(async () => {
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
  }, []);

  const fetchProducts = useCallback(async () => {
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
  }, []);

  const fetchTaxes = useCallback(async () => {
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
  }, []);

  // Load data on mount
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchSalesOrders();
      fetchCustomers();
      fetchProducts();
      fetchTaxes();
    }
  }, [isAuthenticated, authLoading, fetchSalesOrders, fetchCustomers, fetchProducts, fetchTaxes]);

  // Invoice operations
  const handleGenerateInvoice = async (salesOrderId: number) => {
    try {
      setLoading(true);
      const invoice = await invoiceApi.generateFromSalesOrder(salesOrderId);
      setSelectedInvoice(invoice);
      setShowInvoiceModal(true);
      setSuccess('Invoice generated successfully!');
      fetchSalesOrders();
    } catch (err) {
      console.error('Failed to generate invoice:', err);
      setError('Failed to generate invoice.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = async (invoiceId: number) => {
    try {
      setLoading(true);
      const invoice = await invoiceApi.getInvoice(invoiceId);
      setSelectedInvoice(invoice);
      setShowInvoiceModal(true);
    } catch (err) {
      console.error('Failed to fetch invoice:', err);
      setError('Failed to fetch invoice.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async (invoiceId: number) => {
    try {
      setLoading(true);
      const blob = await invoiceApi.generatePDF(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess('PDF downloaded successfully!');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setError('Failed to generate PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (invoiceId: number) => {
    try {
      setLoading(true);
      await invoiceApi.markPaid(invoiceId);
      setShowInvoiceModal(false);
      setSuccess('Invoice marked as paid!');
      fetchSalesOrders();
    } catch (err) {
      console.error('Failed to mark invoice as paid:', err);
      setError('Failed to mark invoice as paid.');
    } finally {
      setLoading(false);
    }
  };

  // Bulk operations
  const handleBulkStatusChange = async (status: string) => {
    try {
      setLoading(true);
      const promises = selectedOrders.map(id => 
        apiClient.patch(`/transactions/sales-orders/${id}/`, { status })
      );
      await Promise.all(promises);
      setSuccess(`Updated ${selectedOrders.length} orders to ${status}`);
      setSelectedOrders([]);
      setShowBulkActions(false);
      fetchSalesOrders();
    } catch (err) {
      console.error('Failed to update orders:', err);
      setError('Failed to update orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedOrders.length} orders?`)) return;
    
    try {
      setLoading(true);
      const promises = selectedOrders.map(id => 
        apiClient.delete(`/transactions/sales-orders/${id}/`)
      );
      await Promise.all(promises);
      setSuccess(`Deleted ${selectedOrders.length} orders`);
      setSelectedOrders([]);
      setShowBulkActions(false);
      fetchSalesOrders();
    } catch (err) {
      console.error('Failed to delete orders:', err);
      setError('Failed to delete orders.');
    } finally {
      setLoading(false);
    }
  };

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ['Order #', 'Customer', 'Date', 'Status', 'Total', 'Invoice Status'],
      ...filteredAndSortedOrders.map(order => [
        order.so_number,
        order.customer_name,
        new Date(order.so_date).toLocaleDateString(),
        order.status,
        order.total_amount.toFixed(2),
        order.has_invoice ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-orders-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setSuccess('Data exported successfully!');
  };

  // Handle form save
  const handleFormSave = (order: any) => {
    setSuccess(editingOrder ? 'Sales order updated successfully!' : 'Sales order created successfully!');
    setEditingOrder(null);
    fetchSalesOrders();
  };

  // Utility functions
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return '📝';
      case 'confirmed': return '✅';
      case 'partially_delivered': return '🚚';
      case 'delivered': return '📦';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  };

  // Clear messages after timeout
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

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
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <header className="pb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Sales Orders</h1>
            <p className="text-gray-600">Manage your sales orders and invoices efficiently.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
          <button
                onClick={() => setViewMode('dashboard')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'dashboard'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 Dashboard
          </button>
                        <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📋 Table
                        </button>
            </div>
            
                      <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
              📊 Export CSV
                      </button>
                      <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                      >
              ➕ New Sales Order
                      </button>
          </div>
        </header>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
            <span>❌</span>
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
            <span>✅</span>
            {success}
          </div>
        )}

        {/* Dashboard View */}
        {viewMode === 'dashboard' && (
          <>
            <SalesDashboard salesOrders={salesOrders} loading={loading} />
            
            {/* Invoice Quick Actions */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                     onClick={() => window.location.href = '/invoices'}>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <h4 className="font-medium text-gray-900">View All Invoices</h4>
                      <p className="text-sm text-gray-500">Manage customer invoices</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                     onClick={() => window.location.href = '/invoices?action=create'}>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">➕</span>
                    <div>
                      <h4 className="font-medium text-gray-900">Create Invoice</h4>
                      <p className="text-sm text-gray-500">Create new invoice manually</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                     onClick={() => {
                       const ordersWithInvoices = salesOrders.filter(order => !order.has_invoice && ['confirmed', 'partially_delivered', 'delivered'].includes(order.status));
                       if (ordersWithInvoices.length > 0) {
                         // Generate invoices for all eligible orders
                         ordersWithInvoices.forEach(order => handleGenerateInvoice(order.id));
                       } else {
                         setSuccess('No orders available for invoice generation');
                       }
                     }}>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <h4 className="font-medium text-gray-900">Bulk Generate</h4>
                      <p className="text-sm text-gray-500">Generate invoices for all eligible orders</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <>
            {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search orders..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="confirmed">Confirmed</option>
                <option value="partially_delivered">Partially Delivered</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Customer Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <select
                value={filters.customer}
                onChange={(e) => setFilters(prev => ({ ...prev, customer: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Customers</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
            </div>

            {/* Date Range */}
                  <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex gap-2">
                    <input
                      type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                    <input
                      type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
                  </div>
                </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters({
                status: '',
                customer: '',
                dateRange: { start: '', end: '' },
                search: ''
              })}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
          </div>
                </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <select
                  onChange={(e) => handleBulkStatusChange(e.target.value)}
                  className="px-3 py-1 border border-blue-300 rounded text-sm"
                >
                  <option value="">Change Status</option>
                  <option value="confirmed">Confirm</option>
                  <option value="partially_delivered">Partially Delivered</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancel</option>
                </select>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedOrders([])}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-sm text-gray-600">
            Showing {paginatedOrders.length} of {filteredAndSortedOrders.length} orders
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Items per page:</span>
                      <select
              value={pagination.itemsPerPage}
              onChange={(e) => setPagination(prev => ({ 
                ...prev, 
                itemsPerPage: parseInt(e.target.value),
                currentPage: 1
              }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
                      </select>
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders(paginatedOrders.map(order => order.id));
                          } else {
                            setSelectedOrders([]);
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => setSortOptions(prev => ({
                          field: 'so_number',
                          direction: prev.field === 'so_number' && prev.direction === 'asc' ? 'desc' : 'asc'
                        }))}>
                      Order # {sortOptions.field === 'so_number' && (sortOptions.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => setSortOptions(prev => ({
                          field: 'customer_name',
                          direction: prev.field === 'customer_name' && prev.direction === 'asc' ? 'desc' : 'asc'
                        }))}>
                      Customer {sortOptions.field === 'customer_name' && (sortOptions.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => setSortOptions(prev => ({
                          field: 'so_date',
                          direction: prev.field === 'so_date' && prev.direction === 'asc' ? 'desc' : 'asc'
                        }))}>
                      Date {sortOptions.field === 'so_date' && (sortOptions.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => setSortOptions(prev => ({
                          field: 'status',
                          direction: prev.field === 'status' && prev.direction === 'asc' ? 'desc' : 'asc'
                        }))}>
                      Status {sortOptions.field === 'status' && (sortOptions.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => setSortOptions(prev => ({
                          field: 'total_amount',
                          direction: prev.field === 'total_amount' && prev.direction === 'asc' ? 'desc' : 'asc'
                        }))}>
                      Total {sortOptions.field === 'total_amount' && (sortOptions.direction === 'asc' ? '↑' : '↓')}
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
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                      <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrders(prev => [...prev, order.id]);
                            } else {
                              setSelectedOrders(prev => prev.filter(id => id !== order.id));
                            }
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.so_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                          {order.customer_email && (
                            <div className="text-sm text-gray-500">{order.customer_email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(order.so_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          <span>{getStatusIcon(order.status)}</span>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${order.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.has_invoice ? (
                          <button
                            onClick={() => handleViewInvoice(order.invoice_id!)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium flex items-center gap-1"
                          >
                            📄 View Invoice
                          </button>
                        ) : (
                          <span className="text-gray-400 flex items-center gap-1">
                            📄 No Invoice
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {!order.has_invoice && ['confirmed', 'partially_delivered', 'delivered'].includes(order.status) && (
                            <button
                              onClick={() => handleGenerateInvoice(order.id)}
                              className="text-indigo-600 hover:text-indigo-900 text-xs"
                              title="Generate Invoice"
                            >
                              📋 Generate
                            </button>
                          )}
                          <button
                            onClick={() => setEditingOrder(order)}
                            className="text-gray-600 hover:text-gray-900 text-xs"
                            title="Edit Order"
                          >
                            ✏️ Edit
                          </button>
                      <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this order?')) {
                                // Handle delete
                              }
                            }}
                            className="text-red-600 hover:text-red-900 text-xs"
                            title="Delete Order"
                          >
                            🗑️ Delete
                      </button>
                    </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalItems > pagination.itemsPerPage && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    disabled={pagination.currentPage >= Math.ceil(pagination.totalItems / pagination.itemsPerPage)}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">
                        {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{pagination.totalItems}</span>{' '}
                      results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                        disabled={pagination.currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {Array.from({ length: Math.ceil(pagination.totalItems / pagination.itemsPerPage) }, (_, i) => i + 1)
                        .filter(page => {
                          const current = pagination.currentPage;
                          return page === 1 || page === Math.ceil(pagination.totalItems / pagination.itemsPerPage) || 
                                 (page >= current - 2 && page <= current + 2);
                        })
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                ...
                              </span>
                            )}
                  <button
                              onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === pagination.currentPage
                                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                  </button>
                          </React.Fragment>
                        ))}
                  <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                        disabled={pagination.currentPage >= Math.ceil(pagination.totalItems / pagination.itemsPerPage)}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                        Next
                  </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
            </div>
        )}

            {/* Empty State */}
            {!loading && paginatedOrders.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sales orders found</h3>
                <p className="text-gray-500 mb-4">
                  {filteredAndSortedOrders.length === 0 
                    ? "Get started by creating your first sales order."
                    : "Try adjusting your filters to see more results."
                  }
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Sales Order
                </button>
              </div>
            )}
          </>
        )}

        {/* Invoice Modal */}
        <InvoiceModal
          invoice={selectedInvoice}
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          onMarkPaid={handleMarkPaid}
          onGeneratePDF={handleGeneratePDF}
        />

        {/* Sales Order Form Modal */}
        <SalesOrderForm
          isOpen={showModal || !!editingOrder}
          onClose={() => {
            setShowModal(false);
            setEditingOrder(null);
          }}
          onSave={handleFormSave}
          editingOrder={editingOrder}
          customers={customers}
          products={products}
          taxes={taxes}
        />
      </main>
    </div>
  );
};

export default SalesPage;