'use client';

import React, { useMemo } from 'react';
import { Invoice } from '@/lib/services/invoices';

interface InvoiceDashboardProps {
  invoices: Invoice[];
  loading?: boolean;
}

const InvoiceDashboard: React.FC<InvoiceDashboardProps> = ({ invoices, loading = false }) => {
  // Calculate analytics
  const analytics = useMemo(() => {
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);
    const paidAmount = invoices.reduce((sum, invoice) => sum + invoice.paid_amount, 0);
    const outstandingAmount = invoices.reduce((sum, invoice) => sum + invoice.balance_amount, 0);
    const averageInvoiceValue = totalInvoices > 0 ? totalAmount / totalInvoices : 0;
    
    // Status breakdown
    const statusCounts = invoices.reduce((acc, invoice) => {
      acc[invoice.status] = (acc[invoice.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Revenue by status
    const revenueByStatus = invoices.reduce((acc, invoice) => {
      acc[invoice.status] = (acc[invoice.status] || 0) + invoice.total_amount;
      return acc;
    }, {} as Record<string, number>);

    // Recent invoices (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentInvoices = invoices.filter(invoice => 
      new Date(invoice.invoice_date) >= sevenDaysAgo
    );

    // Top customers by invoice value
    const customerRevenue = invoices.reduce((acc, invoice) => {
      acc[invoice.customer_name] = (acc[invoice.customer_name] || 0) + invoice.total_amount;
      return acc;
    }, {} as Record<string, number>);

    const topCustomers = Object.entries(customerRevenue)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Monthly revenue trend (last 6 months)
    const monthlyRevenue = invoices.reduce((acc, invoice) => {
      const date = new Date(invoice.invoice_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + invoice.total_amount;
      return acc;
    }, {} as Record<string, number>);

    // Payment collection rate
    const collectionRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

    // Overdue invoices
    const today = new Date();
    const overdueInvoices = invoices.filter(invoice => 
      invoice.status !== 'paid' && 
      invoice.status !== 'cancelled' && 
      new Date(invoice.due_date) < today
    );

    const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + invoice.balance_amount, 0);

    return {
      totalInvoices,
      totalAmount,
      paidAmount,
      outstandingAmount,
      averageInvoiceValue,
      statusCounts,
      revenueByStatus,
      recentInvoices: recentInvoices.length,
      topCustomers,
      monthlyRevenue,
      collectionRate,
      overdueInvoices: overdueInvoices.length,
      overdueAmount
    };
  }, [invoices]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalInvoices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Collection Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.collectionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overdueInvoices}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Invoiced:</span>
              <span className="font-semibold text-gray-900">${analytics.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Amount Paid:</span>
              <span className="font-semibold text-green-600">${analytics.paidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Outstanding:</span>
              <span className="font-semibold text-orange-600">${analytics.outstandingAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Overdue Amount:</span>
              <span className="font-semibold text-red-600">${analytics.overdueAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoices by Status</h3>
          <div className="space-y-3">
            {Object.entries(analytics.statusCounts).map(([status, count]) => {
              const percentage = analytics.totalInvoices > 0 ? (count / analytics.totalInvoices) * 100 : 0;
              const revenue = analytics.revenueByStatus[status] || 0;
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{count}</div>
                    <div className="text-xs text-gray-500">${revenue.toFixed(2)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Customers</h3>
          <div className="space-y-3">
            {analytics.topCustomers.map(([customer, revenue], index) => (
              <div key={customer} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-indigo-600">{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {customer}
                  </span>
                </div>
                <div className="text-sm font-bold text-gray-900">
                  ${revenue.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📄</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Recent Invoices</p>
                <p className="text-xs text-gray-500">Last 7 days</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">{analytics.recentInvoices}</div>
              <div className="text-xs text-gray-500">invoices</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Paid Invoices</p>
                <p className="text-xs text-gray-500">Total paid</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                {analytics.statusCounts.paid || 0}
              </div>
              <div className="text-xs text-gray-500">invoices</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⏰</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Pending Invoices</p>
                <p className="text-xs text-gray-500">Awaiting payment</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-orange-600">
                {(analytics.statusCounts.draft || 0) + (analytics.statusCounts.sent || 0)}
              </div>
              <div className="text-xs text-gray-500">invoices</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Draft Invoices</p>
              <p className="text-2xl font-bold">{analytics.statusCounts.draft || 0}</p>
            </div>
            <span className="text-3xl">📝</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Paid Invoices</p>
              <p className="text-2xl font-bold">{analytics.statusCounts.paid || 0}</p>
            </div>
            <span className="text-3xl">✅</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Sent Invoices</p>
              <p className="text-2xl font-bold">{analytics.statusCounts.sent || 0}</p>
            </div>
            <span className="text-3xl">📤</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Overdue Invoices</p>
              <p className="text-2xl font-bold">{analytics.overdueInvoices}</p>
            </div>
            <span className="text-3xl">⚠️</span>
          </div>
        </div>
      </div>

      {/* Payment Collection Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Collection Progress</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Collection Rate</span>
            <span className="font-semibold">{analytics.collectionRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(analytics.collectionRate, 100)}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="font-semibold text-green-800">${analytics.paidAmount.toFixed(2)}</div>
              <div className="text-green-600">Collected</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="font-semibold text-orange-800">${analytics.outstandingAmount.toFixed(2)}</div>
              <div className="text-orange-600">Outstanding</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDashboard;
