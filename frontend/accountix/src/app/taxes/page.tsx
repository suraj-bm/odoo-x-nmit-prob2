'use client';

import React from 'react';
import Sidebar from '@/components/sidebar';

// --- Taxes Page Component ---
const taxesData = [
    { id: 1, name: 'GST 5%', method: 'Percentage', applicableOn: 'Sales & Purchase' },
    { id: 2, name: 'GST 10%', method: 'Percentage', applicableOn: 'Sales & Purchase' },
    { id: 3, name: 'CESS', method: 'Fixed Value', applicableOn: 'Sales' },
    { id: 4, name: 'TDS', method: 'Percentage', applicableOn: 'Purchase' },
];

const TaxesPage = () => {
    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar activePage="taxes" />

            <main className="flex-1 p-8 overflow-y-auto">
                <header className="pb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Taxes</h1>
                        <p className="text-gray-600">Configure and manage your tax rates.</p>
                    </div>
                    <button className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Add New Tax
                    </button>
                </header>

                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-600 bg-gray-50">
                                    <th className="py-3 px-4 font-semibold">Tax Name</th>
                                    <th className="py-3 px-4 font-semibold">Computation Method</th>
                                    <th className="py-3 px-4 font-semibold">Applicable On</th>
                                    <th className="py-3 px-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {taxesData.map((tax) => (
                                    <tr key={tax.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-4 px-4 font-medium">{tax.name}</td>
                                        <td className="py-4 px-4">{tax.method}</td>
                                        <td className="py-4 px-4">{tax.applicableOn}</td>
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

export default TaxesPage;
