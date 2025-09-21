'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/lib/api';

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

interface PurchaseOrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  tax_id?: number;
  tax_rate: number;
  tax_amount: number;
  line_total: number;
}

interface PurchaseOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: any) => void;
  editingOrder?: any;
  vendors: Vendor[];
  products: Product[];
  taxes: Tax[];
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editingOrder,
  vendors,
  products,
  taxes
}) => {
  const [form, setForm] = useState({
    vendor_id: '',
    po_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    notes: '',
    items: [] as PurchaseOrderItem[]
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when editing
  useEffect(() => {
    if (editingOrder) {
      setForm({
        vendor_id: editingOrder.vendor_id?.toString() || '',
        po_date: editingOrder.po_date || new Date().toISOString().split('T')[0],
        expected_delivery_date: editingOrder.expected_delivery_date || '',
        notes: editingOrder.notes || '',
        items: editingOrder.items?.map((item: any) => ({
          id: item.id || Date.now() + Math.random(),
          product_id: item.product_id || item.product,
          product_name: item.product_name || item.product,
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          tax_id: item.tax_id || item.tax,
          tax_rate: item.tax_rate || 0,
          tax_amount: item.tax_amount || 0,
          line_total: item.line_total || 0
        })) || []
      });
    } else {
      setForm({
        vendor_id: '',
        po_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: '',
        notes: '',
        items: []
      });
    }
  }, [editingOrder, isOpen]);

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = form.items.reduce((sum, item) => sum + item.line_total, 0);
    const taxAmount = form.items.reduce((sum, item) => sum + item.tax_amount, 0);
    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total };
  }, [form.items]);

  // Handle form changes
  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle item changes
  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...form.items];
    const item = newItems[index];

    if (field === 'product_id') {
      const product = products.find(p => p.id === Number(value));
      if (product) {
        item.product_id = product.id;
        item.product_name = product.name;
        item.unit_price = product.purchase_price;
      }
    } else if (field === 'quantity') {
      item.quantity = Number(value) || 0;
    } else if (field === 'unit_price') {
      item.unit_price = Number(value) || 0;
    } else if (field === 'tax_id') {
      const tax = taxes.find(t => t.id === Number(value));
      if (tax) {
        item.tax_id = tax.id;
        item.tax_rate = tax.rate;
      } else {
        item.tax_id = undefined;
        item.tax_rate = 0;
      }
    }

    // Recalculate item totals
    const lineTotal = item.quantity * item.unit_price;
    item.line_total = lineTotal;
    item.tax_amount = lineTotal * (item.tax_rate / 100);

    newItems[index] = item;
    setForm(prev => ({ ...prev, items: newItems }));
  };

  // Add new item
  const addItem = () => {
    const newItem: PurchaseOrderItem = {
      id: Date.now() + Math.random(),
      product_id: 0,
      product_name: '',
      quantity: 1,
      unit_price: 0,
      tax_rate: 0,
      tax_amount: 0,
      line_total: 0
    };
    setForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  // Remove item
  const removeItem = (index: number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.vendor_id) newErrors.vendor_id = 'Please select a vendor';
    if (!form.po_date) newErrors.po_date = 'Please select a PO date';
    if (form.items.length === 0) newErrors.items = 'Please add at least one item';

    form.items.forEach((item, index) => {
      if (!item.product_id) newErrors[`item_${index}_product`] = 'Please select a product';
      if (item.quantity <= 0) newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      if (item.unit_price <= 0) newErrors[`item_${index}_price`] = 'Unit price must be greater than 0';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const orderData = {
        vendor: Number(form.vendor_id),
        po_date: form.po_date,
        expected_delivery_date: form.expected_delivery_date,
        notes: form.notes,
        items: form.items.map(item => ({
          product: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax: item.tax_id
        }))
      };

      await onSave(orderData);
      onClose();
    } catch (error) {
      console.error('Error saving purchase order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vendor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor *
              </label>
              <select
                value={form.vendor_id}
                onChange={(e) => handleChange('vendor_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.vendor_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Vendor</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name} {vendor.email && `(${vendor.email})`}
                  </option>
                ))}
              </select>
              {errors.vendor_id && (
                <p className="mt-1 text-sm text-red-600">{errors.vendor_id}</p>
              )}
            </div>

            {/* PO Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PO Date *
              </label>
              <input
                type="date"
                value={form.po_date}
                onChange={(e) => handleChange('po_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.po_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.po_date && (
                <p className="mt-1 text-sm text-red-600">{errors.po_date}</p>
              )}
            </div>

            {/* Expected Delivery Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={form.expected_delivery_date}
                onChange={(e) => handleChange('expected_delivery_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Notes */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Additional notes or special instructions..."
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Item</span>
              </button>
            </div>

            {errors.items && (
              <p className="mb-4 text-sm text-red-600">{errors.items}</p>
            )}

            <div className="space-y-4">
              {form.items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-gray-200 rounded-lg">
                  {/* Product */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product *
                    </label>
                    <select
                      value={item.product_id}
                      onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors[`item_${index}_product`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value={0}>Select Product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.sku}) - ₹{product.purchase_price}
                        </option>
                      ))}
                    </select>
                    {errors[`item_${index}_product`] && (
                      <p className="mt-1 text-xs text-red-600">{errors[`item_${index}_product`]}</p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qty *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors[`item_${index}_quantity`] && (
                      <p className="mt-1 text-xs text-red-600">{errors[`item_${index}_quantity`]}</p>
                    )}
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors[`item_${index}_price`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors[`item_${index}_price`] && (
                      <p className="mt-1 text-xs text-red-600">{errors[`item_${index}_price`]}</p>
                    )}
                  </div>

                  {/* Tax */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax
                    </label>
                    <select
                      value={item.tax_id || ''}
                      onChange={(e) => handleItemChange(index, 'tax_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">No Tax</option>
                      {taxes.map(tax => (
                        <option key={tax.id} value={tax.id}>
                          {tax.name} ({tax.rate}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Total & Actions */}
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-medium">
                        ₹{(item.line_total + item.tax_amount).toFixed(2)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          {form.items.length > 0 && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">₹{totals.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>₹{totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{editingOrder ? 'Update Order' : 'Create Order'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseOrderForm;
