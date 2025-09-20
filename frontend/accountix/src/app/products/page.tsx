'use client';

import React from 'react';
import Sidebar from '@/components/sidebar'; // Assuming Sidebar is in a components folder





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
