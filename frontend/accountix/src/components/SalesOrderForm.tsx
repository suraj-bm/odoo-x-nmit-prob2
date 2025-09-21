'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';

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
  id?: number;
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

interface SalesOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: any) => void;
  editingOrder?: any;
  customers: Customer[];
  products: Product[];
  taxes: Tax[];
}

const SalesOrderForm: React.FC<SalesOrderFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editingOrder,
  customers,
  products,
  taxes
}) => {
  const [formData, setFormData] = useState({
    customer: '',
    so_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    notes: '',
    items: [] as SalesOrderItem[],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);

  // Filtered products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const taxAmount = formData.items.reduce((sum, item) => sum + item.tax_amount, 0);
  const total = subtotal + taxAmount;

  // Initialize form with editing order data
  useEffect(() => {
    if (editingOrder) {
      setFormData({
        customer: editingOrder.customer.toString(),
        so_date: editingOrder.so_date,
        expected_delivery_date: editingOrder.expected_delivery_date || '',
        notes: editingOrder.notes || '',
        items: editingOrder.items || [],
      });
    } else {
      setFormData({
        customer: '',
        so_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: '',
        notes: '',
        items: [],
      });
    }
    setErrors({});
  }, [editingOrder, isOpen]);

  // Add item to order
  const addItem = useCallback((product: Product) => {
    const existingItemIndex = formData.items.findIndex(item => item.product === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].line_total = updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unit_price;
      setFormData(prev => ({ ...prev, items: updatedItems }));
    } else {
      // Add new item
      const newItem: SalesOrderItem = {
        product: product.id,
        product_name: product.name,
        product_sku: product.sku,
        quantity: 1,
        unit_price: product.sales_price,
        tax: 0,
        tax_name: 'No Tax',
        tax_rate: 0,
        tax_amount: 0,
        line_total: product.sales_price,
      };
      setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }
    setShowProductSearch(false);
    setSearchTerm('');
  }, [formData.items]);

  // Update item
  const updateItem = useCallback((index: number, field: keyof SalesOrderItem, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Recalculate line total
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].line_total = updatedItems[index].quantity * updatedItems[index].unit_price;
    }

    // Recalculate tax
    if (field === 'tax') {
      const selectedTax = taxes.find(t => t.id === value);
      if (selectedTax) {
        updatedItems[index].tax_name = selectedTax.name;
        updatedItems[index].tax_rate = selectedTax.rate;
        updatedItems[index].tax_amount = selectedTax.type === 'percentage' 
          ? (updatedItems[index].line_total * selectedTax.rate) / 100
          : selectedTax.rate;
      }
    }

    setFormData(prev => ({ ...prev, items: updatedItems }));
  }, [formData.items, taxes]);

  // Remove item
  const removeItem = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  }, []);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer) {
      newErrors.customer = 'Customer is required';
    }

    if (!formData.so_date) {
      newErrors.so_date = 'Order date is required';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    formData.items.forEach((item, index) => {
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (item.unit_price <= 0) {
        newErrors[`item_${index}_unit_price`] = 'Unit price must be greater than 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
      if (token) {
        apiClient.setToken(token);
      }

      const orderData = {
        customer: parseInt(formData.customer),
        so_date: formData.so_date,
        expected_delivery_date: formData.expected_delivery_date || null,
        notes: formData.notes || null,
        items: formData.items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax: item.tax || null,
        })),
      };

      let response;
      if (editingOrder) {
        response = await apiClient.put(`/transactions/sales-orders/${editingOrder.id}/`, orderData);
      } else {
        response = await apiClient.post('/transactions/sales-orders/', orderData);
      }

      onSave(response);
      onClose();
    } catch (error) {
      console.error('Failed to save sales order:', error);
      setErrors({ submit: 'Failed to save sales order. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingOrder ? 'Edit Sales Order' : 'Create Sales Order'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer *
              </label>
              <select
                value={formData.customer}
                onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.customer ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.email && `(${customer.email})`}
                  </option>
                ))}
              </select>
              {errors.customer && <p className="text-red-500 text-sm mt-1">{errors.customer}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Date *
              </label>
              <input
                type="date"
                value={formData.so_date}
                onChange={(e) => setFormData(prev => ({ ...prev, so_date: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.so_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.so_date && <p className="text-red-500 text-sm mt-1">{errors.so_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={formData.expected_delivery_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_delivery_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Additional notes..."
              />
            </div>
          </div>

          {/* Items Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Order Items</h3>
              <button
                type="button"
                onClick={() => setShowProductSearch(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                ➕ Add Item
              </button>
            </div>

            {errors.items && <p className="text-red-500 text-sm mb-4">{errors.items}</p>}

            {/* Items Table */}
            {formData.items.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Line Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.product_name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.product_sku}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className={`w-20 px-2 py-1 border rounded text-sm ${
                              errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors[`item_${index}_quantity`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_quantity`]}</p>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            className={`w-24 px-2 py-1 border rounded text-sm ${
                              errors[`item_${index}_unit_price`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors[`item_${index}_unit_price`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_unit_price`]}</p>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <select
                            value={item.tax}
                            onChange={(e) => updateItem(index, 'tax', parseInt(e.target.value) || 0)}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value={0}>No Tax</option>
                            {taxes.map(tax => (
                              <option key={tax.id} value={tax.id}>
                                {tax.name} ({tax.rate}%)
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${item.line_total.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals */}
            {formData.items.length > 0 && (
              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax Amount:</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.submit}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            {editingOrder ? 'Update Order' : 'Create Order'}
          </button>
        </div>

        {/* Product Search Modal */}
        {showProductSearch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Add Product</h3>
                <button
                  onClick={() => {
                    setShowProductSearch(false);
                    setSearchTerm('');
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
                />
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => addItem(product)}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                        {product.description && (
                          <div className="text-sm text-gray-600">{product.description}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">${product.sales_price.toFixed(2)}</div>
                        {product.stock_quantity !== undefined && (
                          <div className="text-sm text-gray-500">
                            Stock: {product.stock_quantity}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesOrderForm;
