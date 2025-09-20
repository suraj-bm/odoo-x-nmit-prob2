// Products API services

import { apiClient, PaginatedResponse } from '../api';

export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  category: number;
  category_name?: string;
  hsn_code?: string;
  unit_of_measure: string;
  sales_price: number;
  purchase_price: number;
  sales_tax: number;
  sales_tax_name?: string;
  purchase_tax: number;
  purchase_tax_name?: string;
  current_stock: number;
  minimum_stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  description?: string;
  category: number;
  hsn_code?: string;
  unit_of_measure?: string;
  sales_price: number;
  purchase_price: number;
  sales_tax?: number;
  purchase_tax?: number;
  minimum_stock?: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  is_active?: boolean;
}

export interface StockAdjustmentRequest {
  adjustment_type: 'increase' | 'decrease';
  quantity: number;
}

// Products API functions
export const productsApi = {
  // Get all products with pagination and filters
  async getProducts(params?: {
    page?: number;
    search?: string;
    category?: number;
    is_active?: boolean;
    sales_tax?: number;
    purchase_tax?: number;
    ordering?: string;
  }): Promise<PaginatedResponse<Product>> {
    return apiClient.get<PaginatedResponse<Product>>('/master/products/', params);
  },

  // Get single product by ID
  async getProduct(id: number): Promise<Product> {
    return apiClient.get<Product>(`/master/products/${id}/`);
  },

  // Create new product
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    return apiClient.post<Product>('/master/products/', productData);
  },

  // Update product
  async updateProduct(id: number, productData: UpdateProductRequest): Promise<Product> {
    return apiClient.put<Product>(`/master/products/${id}/`, productData);
  },

  // Partially update product
  async patchProduct(id: number, productData: Partial<UpdateProductRequest>): Promise<Product> {
    return apiClient.patch<Product>(`/master/products/${id}/`, productData);
  },

  // Delete product
  async deleteProduct(id: number): Promise<void> {
    return apiClient.delete<void>(`/master/products/${id}/`);
  },

  // Get products with low stock
  async getLowStockProducts(): Promise<Product[]> {
    return apiClient.get<Product[]>('/master/products/low_stock/');
  },

  // Get out of stock products
  async getOutOfStockProducts(): Promise<Product[]> {
    return apiClient.get<Product[]>('/master/products/out_of_stock/');
  },

  // Adjust product stock
  async adjustStock(id: number, adjustmentData: StockAdjustmentRequest): Promise<Product> {
    return apiClient.post<Product>(`/master/products/${id}/adjust_stock/`, adjustmentData);
  },
};

// Product Categories API functions
export const productCategoriesApi = {
  // Get all categories
  async getCategories(params?: {
    page?: number;
    search?: string;
    is_active?: boolean;
    ordering?: string;
  }): Promise<PaginatedResponse<ProductCategory>> {
    return apiClient.get<PaginatedResponse<ProductCategory>>('/master/product-categories/', params);
  },

  // Get single category by ID
  async getCategory(id: number): Promise<ProductCategory> {
    return apiClient.get<ProductCategory>(`/master/product-categories/${id}/`);
  },

  // Create new category
  async createCategory(categoryData: Omit<ProductCategory, 'id' | 'created_at'>): Promise<ProductCategory> {
    return apiClient.post<ProductCategory>('/master/product-categories/', categoryData);
  },

  // Update category
  async updateCategory(id: number, categoryData: Partial<Omit<ProductCategory, 'id' | 'created_at'>>): Promise<ProductCategory> {
    return apiClient.put<ProductCategory>(`/master/product-categories/${id}/`, categoryData);
  },

  // Delete category
  async deleteCategory(id: number): Promise<void> {
    return apiClient.delete<void>(`/master/product-categories/${id}/`);
  },
};
