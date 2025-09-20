'use client';

import React from 'react';
import Sidebar from '@/components/sidebar';

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
