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

// --- Products Page Component ---
const productsData = [
    { id: 1, name: 'Office Chair', type: 'Goods', salesPrice: 150.00, purchasePrice: 95.00, hsnCode: '9401' },
    { id: 2, name: 'Wooden Table', type: 'Goods', salesPrice: 275.00, purchasePrice: 180.00, hsnCode: '9403' },
    { id: 3, name: 'Sofa Set', type: 'Goods', salesPrice: 750.00, purchasePrice: 520.00, hsnCode: '9401' },
    { id: 4, name: 'Dining Table', type: 'Goods', salesPrice: 450.00, purchasePrice: 310.00, hsnCode: '9403' },
    { id: 5, name: 'Installation Service', type: 'Service', salesPrice: 50.00, purchasePrice: 0, hsnCode: '9987' },
];

const ProductsPage = () => {
    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar activePage="products" />

            <main className="flex-1 p-8 overflow-y-auto">
                <header className="pb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Products</h1>
                        <p className="text-gray-600">Manage your products and services.</p>
                    </div>
                    <button className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Add New Product
                    </button>
                </header>

                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6">
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-600 bg-gray-50">
                                    <th className="py-3 px-4 font-semibold">Product Name</th>
                                    <th className="py-3 px-4 font-semibold">Type</th>
                                    <th className="py-3 px-4 font-semibold">Sales Price</th>
                                    <th className="py-3 px-4 font-semibold">Purchase Price</th>
                                    <th className="py-3 px-4 font-semibold">HSN Code</th>
                                    <th className="py-3 px-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {productsData.map((product) => (
                                    <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-4 px-4 font-medium">{product.name}</td>
                                        <td className="py-4 px-4">{product.type}</td>
                                        <td className="py-4 px-4">${product.salesPrice.toFixed(2)}</td>
                                        <td className="py-4 px-4">${product.purchasePrice.toFixed(2)}</td>
                                        <td className="py-4 px-4">{product.hsnCode}</td>
                                        <td className="py-4 px-4">
                                            <button className="text-indigo-600 hover:text-indigo-800 font-medium mr-4">Edit</button>
                                            <button className="text-red-600 hover:text-red-800 font-medium">Delete</button>
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

export default ProductsPage;
