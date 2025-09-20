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
  product: number;
  quantity: number;
  unit_price: number;
  tax: number;
}

interface SalesOrder {
  id: number;
  customer: string;
  status: string;
  total: number | string;
  date: string;
}

const SalesPage = () => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);

  const [form, setForm] = useState({
    customer: '',
    so_date: '',
    expected_delivery_date: '',
    notes: '',
    items: [] as SalesOrderItem[],
  });

  const token = localStorage.getItem('accessToken');
  const api = axios.create({
    baseURL: 'http://localhost:8000/api/transactions/',
    headers: { Authorization: `Bearer ${token}` },
  });

  // Fetch sales orders
  const fetchSalesOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('sales-orders/');
      setSalesOrders(Array.isArray(res.data) ? res.data : res.data.results);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch sales orders.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers, products, taxes for dropdowns
  const fetchMasterData = async () => {
    try {
      const [custRes, prodRes, taxRes] = await Promise.all([
        api.get('customers/'),
        api.get('products/'),
        api.get('taxes/'),
      ]);
      setCustomers(custRes.data);
      setProducts(prodRes.data);
      setTaxes(taxRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSalesOrders();
    fetchMasterData();
  }, []);

  const openModal = (order?: SalesOrder) => {
    if (order) {
      setEditingOrder(order);
      setForm({
        customer: order.customer,
        so_date: order.date,
        expected_delivery_date: '',
        notes: '',
        items: order.items || [],
      });
    } else {
      setEditingOrder(null);
      setForm({
        customer: '',
        so_date: '',
        expected_delivery_date: '',
        notes: '',
        items: [],
      });
    }
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...form.items];
    newItems[index][field as keyof SalesOrderItem] =
      field === 'product' || field === 'tax'
        ? Number(value)
        : Number(value);
    setForm({ ...form, items: newItems });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { product: 0, quantity: 1, unit_price: 0, tax: 0 }],
    });
  };

  const removeItem = (index: number) => {
    const newItems = [...form.items];
    newItems.splice(index, 1);
    setForm({ ...form, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingOrder) {
        // Update (PUT)
        const res = await api.put(`sales-orders/${editingOrder.id}/`, form);
        setSalesOrders(prev =>
          prev.map(order => (order.id === editingOrder.id ? res.data : order))
        );
      } else {
        // Create (POST)
        const res = await api.post('sales-orders/create/', form);
        setSalesOrders(prev => [...prev, res.data]);
      }
      setShowModal(false);
    } catch (err: any) {
      console.error(err.response?.data || err);
      setError('Failed to save sales order.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this sales order?')) return;
    try {
      await api.delete(`sales-orders/${id}/`);
      setSalesOrders(prev => prev.filter(order => order.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete sales order.');
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
        ) : error ? (
          <p className="text-red-600">{error}</p>
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
                  <th className="py-3 px-4 font-semibold">Total</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
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
                    <td className="py-4 px-4">${Number(order.total ?? 0).toFixed(2)}</td>
                    <td className="py-4 px-4">{order.date}</td>
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
                <div className="flex gap-4">
                  <input
                    type="date"
                    name="so_date"
                    value={form.so_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                  <input
                    type="date"
                    name="expected_delivery_date"
                    value={form.expected_delivery_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
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

        
