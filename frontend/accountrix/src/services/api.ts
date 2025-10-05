const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// API service class for backend communication
class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication APIs
  async login(credentials: { username: string; password: string }) {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    user_type: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  }) {
    return this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Categories APIs
  async getCategories() {
    return this.request('/categories/');
  }

  async getCategory(id: number) {
    return this.request(`/categories/${id}/`);
  }

  async createCategory(categoryData: {
    name: string;
    description: string;
    is_active: boolean;
  }) {
    return this.request('/categories/', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: number, categoryData: any) {
    return this.request(`/categories/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: number) {
    return this.request(`/categories/${id}/`, {
      method: 'DELETE',
    });
  }

  // Products APIs
  async getProducts(params?: {
    category?: number;
    search?: string;
    featured?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/products/?${queryString}` : '/products/';
    
    return this.request(endpoint);
  }

  async getProduct(id: number) {
    return this.request(`/products/${id}/`);
  }

  async createProduct(productData: any) {
    return this.request('/products/', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: number, productData: any) {
    return this.request(`/products/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: number) {
    return this.request(`/products/${id}/`, {
      method: 'DELETE',
    });
  }

  // Cart APIs (requires authentication)
  async getCart(token: string) {
    return this.request('/cart/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async addToCart(token: string, itemData: { product: number; quantity: number }) {
    return this.request('/cart/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(itemData),
    });
  }

  async updateCartItem(token: string, id: number, itemData: { product: number; quantity: number }) {
    return this.request(`/cart/${id}/`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(itemData),
    });
  }

  async removeFromCart(token: string, id: number) {
    return this.request(`/cart/${id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Order APIs (requires authentication)
  async getOrders(token: string) {
    return this.request('/orders/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getOrder(token: string, id: number) {
    return this.request(`/orders/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async createOrder(token: string, orderData: {
    shipping_address: string;
    payment_method: string;
    notes?: string;
  }) {
    return this.request('/orders/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
  }

  async checkout(token: string) {
    return this.request('/checkout/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Analytics APIs (requires authentication)
  async getEcommerceAnalytics(token: string) {
    return this.request('/reports/ecommerce/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getProductPerformance(token: string) {
    return this.request('/reports/product-performance/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Seller APIs (requires authentication)
  async getSellerProfile(token: string) {
    return this.request('/seller-profiles/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async createSellerProfile(token: string, profileData: any) {
    return this.request('/seller-profiles/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
  }

  async getSellerProducts(token: string) {
    return this.request('/seller-products/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async createSellerProduct(token: string, productData: any) {
    return this.request('/seller-products/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
