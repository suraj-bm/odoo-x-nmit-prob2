'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import Sidebar from '@/components/sidebar';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';

// Color palette for PieChart
const COLORS = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'];

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
}

interface Transaction {
  id: number | string;
  type: string;
  amount: number;
  status: string;
  date: string;
}

interface SalesCategory {
  name: string;
  value: number;
}

const DashboardPage = () => {
  const router = useRouter();

  const [kpiData, setKpiData] = useState<KpiData>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    newCustomers: 0,
  });

  const [revenueExpenseData, setRevenueExpenseData] = useState<RevenueExpenseData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [salesByCategoryData, setSalesByCategoryData] = useState<SalesCategory[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/loginpage');
      return;
    }

    const api = axios.create({
      baseURL: 'http://localhost:8000/api/transactions/',
      headers: { Authorization: `Bearer ${token}` },
    });

    // Fetch KPI
    const fetchKpi = async () => {
      try {
        const res = await api.get<KpiData>('dashboard/kpi/');
        setKpiData(res.data);
      } catch (err) {
        handleError(err);
      }
    };

    // Fetch Revenue vs Expenses
    const fetchRevenueExpense = async () => {
      try {
        const res = await api.get<RevenueExpenseData[]>('dashboard/revenue-expense/');
        setRevenueExpenseData(res.data);
      } catch (err) {
        handleError(err);
      }
    };

    // Fetch Recent Transactions
    const fetchRecentTransactions = async () => {
      try {
        const res = await api.get<Transaction[]>('dashboard/recent-transactions/');
        setRecentTransactions(res.data);
      } catch (err) {
        handleError(err);
      }
    };

    // Fetch Sales by Category dynamically from products API (optional)
    const fetchSalesByCategory = async () => {
      try {
        const res = await api.get<SalesCategory[]>('dashboard/sales-by-category/');
        setSalesByCategoryData(res.data);
      } catch {
        // fallback to default categories if API fails
        setSalesByCategoryData([
          { name: 'Office Chairs', value: 0 },
          { name: 'Wooden Tables', value: 0 },
          { name: 'Sofas', value: 0 },
          { name: 'Dining Tables', value: 0 },
        ]);
      }
    };

    const handleError = (err: unknown) => {
      if (axios.isAxiosError(err)) {
        console.error('API Error:', err.response?.data || err.message);
        if (err.response?.status === 401) router.push('/loginpage');
      } else {
        console.error('Unexpected Error:', err);
      }
    };

    fetchKpi();
    fetchRevenueExpense();
    fetchRecentTransactions();
    fetchSalesByCategory();
  }, [router]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar activePage="dashboard" />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="pb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Welcome back!</p>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">${kpiData.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">${kpiData.totalExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Net Profit</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">${kpiData.netProfit.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">New Customers</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{kpiData.newCustomers}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-4">Revenue vs Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueExpenseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#6366F1" />
                <Bar dataKey="expenses" fill="#F472B6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-4">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesByCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {salesByCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Recent Transactions</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {recentTransactions.map((txn) => (
                  <tr key={txn.id} className={Number(txn.id) % 2 === 0 ? '' : 'bg-gray-50'}>
                    <td className="py-4 px-4 font-medium">{txn.id}</td>
                    <td className="py-4 px-4">{txn.type}</td>
                    <td className="py-4 px-4">${txn.amount.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        txn.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">{txn.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

export default DashboardPage;
