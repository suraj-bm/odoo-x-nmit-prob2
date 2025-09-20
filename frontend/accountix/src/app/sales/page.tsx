'use client';

import React from 'react';

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
            <a href="#" className={getLinkClassName('dashboard')}>
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              Dashboard
            </a>
             <a href="#" className={getLinkClassName('contacts')}>
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0112 13a5.995 5.995 0 013 5.197M15 21a6 6 0 00-9-5.197" /></svg>
              Contacts
            </a>
          </div>
        </div>
        <div>
           <span className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transactions</span>
           <div className="mt-2 space-y-1">
             <a href="#" className={getLinkClassName('products')}>
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              Products
            </a>
            <a href="#" className={getLinkClassName('purchases')}>
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              Purchases
            </a>
            <a href="#" className={getLinkClassName('sales')}>
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              Sales
            </a>
           </div>
        </div>
        <div>
           <span className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Configuration</span>
            <div className="mt-2 space-y-1">
              <a href="#" className={getLinkClassName('taxes')}>
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
                Taxes
              </a>
              <a href="#" className={getLinkClassName('accounts')}>
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Chart of Accounts
              </a>
               <a href="#" className={getLinkClassName('reports')}>
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

// --- Sales Page Component ---
const salesData = [
    { id: 'SO001', customer: 'Nimesh Pathak', status: 'Invoiced', total: 1250.00, date: '2023-10-26' },
    { id: 'SO002', customer: 'Corporate Solutions Ltd.', status: 'Pending', total: 4500.00, date: '2023-10-25' },
    { id: 'SO003', customer: 'Home Decor Inc.', status: 'Shipped', total: 820.50, date: '2023-10-23' },
    { id: 'SO004', customer: 'Nimesh Pathak', status: 'Invoiced', total: 3200.00, date: '2023-10-22' },
    { id: 'SO005', customer: 'Urban Living', status: 'Cancelled', total: 150.25, date: '2023-10-21' },
];

const SalesPage = () => {
    const getStatusChip = (status: string) => {
        switch (status) {
            case 'Invoiced':
                return 'bg-green-100 text-green-700';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'Shipped':
                return 'bg-blue-100 text-blue-700';
            case 'Cancelled':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar activePage="sales" />

            <main className="flex-1 p-8 overflow-y-auto">
                <header className="pb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Sales Orders</h1>
                        <p className="text-gray-600">Track and manage your customer orders.</p>
                    </div>
                    <button className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Create Sales Order
                    </button>
                </header>

                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6">
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search sales orders..."
                                className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-600 bg-gray-50">
                                    <th className="py-3 px-4 font-semibold">Order #</th>
                                    <th className="py-3 px-4 font-semibold">Customer</th>
                                    <th className="py-3 px-4 font-semibold">Status</th>
                                    <th className="py-3 px-4 font-semibold">Total</th>
                                    <th className="py-3 px-4 font-semibold">Date</th>
                                    <th className="py-3 px-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {salesData.map((order) => (
                                    <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-4 px-4 font-medium text-indigo-600">{order.id}</td>
                                        <td className="py-4 px-4">{order.customer}</td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">${order.total.toFixed(2)}</td>
                                        <td className="py-4 px-4">{order.date}</td>
                                        <td className="py-4 px-4">
                                            <button className="text-indigo-600 hover:text-indigo-800 font-medium mr-4">View</button>
                                            <button className="text-gray-600 hover:text-gray-800 font-medium">Convert to Invoice</button>
                                        </td>
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

export default SalesPage;
