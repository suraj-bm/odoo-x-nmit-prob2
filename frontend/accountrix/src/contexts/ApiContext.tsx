'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import apiService from '@/services/api';

interface ApiContextType {
  // Data states
  categories: any[];
  products: any[];
  cart: any[];
  orders: any[];
  analytics: any;
  
  // Loading states
  loading: {
    categories: boolean;
    products: boolean;
    cart: boolean;
    orders: boolean;
    analytics: boolean;
  };
  
  // Error states
  error: string | null;
  
  // Actions
  fetchCategories: () => Promise<void>;
  fetchProducts: (params?: any) => Promise<void>;
  fetchCart: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  checkout: () => Promise<void>;
  clearError: () => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [loading, setLoading] = useState({
    categories: false,
    products: false,
    cart: false,
    orders: false,
    analytics: false,
  });

  const setLoadingState = (key: keyof typeof loading, value: boolean) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  };

  const handleError = (error: any) => {
    console.error('API Error:', error);
    setError(error.message || 'An error occurred');
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoadingState('categories', true);
      setError(null);
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingState('categories', false);
    }
  };

  // Fetch products
  const fetchProducts = async (params?: any) => {
    try {
      setLoadingState('products', true);
      setError(null);
      const data = await apiService.getProducts(params);
      setProducts(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingState('products', false);
    }
  };

  // Fetch cart (requires authentication)
  const fetchCart = async () => {
    if (!session?.accessToken) return;
    
    try {
      setLoadingState('cart', true);
      setError(null);
      const data = await apiService.getCart(session.accessToken);
      setCart(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingState('cart', false);
    }
  };

  // Fetch orders (requires authentication)
  const fetchOrders = async () => {
    if (!session?.accessToken) return;
    
    try {
      setLoadingState('orders', true);
      setError(null);
      const data = await apiService.getOrders(session.accessToken);
      setOrders(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingState('orders', false);
    }
  };

  // Fetch analytics (requires authentication)
  const fetchAnalytics = async () => {
    if (!session?.accessToken) return;
    
    try {
      setLoadingState('analytics', true);
      setError(null);
      const data = await apiService.getEcommerceAnalytics(session.accessToken);
      setAnalytics(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingState('analytics', false);
    }
  };

  // Add to cart
  const addToCart = async (productId: number, quantity: number) => {
    if (!session?.accessToken) {
      setError('Please log in to add items to cart');
      return;
    }
    
    try {
      setError(null);
      await apiService.addToCart(session.accessToken, { product: productId, quantity });
      await fetchCart(); // Refresh cart
    } catch (error) {
      handleError(error);
    }
  };

  // Remove from cart
  const removeFromCart = async (itemId: number) => {
    if (!session?.accessToken) return;
    
    try {
      setError(null);
      await apiService.removeFromCart(session.accessToken, itemId);
      await fetchCart(); // Refresh cart
    } catch (error) {
      handleError(error);
    }
  };

  // Update cart item
  const updateCartItem = async (itemId: number, quantity: number) => {
    if (!session?.accessToken) return;
    
    try {
      setError(null);
      const product = cart.find(item => item.id === itemId)?.product;
      if (product) {
        await apiService.updateCartItem(session.accessToken, itemId, { product, quantity });
        await fetchCart(); // Refresh cart
      }
    } catch (error) {
      handleError(error);
    }
  };

  // Checkout
  const checkout = async () => {
    if (!session?.accessToken) {
      setError('Please log in to checkout');
      return;
    }
    
    try {
      setError(null);
      await apiService.checkout(session.accessToken);
      await fetchCart(); // Refresh cart (should be empty after checkout)
      await fetchOrders(); // Refresh orders
    } catch (error) {
      handleError(error);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Auto-fetch data when session changes
  useEffect(() => {
    if (session?.accessToken) {
      fetchCart();
      fetchOrders();
      fetchAnalytics();
    }
  }, [session?.accessToken]);

  // Auto-fetch public data
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const value: ApiContextType = {
    categories,
    products,
    cart,
    orders,
    analytics,
    loading,
    error,
    fetchCategories,
    fetchProducts,
    fetchCart,
    fetchOrders,
    fetchAnalytics,
    addToCart,
    removeFromCart,
    updateCartItem,
    checkout,
    clearError,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};
