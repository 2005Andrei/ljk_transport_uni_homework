import axios from 'axios';

//const api_base_url = 'http://localhost:8000/api';

const api_base_url = 'https://andrewshort.pythonanywhere.com/api';

const api = axios.create({
  baseURL: api_base_url,
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
          const response = await axios.post(`${api_base_url}/auth/refresh/`, {
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
  login: async (credentials: any) => {
    const res = await api.post('/auth/login/', credentials);
    if (res.data.access) {
      localStorage.setItem('access_token', res.data.access);
    }
    if (res.data.refresh) {
      localStorage.setItem('refresh_token', res.data.refresh);
    }
    return res.data;
  },

  register: async (userData: any) => {
    console.log("reached register");
    const res = await api.post('/auth/registration/', {
      phone_number: userData.phone_number,
      email: userData.email,
      password1: userData.password,
      password2: userData.password,
      first_name: userData.first_name,
      last_name: userData.last_name,
    });

    if (res.data.access) {
      localStorage.setItem('access_token', res.data.access);
    }
    if (res.data.refresh) {
      localStorage.setItem('refresh_token', res.data.refresh);
    }
    return res.data;
  },

  logout: async () => {
    console.log("logout called");
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return;
    }
    try {
      await api.post('/auth/logout/', {
        refresh: refreshToken,
      });
    } catch (error) {
      console.error('logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const res = await api.post('/auth/refresh/', { 
      refresh: refreshToken,
    });

    if (res.data.access) {
      localStorage.setItem('access_token', res.data.access);
    }
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/auth/user/');
    return res.data;
  },

  updateProfile: async (userData: any) => {
    const res = await api.patch('/auth/user/', userData);
    return res.data;
  },

  changePassword: async (passwords: any) => {
    const res = await api.post('/auth/password/change/', {
      old_password: passwords.oldPassword,
      new_password1: passwords.newPassword,
      new_password2: passwords.newPassword,
    });
    return res.data;
  },
};

export default AuthAPI;
