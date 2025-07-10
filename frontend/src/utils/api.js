// API utility functions for consistent API calls

const API_BASE_URL = 'http://localhost:3000/api';

export const api = {
  get: async (endpoint, params = {}) => {
    const token = localStorage.getItem('authToken');
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  },
  
  post: async (endpoint, data = {}) => {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
};
