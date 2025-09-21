'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from '@/components/sidebar';
import MobileNav from '@/components/MobileNav';
import PurchaseOrderForm from '@/components/PurchaseOrderForm';
import PurchaseDashboard from '@/components/PurchaseDashboard';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { apiClient } from '@/lib/api';

interface PurchaseOrderItem {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  tax: number;
  tax_amount: number;
  line_total: number;
}

interface PurchaseOrder {
  id: number;
  po_number: string;
  vendor: number;
  vendor_name: string;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  payment_status: 'unpaid' | 'partial' | 'paid';
  total_amount: number;
  po_date: string;
  expected_delivery_date: string;
  received_date?: string;
  notes?: string;
  items: PurchaseOrderItem[];
  created_at: string;
  updated_at: string;
}

interface Vendor {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  gst_number?: string;
  pan_number?: string;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  purchase_price: number;
  category?: string;
  current_stock?: number;
  minimum_stock?: number;
}

interface Tax {
  id: number;
  name: string;
  rate: number;
  tax_type: string;
}

const PurchasesPage = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Core state
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  
  // Real-time features
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  
  // View mode
  const [viewMode, setViewMode] = useState<'dashboard' | 'table'>('dashboard');
  
  // Filtering and search
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    vendor: 'all',
    paymentStatus: 'all',
    dateRange: { start: '', end: '' }
  });
  
  // Sorting and pagination
  const [sortOptions, setSortOptions] = useState({
    field: 'created_at' as keyof PurchaseOrder,
    direction: 'desc' as 'asc' | 'desc'
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  // Bulk operations
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  // Optimized data fetching with error handling
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setConnectionStatus('reconnecting');
      const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
      
      if (!token) {
        setConnectionStatus('disconnected');
        return;
      }

      apiClient.setToken(token);

      const [ordersRes, vendorsRes, productsRes, taxesRes] = await Promise.allSettled([
        apiClient.get('/transactions/purchase-orders/'),
        apiClient.get('/master/contacts/?contact_type=vendor'),
        apiClient.get('/master/products/'),
        apiClient.get('/master/taxes/')
      ]);

      if (ordersRes.status === 'fulfilled') {
        const orders = ordersRes.value.results || ordersRes.value;
        setPurchaseOrders(Array.isArray(orders) ? orders : []);
        setPagination(prev => ({ ...prev, total: orders.length }));
      }

      if (vendorsRes.status === 'fulfilled') {
        const vendorData = vendorsRes.value.results || vendorsRes.value;
        setVendors(Array.isArray(vendorData) ? vendorData : []);
      }

      if (productsRes.status === 'fulfilled') {
        const productData = productsRes.value.results || productsRes.value;
        setProducts(Array.isArray(productData) ? productData : []);
      }

      if (taxesRes.status === 'fulfilled') {
        const taxData = taxesRes.value.results || taxesRes.value;
        setTaxes(Array.isArray(taxData) ? taxData : []);
      }

      setLastUpdated(new Date());
      setConnectionStatus('connected');
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setConnectionStatus('disconnected');
      setError('Failed to fetch data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchData();

    let interval: NodeJS.Timeout;
    if (isLive) {
      interval = setInterval(() => {
        fetchData();
      }, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated, isLive, refreshInterval, fetchData]);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/loginpage');
    }
  }, [isAuthenticated, authLoading, router]);

  // Filtered and sorted data with pagination
  const filteredOrders = useMemo(() => {
    let filtered = [...purchaseOrders];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(order =>
        order.po_number?.toLowerCase().includes(searchLower) ||
        order.vendor_name?.toLowerCase().includes(searchLower) ||
        order.notes?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    if (filters.vendor !== 'all') {
      filtered = filtered.filter(order => order.vendor.toString() === filters.vendor);
    }

    if (filters.paymentStatus !== 'all') {
      filtered = filtered.filter(order => order.payment_status === filters.paymentStatus);
    }

    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.po_date);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

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

    // Update pagination total
    setPagination(prev => ({ ...prev, total: filtered.length }));

    // Apply pagination
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    
    return filtered.slice(startIndex, endIndex);
  }, [purchaseOrders, filters, sortOptions, pagination.page, pagination.limit]);

  // Form handlers
  const handleSave = async (orderData: any) => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
      if (!token) throw new Error('No authentication token');

      apiClient.setToken(token);

      if (editingOrder) {
        // Update existing order
        const response = await apiClient.put(`/transactions/purchase-orders/${editingOrder.id}/`, orderData);
        setPurchaseOrders(prev => prev.map(order => 
          order.id === editingOrder.id ? response : order
        ));
        setSuccess('Purchase order updated successfully');
      } else {
        // Create new order
        const response = await apiClient.post('/transactions/purchase-orders/', orderData);
        setPurchaseOrders(prev => [response, ...prev]);
        setSuccess('Purchase order created successfully');
      }

      setEditingOrder(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving purchase order:', error);
      setError('Failed to save purchase order');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this purchase order?')) return;

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
      if (!token) throw new Error('No authentication token');

      apiClient.setToken(token);
      await apiClient.delete(`/transactions/purchase-orders/${id}/`);
      
      setPurchaseOrders(prev => prev.filter(order => order.id !== id));
      setSuccess('Purchase order deleted successfully');
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      setError('Failed to delete purchase order');
    }
  };

  const exportToCSV = () => {
    const headers = ['PO Number', 'Vendor', 'Status', 'Payment Status', 'Total Amount', 'PO Date', 'Expected Delivery'];
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(order => [
        order.po_number,
        order.vendor_name,
        order.status,
        order.payment_status,
        order.total_amount,
        order.po_date,
        order.expected_delivery_date
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="flex h-screen bg-gray-50 font-sans">
        <Sidebar activePage="purchases" />
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
        <Sidebar activePage="purchases" />
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
      <Sidebar activePage="purchases" />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
            <p className="text-gray-600 mt-1">
              Manage your purchase orders and vendor relationships
              {isLive && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                  Live
                </span>
              )}
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0 flex flex-wrap items-center gap-3">
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
                Dashboard
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Table
              </button>
            </div>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export</span>
            </button>

            {/* New Purchase Order Button */}
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Purchase Order</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="ml-auto text-green-400 hover:text-green-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Dashboard View */}
        {viewMode === 'dashboard' && (
          <PurchaseDashboard purchaseOrders={purchaseOrders} loading={loading} />
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Search orders..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="received">Received</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
                  <select
                    value={filters.vendor}
                    onChange={(e) => setFilters(prev => ({ ...prev, vendor: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Vendors</option>
                    {vendors.map(vendor => (
                      <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                  <select
                    value={filters.paymentStatus}
                    onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Payment Statuses</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PO Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <span className="ml-2 text-gray-600">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          No purchase orders found
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.po_number || `PO-${order.id}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.vendor_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{order.total_amount?.toLocaleString() || '0'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                              {order.payment_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.po_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingOrder(order);
                                  setShowForm(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(order.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Status */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Last updated: {lastUpdated.toLocaleTimeString()}
          {connectionStatus === 'reconnecting' && (
            <span className="ml-2 text-yellow-600">Reconnecting...</span>
          )}
          {connectionStatus === 'disconnected' && (
            <span className="ml-2 text-red-600">Disconnected</span>
          )}
        </div>

        {/* Purchase Order Form Modal */}
        <PurchaseOrderForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingOrder(null);
          }}
          onSave={handleSave}
          editingOrder={editingOrder}
          vendors={vendors}
          products={products}
          taxes={taxes}
        />
      </main>
    </div>
  );
};

export default PurchasesPage;
