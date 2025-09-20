'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import api from '../lib/api'; // Axios instance with token configured

interface Product {
  id: number;
  name: string;
  sku: string;
  category?: number;
  category_name?: string;
  sales_price: number;
  purchase_price: number;
  current_stock: number;
  minimum_stock: number;
  unit_of_measure?: string;
  is_active: boolean;
}

interface ProductCategory {
  id: number;
  name: string;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    sales_price: 0,
    purchase_price: 0,
    current_stock: 0,
    minimum_stock: 0,
    unit_of_measure: 'pcs',
    is_active: true,
  });

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/master/products/');
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await api.get('/master/product-categories/');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or Update Product
  const handleSubmit = async () => {
    try {
      if (editingProduct) {
        await api.put(`/master/products/${editingProduct.id}/`, form);
      } else {
        await api.post('/master/add-product/', form);
      }
      setShowModal(false);
      setEditingProduct(null);
      setForm({
        name: '',
        sku: '',
        category: '',
        sales_price: 0,
        purchase_price: 0,
        current_stock: 0,
        minimum_stock: 0,
        unit_of_measure: 'pcs',
        is_active: true,
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError('Failed to save product');
    }
  };

  // Edit product
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category?.toString() || '',
      sales_price: product.sales_price,
      purchase_price: product.purchase_price,
      current_stock: product.current_stock,
      minimum_stock: product.minimum_stock,
      unit_of_measure: product.unit_of_measure || 'pcs',
      is_active: product.is_active,
    });
    setShowModal(true);
  };

  // Delete product
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/master/products/${id}/`);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError('Failed to delete product');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar activePage="products" />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Products</h1>
            <p className="text-gray-600">Manage your products and services.</p>
          </div>
          <button
            onClick={() => {
              setShowModal(true);
              setEditingProduct(null);
              setForm({
                name: '',
                sku: '',
                category: '',
                sales_price: 0,
                purchase_price: 0,
                current_stock: 0,
                minimum_stock: 0,
                unit_of_measure: 'pcs',
                is_active: true,
              });
            }}
            className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Add New Product
          </button>
        </header>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full bg-white border rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-6 py-3 border-b">Name</th>
                  <th className="px-6 py-3 border-b">SKU</th>
                  <th className="px-6 py-3 border-b">Category</th>
                  <th className="px-6 py-3 border-b">Sales Price</th>
                  <th className="px-6 py-3 border-b">Purchase Price</th>
                  <th className="px-6 py-3 border-b">Stock</th>
                  <th className="px-6 py-3 border-b">Min Stock</th>
                  <th className="px-6 py-3 border-b">Status</th>
                  <th className="px-6 py-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b">
                    <td className="px-6 py-3">{p.name}</td>
                    <td className="px-6 py-3">{p.sku}</td>
                    <td className="px-6 py-3">{p.category_name}</td>
                    <td className="px-6 py-3">{p.sales_price}</td>
                    <td className="px-6 py-3">{p.purchase_price}</td>
                    <td className="px-6 py-3">{p.current_stock}</td>
                    <td className="px-6 py-3">{p.minimum_stock}</td>
                    <td className="px-6 py-3">{p.is_active ? 'Active' : 'Inactive'}</td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 hover:text-red-900"
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

        {/* Modal for Add/Edit */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  name="name"
                  placeholder="Product Name"
                  className="w-full px-3 py-2 border rounded-md"
                  value={form.name}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="sku"
                  placeholder="SKU"
                  className="w-full px-3 py-2 border rounded-md"
                  value={form.sku}
                  onChange={handleChange}
                />
                <select
                  name="category"
                  value={form.category}
                  className="w-full px-3 py-2 border rounded-md"
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  name="sales_price"
                  placeholder="Sales Price"
                  className="w-full px-3 py-2 border rounded-md"
                  value={form.sales_price}
                  onChange={handleChange}
                />
                <input
                  type="number"
                  name="purchase_price"
                  placeholder="Purchase Price"
                  className="w-full px-3 py-2 border rounded-md"
                  value={form.purchase_price}
                  onChange={handleChange}
                />
                <input
                  type="number"
                  name="current_stock"
                  placeholder="Current Stock"
                  className="w-full px-3 py-2 border rounded-md"
                  value={form.current_stock}
                  onChange={handleChange}
                />
                <input
                  type="number"
                  name="minimum_stock"
                  placeholder="Minimum Stock"
                  className="w-full px-3 py-2 border rounded-md"
                  value={form.minimum_stock}
                  onChange={handleChange}
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  />
                  <label>Active</label>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  onClick={handleSubmit}
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default ProductsPage;
