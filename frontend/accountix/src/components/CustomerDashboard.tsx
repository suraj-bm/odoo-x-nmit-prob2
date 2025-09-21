'use client';

import React, { useMemo } from 'react';
import { Contact } from '@/lib/services/contacts';

interface CustomerDashboardProps {
  customers: Contact[];
  loading?: boolean;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ customers, loading = false }) => {
  // Calculate analytics
  const analytics = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(customer => customer.is_active).length;
    const inactiveCustomers = totalCustomers - activeCustomers;
    
    // Contact type breakdown
    const typeCounts = customers.reduce((acc, customer) => {
      acc[customer.contact_type] = (acc[customer.contact_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Geographic distribution
    const cityCounts = customers.reduce((acc, customer) => {
      if (customer.city) {
        acc[customer.city] = (acc[customer.city] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const stateCounts = customers.reduce((acc, customer) => {
      if (customer.state) {
        acc[customer.state] = (acc[customer.state] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Top cities
    const topCities = Object.entries(cityCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Top states
    const topStates = Object.entries(stateCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Recent customers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCustomers = customers.filter(customer => 
      new Date(customer.created_at) >= thirtyDaysAgo
    );

    // Customers with tax information
    const customersWithGST = customers.filter(customer => customer.gst_number).length;
    const customersWithPAN = customers.filter(customer => customer.pan_number).length;

    // Contact completeness
    const customersWithPhone = customers.filter(customer => customer.phone).length;
    const customersWithAddress = customers.filter(customer => customer.address).length;

    return {
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      typeCounts,
      topCities,
      topStates,
      recentCustomers: recentCustomers.length,
      customersWithGST,
      customersWithPAN,
      customersWithPhone,
      customersWithAddress,
      completenessRate: totalCustomers > 0 ? 
        ((customersWithPhone + customersWithAddress) / (totalCustomers * 2)) * 100 : 0
    };
  }, [customers]);

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
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.activeCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Data Completeness</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.completenessRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">🆕</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New This Month</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.recentCustomers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Types */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Types</h3>
          <div className="space-y-3">
            {Object.entries(analytics.typeCounts).map(([type, count]) => {
              const percentage = analytics.totalCustomers > 0 ? (count / analytics.totalCustomers) * 100 : 0;
              
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      type === 'customer' ? 'bg-blue-500' :
                      type === 'vendor' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {type === 'customer' ? '👤 Customers' :
                       type === 'vendor' ? '🏪 Vendors' :
                       '🔄 Both'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{count}</div>
                    <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Cities</h3>
          <div className="space-y-3">
            {analytics.topCities.map(([city, count], index) => (
              <div key={city} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-indigo-600">{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {city}
                  </span>
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Quality */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Quality Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{analytics.customersWithPhone}</div>
            <div className="text-sm text-blue-600">With Phone</div>
            <div className="text-xs text-gray-500">
              {analytics.totalCustomers > 0 ? 
                ((analytics.customersWithPhone / analytics.totalCustomers) * 100).toFixed(1) : 0}%
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{analytics.customersWithAddress}</div>
            <div className="text-sm text-green-600">With Address</div>
            <div className="text-xs text-gray-500">
              {analytics.totalCustomers > 0 ? 
                ((analytics.customersWithAddress / analytics.totalCustomers) * 100).toFixed(1) : 0}%
            </div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{analytics.customersWithGST}</div>
            <div className="text-sm text-purple-600">With GST</div>
            <div className="text-xs text-gray-500">
              {analytics.totalCustomers > 0 ? 
                ((analytics.customersWithGST / analytics.totalCustomers) * 100).toFixed(1) : 0}%
            </div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{analytics.customersWithPAN}</div>
            <div className="text-sm text-orange-600">With PAN</div>
            <div className="text-xs text-gray-500">
              {analytics.totalCustomers > 0 ? 
                ((analytics.customersWithPAN / analytics.totalCustomers) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🆕</span>
              <div>
                <p className="text-sm font-medium text-gray-900">New Customers</p>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">{analytics.recentCustomers}</div>
              <div className="text-xs text-gray-500">customers</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Active Customers</p>
                <p className="text-xs text-gray-500">Currently active</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">{analytics.activeCustomers}</div>
              <div className="text-xs text-gray-500">customers</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">❌</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Inactive Customers</p>
                <p className="text-xs text-gray-500">Need attention</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-orange-600">{analytics.inactiveCustomers}</div>
              <div className="text-xs text-gray-500">customers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Customers</p>
              <p className="text-2xl font-bold">{analytics.totalCustomers}</p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Rate</p>
              <p className="text-2xl font-bold">
                {analytics.totalCustomers > 0 ? 
                  ((analytics.activeCustomers / analytics.totalCustomers) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <span className="text-3xl">📈</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Data Quality</p>
              <p className="text-2xl font-bold">{analytics.completenessRate.toFixed(1)}%</p>
            </div>
            <span className="text-3xl">📊</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">New This Month</p>
              <p className="text-2xl font-bold">{analytics.recentCustomers}</p>
            </div>
            <span className="text-3xl">🆕</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
