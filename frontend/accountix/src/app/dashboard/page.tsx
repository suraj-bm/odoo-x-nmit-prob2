'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- Sidebar Component ---


// --- Dashboard Page Component ---
const kpiData = {
    totalRevenue: 45231.89,
    totalExpenses: 21754.32,
    netProfit: 23477.57,
    newCustomers: 23,
};

const revenueExpenseData = [
    { name: 'Jan', revenue: 4000, expenses: 2400 },
    { name: 'Feb', revenue: 3000, expenses: 1398 },
    { name: 'Mar', revenue: 5000, expenses: 3800 },
    { name: 'Apr', revenue: 4780, expenses: 3908 },
    { name: 'May', revenue: 5890, expenses: 4800 },
    { name: 'Jun', revenue: 4390, expenses: 3800 },
];

const salesByCategoryData = [
    { name: 'Office Chairs', value: 400 },
    { name: 'Wooden Tables', value: 300 },
    { name: 'Sofas', value: 300 },
    { name: 'Dining Tables', value: 200 },
];

const COLORS = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'];

const recentTransactions = [
    { id: 'TXN001', type: 'Sale', amount: 1250.00, status: 'Completed', date: '2023-10-26' },
    { id: 'TXN002', type: 'Purchase', amount: 780.50, status: 'Completed', date: '2023-10-25' },
    { id: 'TXN003', type: 'Sale', amount: 3200.00, status: 'Pending', date: '2023-10-25' },
    { id: 'TXN004', type: 'Expense', amount: 150.00, status: 'Completed', date: '2023-10-24' },
    { id: 'TXN005', type: 'Sale', amount: 890.75, status: 'Completed', date: '2023-10-23' },
];

const DashboardPage = () => {
    return (
        <div className="flex h-screen bg-gray-50 font-sans">

            {/* Main content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="pb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-600">Welcome back, Admin!</p>
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
                                <Pie data={salesByCategoryData} cx="50%" cy="50%" labelLine={false} outerRadius={110} fill="#8884d8" dataKey="value">
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
                                {recentTransactions.map((txn, index) => (
                                    <tr key={txn.id} className={index % 2 === 0 ? '' : 'bg-gray-50'}>
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

