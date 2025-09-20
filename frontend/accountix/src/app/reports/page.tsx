'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/sidebar';
import axios from 'axios';

interface BalanceSheetItem {
  name: string;
  amount: number;
}

interface InventoryItem {
  name: string;
  purchased: number;
  sold: number;
}

const ReportsPage = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [balanceAssets, setBalanceAssets] = useState<BalanceSheetItem[]>([]);
  const [balanceLiabilities, setBalanceLiabilities] = useState<BalanceSheetItem[]>([]);
  const [income, setIncome] = useState<number>(0);
  const [expenses, setExpenses] = useState<number>(0);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('accessToken');
  const api = axios.create({
    baseURL: 'http://localhost:8000/api/reports/',
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchReports = async () => {
    if (!startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Fetch balance sheet
      const balanceRes = await api.get('balance-sheet/', {
        params: { start_date: startDate, end_date: endDate },
      });
      setBalanceAssets(balanceRes.data.assets || []);
      setBalanceLiabilities(balanceRes.data.liabilities || []);

      // Fetch P&L
      const plRes = await api.get('profit-loss/', {
        params: { start_date: startDate, end_date: endDate },
      });
      setIncome(plRes.data.income || 0);
      setExpenses(plRes.data.expenses || 0);

      // Fetch inventory
      const inventoryRes = await api.get('inventory/', {
        params: { as_of: endDate },
      });
      setInventory(inventoryRes.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const totalAssets = balanceAssets.reduce((acc, item) => acc + item.amount, 0);
  const totalLiabilities = balanceLiabilities.reduce((acc, item) => acc + item.amount, 0);
  const netProfit = income - expenses;

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar activePage="reports" />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="pb-6">
          <h1 className="text-3xl font-bold text-gray-800">Financial Reports</h1>
          <p className="text-gray-600">Review your company's financial performance.</p>
        </header>

        {/* Filters */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow-sm flex items-center space-x-4">
          <label className="font-semibold text-gray-700">Reporting Period:</label>
          <input
            type="date"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <span className="text-gray-600">to</span>
          <input
            type="date"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
          <button
            className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            onClick={fetchReports}
          >
            Generate
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="space-y-8">
            {/* Balance Sheet */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-700">Balance Sheet</h2>
                <p className="text-sm text-gray-500">As of {endDate || 'N/A'}</p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Assets</h3>
                  <div className="space-y-2 text-gray-700">
                    {balanceAssets.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{item.name}</span>
                        <span>${item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                      <span>Total Assets</span>
                      <span>${totalAssets.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Liabilities & Equity</h3>
                  <div className="space-y-2 text-gray-700">
                    {balanceLiabilities.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{item.name}</span>
                        <span>${item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                      <span>Total Liabilities & Equity</span>
                      <span>${totalLiabilities.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profit & Loss */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-700">Profit & Loss Statement</h2>
                <p className="text-sm text-gray-500">For the period ending {endDate || 'N/A'}</p>
              </div>
              <div className="p-6">
                <div className="space-y-3 text-gray-700">
                  <h4 className="font-semibold text-gray-800">Income</h4>
                  <div className="flex justify-between pl-4 font-bold border-t pt-2">
                    <span>Total Income</span>
                    <span>${income.toFixed(2)}</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mt-4">Expenses</h4>
                  <div className="flex justify-between pl-4 font-bold border-t pt-2">
                    <span>Total Expenses</span>
                    <span>${expenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-4 pt-3 border-t-2 border-gray-800">
                    <span>Net Profit</span>
                    <span className={`font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${netProfit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-700">Inventory Report</h2>
                <p className="text-sm text-gray-500">Current stock levels</p>
              </div>
              <div className="p-6">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-600 bg-gray-50">
                      <th className="py-3 px-4 font-semibold">Product Name</th>
                      <th className="py-3 px-4 font-semibold">Purchased Qty</th>
                      <th className="py-3 px-4 font-semibold">Sales Qty</th>
                      <th className="py-3 px-4 font-semibold">Available Stock</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {inventory.map((item, i) => (
                      <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium">{item.name}</td>
                        <td className="py-4 px-4">{item.purchased}</td>
                        <td className="py-4 px-4">{item.sold}</td>
                        <td className="py-4 px-4 font-bold">{item.purchased - item.sold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReportsPage;
