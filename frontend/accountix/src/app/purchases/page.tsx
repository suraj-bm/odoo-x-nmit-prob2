'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import axios from 'axios';

interface PurchaseOrderItem {
  product: string;
  quantity: number;
  unit_price: number;
  tax?: string;
}

interface PurchaseOrder {
  id: number;
  vendor: string;
  status: string;
  total_amount: number | string;
  po_date: string;
  expected_delivery_date?: string;
  notes?: string;
  items?: PurchaseOrderItem[];
}

const PurchasesPage = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);

  const [form, setForm] = useState({
    vendor: '',
    po_date: '',
    expected_delivery_date: '',
    notes: '',
    items: [] as PurchaseOrderItem[],
  });

  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; sales_price: number }[]>([]);
  const [taxes, setTaxes] = useState<{ id: string; name: string; rate: number }[]>([]);

  // API client will be initialized in useEffect
  const [api, setApi] = useState<any>(null);

  // Initialize API client on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const apiClient = axios.create({
        baseURL: 'http://localhost:8000/api/',
        headers: { Authorization: `Bearer ${token}` },
      });
      setApi(apiClient);
    }
  }, []);

  useEffect(() => {
    if (api) {
      fetchPurchaseOrders();
      fetchVendors();
      fetchProducts();
      fetchTaxes();
    }
  }, [api]);

  const fetchPurchaseOrders = async () => {
    if (!api) return;
    setLoading(true);
    try {
      const res = await api.get('/transactions/purchase-orders/');
      setPurchaseOrders(Array.isArray(res.data) ? res.data : res.data.results);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch purchase orders.');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    if (!api) return;
    try {
      const res = await api.get('/master/contacts/?contact_type=vendor');
      setVendors(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    if (!api) return;
    try {
      const res = await api.get('/master/products/');
      setProducts(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTaxes = async () => {
    if (!api) return;
    try {
      const res = await api.get('/master/taxes/');
      setTaxes(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (order?: PurchaseOrder) => {
    if (order) {
      setEditingOrder(order);
      setForm({
        vendor: order.vendor,
        po_date: order.po_date,
        expected_delivery_date: order.expected_delivery_date || '',
        notes: order.notes || '',
        items: order.items || [],
      });
    } else {
      setEditingOrder(null);
      setForm({ vendor: '', po_date: '', expected_delivery_date: '', notes: '', items: [] });
    }
    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
    const newItems = [...form.items];
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index][field] = Number(value);
    } else {
      (newItems[index] as any)[field] = value;
    }
    setForm({ ...form, items: newItems });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { product: '', quantity: 1, unit_price: 0 }] });
  const removeItem = (index: number) => setForm({ ...form, items: form.items.filter((_, i) => i !== index) });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingOrder) {
        const res = await api.put(`purchase-orders/${editingOrder.id}/`, form);
        setPurchaseOrders(prev => prev.map(po => (po.id === editingOrder.id ? res.data : po)));
      } else {
        const res = await api.post('purchase-orders/', form);
        setPurchaseOrders(prev => [...prev, res.data]);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setError('Failed to save purchase order.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this purchase order?')) return;
    try {
      await api.delete(`purchase-orders/${id}/`);
      setPurchaseOrders(prev => prev.filter(po => po.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete purchase order.');
    }
  };

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

