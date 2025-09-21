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

interface SalesOrder {
  id: number;
  so_number: string;
  customer: number;
  customer_name: string;
  total_amount: number;
  status: string;
}

interface InvoiceItem {
  id?: number;
  product_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  tax_amount: number;
  line_total: number;
}

interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: any) => void;
  editingInvoice?: any;
  customers: Customer[];
  salesOrders: SalesOrder[];
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editingInvoice,
  customers,
  salesOrders
}) => {
  const [formData, setFormData] = useState({
    customer: '',
    sales_order: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'draft',
    notes: '',
    items: [] as InvoiceItem[],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSalesOrderModal, setShowSalesOrderModal] = useState(false);

  // Calculate totals
  const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const taxAmount = formData.items.reduce((sum, item) => sum + item.tax_amount, 0);
  const total = subtotal + taxAmount;

  // Initialize form with editing invoice data
  useEffect(() => {
    if (editingInvoice) {
      setFormData({
        customer: editingInvoice.customer.toString(),
        sales_order: editingInvoice.sales_order?.toString() || '',
        invoice_date: editingInvoice.invoice_date,
        due_date: editingInvoice.due_date,
        status: editingInvoice.status,
        notes: editingInvoice.notes || '',
        items: editingInvoice.items || [],
      });
    } else {
      setFormData({
        customer: '',
        sales_order: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        status: 'draft',
        notes: '',
        items: [],
      });
    }
    setErrors({});
  }, [editingInvoice, isOpen]);

  // Auto-set due date when invoice date changes
  useEffect(() => {
    if (formData.invoice_date && !formData.due_date) {
      const invoiceDate = new Date(formData.invoice_date);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30); // 30 days from invoice date
      setFormData(prev => ({ ...prev, due_date: dueDate.toISOString().split('T')[0] }));
    }
  }, [formData.invoice_date]);

  // Load sales order data when selected
  const loadSalesOrderData = useCallback((salesOrderId: string) => {
    const salesOrder = salesOrders.find(so => so.id === parseInt(salesOrderId));
    if (salesOrder) {
      setFormData(prev => ({
        ...prev,
        customer: salesOrder.customer.toString(),
        items: [{
          product_name: `Sales Order ${salesOrder.so_number}`,
          description: `Items from Sales Order ${salesOrder.so_number}`,
          quantity: 1,
          unit_price: salesOrder.total_amount,
          tax_rate: 0,
          tax_amount: 0,
          line_total: salesOrder.total_amount,
        }]
      }));
    }
  }, [salesOrders]);

  // Add item to invoice
  const addItem = () => {
    const newItem: InvoiceItem = {
      product_name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_rate: 0,
      tax_amount: 0,
      line_total: 0,
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  // Update item
  const updateItem = useCallback((index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Recalculate line total
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].line_total = updatedItems[index].quantity * updatedItems[index].unit_price;
    }

    // Recalculate tax
    if (field === 'tax_rate') {
      updatedItems[index].tax_amount = (updatedItems[index].line_total * value) / 100;
    }

    setFormData(prev => ({ ...prev, items: updatedItems }));
  }, [formData.items]);

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

    if (!formData.invoice_date) {
      newErrors.invoice_date = 'Invoice date is required';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    formData.items.forEach((item, index) => {
      if (!item.product_name.trim()) {
        newErrors[`item_${index}_product_name`] = 'Product name is required';
      }
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

      const invoiceData = {
        customer: parseInt(formData.customer),
        sales_order: formData.sales_order ? parseInt(formData.sales_order) : null,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date,
        status: formData.status,
        notes: formData.notes || null,
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_amount: total,
        balance_amount: total,
        items: formData.items.map(item => ({
          product_name: item.product_name,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate,
          tax_amount: item.tax_amount,
          line_total: item.line_total,
        })),
      };

      let response;
      if (editingInvoice) {
        response = await apiClient.put(`/transactions/customer-invoices/${editingInvoice.id}/`, invoiceData);
      } else {
        response = await apiClient.post('/transactions/customer-invoices/', invoiceData);
      }

      onSave(response);
      onClose();
    } catch (error) {
      console.error('Failed to save invoice:', error);
      setErrors({ submit: 'Failed to save invoice. Please try again.' });
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
            {editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                Sales Order
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.sales_order}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, sales_order: e.target.value }));
                    if (e.target.value) {
                      loadSalesOrderData(e.target.value);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Sales Order</option>
                  {salesOrders
                    .filter(so => so.customer === parseInt(formData.customer) || !formData.customer)
                    .map(order => (
                      <option key={order.id} value={order.id}>
                        {order.so_number} - ${order.total_amount.toFixed(2)}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowSalesOrderModal(true)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  title="View Sales Orders"
                >
                  📋
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Date *
              </label>
              <input
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData(prev => ({ ...prev, invoice_date: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.invoice_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.invoice_date && <p className="text-red-500 text-sm mt-1">{errors.invoice_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.due_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.due_date && <p className="text-red-500 text-sm mt-1">{errors.due_date}</p>}
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
              <h3 className="text-lg font-semibold text-gray-800">Invoice Items</h3>
              <button
                type="button"
                onClick={addItem}
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
                        Product/Service
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax Rate %
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
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={item.product_name}
                            onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                            className={`w-full px-2 py-1 border rounded text-sm ${
                              errors[`item_${index}_product_name`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Product or service name"
                          />
                          {errors[`item_${index}_product_name`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_product_name`]}</p>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Description"
                          />
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
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.tax_rate}
                            onChange={(e) => updateItem(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
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
            {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
          </button>
        </div>

        {/* Sales Order Modal */}
        {showSalesOrderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Select Sales Order</h3>
                <button
                  onClick={() => setShowSalesOrderModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {salesOrders
                    .filter(so => so.customer === parseInt(formData.customer) || !formData.customer)
                    .map(order => (
                      <div
                        key={order.id}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, sales_order: order.id.toString() }));
                          loadSalesOrderData(order.id.toString());
                          setShowSalesOrderModal(false);
                        }}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{order.so_number}</div>
                          <div className="text-sm text-gray-500">Customer: {order.customer_name}</div>
                          <div className="text-sm text-gray-500">Status: {order.status}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">${order.total_amount.toFixed(2)}</div>
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

export default InvoiceForm;
