'use client';

import React from 'react';
import Sidebar from '@/components/sidebar';

interface Product {
  id: number;
  name: string;
  sku?: string;
  category_name?: string;
  sales_price: number;
  purchase_price: number;
  current_stock: number;
  minimum_stock: number;
  unit_of_measure?: string;
  is_active: boolean;
}

const productsData: Product[] = [
  { id: 1, name: 'Office Chair', sales_price: 150, purchase_price: 95, current_stock: 10, minimum_stock: 5, is_active: true },
  { id: 2, name: 'Wooden Table', sales_price: 275, purchase_price: 180, current_stock: 2, minimum_stock: 5, is_active: true },
  { id: 3, name: 'Sofa Set', sales_price: 750, purchase_price: 520, current_stock: 0, minimum_stock: 2, is_active: false },
  { id: 4, name: 'Dining Table', sales_price: 450, purchase_price: 310, current_stock: 8, minimum_stock: 5, is_active: true },
  { id: 5, name: 'Installation Service', sales_price: 50, purchase_price: 0, current_stock: 100, minimum_stock: 0, is_active: true },
];

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [products, setProducts] = React.useState<Product[]>(productsData);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(productsData.length);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const filtered = productsData.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setProducts(filtered);
      setTotalCount(filtered.length);
      setCurrentPage(1);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

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
            Add New Product
          </button>
        </header>

        {/* Rest of your table + search + pagination goes here */}
      </main>
    </div>
  );
};

export default ProductsPage;
