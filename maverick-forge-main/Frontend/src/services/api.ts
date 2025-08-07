const API_BASE_URL = 'http://localhost:5000/api';

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
  
  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },
};

// Admin API
export const adminAPI = {
  getDashboardData: async () => {
    return apiRequest('/admin/dashboard');
  },
  
  getDepartmentAnalytics: async () => {
    return apiRequest('/admin/department-analytics');
  },
  
  addFresher: async (fresherData: {
    name: string;
    email: string;
    department: string;
  }) => {
    return apiRequest('/fresher/admin-create', {
      method: 'POST',
      body: JSON.stringify(fresherData),
    });
  },
  
  getFreshers: async () => {
    return apiRequest('/fresher');
  },
};

// Fresher API
export const fresherAPI = {
  getDashboardData: async () => {
    return apiRequest('/fresher/dashboard');
  },
  
  updateProfile: async (profileData: any) => {
    return apiRequest('/fresher/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
  
  updateScores: async (id: number, scores: {
    quizzes?: number;
    coding?: number;
    assignments?: number;
    certifications?: number;
  }) => {
    return apiRequest(`/fresher/scores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scores),
    });
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await fetch('http://localhost:5000/health');
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

export default {
  authAPI,
  adminAPI,
  fresherAPI,
  healthCheck,
}; 