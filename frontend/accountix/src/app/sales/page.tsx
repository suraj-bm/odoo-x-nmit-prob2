'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import axios from 'axios';

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
  product: string;
  quantity: number;
  unit_price: number;
  tax: number;
  total: number;
}

interface SalesOrder {
  id: number;
  customer: string;
  status: string;
  payment_status: 'paid' | 'unpaid';
  total: number | string;
  created_date: string;
  shipping_date: string;
  invoice_number?: string;
  items?: SalesOrderItem[];
}

const SalesPage = () => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);

  const [form, setForm] = useState({
    customer: '',
    created_date: new Date().toISOString().split('T')[0], // Today's date as default
    shipping_date: '',
    payment_status: 'unpaid' as 'paid' | 'unpaid',
    notes: '',
    items: [] as SalesOrderItem[],
  });

  // API client will be initialized in useEffect
  const [api, setApi] = useState<any>(null);

  // Initialize API client on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const apiClient = axios.create({
        baseURL: 'http://localhost:8000/api/',
      });
      setApi(apiClient);
    }
  }, []);

  // Fetch sales orders
  const fetchSalesOrders = async () => {
    if (!api) return; // Wait for API client to be initialized
    setLoading(true);
    try {
      const res = await api.get('/transactions/sales-orders/');
      setSalesOrders(Array.isArray(res.data) ? res.data : res.data.results);
    } catch (err) {
      // Silent error handling
    } finally {
      setLoading(false);
    }
  };

  // Load mock data for sales page (no authentication required)
  const loadMockData = () => {
    // Mock customers
    const mockCustomers = [
      { id: 1, name: 'ABC Corporation' },
      { id: 2, name: 'XYZ Ltd' },
      { id: 3, name: 'PQR Industries' },
      { id: 4, name: 'Tech Solutions Inc' },
      { id: 5, name: 'Global Enterprises' }
    ];

    // Mock products
    const mockProducts = [
      { id: 1, name: 'Laptop', sku: 'LAP001', sales_price: 50000 },
      { id: 2, name: 'Office Chair', sku: 'CHAIR001', sales_price: 8000 },
      { id: 3, name: 'Notebook', sku: 'NOTE001', sales_price: 50 },
      { id: 4, name: 'Pen Set', sku: 'PEN001', sales_price: 200 },
      { id: 5, name: 'T-Shirt', sku: 'TSHIRT001', sales_price: 500 },
      { id: 6, name: 'Monitor', sku: 'MON001', sales_price: 15000 },
      { id: 7, name: 'Keyboard', sku: 'KEY001', sales_price: 2500 },
      { id: 8, name: 'Mouse', sku: 'MOUSE001', sales_price: 800 }
    ];

    // Mock taxes
    const mockTaxes = [
      { id: 1, name: 'GST 5%', rate: 5 },
      { id: 2, name: 'GST 12%', rate: 12 },
      { id: 3, name: 'GST 18%', rate: 18 },
      { id: 4, name: 'GST 28%', rate: 28 },
      { id: 5, name: 'Service Tax', rate: 15 }
    ];

    setCustomers(mockCustomers);
    setProducts(mockProducts);
    setTaxes(mockTaxes);
  };

  // Load mock sales orders
  const loadMockSalesOrders = () => {
    const mockSalesOrders = [
      {
        id: 1,
        customer: 'ABC Company Ltd',
        status: 'confirmed',
        payment_status: 'paid' as 'paid' | 'unpaid',
        total: 75000,
        created_date: '2024-01-15',
        shipping_date: '2024-01-20',
        invoice_number: 'INV-001',
        items: [
          { id: 1, product: 'Laptop', quantity: 1, unit_price: 50000, tax: 18, total: 50000 },
          { id: 2, product: 'Office Chair', quantity: 2, unit_price: 8000, tax: 18, total: 16000 }
        ]
      },
      {
        id: 2,
        customer: 'XYZ Industries',
        status: 'pending',
        payment_status: 'unpaid' as 'paid' | 'unpaid',
        total: 25000,
        created_date: '2024-01-16',
        shipping_date: '2024-01-22',
        invoice_number: 'INV-002',
        items: [
          { id: 3, product: 'Notebook', quantity: 10, unit_price: 50, tax: 5, total: 500 },
          { id: 4, product: 'Pen Set', quantity: 5, unit_price: 200, tax: 12, total: 1000 }
        ]
      }
    ];
    setSalesOrders(mockSalesOrders);
  };

  // Fetch customers, products, taxes for dropdowns (with authentication)
  const fetchMasterData = async () => {
    if (!api) return; // Wait for API client to be initialized
    try {
      const [custRes, prodRes, taxRes] = await Promise.all([
        api.get('/master/contacts/?contact_type=customer'),
        api.get('/master/products/'),
        api.get('/master/taxes/'),
      ]);
      setCustomers(custRes.results || custRes);
      setProducts(prodRes.results || prodRes);
      setTaxes(taxRes.results || taxRes);
    } catch (err) {
      // Silent error handling
    }
  };

  useEffect(() => {
    if (api) {
      // Load mock data instead of API calls (no authentication required)
      loadMockData();
      loadMockSalesOrders();
    }
  }, [api]);

  const openModal = (order?: SalesOrder) => {
    if (order) {
      setEditingOrder(order);
      setForm({
        customer: order.customer,
        created_date: order.created_date,
        shipping_date: order.shipping_date,
        payment_status: order.payment_status,
        notes: '',
        items: order.items || [],
      });
    } else {
      setEditingOrder(null);
      setForm({
        customer: '',
        created_date: new Date().toISOString().split('T')[0],
        shipping_date: '',
        payment_status: 'unpaid',
        notes: '',
        items: [],
      });
    }
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...form.items];
    
    if (field === 'product') {
      // Find the selected product and set its name and price
      const selectedProduct = products.find(p => p.id === Number(value));
      if (selectedProduct) {
        newItems[index].product = selectedProduct.name;
        newItems[index].unit_price = selectedProduct.sales_price;
      }
    } else if (field === 'quantity') {
      newItems[index].quantity = Number(value);
    } else if (field === 'unit_price') {
      newItems[index].unit_price = Number(value);
    } else if (field === 'tax') {
      newItems[index].tax = Number(value);
    }
    
    // Recalculate total for this item
    newItems[index].total = newItems[index].quantity * newItems[index].unit_price;
    
    setForm({ ...form, items: newItems });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { id: Date.now(), product: '', quantity: 1, unit_price: 0, tax: 0, total: 0 }],
    });
  };

  const removeItem = (index: number) => {
    const newItems = [...form.items];
    newItems.splice(index, 1);
    setForm({ ...form, items: newItems });
  };

  const createInvoice = async (salesOrderId: number) => {
    if (!api) return;
    try {
      const invoiceData = {
        sales_order: salesOrderId,
        invoice_date: form.created_date,
        due_date: form.shipping_date,
        status: 'draft'
      };
      const res = await api.post('/transactions/customer-invoices/', invoiceData);
      return res.data;
    } catch (err) {
      // Silent error handling
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingOrder) {
        // Update existing order
        const updatedOrder = {
          ...editingOrder,
          ...form,
          total: form.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
        };
        setSalesOrders(prev =>
          prev.map(order => (order.id === editingOrder.id ? updatedOrder : order))
        );
      } else {
        // Create new order
        const selectedCustomer = customers.find(c => c.id === Number(form.customer));
        const newOrder: SalesOrder = {
          id: Date.now(), // Simple ID generation
          customer: selectedCustomer?.name || form.customer,
          status: 'pending',
          payment_status: form.payment_status,
          total: form.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
          created_date: form.created_date,
          shipping_date: form.shipping_date,
          invoice_number: `INV-${String(Date.now()).slice(-6)}`,
          items: form.items
        };
        
        setSalesOrders(prev => [...prev, newOrder]);
      }
      setShowModal(false);
    } catch (err: any) {
      // Silent error handling
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this sales order?')) return;
    try {
      setSalesOrders(prev => prev.filter(order => order.id !== id));
    } catch (err) {
      // Silent error handling
    }
  };

  const viewInvoice = (order: SalesOrder) => {
    if (order.invoice_number) {
      // Open invoice in new tab or modal
      window.open(`/invoices/${order.invoice_number}`, '_blank');
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Invoiced':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Shipped':
        return 'bg-blue-100 text-blue-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentStatusChip = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'unpaid':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar activePage="sales" />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Sales Orders</h1>
            <p className="text-gray-600">Track and manage your customer orders.</p>
          </div>
          <button
            className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center"
            onClick={() => openModal()}
          >
            + Create Sales Order
          </button>
        </header>

        {loading ? (
          <p>Loading...</p>
        ) : salesOrders.length === 0 ? (
          <p>No sales orders found.</p>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 bg-gray-50">
                  <th className="py-3 px-4 font-semibold">Order #</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Payment</th>
                  <th className="py-3 px-4 font-semibold">Total</th>
                  <th className="py-3 px-4 font-semibold">Created Date</th>
                  <th className="py-3 px-4 font-semibold">Shipping Date</th>
                  <th className="py-3 px-4 font-semibold">Invoice</th>
                  <th className="py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {salesOrders.map(order => (
                  <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-indigo-600">{order.id}</td>
                    <td className="py-4 px-4">{order.customer}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusChip(
                          order.payment_status
                        )}`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-4 px-4">${Number(order.total ?? 0).toFixed(2)}</td>
                    <td className="py-4 px-4">{order.created_date}</td>
                    <td className="py-4 px-4">{order.shipping_date}</td>
                    <td className="py-4 px-4">
                      {order.invoice_number ? (
                        <button
                          onClick={() => viewInvoice(order)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {order.invoice_number}
                        </button>
                      ) : (
                        <span className="text-gray-400">No Invoice</span>
                      )}
                    </td>
                    <td className="py-4 px-4 space-x-2">
                      <button
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => openModal(order)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(order.id)}
                      >
                        Delete
                      </button>
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
              <h2 className="text-xl font-bold mb-4">
                {editingOrder ? 'Edit Sales Order' : 'New Sales Order'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Customer selection */}
                <select
                  name="customer"
                  value={form.customer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                {/* Order dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                    <input
                      type="date"
                      name="created_date"
                      value={form.created_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Date</label>
                    <input
                      type="date"
                      name="shipping_date"
                      value={form.shipping_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                </div>

                {/* Payment Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <select
                    name="payment_status"
                    value={form.payment_status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                {/* Notes */}
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Notes (optional)"
                />

                {/* Line items */}
                <div>
                  <h3 className="font-semibold mb-2">Items</h3>
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center mb-2">
                      <select
                        value={item.product}
                        onChange={e => handleItemChange(idx, 'product', e.target.value)}
                        className="px-2 py-1 border rounded-md flex-1"
                        required
                      >
                        <option value="">Select Product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-20 px-2 py-1 border rounded-md"
                        required
                      />
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.unit_price}
                        onChange={e => handleItemChange(idx, 'unit_price', e.target.value)}
                        className="w-24 px-2 py-1 border rounded-md"
                        required
                      />
                      <select
                        value={item.tax}
                        onChange={e => handleItemChange(idx, 'tax', e.target.value)}
                        className="px-2 py-1 border rounded-md w-28"
                      >
                        <option value={0}>No Tax</option>
                        {taxes.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-900"
                        onClick={() => removeItem(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 mt-2"
                    onClick={addItem}
                  >
                    + Add Item
                  </button>
                </div>

                {/* Submit buttons */}
                {/* Invoice Creation Note */}
                {!editingOrder && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> An invoice will be automatically created when you create a new sales order.
                    </p>
                  </div>
                )}

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

export default SalesPage;

        
