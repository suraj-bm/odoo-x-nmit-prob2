// 'use client';

// import React from 'react';

// // --- Sidebar Component ---




// // --- Chart of Accounts Page Component ---
// const accountsData = {
//     Assets: [
//         { id: 101, name: 'Cash' },
//         { id: 102, name: 'Bank' },
//         { id: 103, name: 'Debtors' },
//     ],
//     Liabilities: [
//         { id: 201, name: 'Creditors' },
//         { id: 202, name: 'Loans Payable' },
//     ],
//     Income: [
//         { id: 301, name: 'Sale Income' },
//         { id: 302, name: 'Interest Income' },
//     ],
//     Expenses: [
//         { id: 401, name: 'Purchases Expense' },
//         { id: 402, name: 'Rent Expense' },
//         { id: 403, name: 'Salaries Expense' },
//     ],
//     Equity: [
//         { id: 501, name: 'Owner\'s Capital' },
//     ],
// };

// const ChartOfAccountsPage = () => {
//     return (
//         <div className="flex h-screen bg-gray-50 font-sans">

//             <main className="flex-1 p-8 overflow-y-auto">
//                 <header className="pb-6 flex items-center justify-between">
//                     <div>
//                         <h1 className="text-3xl font-bold text-gray-800">Chart of Accounts</h1>
//                         <p className="text-gray-600">Manage the master list of all ledger accounts.</p>
//                     </div>
//                      <button className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center">
//                         <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
//                         Add New Account
//                     </button>
//                 </header>

//                 <div className="space-y-8">
//                     {Object.entries(accountsData).map(([type, accounts]) => (
//                         <div key={type} className="bg-white rounded-lg shadow-sm">
//                             <div className="p-6">
//                                 <h2 className="text-xl font-semibold text-gray-700 mb-4">{type}</h2>
//                                 <table className="w-full text-left">
//                                     <thead>
//                                         <tr className="text-gray-600 bg-gray-50">
//                                             <th className="py-3 px-4 font-semibold">Account Name</th>
//                                             <th className="py-3 px-4 font-semibold">Actions</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody className="text-gray-700">
//                                         {accounts.map((account) => (
//                                             <tr key={account.id} className="border-b border-gray-200 hover:bg-gray-50">
//                                                 <td className="py-4 px-4 font-medium">{account.name}</td>
//                                                 <td className="py-4 px-4">
//                                                     <button className="text-indigo-600 hover:text-indigo-800 font-medium mr-4">Edit</button>
//                                                     <button className="text-red-600 hover:text-red-800 font-medium">Delete</button>
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </main>
//         </div>
//     );
// };

// export default ChartOfAccountsPage;
