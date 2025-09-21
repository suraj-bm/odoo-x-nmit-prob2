'use client';

import React, { useMemo } from 'react';

interface SalesOrder {
  id: number;
  so_number: string;
  customer_name: string;
  status: 'draft' | 'confirmed' | 'partially_delivered' | 'delivered' | 'cancelled';
  so_date: string;
  total_amount: number;
  has_invoice?: boolean;
}

interface SalesDashboardProps {
  salesOrders: SalesOrder[];
  loading?: boolean;
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({ salesOrders, loading = false }) => {
  // Calculate analytics
  const analytics = useMemo(() => {
    const totalOrders = salesOrders.length;
    const totalRevenue = salesOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Status breakdown
    const statusCounts = salesOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Revenue by status
    const revenueByStatus = salesOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + order.total_amount;
      return acc;
    }, {} as Record<string, number>);

    // Recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOrders = salesOrders.filter(order => 
      new Date(order.so_date) >= sevenDaysAgo
    );

    // Top customers by revenue
    const customerRevenue = salesOrders.reduce((acc, order) => {
      acc[order.customer_name] = (acc[order.customer_name] || 0) + order.total_amount;
      return acc;
    }, {} as Record<string, number>);

    const topCustomers = Object.entries(customerRevenue)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Monthly revenue trend (last 6 months)
    const monthlyRevenue = salesOrders.reduce((acc, order) => {
      const date = new Date(order.so_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + order.total_amount;
      return acc;
    }, {} as Record<string, number>);

    // Invoice conversion rate
    const ordersWithInvoices = salesOrders.filter(order => order.has_invoice).length;
    const invoiceConversionRate = totalOrders > 0 ? (ordersWithInvoices / totalOrders) * 100 : 0;

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      statusCounts,
      revenueByStatus,
      recentOrders: recentOrders.length,
      topCustomers,
      monthlyRevenue,
      invoiceConversionRate,
      ordersWithInvoices
    };
  }, [salesOrders]);

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
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
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
              <p className="text-2xl font-bold text-gray-900">${analytics.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Order Value</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.averageOrderValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">📄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Invoice Conversion</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.invoiceConversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {Object.entries(analytics.statusCounts).map(([status, count]) => {
              const percentage = analytics.totalOrders > 0 ? (count / analytics.totalOrders) * 100 : 0;
              const revenue = analytics.revenueByStatus[status] || 0;
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {status.replace('_', ' ')}
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

        {/* Top Customers */}
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
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📊</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Recent Orders</p>
                <p className="text-xs text-gray-500">Last 7 days</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">{analytics.recentOrders}</div>
              <div className="text-xs text-gray-500">orders</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📄</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Invoices Generated</p>
                <p className="text-xs text-gray-500">Total invoices</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">{analytics.ordersWithInvoices}</div>
              <div className="text-xs text-gray-500">invoices</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Draft Orders</p>
              <p className="text-2xl font-bold">{analytics.statusCounts.draft || 0}</p>
            </div>
            <span className="text-3xl">📝</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Delivered Orders</p>
              <p className="text-2xl font-bold">{analytics.statusCounts.delivered || 0}</p>
            </div>
            <span className="text-3xl">📦</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Confirmed Orders</p>
              <p className="text-2xl font-bold">{analytics.statusCounts.confirmed || 0}</p>
            </div>
            <span className="text-3xl">✅</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
