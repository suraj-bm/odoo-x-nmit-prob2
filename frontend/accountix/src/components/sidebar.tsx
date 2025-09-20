'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/app/lib/api'; // your axios instance

interface SidebarProps {
  activePage: 'dashboard' | 'contact' | 'products' | 'taxes' | 'accounts' | 'purchases' | 'sales' | 'reports';
}

interface UserProfile {
  username: string;
  email: string;
  profile_image?: string; // optional
}

const Sidebar: React.FC<SidebarProps> = ({ activePage }) => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile>({
    username: 'Loading...',
    email: 'Loading...',
    profile_image: '',
  });

  const getLinkClassName = (page: SidebarProps['activePage']) => {
    return `flex items-center px-4 py-2.5 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${
      activePage === page ? 'bg-indigo-50 text-indigo-600' : ''
    }`;
  };

  // Fetch current user profile in real-time
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchProfile = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/loginpage');
      return;
    }

    try {
      const res = await api.get('users/profile/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/loginpage'); // redirect only if request fails
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, [router]);

if (loading) {
  return <div className="p-6 text-center">Loading...</div>; // show spinner/loading
}

if (!user) {
  return null; // safety fallback
}

  // Logout function
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/logout/', { refresh: refreshToken });
      }
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/loginpage'); // redirect to login page
    }
  };

  return (
    <aside className="w-64 bg-white shadow-sm flex flex-col h-full">
      <div className="p-6 text-2xl font-bold text-gray-800 border-b">Shiv Accounts</div>

      <nav className="flex-1 px-4 py-6 space-y-4">
        {/* Main Section */}
        <div>
          <span className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</span>
          <div className="mt-2 space-y-1">
            <a href="/dashboard" className={getLinkClassName('dashboard')}>Dashboard</a>
            <a href="/contact" className={getLinkClassName('contact')}>Contacts</a>
          </div>
        </div>

        {/* Transactions Section */}
        <div>
          <span className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transactions</span>
          <div className="mt-2 space-y-1">
            <a href="/products" className={getLinkClassName('products')}>Products</a>
            <a href="/purchases" className={getLinkClassName('purchases')}>Purchases</a>
            <a href="/sales" className={getLinkClassName('sales')}>Sales</a>
          </div>
        </div>

        {/* Configuration Section */}
        <div>
          <span className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Configuration</span>
          <div className="mt-2 space-y-1">
            <a href="/taxes" className={getLinkClassName('taxes')}>Taxes</a>
            <a href="/accounts" className={getLinkClassName('accounts')}>Chart of Accounts</a>
            <a href="/reports" className={getLinkClassName('reports')}>Reports</a>
          </div>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t flex items-center justify-between">
        <div className="flex items-center">
          <img
            className="w-10 h-10 rounded-full"
            src={user.profile_image || `https://i.pravatar.cc/150?u=${user.username}`}
            alt="User Avatar"
          />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-800">{user.username}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="ml-4 px-3 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
