'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- Sidebar Component ---
interface SidebarProps {
  activePage: 'dashboard' | 'contacts' | 'products' | 'taxes' | 'accounts' | 'purchases' | 'sales' | 'reports';
}

const Sidebar: React.FC<SidebarProps> = ({ activePage }) => {
  const getLinkClassName = (page: SidebarProps['activePage']) => {
    return `flex items-center px-4 py-2.5 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${
      activePage === page ? 'bg-indigo-50 text-indigo-600' : ''
    }`;
  };

  return (
    <aside className="w-64 bg-white shadow-sm flex flex-col h-full">
      <div className="p-6 text-2xl font-bold text-gray-800 border-b">
        Shiv Accounts
      </div>
      <nav className="flex-1 px-4 py-6 space-y-4">
        <div>
          <span className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</span>
          <div className="mt-2 space-y-1">
            <a href="/" className={getLinkClassName('dashboard')}>
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              Dashboard
            </a>
             <a href="/contact" className={getLinkClassName('contacts')}>
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0112 13a5.995 5.995 0 013 5.197M15 21a6 6 0 00-9-5.197" /></svg>
              Contacts
            </a>
          </div>
        </div>
        <div>
           <span className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transactions</span>
           <div className="mt-2 space-y-1">
             <a href="/products" className={getLinkClassName('products')}>
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              Products
            </a>
            <a href="/purchases" className={getLinkClassName('purchases')}>
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              Purchases
            </a>
            <a href="/sales" className={getLinkClassName('sales')}>
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              Sales
            </a>
           </div>
        </div>
        <div>
           <span className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Configuration</span>
            <div className="mt-2 space-y-1">
              <a href="/taxes" className={getLinkClassName('taxes')}>
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
                Taxes
              </a>
              <a href="/accounts" className={getLinkClassName('accounts')}>
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Chart of Accounts
              </a>
               <a href="/reports" className={getLinkClassName('reports')}>
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                Reports
              </a>
            </div>
        </div>
      </nav>
      <div className="p-4 border-t">
          <div className="flex items-center">
              <img className="w-10 h-10 rounded-full" src="https://i.pravatar.cc/150?u=a042581f4e29026704a" alt="User Avatar" />
              <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800">Admin User</p>
                  <p className="text-xs text-gray-500">admin@shiv.com</p>
              </div>
          </div>
      </div>
    </aside>
  );
};


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
            <Sidebar activePage="dashboard" />

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

