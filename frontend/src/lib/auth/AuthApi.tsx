import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccessToken = response.data.access;
          localStorage.setItem('access_token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);



const AuthAPI = {
  /**
   * Standard username/password login
   */
  login: async (credentials) => {
    const res = await api.post('/api/auth/login/', credentials);
    // Store tokens
    if (res.data.access) {
      localStorage.setItem('access_token', res.data.access);
    }
    if (res.data.refresh) {
      localStorage.setItem('refresh_token', res.data.refresh);
    }
    return res.data;
  },

  /**
   * Register new user
   */
  register: async (userData) => {
    const res = await api.post('/api/auth/registration/', {
      phone_number: userData.phone_number,
      email: userData.email,
      password1: userData.password,
      password2: userData.password, // dj-rest-auth requires password confirmation
      first_name: userData.first_name,
      last_name: userData.last_name,
    });

    // Store tokens if auto-login is enabled
    if (res.data.access) {
      localStorage.setItem('access_token', res.data.access);
    }
    if (res.data.refresh) {
      localStorage.setItem('refresh_token', res.data.refresh);
    }
    return res.data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await api.post('/api/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens regardless of API response
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const res = await api.post('/api/auth/token/refresh/', {
      refresh: refreshToken,
    });

    if (res.data.access) {
      localStorage.setItem('access_token', res.data.access);
    }
    return res.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async () => {
    const res = await api.get('/api/auth/user/');
    return res.data;
  },

  /**
   * Update current user profile
   */
  updateProfile: async (userData) => {
    const res = await api.patch('/api/auth/user/', userData);
    return res.data;
  },

  /**
   * Change password
   */
  changePassword: async (passwords) => {
    const res = await api.post('/api/auth/password/change/', {
      old_password: passwords.oldPassword,
      new_password1: passwords.newPassword,
      new_password2: passwords.newPassword,
    });
    return res.data;
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email) => {
    const res = await api.post('/api/auth/password/reset/', { email });
    return res.data;
  },

  /**
   * Confirm password reset
   */
  confirmPasswordReset: async (uid, token, passwords) => {
    const res = await api.post('/api/auth/password/reset/confirm/', {
      uid,
      token,
      new_password1: passwords.newPassword,
      new_password2: passwords.newPassword,
    });
    return res.data;
  },

  /**
   * Initiate Google OAuth login
   * This redirects to Google's OAuth page
   */
  loginWithGoogle: () => {
    const clientId = 'your-google-client-id';
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'profile email';
    const responseType = 'code';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=${responseType}`;

    window.location.href = authUrl;
  },

  /**
   * Complete Google OAuth login
   * Call this in your callback component
   */
  completeGoogleLogin: async (code) => {
    const res = await api.post('/api/auth/google/', { code });

    if (res.data.access) {
      localStorage.setItem('access_token', res.data.access);
    }
    if (res.data.refresh) {
      localStorage.setItem('refresh_token', res.data.refresh);
    }
    return res.data;
  },
};

export default AuthAPI
