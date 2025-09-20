'use client';

import React from 'react';
import Sidebar from '@/components/sidebar';

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
            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-gray-600">Loading products...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Error loading products</h3>
                    <p className="text-sm text-red-700 mt-1">{error.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Products Table */}
            {!loading && !error && (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Showing {products.length} of {totalCount} products
                </div>
                
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-600 bg-gray-50">
                      <th className="py-3 px-4 font-semibold">Product Name</th>
                      <th className="py-3 px-4 font-semibold">SKU</th>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      <th className="py-3 px-4 font-semibold">Sales Price</th>
                      <th className="py-3 px-4 font-semibold">Purchase Price</th>
                      <th className="py-3 px-4 font-semibold">Stock</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 px-4 text-center text-gray-500">
                          No products found. {searchTerm && 'Try adjusting your search terms.'}
                        </td>
                      </tr>
                    ) : (
                      products.map((product: Product) => (
                        <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium">{product.name}</td>
                          <td className="py-4 px-4 text-sm text-gray-500">{product.sku}</td>
                          <td className="py-4 px-4">{product.category_name || 'N/A'}</td>
                          <td className="py-4 px-4">₹{product.sales_price.toFixed(2)}</td>
                          <td className="py-4 px-4">₹{product.purchase_price.toFixed(2)}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.current_stock <= product.minimum_stock
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {product.current_stock} {product.unit_of_measure}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button className="text-indigo-600 hover:text-indigo-800 font-medium mr-4">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-800 font-medium">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalCount > 20 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Page {currentPage} of {Math.ceil(totalCount / 20)}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage >= Math.ceil(totalCount / 20)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductsPage;