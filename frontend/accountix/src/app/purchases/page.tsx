'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from '@/components/sidebar';
import MobileNav from '@/components/MobileNav';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Color palette
const COLORS = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'];

interface PurchaseOrderItem {
  id: number;
  product: string;
  product_id: number;
  quantity: number;
  unit_price: number;
  tax: number;
  total: number;
}

interface PurchaseOrder {
  id: number;
  vendor: string;
  vendor_id: number;
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
}

interface Product {
  id: number;
  name: string;
  sku: string;
  purchase_price: number;
  category?: string;
}

interface Tax {
  id: number;
  name: string;
  rate: number;
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
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  
  // Live features
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  
  // Filtering and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vendorFilter, setVendorFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'vendor' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Form state
  const [form, setForm] = useState({
    vendor: '',
    po_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    notes: '',
    items: [] as PurchaseOrderItem[],
  });

  // Mock data for demonstration
  const mockVendors: Vendor[] = [
    { id: 1, name: 'ABC Suppliers', email: 'contact@abcsuppliers.com', phone: '+1-555-0123' },
    { id: 2, name: 'XYZ Manufacturing', email: 'sales@xyz.com', phone: '+1-555-0456' },
    { id: 3, name: 'Global Electronics', email: 'orders@global.com', phone: '+1-555-0789' },
    { id: 4, name: 'Office Solutions Inc', email: 'info@office.com', phone: '+1-555-0321' },
  ];

  const mockProducts: Product[] = [
    { id: 1, name: 'Office Chair', sku: 'OC-001', purchase_price: 150, category: 'Furniture' },
    { id: 2, name: 'Laptop', sku: 'LP-002', purchase_price: 1200, category: 'Electronics' },
    { id: 3, name: 'Desk Lamp', sku: 'DL-003', purchase_price: 45, category: 'Furniture' },
    { id: 4, name: 'Monitor', sku: 'MN-004', purchase_price: 300, category: 'Electronics' },
    { id: 5, name: 'Keyboard', sku: 'KB-005', purchase_price: 80, category: 'Electronics' },
  ];

  const mockTaxes: Tax[] = [
    { id: 1, name: 'GST', rate: 18 },
    { id: 2, name: 'VAT', rate: 12 },
    { id: 3, name: 'Service Tax', rate: 5 },
  ];

  const mockPurchaseOrders: PurchaseOrder[] = [
    {
      id: 1,
      vendor: 'ABC Suppliers',
      vendor_id: 1,
      status: 'confirmed',
      payment_status: 'unpaid',
      total_amount: 2500,
      po_date: '2024-01-15',
      expected_delivery_date: '2024-01-25',
      notes: 'Urgent delivery required',
      items: [
        { id: 1, product: 'Office Chair', product_id: 1, quantity: 10, unit_price: 150, tax: 18, total: 1770 },
        { id: 2, product: 'Desk Lamp', product_id: 3, quantity: 5, unit_price: 45, tax: 18, total: 265.5 }
      ],
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      vendor: 'XYZ Manufacturing',
      vendor_id: 2,
      status: 'sent',
      payment_status: 'partial',
      total_amount: 4800,
      po_date: '2024-01-14',
      expected_delivery_date: '2024-01-30',
      notes: 'Bulk order discount applied',
      items: [
        { id: 3, product: 'Laptop', product_id: 2, quantity: 3, unit_price: 1200, tax: 18, total: 4248 },
        { id: 4, product: 'Monitor', product_id: 4, quantity: 2, unit_price: 300, tax: 18, total: 708 }
      ],
      created_at: '2024-01-14T14:30:00Z',
      updated_at: '2024-01-14T14:30:00Z'
    },
    {
      id: 3,
      vendor: 'Global Electronics',
      vendor_id: 3,
      status: 'received',
      payment_status: 'paid',
      total_amount: 1200,
      po_date: '2024-01-10',
      expected_delivery_date: '2024-01-20',
      received_date: '2024-01-18',
      notes: 'Delivered on time',
      items: [
        { id: 5, product: 'Keyboard', product_id: 5, quantity: 15, unit_price: 80, tax: 18, total: 1416 }
      ],
      created_at: '2024-01-10T09:15:00Z',
      updated_at: '2024-01-18T16:45:00Z'
    }
  ];

  // Optimized data fetching
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setConnectionStatus('reconnecting');
      const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
      
      if (!token) {
        // Use mock data
        setPurchaseOrders(mockPurchaseOrders);
        setVendors(mockVendors);
        setProducts(mockProducts);
        setTaxes(mockTaxes);
        setLastUpdated(new Date());
        setConnectionStatus('connected');
        return;
      }

      const api = axios.create({
        baseURL: 'http://localhost:8000/api/',
        headers: { Authorization: `Bearer ${token}` },
      });

      const [ordersRes, vendorsRes, productsRes, taxesRes] = await Promise.allSettled([
        api.get('/transactions/purchase-orders/'),
        api.get('/master/contacts/?contact_type=vendor'),
        api.get('/master/products/'),
        api.get('/master/taxes/')
      ]);

      if (ordersRes.status === 'fulfilled') {
        setPurchaseOrders(ordersRes.value.data.results || ordersRes.value.data);
      } else {
        setPurchaseOrders(mockPurchaseOrders);
      }

      if (vendorsRes.status === 'fulfilled') {
        setVendors(vendorsRes.value.data.results || vendorsRes.value.data);
      } else {
        setVendors(mockVendors);
      }

      if (productsRes.status === 'fulfilled') {
        setProducts(productsRes.value.data.results || productsRes.value.data);
      } else {
        setProducts(mockProducts);
      }

      if (taxesRes.status === 'fulfilled') {
        setTaxes(taxesRes.value.data.results || taxesRes.value.data);
      } else {
        setTaxes(mockTaxes);
      }

      setLastUpdated(new Date());
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error fetching data:', error);
      setConnectionStatus('disconnected');
      // Fallback to mock data
      setPurchaseOrders(mockPurchaseOrders);
      setVendors(mockVendors);
      setProducts(mockProducts);
      setTaxes(mockTaxes);
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

  // Filtered and sorted data
  const filteredOrders = useMemo(() => {
    let filtered = purchaseOrders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm) ||
        order.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Vendor filter
    if (vendorFilter !== 'all') {
      filtered = filtered.filter(order => order.vendor_id.toString() === vendorFilter);
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.po_date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.po_date);
          bValue = new Date(b.po_date);
          break;
        case 'amount':
          aValue = a.total_amount;
          bValue = b.total_amount;
          break;
        case 'vendor':
          aValue = a.vendor;
          bValue = b.vendor;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [purchaseOrders, searchTerm, statusFilter, vendorFilter, dateRange, sortBy, sortOrder]);

  // Analytics data
  const analyticsData = useMemo(() => {
    const totalAmount = purchaseOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const statusCounts = purchaseOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const monthlyData = purchaseOrders.reduce((acc, order) => {
      const month = new Date(order.po_date).toLocaleDateString('en-US', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { month, amount: 0, count: 0 };
      }
      acc[month].amount += order.total_amount;
      acc[month].count += 1;
      return acc;
    }, {} as Record<string, { month: string; amount: number; count: number }>);

    return {
      totalAmount,
      statusCounts,
      monthlyData: Object.values(monthlyData),
      totalOrders: purchaseOrders.length,
      averageOrderValue: purchaseOrders.length > 0 ? totalAmount / purchaseOrders.length : 0
    };
  }, [purchaseOrders]);

  // Form handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newOrder: PurchaseOrder = {
        id: editingOrder ? editingOrder.id : Date.now(),
        vendor: vendors.find(v => v.id.toString() === form.vendor)?.name || form.vendor,
        vendor_id: Number(form.vendor),
        status: 'draft',
        payment_status: 'unpaid',
        total_amount: form.items.reduce((sum, item) => sum + item.total, 0),
        po_date: form.po_date,
        expected_delivery_date: form.expected_delivery_date,
        notes: form.notes,
        items: form.items,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (editingOrder) {
        setPurchaseOrders(prev => prev.map(order => order.id === editingOrder.id ? newOrder : order));
      } else {
        setPurchaseOrders(prev => [newOrder, ...prev]);
      }

      setShowModal(false);
      setEditingOrder(null);
      setForm({
        vendor: '',
        po_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: '',
        notes: '',
        items: [],
      });
    } catch (error) {
      console.error('Error saving purchase order:', error);
    }
  };

  const handleDelete = (id: number) => {
    setPurchaseOrders(prev => prev.filter(order => order.id !== id));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...form.items];
    
    if (field === 'product') {
      const selectedProduct = products.find(p => p.id === Number(value));
      if (selectedProduct) {
        newItems[index].product = selectedProduct.name;
        newItems[index].product_id = selectedProduct.id;
        newItems[index].unit_price = selectedProduct.purchase_price;
      }
    } else if (field === 'quantity') {
      newItems[index].quantity = Number(value);
    } else if (field === 'unit_price') {
      newItems[index].unit_price = Number(value);
    } else if (field === 'tax') {
      newItems[index].tax = Number(value);
    }
    
    newItems[index].total = newItems[index].quantity * newItems[index].unit_price * (1 + newItems[index].tax / 100);
    
    setForm({ ...form, items: newItems });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, {
        id: Date.now(),
        product: '',
        product_id: 0,
        quantity: 1,
        unit_price: 0,
        tax: 0,
        total: 0
      }]
    });
  };

  const removeItem = (index: number) => {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index)
    });
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
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Purchase Orders</h1>
            <p className="text-gray-600">Manage your purchase orders.</p>
          </div>
          <button
            className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700"
            onClick={() => openModal()}
          >
            + New Purchase
          </button>
        </header>

        {/* Table */}
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : purchaseOrders.length === 0 ? (
          <p>No purchase orders found.</p>
        ) : (
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full bg-white border rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-6 py-3 border-b">ID</th>
                  <th className="px-6 py-3 border-b">Vendor</th>
                  <th className="px-6 py-3 border-b">Total</th>
                  <th className="px-6 py-3 border-b">Status</th>
                  <th className="px-6 py-3 border-b">Date</th>
                  <th className="px-6 py-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map(po => (
                  <tr key={po.id} className="border-b">
                    <td className="px-6 py-3">{po.id}</td>
                    <td className="px-6 py-3">{po.vendor}</td>
                    <td className="px-6 py-3">${Number(po.total_amount ?? 0).toFixed(2)}</td>
                    <td className="px-6 py-3">{po.status}</td>
                    <td className="px-6 py-3">{po.po_date}</td>
                    <td className="px-6 py-3 space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900" onClick={() => openModal(po)}>Edit</button>
                      <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(po.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl overflow-y-auto max-h-[90vh]">
              <h2 className="text-xl font-bold mb-4">{editingOrder ? 'Edit Purchase Order' : 'New Purchase Order'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <select name="vendor" value={form.vendor} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required>
                  <option value="">Select Vendor</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
                <div className="flex gap-4">
                  <input type="date" name="po_date" value={form.po_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                  <input type="date" name="expected_delivery_date" value={form.expected_delivery_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" placeholder="Notes" />

                {/* Items */}
                <div>
                  <h3 className="font-semibold mb-2">Items</h3>
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center mb-2">
                      <select value={item.product} onChange={e => handleItemChange(idx, 'product', e.target.value)} className="px-2 py-1 border rounded-md flex-1" required>
                        <option value="">Select Product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <input type="number" min={1} value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} className="w-20 px-2 py-1 border rounded-md" required />
                      <input type="number" min={0} step="0.01" value={item.unit_price} onChange={e => handleItemChange(idx, 'unit_price', e.target.value)} className="w-24 px-2 py-1 border rounded-md" required />
                                            <select
                        value={item.tax || ''}
                        onChange={e => handleItemChange(idx, 'tax', e.target.value)}
                        className="w-28 px-2 py-1 border rounded-md"
                      >
                        <option value="">No Tax</option>
                        {taxes.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-900 px-2"
                        onClick={() => removeItem(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="mt-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                    onClick={addItem}
                  >
                    + Add Item
                  </button>
                </div>

                {/* Modal actions */}
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    {editingOrder ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PurchasesPage;

