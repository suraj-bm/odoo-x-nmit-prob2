'use client';

import React from 'react';
import Sidebar from '@/components/sidebar';

// --- Purchases Page Component ---
const purchasesData = [
    { id: 'PO001', vendor: 'Azure Furniture', status: 'Billed', total: 1250.00, date: '2023-10-25' },
    { id: 'PO002', vendor: 'Wood Wonders Inc.', status: 'Pending', total: 3450.50, date: '2023-10-24' },
    { id: 'PO003', vendor: 'SteelCraft Supplies', status: 'Billed', total: 780.00, date: '2023-10-22' },
    { id: 'PO004', vendor: 'Azure Furniture', status: 'Cancelled', total: 2100.00, date: '2023-10-21' },
    { id: 'PO005', vendor: 'Fabric & Co.', status: 'Pending', total: 950.75, date: '2023-10-20' },
];

const PurchasesPage = () => {
    const getStatusChip = (status: string) => {
        switch (status) {
            case 'Billed':
                return 'bg-green-100 text-green-700';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'Cancelled':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar activePage="purchases" />

            <main className="flex-1 p-8 overflow-y-auto">
                <header className="pb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Purchase Orders</h1>
                        <p className="text-gray-600">Track and manage your purchase orders.</p>
                    </div>
                    <button className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Create Purchase Order
                    </button>
                </header>

                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6">
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search purchase orders..."
                                className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-600 bg-gray-50">
                                    <th className="py-3 px-4 font-semibold">Order #</th>
                                    <th className="py-3 px-4 font-semibold">Vendor</th>
                                    <th className="py-3 px-4 font-semibold">Status</th>
                                    <th className="py-3 px-4 font-semibold">Total</th>
                                    <th className="py-3 px-4 font-semibold">Date</th>
                                    <th className="py-3 px-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {purchasesData.map((order) => (
                                    <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-4 px-4 font-medium text-indigo-600">{order.id}</td>
                                        <td className="py-4 px-4">{order.vendor}</td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">${order.total.toFixed(2)}</td>
                                        <td className="py-4 px-4">{order.date}</td>
                                        <td className="py-4 px-4">
                                            <button className="text-indigo-600 hover:text-indigo-800 font-medium mr-4">View</button>
                                            <button className="text-gray-600 hover:text-gray-800 font-medium">Convert to Bill</button>
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

export default PurchasesPage;
