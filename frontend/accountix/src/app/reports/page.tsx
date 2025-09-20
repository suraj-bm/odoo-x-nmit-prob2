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

// --- Reports Page Component ---

const ReportsPage = () => {
    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar activePage="reports" />

            <main className="flex-1 p-8 overflow-y-auto">
                <header className="pb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Financial Reports</h1>
                    <p className="text-gray-600">Review your company's financial performance.</p>
                </header>
                
                {/* Report Filters */}
                <div className="mb-8 p-4 bg-white rounded-lg shadow-sm flex items-center space-x-4">
                    <label htmlFor="period" className="font-semibold text-gray-700">Reporting Period:</label>
                    <input type="date" id="start-date" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                    <span className="text-gray-600">to</span>
                    <input type="date" id="end-date" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                    <button className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200">Generate</button>
                </div>


                <div className="space-y-8">
                    {/* Balance Sheet */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold text-gray-700">Balance Sheet</h2>
                            <p className="text-sm text-gray-500">As of October 26, 2023</p>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Assets</h3>
                                <div className="space-y-2 text-gray-700">
                                    <div className="flex justify-between"><span>Cash</span><span>$15,200.50</span></div>
                                    <div className="flex justify-between"><span>Bank</span><span>$75,890.25</span></div>
                                    <div className="flex justify-between"><span>Debtors</span><span>$12,450.00</span></div>
                                    <div className="flex justify-between font-bold mt-2 pt-2 border-t"><span>Total Assets</span><span>$103,540.75</span></div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Liabilities & Equity</h3>
                                 <div className="space-y-2 text-gray-700">
                                    <div className="flex justify-between"><span>Creditors</span><span>$8,765.20</span></div>
                                    <div className="flex justify-between"><span>Owner's Capital</span><span>$71,300.00</span></div>
                                    <div className="flex justify-between"><span>Retained Earnings</span><span>$23,475.55</span></div>
                                    <div className="flex justify-between font-bold mt-2 pt-2 border-t"><span>Total Liabilities & Equity</span><span>$103,540.75</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profit & Loss */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold text-gray-700">Profit & Loss Statement</h2>
                            <p className="text-sm text-gray-500">For the period ending October 26, 2023</p>
                        </div>
                         <div className="p-6">
                            <div className="space-y-3 text-gray-700">
                                <h4 className="font-semibold text-gray-800">Income</h4>
                                <div className="flex justify-between pl-4"><span>Sale Income</span><span>$45,231.89</span></div>
                                <div className="flex justify-between pl-4 font-bold border-t pt-2"><span>Total Income</span><span>$45,231.89</span></div>

                                <h4 className="font-semibold text-gray-800 mt-4">Expenses</h4>
                                <div className="flex justify-between pl-4"><span>Purchases Expense</span><span>$18,500.00</span></div>
                                <div className="flex justify-between pl-4"><span>Salaries Expense</span><span>$3,254.32</span></div>
                                <div className="flex justify-between pl-4 font-bold border-t pt-2"><span>Total Expenses</span><span>$21,754.32</span></div>
                                
                                <div className="flex justify-between text-lg font-bold mt-4 pt-3 border-t-2 border-gray-800"><span>Net Profit</span><span className="text-green-600">$23,477.57</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Inventory Report */}
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
                                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-4 px-4 font-medium">Office Chair</td>
                                        <td className="py-4 px-4">50</td>
                                        <td className="py-4 px-4">35</td>
                                        <td className="py-4 px-4 font-bold">15</td>
                                    </tr>
                                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-4 px-4 font-medium">Wooden Table</td>
                                        <td className="py-4 px-4">30</td>
                                        <td className="py-4 px-4">18</td>
                                        <td className="py-4 px-4 font-bold">12</td>
                                    </tr>
                                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-4 px-4 font-medium">Sofa</td>
                                        <td className="py-4 px-4">20</td>
                                        <td className="py-4 px-4">10</td>
                                        <td className="py-4 px-4 font-bold">10</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ReportsPage;
