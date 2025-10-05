// 'use client';

// import React from 'react';


// // --- Reports Page Component ---

// const ReportsPage = () => {
//     return (
//         <div className="flex h-screen bg-gray-50 font-sans">

//             <main className="flex-1 p-8 overflow-y-auto">
//                 <header className="pb-6">
//                     <h1 className="text-3xl font-bold text-gray-800">Financial Reports</h1>
//                     <p className="text-gray-600">Review your company's financial performance.</p>
//                 </header>
                
//                 {/* Report Filters */}
//                 <div className="mb-8 p-4 bg-white rounded-lg shadow-sm flex items-center space-x-4">
//                     <label htmlFor="period" className="font-semibold text-gray-700">Reporting Period:</label>
//                     <input type="date" id="start-date" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
//                     <span className="text-gray-600">to</span>
//                     <input type="date" id="end-date" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
//                     <button className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200">Generate</button>
//                 </div>


//                 <div className="space-y-8">
//                     {/* Balance Sheet */}
//                     <div className="bg-white rounded-lg shadow-sm">
//                         <div className="p-6 border-b">
//                             <h2 className="text-xl font-semibold text-gray-700">Balance Sheet</h2>
//                             <p className="text-sm text-gray-500">As of October 26, 2023</p>
//                         </div>
//                         <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
//                             <div>
//                                 <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Assets</h3>
//                                 <div className="space-y-2 text-gray-700">
//                                     <div className="flex justify-between"><span>Cash</span><span>$15,200.50</span></div>
//                                     <div className="flex justify-between"><span>Bank</span><span>$75,890.25</span></div>
//                                     <div className="flex justify-between"><span>Debtors</span><span>$12,450.00</span></div>
//                                     <div className="flex justify-between font-bold mt-2 pt-2 border-t"><span>Total Assets</span><span>$103,540.75</span></div>
//                                 </div>
//                             </div>
//                             <div>
//                                 <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Liabilities & Equity</h3>
//                                  <div className="space-y-2 text-gray-700">
//                                     <div className="flex justify-between"><span>Creditors</span><span>$8,765.20</span></div>
//                                     <div className="flex justify-between"><span>Owner's Capital</span><span>$71,300.00</span></div>
//                                     <div className="flex justify-between"><span>Retained Earnings</span><span>$23,475.55</span></div>
//                                     <div className="flex justify-between font-bold mt-2 pt-2 border-t"><span>Total Liabilities & Equity</span><span>$103,540.75</span></div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Profit & Loss */}
//                     <div className="bg-white rounded-lg shadow-sm">
//                         <div className="p-6 border-b">
//                             <h2 className="text-xl font-semibold text-gray-700">Profit & Loss Statement</h2>
//                             <p className="text-sm text-gray-500">For the period ending October 26, 2023</p>
//                         </div>
//                          <div className="p-6">
//                             <div className="space-y-3 text-gray-700">
//                                 <h4 className="font-semibold text-gray-800">Income</h4>
//                                 <div className="flex justify-between pl-4"><span>Sale Income</span><span>$45,231.89</span></div>
//                                 <div className="flex justify-between pl-4 font-bold border-t pt-2"><span>Total Income</span><span>$45,231.89</span></div>

//                                 <h4 className="font-semibold text-gray-800 mt-4">Expenses</h4>
//                                 <div className="flex justify-between pl-4"><span>Purchases Expense</span><span>$18,500.00</span></div>
//                                 <div className="flex justify-between pl-4"><span>Salaries Expense</span><span>$3,254.32</span></div>
//                                 <div className="flex justify-between pl-4 font-bold border-t pt-2"><span>Total Expenses</span><span>$21,754.32</span></div>
                                
//                                 <div className="flex justify-between text-lg font-bold mt-4 pt-3 border-t-2 border-gray-800"><span>Net Profit</span><span className="text-green-600">$23,477.57</span></div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Inventory Report */}
//                     <div className="bg-white rounded-lg shadow-sm">
//                         <div className="p-6 border-b">
//                             <h2 className="text-xl font-semibold text-gray-700">Inventory Report</h2>
//                             <p className="text-sm text-gray-500">Current stock levels</p>
//                         </div>
//                         <div className="p-6">
//                             <table className="w-full text-left">
//                                 <thead>
//                                     <tr className="text-gray-600 bg-gray-50">
//                                         <th className="py-3 px-4 font-semibold">Product Name</th>
//                                         <th className="py-3 px-4 font-semibold">Purchased Qty</th>
//                                         <th className="py-3 px-4 font-semibold">Sales Qty</th>
//                                         <th className="py-3 px-4 font-semibold">Available Stock</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="text-gray-700">
//                                     <tr className="border-b border-gray-200 hover:bg-gray-50">
//                                         <td className="py-4 px-4 font-medium">Office Chair</td>
//                                         <td className="py-4 px-4">50</td>
//                                         <td className="py-4 px-4">35</td>
//                                         <td className="py-4 px-4 font-bold">15</td>
//                                     </tr>
//                                     <tr className="border-b border-gray-200 hover:bg-gray-50">
//                                         <td className="py-4 px-4 font-medium">Wooden Table</td>
//                                         <td className="py-4 px-4">30</td>
//                                         <td className="py-4 px-4">18</td>
//                                         <td className="py-4 px-4 font-bold">12</td>
//                                     </tr>
//                                     <tr className="border-b border-gray-200 hover:bg-gray-50">
//                                         <td className="py-4 px-4 font-medium">Sofa</td>
//                                         <td className="py-4 px-4">20</td>
//                                         <td className="py-4 px-4">10</td>
//                                         <td className="py-4 px-4 font-bold">10</td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 </div>
//             </main>
//         </div>
//     );
// };

// export default ReportsPage;
