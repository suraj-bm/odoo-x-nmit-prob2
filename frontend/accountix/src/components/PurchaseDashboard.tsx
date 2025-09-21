'use client';

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';

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
  items: any[];
  created_at: string;
  updated_at: string;
}

interface PurchaseDashboardProps {
  purchaseOrders: PurchaseOrder[];
  loading: boolean;
}

const PurchaseDashboard: React.FC<PurchaseDashboardProps> = ({ purchaseOrders, loading }) => {
  // Helper function to format large numbers
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₹${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  // Calculate analytics data
  const analytics = React.useMemo(() => {
    const totalAmount = purchaseOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const totalOrders = purchaseOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

    // Status distribution
    const statusCounts = purchaseOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Payment status distribution
    const paymentStatusCounts = purchaseOrders.reduce((acc, order) => {
      acc[order.payment_status] = (acc[order.payment_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly spending
    const monthlyData = purchaseOrders.reduce((acc, order) => {
      const month = new Date(order.po_date).toLocaleDateString('en-US', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { month, amount: 0, count: 0 };
      }
      acc[month].amount += order.total_amount;
      acc[month].count += 1;
      return acc;
    }, {} as Record<string, { month: string; amount: number; count: number }>);

    // Vendor performance
    const vendorData = purchaseOrders.reduce((acc, order) => {
      if (!acc[order.vendor]) {
        acc[order.vendor] = { vendor: order.vendor, amount: 0, count: 0 };
      }
      acc[order.vendor].amount += order.total_amount;
      acc[order.vendor].count += 1;
      return acc;
    }, {} as Record<string, { vendor: string; amount: number; count: number }>);

    // Recent orders
    const recentOrders = [...purchaseOrders]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    return {
      totalAmount,
      totalOrders,
      averageOrderValue,
      statusCounts,
      paymentStatusCounts,
      monthlyData: Object.values(monthlyData),
      vendorData: Object.values(vendorData).sort((a, b) => b.amount - a.amount).slice(0, 5),
      recentOrders
    };
  }, [purchaseOrders]);

  const statusColors = {
    draft: '#6B7280',
    sent: '#3B82F6',
    confirmed: '#F59E0B',
    received: '#10B981',
    cancelled: '#EF4444'
  };

  const paymentStatusColors = {
    unpaid: '#EF4444',
    partial: '#F59E0B',
    paid: '#10B981'
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 truncate" title={`₹${analytics.totalAmount.toLocaleString()}`}>
                {formatCurrency(analytics.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 truncate" title={`₹${analytics.averageOrderValue.toLocaleString()}`}>
                {formatCurrency(analytics.averageOrderValue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">
                {analytics.statusCounts.draft + analytics.statusCounts.sent + analytics.statusCounts.confirmed || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
              <Area type="monotone" dataKey="amount" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(analytics.statusCounts).map(([status, count]) => ({
                  name: status.charAt(0).toUpperCase() + status.slice(1),
                  value: count,
                  color: statusColors[status as keyof typeof statusColors]
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.entries(analytics.statusCounts).map(([status, count], index) => (
                  <Cell key={`cell-${index}`} fill={statusColors[status as keyof typeof statusColors]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vendor Performance & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Vendors */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Vendors by Spending</h3>
          <div className="space-y-4">
            {analytics.vendorData.map((vendor, index) => (
              <div key={vendor.vendor} className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-medium text-indigo-600 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate" title={vendor.vendor}>
                      {vendor.vendor}
                    </p>
                    <p className="text-sm text-gray-500">{vendor.count} orders</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-sm font-medium text-gray-900" title={`₹${vendor.amount.toLocaleString()}`}>
                    {formatCurrency(vendor.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-4">
            {analytics.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">PO-{order.id}</p>
                  <p className="text-sm text-gray-500 truncate" title={order.vendor}>
                    {order.vendor}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-sm font-medium text-gray-900" title={`₹${order.total_amount.toLocaleString()}`}>
                    {formatCurrency(order.total_amount)}
                  </p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    order.status === 'received' ? 'bg-green-100 text-green-800' :
                    order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Status Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(analytics.paymentStatusCounts).map(([status, count]) => (
            <div key={status} className="text-center">
              <div className="text-3xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-500 capitalize">{status} Orders</div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(count / analytics.totalOrders) * 100}%`,
                      backgroundColor: paymentStatusColors[status as keyof typeof paymentStatusColors]
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PurchaseDashboard;
