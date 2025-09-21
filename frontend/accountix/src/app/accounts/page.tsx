'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/sidebar';
import axios from 'axios';

interface Account {
  id: number;
  name: string;
  code: string;
  account_type: string;
  parent_category: string;
  description?: string;
  is_active: boolean;
}

const ChartOfAccountsPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    code: '',
    account_type: 'asset',
    parent_category: 'current_assets',
    description: '',
    is_active: true,
  });

  const token = localStorage.getItem('accessToken');
interface APIResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: Account[];
}
  const fetchAccounts = async () => {
  setLoading(true);
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/master/chart-of-accounts/', {
      headers: { Authorization: `Bearer ${token}` },
    });

    // If paginated, use res.data.results, else fallback to res.data
    setAccounts(Array.isArray(res.data) ? res.data : res.data.results || []);
  } catch (err: any) {
    console.error(err);
    setError('Failed to fetch accounts');
  } finally {
    setLoading(false);
  }
};

  const handleAddAccount = async () => {
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/api/master/chart-of-accounts/',
        newAccount,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAccounts((prev) => [...prev, res.data]);
      setShowModal(false);
      setNewAccount({
        name: '',
        code: '',
        account_type: 'asset',
        parent_category: 'current_assets',
        description: '',
        is_active: true,
      });
    } catch (err) {
      console.error(err);
      setError('Failed to add account');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/master/chart-of-accounts/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete account');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar activePage="chart-of-accounts" />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Chart of Accounts</h1>
            <p className="text-gray-600">Manage your company's accounts.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700"
          >
            Add Account
          </button>
        </header>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-6 py-3 border-b">Code</th>
                <th className="px-6 py-3 border-b">Name</th>
                <th className="px-6 py-3 border-b">Type</th>
                <th className="px-6 py-3 border-b">Parent</th>
                <th className="px-6 py-3 border-b">Active</th>
                <th className="px-6 py-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">{a.code}</td>
                  <td className="px-6 py-3">{a.name}</td>
                  <td className="px-6 py-3">{a.account_type}</td>
                  <td className="px-6 py-3">{a.parent_category}</td>
                  <td className="px-6 py-3">{a.is_active ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Add Account Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add New Account</h2>
              <input
                type="text"
                placeholder="Code"
                className="w-full px-3 py-2 border rounded-md mb-2"
                value={newAccount.code}
                onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
              />
              <input
                type="text"
                placeholder="Name"
                className="w-full px-3 py-2 border rounded-md mb-2"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
              />
              <select
                className="w-full px-3 py-2 border rounded-md mb-2"
                value={newAccount.account_type}
                onChange={(e) => setNewAccount({ ...newAccount, account_type: e.target.value })}
              >
                <option value="asset">Asset</option>
                <option value="liability">Liability</option>
                <option value="equity">Equity</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <select
                className="w-full px-3 py-2 border rounded-md mb-2"
                value={newAccount.parent_category}
                onChange={(e) => setNewAccount({ ...newAccount, parent_category: e.target.value })}
              >
                <option value="current_assets">Current Assets</option>
                <option value="fixed_assets">Fixed Assets</option>
                <option value="current_liabilities">Current Liabilities</option>
                <option value="long_term_liabilities">Long Term Liabilities</option>
                <option value="equity">Equity</option>
                <option value="revenue">Revenue</option>
                <option value="cost_of_goods_sold">Cost of Goods Sold</option>
                <option value="operating_expenses">Operating Expenses</option>
                <option value="other_income">Other Income</option>
                <option value="other_expenses">Other Expenses</option>
              </select>
              <textarea
                placeholder="Description"
                className="w-full px-3 py-2 border rounded-md mb-2"
                value={newAccount.description}
                onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
              />
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={newAccount.is_active}
                  onChange={(e) => setNewAccount({ ...newAccount, is_active: e.target.checked })}
                />
                <label className="ml-2">Active</label>
              </div>
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">Cancel</button>
                <button onClick={handleAddAccount} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Add</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChartOfAccountsPage;
