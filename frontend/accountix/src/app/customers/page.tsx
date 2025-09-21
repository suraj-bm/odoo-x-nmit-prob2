'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '@/components/sidebar';
import CustomerForm from '@/components/CustomerForm';
import CustomerDashboard from '@/components/CustomerDashboard';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/contexts/AuthContext';
import { contactsApi, Contact } from '@/lib/services/contacts';

interface CustomerFilters {
  contact_type: string;
  is_active: string;
  search: string;
  city: string;
  state: string;
}

interface SortOptions {
  field: keyof Contact;
  direction: 'asc' | 'desc';
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

const CustomersPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // Data states
  const [customers, setCustomers] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Contact | null>(null);
  
  // Filter and search states
  const [filters, setFilters] = useState<CustomerFilters>({
    contact_type: 'customer',
    is_active: '',
    search: '',
    city: '',
    state: ''
  });
  
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'name',
    direction: 'asc'
  });
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });
  
  // Bulk operations
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  
  // View mode
  const [viewMode, setViewMode] = useState<'dashboard' | 'table'>('dashboard');

  // Memoized filtered and sorted data
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers.filter(customer => {
      // Contact type filter
      if (filters.contact_type && customer.contact_type !== filters.contact_type) return false;
      
      // Active status filter
      if (filters.is_active && customer.is_active.toString() !== filters.is_active) return false;
      
      // City filter
      if (filters.city && customer.city?.toLowerCase() !== filters.city.toLowerCase()) return false;
      
      // State filter
      if (filters.state && customer.state?.toLowerCase() !== filters.state.toLowerCase()) return false;
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          customer.name.toLowerCase().includes(searchLower) ||
          customer.email.toLowerCase().includes(searchLower) ||
          customer.phone?.toLowerCase().includes(searchLower) ||
          customer.city?.toLowerCase().includes(searchLower) ||
          customer.state?.toLowerCase().includes(searchLower) ||
          customer.gst_number?.toLowerCase().includes(searchLower) ||
          customer.pan_number?.toLowerCase().includes(searchLower)
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
  }, [customers, filters, sortOptions]);

  // Paginated data
  const paginatedCustomers = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredAndSortedCustomers.slice(startIndex, endIndex);
  }, [filteredAndSortedCustomers, pagination]);

  // Update pagination when filtered data changes
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalItems: filteredAndSortedCustomers.length,
      currentPage: 1 // Reset to first page when filters change
    }));
  }, [filteredAndSortedCustomers]);

  // Data fetching
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
      if (token) {
        apiClient.setToken(token);
      }
      const res = await contactsApi.getCustomers();
      setCustomers(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch customers.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchCustomers();
    }
  }, [isAuthenticated, authLoading, fetchCustomers]);

  // Customer operations
  const handleDeleteCustomer = async (customerId: number) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      setLoading(true);
      await contactsApi.deleteContact(customerId);
      setSuccess('Customer deleted successfully!');
      fetchCustomers();
    } catch (err) {
      console.error('Failed to delete customer:', err);
      setError('Failed to delete customer.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (customerId: number, currentStatus: boolean) => {
    try {
      setLoading(true);
      await contactsApi.patchContact(customerId, { is_active: !currentStatus });
      setSuccess(`Customer ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchCustomers();
    } catch (err) {
      console.error('Failed to update customer status:', err);
      setError('Failed to update customer status.');
    } finally {
      setLoading(false);
    }
  };

  // Bulk operations
  const handleBulkToggleActive = async (activate: boolean) => {
    try {
      setLoading(true);
      const promises = selectedCustomers.map(id => 
        contactsApi.patchContact(id, { is_active: activate })
      );
      await Promise.all(promises);
      setSuccess(`${activate ? 'Activated' : 'Deactivated'} ${selectedCustomers.length} customers`);
      setSelectedCustomers([]);
      fetchCustomers();
    } catch (err) {
      console.error('Failed to update customers:', err);
      setError('Failed to update customers.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedCustomers.length} customers?`)) return;
    
    try {
      setLoading(true);
      const promises = selectedCustomers.map(id => contactsApi.deleteContact(id));
      await Promise.all(promises);
      setSuccess(`Deleted ${selectedCustomers.length} customers`);
      setSelectedCustomers([]);
      fetchCustomers();
    } catch (err) {
      console.error('Failed to delete customers:', err);
      setError('Failed to delete customers.');
    } finally {
      setLoading(false);
    }
  };

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Type', 'City', 'State', 'GST Number', 'PAN Number', 'Status'],
      ...filteredAndSortedCustomers.map(customer => [
        customer.name,
        customer.email,
        customer.phone || '',
        customer.contact_type,
        customer.city || '',
        customer.state || '',
        customer.gst_number || '',
        customer.pan_number || '',
        customer.is_active ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setSuccess('Data exported successfully!');
  };

  // Handle form save
  const handleFormSave = (customer: any) => {
    setSuccess(editingCustomer ? 'Customer updated successfully!' : 'Customer created successfully!');
    setEditingCustomer(null);
    fetchCustomers();
  };

  // Get unique cities and states for filters
  const uniqueCities = useMemo(() => {
    const cities = customers.map(c => c.city).filter(Boolean);
    return [...new Set(cities)].sort();
  }, [customers]);

  const uniqueStates = useMemo(() => {
    const states = customers.map(c => c.state).filter(Boolean);
    return [...new Set(states)].sort();
  }, [customers]);

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
        <Sidebar activePage="customers" />
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
        <Sidebar activePage="customers" />
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
      <Sidebar activePage="customers" />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <header className="pb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
            <p className="text-gray-600">Manage your customer database and relationships.</p>
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
              ➕ New Customer
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
          <CustomerDashboard customers={customers} loading={loading} />
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <>
            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Contact Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={filters.contact_type}
                    onChange={(e) => setFilters(prev => ({ ...prev, contact_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="customer">Customers</option>
                    <option value="vendor">Vendors</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.is_active}
                    onChange={(e) => setFilters(prev => ({ ...prev, is_active: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <select
                    value={filters.city}
                    onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Cities</option>
                    {uniqueCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* State Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    value={filters.state}
                    onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All States</option>
                    {uniqueStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setFilters({
                    contact_type: 'customer',
                    is_active: '',
                    search: '',
                    city: '',
                    state: ''
                  })}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedCustomers.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium">
                    {selectedCustomers.length} customer{selectedCustomers.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkToggleActive(true)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => handleBulkToggleActive(false)}
                      className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                    >
                      Deactivate
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setSelectedCustomers([])}
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
                Showing {paginatedCustomers.length} of {filteredAndSortedCustomers.length} customers
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
                            checked={selectedCustomers.length === paginatedCustomers.length && paginatedCustomers.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCustomers(paginatedCustomers.map(customer => customer.id));
                              } else {
                                setSelectedCustomers([]);
                              }
                            }}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => setSortOptions(prev => ({
                              field: 'name',
                              direction: prev.field === 'name' && prev.direction === 'asc' ? 'desc' : 'asc'
                            }))}>
                          Name {sortOptions.field === 'name' && (sortOptions.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => setSortOptions(prev => ({
                              field: 'email',
                              direction: prev.field === 'email' && prev.direction === 'asc' ? 'desc' : 'asc'
                            }))}>
                          Email {sortOptions.field === 'email' && (sortOptions.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedCustomers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedCustomers.includes(customer.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCustomers(prev => [...prev, customer.id]);
                                } else {
                                  setSelectedCustomers(prev => prev.filter(id => id !== customer.id));
                                }
                              }}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-indigo-600">
                                    {customer.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                {customer.gst_number && (
                                  <div className="text-sm text-gray-500">GST: {customer.gst_number}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer.phone || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              {customer.city && <div>{customer.city}</div>}
                              {customer.state && <div className="text-gray-500">{customer.state}</div>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              customer.contact_type === 'customer' ? 'bg-blue-100 text-blue-800' :
                              customer.contact_type === 'vendor' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {customer.contact_type === 'customer' ? '👤 Customer' :
                               customer.contact_type === 'vendor' ? '🏪 Vendor' :
                               '🔄 Both'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              customer.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {customer.is_active ? '✅ Active' : '❌ Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingCustomer(customer)}
                                className="text-indigo-600 hover:text-indigo-900 text-xs"
                                title="Edit Customer"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleToggleActive(customer.id, customer.is_active)}
                                className={`text-xs ${
                                  customer.is_active 
                                    ? 'text-yellow-600 hover:text-yellow-900' 
                                    : 'text-green-600 hover:text-green-900'
                                }`}
                                title={customer.is_active ? 'Deactivate' : 'Activate'}
                              >
                                {customer.is_active ? '⏸️ Deactivate' : '▶️ Activate'}
                              </button>
                              <button
                                onClick={() => handleDeleteCustomer(customer.id)}
                                className="text-red-600 hover:text-red-900 text-xs"
                                title="Delete Customer"
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
            {!loading && paginatedCustomers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                <p className="text-gray-500 mb-4">
                  {filteredAndSortedCustomers.length === 0 
                    ? "Get started by adding your first customer."
                    : "Try adjusting your filters to see more results."
                  }
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add Customer
                </button>
              </div>
            )}
          </>
        )}

        {/* Customer Form Modal */}
        <CustomerForm
          isOpen={showModal || !!editingCustomer}
          onClose={() => {
            setShowModal(false);
            setEditingCustomer(null);
          }}
          onSave={handleFormSave}
          editingCustomer={editingCustomer}
        />
      </main>
    </div>
  );
};

export default CustomersPage;
