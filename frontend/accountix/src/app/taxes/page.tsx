'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/sidebar';

const TaxesPage = () => {
    const [taxes, setTaxes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch taxes from API
    const fetchTaxes = async () => {
        try {
            const response = await fetch('/api/taxes/'); // Make sure this matches your API URL
            if (!response.ok) throw new Error('Failed to fetch taxes');
            const data = await response.json();
            setTaxes(data);
        } catch (error) {
            console.error('Error fetching taxes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTaxes();
    }, []);

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`/api/taxes/${id}/`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setTaxes(taxes.filter((tax) => tax.id !== id));
            } else {
                console.error('Failed to delete tax');
            }
        } catch (error) {
            console.error(error);
        }
    };

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
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add New Tax
                    </button>
                </header>

                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6">
                        {loading ? (
                            <p>Loading taxes...</p>
                        ) : (
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
                                    {taxes.map((tax) => (
                                        <tr key={tax.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="py-4 px-4 font-medium">{tax.name}</td>
                                            <td className="py-4 px-4">{tax.tax_type === 'percentage' ? 'Percentage' : 'Fixed Value'}</td>
                                            <td className="py-4 px-4">
                                                {tax.applicable_on === 'both'
                                                    ? 'Sales & Purchase'
                                                    : tax.applicable_on.charAt(0).toUpperCase() + tax.applicable_on.slice(1)}
                                            </td>
                                            <td className="py-4 px-4">
                                                <button className="text-indigo-600 hover:text-indigo-800 font-medium mr-4">Edit</button>
                                                <button
                                                    className="text-red-600 hover:text-red-800 font-medium"
                                                    onClick={() => handleDelete(tax.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TaxesPage;
