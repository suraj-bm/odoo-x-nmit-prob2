'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import Sidebar from '@/components/sidebar';
import MobileNav from '@/components/MobileNav';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import axios, { AxiosError } from 'axios';

// Color palette for charts
const COLORS = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF', '#F3F4F6'];

interface KpiData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  newCustomers: number;
}

interface RevenueExpenseData {
  name: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface Transaction {
  id: number | string;
  type: string;
  amount: number;
  status: string;
  date: string;
  customer?: string;
}

interface SalesCategory {
  name: string;
  value: number;
  color?: string;
  [key: string]: string | number | undefined;
}

const DashboardPage = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Core data state
  const [kpiData, setKpiData] = useState<KpiData>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    newCustomers: 0,
  });
  const [revenueExpenseData, setRevenueExpenseData] = useState<RevenueExpenseData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [salesByCategoryData, setSalesByCategoryData] = useState<SalesCategory[]>([]);
  
  // Live dashboard features
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockKpiData: KpiData = {
    totalRevenue: 125000,
    totalExpenses: 75000,
    netProfit: 50000,
    newCustomers: 24,
  };

  const mockRevenueExpenseData: RevenueExpenseData[] = [
    { name: 'Jan', revenue: 12000, expenses: 8000, profit: 4000 },
    { name: 'Feb', revenue: 15000, expenses: 9000, profit: 6000 },
    { name: 'Mar', revenue: 18000, expenses: 10000, profit: 8000 },
    { name: 'Apr', revenue: 22000, expenses: 12000, profit: 10000 },
    { name: 'May', revenue: 25000, expenses: 14000, profit: 11000 },
    { name: 'Jun', revenue: 28000, expenses: 15000, profit: 13000 },
  ];

  const mockRecentTransactions: Transaction[] = [
    { id: 1, type: 'Sale', amount: 2500, status: 'completed', date: '2024-01-15', customer: 'ABC Corp' },
    { id: 2, type: 'Purchase', amount: -1200, status: 'pending', date: '2024-01-14', customer: 'XYZ Ltd' },
    { id: 3, type: 'Sale', amount: 3500, status: 'completed', date: '2024-01-13', customer: 'DEF Inc' },
    { id: 4, type: 'Refund', amount: -500, status: 'completed', date: '2024-01-12', customer: 'GHI Co' },
    { id: 5, type: 'Sale', amount: 1800, status: 'processing', date: '2024-01-11', customer: 'JKL Ltd' },
  ];

  const mockSalesByCategory: SalesCategory[] = [
    { name: 'Electronics', value: 35, color: '#6366F1' },
    { name: 'Clothing', value: 25, color: '#818CF8' },
    { name: 'Books', value: 20, color: '#A5B4FC' },
    { name: 'Home & Garden', value: 15, color: '#C7D2FE' },
    { name: 'Sports', value: 5, color: '#E0E7FF' },
  ];

  // Optimized data fetching with caching and error handling
  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setConnectionStatus('reconnecting');
      const token = localStorage.getItem('auth_token') || localStorage.getItem('accessToken');
      
      if (!token) {
        // Use mock data if no token
        setKpiData(mockKpiData);
        setRevenueExpenseData(mockRevenueExpenseData);
        setRecentTransactions(mockRecentTransactions);
        setSalesByCategoryData(mockSalesByCategory);
        setLastUpdated(new Date());
        setConnectionStatus('connected');
        return;
      }

      const api = axios.create({
        baseURL: 'http://localhost:8000/api/',
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch all data in parallel for better performance
      const [kpiRes, revenueRes, transactionsRes, salesRes] = await Promise.allSettled([
        api.get('/transactions/dashboard/kpi/'),
        api.get('/transactions/dashboard/revenue-expense/'),
        api.get('/transactions/dashboard/recent-transactions/'),
        api.get('/transactions/dashboard/sales-by-category/')
      ]);

      // Update KPI data
      if (kpiRes.status === 'fulfilled') {
        setKpiData(kpiRes.value.data);
      } else {
        setKpiData(mockKpiData);
      }

      // Update revenue/expense data
      if (revenueRes.status === 'fulfilled') {
        setRevenueExpenseData(revenueRes.value.data);
      } else {
        setRevenueExpenseData(mockRevenueExpenseData);
      }

      // Update recent transactions
      if (transactionsRes.status === 'fulfilled') {
        setRecentTransactions(transactionsRes.value.data);
      } else {
        setRecentTransactions(mockRecentTransactions);
      }

      // Update sales by category
      if (salesRes.status === 'fulfilled') {
        setSalesByCategoryData(salesRes.value.data);
      } else {
        setSalesByCategoryData(mockSalesByCategory);
      }

      setLastUpdated(new Date());
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setConnectionStatus('disconnected');
      // Fallback to mock data
      setKpiData(mockKpiData);
      setRevenueExpenseData(mockRevenueExpenseData);
      setRecentTransactions(mockRecentTransactions);
      setSalesByCategoryData(mockSalesByCategory);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Real-time updates with interval
  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial fetch
    fetchDashboardData();

    // Set up live updates if enabled
    let interval: NodeJS.Timeout;
    if (isLive) {
      interval = setInterval(() => {
        fetchDashboardData();
      }, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated, isLive, refreshInterval, fetchDashboardData]);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/loginpage');
    }
  }, [isAuthenticated, authLoading, router]);

  // Memoized components for better performance
  const KpiCard = useMemo(() => ({ title, value, change, icon }: any) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className="text-3xl text-indigo-600">{icon}</div>
      </div>
    </div>
  ), []);

  const ConnectionStatus = useMemo(() => () => (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${
        connectionStatus === 'connected' ? 'bg-green-500' : 
        connectionStatus === 'reconnecting' ? 'bg-yellow-500' : 'bg-red-500'
      }`} />
      <span className="text-gray-600">
        {connectionStatus === 'connected' ? 'Live' : 
         connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Disconnected'}
      </span>
      <span className="text-gray-400">•</span>
      <span className="text-gray-500">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </span>
    </div>
  ), [connectionStatus, lastUpdated]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activePage="dashboard" />
      <div className="flex-1 flex flex-col">
        <MobileNav activePage="dashboard" />
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Real-time business insights and analytics</p>
              </div>
              <div className="flex items-center space-x-4">
                <ConnectionStatus />
                <div className="flex items-center space-x-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isLive}
                      onChange={(e) => setIsLive(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Live Updates</span>
                  </label>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                    disabled={!isLive}
                  >
                    <option value={10000}>10s</option>
                    <option value={30000}>30s</option>
                    <option value={60000}>1m</option>
                    <option value={300000}>5m</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KpiCard
              title="Total Revenue"
              value={`$${kpiData.totalRevenue.toLocaleString()}`}
              change={12.5}
              icon="💰"
            />
            <KpiCard
              title="Total Expenses"
              value={`$${kpiData.totalExpenses.toLocaleString()}`}
              change={-2.3}
              icon="💸"
            />
            <KpiCard
              title="Net Profit"
              value={`$${kpiData.netProfit.toLocaleString()}`}
              change={18.7}
              icon="📈"
            />
            <KpiCard
              title="New Customers"
              value={kpiData.newCustomers}
              change={8.2}
              icon="👥"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue vs Expenses Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Expenses</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#6366F1" fill="#6366F1" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="expenses" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Sales by Category */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={salesByCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {salesByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.type === 'Sale' ? 'bg-green-100 text-green-800' :
                          transaction.type === 'Purchase' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.customer || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;