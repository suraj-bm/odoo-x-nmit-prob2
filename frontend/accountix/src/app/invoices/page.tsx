'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '@/components/sidebar';
import InvoiceModal from '@/components/InvoiceModal';
import InvoiceForm from '@/components/InvoiceForm';
import InvoiceDashboard from '@/components/InvoiceDashboard';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/contexts/AuthContext';
import { invoiceApi, Invoice } from '@/lib/services/invoices';

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface SalesOrder {
  id: number;
  so_number: string;
  customer: number;
  customer_name: string;
  total_amount: number;
  status: string;
}

interface InvoiceFilters {
  status: string;
  customer: string;
  dateRange: {
    start: string;
    end: string;
  };
  search: string;
}

interface SortOptions {
  field: keyof Invoice;
  direction: 'asc' | 'desc';
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

const InvoicesPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // Data states
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  
  // Filter and search states
  const [filters, setFilters] = useState<InvoiceFilters>({
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
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  
  // View mode
  const [viewMode, setViewMode] = useState<'dashboard' | 'table'>('dashboard');

  // Memoized filtered and sorted data
  const filteredAndSortedInvoices = useMemo(() => {
    let filtered = invoices.filter(invoice => {
      // Status filter
      if (filters.status && invoice.status !== filters.status) return false;
      
      // Customer filter
      if (filters.customer && invoice.customer !== parseInt(filters.customer)) return false;
      
      // Date range filter
      if (filters.dateRange.start && new Date(invoice.invoice_date) < new Date(filters.dateRange.start)) return false;
      if (filters.dateRange.end && new Date(invoice.invoice_date) > new Date(filters.dateRange.end)) return false;
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          invoice.invoice_number.toLowerCase().includes(searchLower) ||
          invoice.customer_name.toLowerCase().includes(searchLower) ||
          invoice.notes?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortOptions.field];
      const bValue = b[sortOptions.field];
      
      // Handle undefined and null values
      if ((aValue === undefined || aValue === null) && (bValue === undefined || bValue === null)) return 0;
      if (aValue === undefined || aValue === null) return sortOptions.direction === 'asc' ? 1 : -1;
      if (bValue === undefined || bValue === null) return sortOptions.direction === 'asc' ? -1 : 1;
      
      if (aValue < bValue) return sortOptions.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOptions.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [invoices, filters, sortOptions]);

  // Paginated data
  const paginatedInvoices = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredAndSortedInvoices.slice(startIndex, endIndex);
  }, [filteredAndSortedInvoices, pagination]);

  // Update pagination when filtered data changes
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalItems: filteredAndSortedInvoices.length,
      currentPage: 1 // Reset to first page when filters change
    }));
  }, [filteredAndSortedInvoices]);

  // Data fetching
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
      if (token) {
        apiClient.setToken(token);
      }
      const res = await apiClient.get<Invoice[]>('/transactions/customer-invoices/');
      setInvoices(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch invoices.');
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

  const fetchSalesOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
      if (token) {
        apiClient.setToken(token);
      }
      const res = await apiClient.get<SalesOrder[]>('/transactions/sales-orders/');
      setSalesOrders(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchInvoices();
      fetchCustomers();
      fetchSalesOrders();
    }
  }, [isAuthenticated, authLoading, fetchInvoices, fetchCustomers, fetchSalesOrders]);

  // Invoice operations
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
      fetchInvoices();
    } catch (err) {
      console.error('Failed to mark invoice as paid:', err);
      setError('Failed to mark invoice as paid.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId: number) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      setLoading(true);
      await apiClient.delete(`/transactions/customer-invoices/${invoiceId}/`);
      setSuccess('Invoice deleted successfully!');
      fetchInvoices();
    } catch (err) {
      console.error('Failed to delete invoice:', err);
      setError('Failed to delete invoice.');
    } finally {
      setLoading(false);
    }
  };

  // Bulk operations
  const handleBulkStatusChange = async (status: string) => {
    try {
      setLoading(true);
      const promises = selectedInvoices.map(id => 
        apiClient.patch(`/transactions/customer-invoices/${id}/`, { status })
      );
      await Promise.all(promises);
      setSuccess(`Updated ${selectedInvoices.length} invoices to ${status}`);
      setSelectedInvoices([]);
      fetchInvoices();
    } catch (err) {
      console.error('Failed to update invoices:', err);
      setError('Failed to update invoices.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedInvoices.length} invoices?`)) return;
    
    try {
      setLoading(true);
      const promises = selectedInvoices.map(id => 
        apiClient.delete(`/transactions/customer-invoices/${id}/`)
      );
      await Promise.all(promises);
      setSuccess(`Deleted ${selectedInvoices.length} invoices`);
      setSelectedInvoices([]);
      fetchInvoices();
    } catch (err) {
      console.error('Failed to delete invoices:', err);
      setError('Failed to delete invoices.');
    } finally {
      setLoading(false);
    }
  };

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ['Invoice #', 'Customer', 'Date', 'Due Date', 'Status', 'Total', 'Paid', 'Balance'],
      ...filteredAndSortedInvoices.map(invoice => [
        invoice.invoice_number,
        invoice.customer_name,
        new Date(invoice.invoice_date).toLocaleDateString(),
        new Date(invoice.due_date).toLocaleDateString(),
        invoice.status,
        invoice.total_amount.toFixed(2),
        invoice.paid_amount.toFixed(2),
        invoice.balance_amount.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setSuccess('Data exported successfully!');
  };

  // Handle form save
  const handleFormSave = (invoice: any) => {
    setSuccess(editingInvoice ? 'Invoice updated successfully!' : 'Invoice created successfully!');
    setEditingInvoice(null);
    fetchInvoices();
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return '📝';
      case 'sent': return '📤';
      case 'paid': return '✅';
      case 'overdue': return '⚠️';
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
        <Sidebar activePage="invoices" />
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
        <Sidebar activePage="invoices" />
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
      <Sidebar activePage="invoices" />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <header className="pb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Invoices</h1>
            <p className="text-gray-600">Manage your customer invoices and payments.</p>
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
              ➕ New Invoice
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
          <InvoiceDashboard invoices={invoices} loading={loading} />
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
                    placeholder="Search invoices..."
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
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
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
            {selectedInvoices.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium">
                    {selectedInvoices.length} invoice{selectedInvoices.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    <select
                      onChange={(e) => handleBulkStatusChange(e.target.value)}
                      className="px-3 py-1 border border-blue-300 rounded text-sm"
                    >
                      <option value="">Change Status</option>
                      <option value="sent">Mark as Sent</option>
                      <option value="paid">Mark as Paid</option>
                      <option value="cancelled">Cancel</option>
                    </select>
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setSelectedInvoices([])}
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
                Showing {paginatedInvoices.length} of {filteredAndSortedInvoices.length} invoices
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
                            checked={selectedInvoices.length === paginatedInvoices.length && paginatedInvoices.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedInvoices(paginatedInvoices.map(invoice => invoice.id));
                              } else {
                                setSelectedInvoices([]);
                              }
                            }}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => setSortOptions(prev => ({
                              field: 'invoice_number',
                              direction: prev.field === 'invoice_number' && prev.direction === 'asc' ? 'desc' : 'asc'
                            }))}>
                          Invoice # {sortOptions.field === 'invoice_number' && (sortOptions.direction === 'asc' ? '↑' : '↓')}
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
                              field: 'invoice_date',
                              direction: prev.field === 'invoice_date' && prev.direction === 'asc' ? 'desc' : 'asc'
                            }))}>
                          Date {sortOptions.field === 'invoice_date' && (sortOptions.direction === 'asc' ? '↑' : '↓')}
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
                          Balance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedInvoices.includes(invoice.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedInvoices(prev => [...prev, invoice.id]);
                                } else {
                                  setSelectedInvoices(prev => prev.filter(id => id !== invoice.id));
                                }
                              }}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {invoice.invoice_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{invoice.customer_name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(invoice.invoice_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                              <span>{getStatusIcon(invoice.status)}</span>
                              {invoice.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${invoice.total_amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span className="font-medium">${invoice.balance_amount.toFixed(2)}</span>
                              <span className="text-xs text-gray-500">Paid: ${invoice.paid_amount.toFixed(2)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewInvoice(invoice.id)}
                                className="text-indigo-600 hover:text-indigo-900 text-xs"
                                title="View Invoice"
                              >
                                👁️ View
                              </button>
                              <button
                                onClick={() => handleGeneratePDF(invoice.id)}
                                className="text-blue-600 hover:text-blue-900 text-xs"
                                title="Download PDF"
                              >
                                📄 PDF
                              </button>
                              <button
                                onClick={() => setEditingInvoice(invoice)}
                                className="text-gray-600 hover:text-gray-900 text-xs"
                                title="Edit Invoice"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteInvoice(invoice.id)}
                                className="text-red-600 hover:text-red-900 text-xs"
                                title="Delete Invoice"
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
            {!loading && paginatedInvoices.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                <p className="text-gray-500 mb-4">
                  {filteredAndSortedInvoices.length === 0 
                    ? "Get started by creating your first invoice."
                    : "Try adjusting your filters to see more results."
                  }
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Invoice
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

        {/* Invoice Form Modal */}
        <InvoiceForm
          isOpen={showModal || !!editingInvoice}
          onClose={() => {
            setShowModal(false);
            setEditingInvoice(null);
          }}
          onSave={handleFormSave}
          editingInvoice={editingInvoice}
          customers={customers}
          salesOrders={salesOrders}
        />
      </main>
    </div>
  );
};

export default InvoicesPage;
