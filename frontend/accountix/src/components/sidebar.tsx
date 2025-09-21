'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';

interface SidebarProps {
  activePage: 'dashboard' | 'contact' | 'products' | 'taxes' | 'accounts' | 'purchases' | 'sales' | 'reports';
}

interface UserProfile {
  username: string;
  email: string;
  profile_image?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: string;
  activePage: SidebarProps['activePage'];
}

// Navigation items with icons
const navigationItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊', activePage: 'dashboard' },
  { name: 'Contacts', href: '/contact', icon: '👥', activePage: 'contact' },
  { name: 'Products', href: '/products', icon: '📦', activePage: 'products' },
  { name: 'Purchases', href: '/purchases', icon: '🛒', activePage: 'purchases' },
  { name: 'Sales', href: '/sales', icon: '💰', activePage: 'sales' },
  { name: 'Taxes', href: '/taxes', icon: '🧾', activePage: 'taxes' },
  { name: 'Accounts', href: '/accounts', icon: '📋', activePage: 'accounts' },
  { name: 'Reports', href: '/reports', icon: '📈', activePage: 'reports' },
];

// Group navigation items by category
const navigationGroups = [
  {
    title: 'Main',
    items: navigationItems.filter(item => ['dashboard', 'contact'].includes(item.activePage))
  },
  {
    title: 'Transactions',
    items: navigationItems.filter(item => ['products', 'purchases', 'sales'].includes(item.activePage))
  },
  {
    title: 'Configuration',
    items: navigationItems.filter(item => ['taxes', 'accounts', 'reports'].includes(item.activePage))
  }
];

const Sidebar: React.FC<SidebarProps> = ({ activePage }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: 'Loading...',
    email: 'Loading...',
    profile_image: '',
  });

  // Update user profile from auth context
  useEffect(() => {
    if (user) {
      setUserProfile({
        username: user.username,
        email: user.email,
        profile_image: '',
      });
    }
  }, [user]);

  // Get link className with improved styling
  const getLinkClassName = (item: NavItem) => {
    const isActive = activePage === item.activePage || pathname === item.href;
    return `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    } ${isCollapsed ? 'justify-center' : ''}`;
  };

  // Logout function
  const handleLogout = async () => {
    await logout();
  };

  if (authLoading) {
    return (
      <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg flex flex-col h-full transition-all duration-300`}>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </aside>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg flex flex-col h-full transition-all duration-300 border-r border-gray-200`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SA</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Shiv Accounts</h1>
                <p className="text-xs text-gray-500">Cloud Edition</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="text-gray-600">
              {isCollapsed ? '→' : '←'}
            </span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navigationGroups.map((group) => (
          <div key={group.title}>
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={getLinkClassName(item)}
                  title={isCollapsed ? item.name : undefined}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                  {activePage === item.activePage && !isCollapsed && (
                    <div className="ml-auto w-2 h-2 bg-indigo-600 rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center space-x-3">
            <img
              className="w-8 h-8 rounded-full ring-2 ring-indigo-200"
              src={userProfile.profile_image || `https://i.pravatar.cc/150?u=${userProfile.username}`}
              alt="User Avatar"
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{userProfile.username}</p>
                <p className="text-xs text-gray-500 truncate">{userProfile.email}</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
              title="Logout"
            >
              Logout
            </button>
          )}
          {isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Logout"
            >
              🚪
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
