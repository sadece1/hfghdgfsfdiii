// API Service for Grader Marketplace Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData: {
    username: string;
    email: string;
    password: string;
    full_name?: string;
    phone?: string;
  }) {
    const response = await this.request<{
      message: string;
      token: string;
      user: any;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{
      message: string;
      token: string;
      user: any;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
    return response;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Graders methods
  async getGraders(filters?: {
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    isSold?: boolean;
    isFeatured?: boolean;
    stockCountry?: string;
    limit?: number;
    offset?: number;
    search?: string;
  }) {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/graders?${queryString}` : '/graders';
    
    return this.request<any[]>(endpoint);
  }

  async getGraderById(id: string) {
    return this.request<any>(`/graders/${id}`);
  }

  async createGrader(graderData: any) {
    return this.request<{ message: string; id: string }>('/graders', {
      method: 'POST',
      body: JSON.stringify(graderData),
    });
  }

  async updateGrader(id: string, graderData: any) {
    return this.request<{ message: string }>(`/graders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(graderData),
    });
  }

  async deleteGrader(id: string) {
    return this.request<{ message: string }>(`/graders/${id}`, {
      method: 'DELETE',
    });
  }

  // Parts methods
  async getParts(filters?: {
    brand?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    isSold?: boolean;
    stockCountry?: string;
    minStock?: number;
    limit?: number;
    offset?: number;
    search?: string;
  }) {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/parts?${queryString}` : '/parts';
    
    return this.request<any[]>(endpoint);
  }

  async getPartById(id: string) {
    return this.request<any>(`/parts/${id}`);
  }

  async createPart(partData: any) {
    return this.request<{ message: string; id: string }>('/parts', {
      method: 'POST',
      body: JSON.stringify(partData),
    });
  }

  async updatePart(id: string, partData: any) {
    return this.request<{ message: string }>(`/parts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(partData),
    });
  }

  async deletePart(id: string) {
    return this.request<{ message: string }>(`/parts/${id}`, {
      method: 'DELETE',
    });
  }

  async updatePartStock(id: string, stockQuantity: number) {
    return this.request<{ message: string }>(`/parts/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stockQuantity }),
    });
  }

  // Sales locations methods
  async getSalesLocations() {
    return this.request<any[]>('/sales-locations');
  }

  // Contact methods
  async sendContactMessage(messageData: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }) {
    return this.request<{ message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  // Homepage slider methods
  async getHomepageSlider() {
    return this.request<any[]>('/homepage-slider');
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export class for custom instances
export default ApiService;
