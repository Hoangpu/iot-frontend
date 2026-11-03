import axios from 'axios';
import {
  MOCK_USER,
  MOCK_ACTUATORS,
  MOCK_SENSORS,
  MOCK_LATEST_SENSOR_DATA,
  MOCK_SENSOR_RECORDS,
  MOCK_HISTORY_RECORDS,
  paginateMockData,
  createHistoryRecord,
  updateHistoryStatus,
} from './mockData';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  JWT TOKEN INTERCEPTOR
//  Tự động gắn Bearer Token vào header mọi request
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  RESPONSE INTERCEPTOR
//  Nếu gặp lỗi 401 (chưa có token hoặc token hết hạn) -> Xóa token và chuyển về login
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('🔒 Token không hợp lệ hoặc đã hết hạn, chuyển hướng đăng nhập');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('isAuthenticated');
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  MOCK FALLBACK WRAPPER
//  Gọi API thật trước -> nếu lỗi do backend tắt hoàn toàn (Network Error) -> dùng mock
//  Nếu backend trả về mã lỗi HTTP (400, 401, ...) -> ném lỗi để UI xử lý chính xác
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const withMockFallback = (apiCall, mockFn) => {
  return apiCall().catch((err) => {
    if (err.response) {
      throw err;
    }
    console.warn('⚠️ Backend không phản hồi, dùng dữ liệu mẫu (mock):', err.message);
    return mockFn();
  });
};

// ============ USER (UC06) ============
export const getCurrentUser = () =>
  withMockFallback(
    () => api.get('/users/me'),
    () => ({ data: MOCK_USER })
  );

export const getUser = (id = 1) =>
  withMockFallback(
    () => api.get(`/users/${id}`),
    () => ({ data: MOCK_USER })
  );

export const login = (data) =>
  withMockFallback(
    () => api.post('/users/login', data),
    () => ({
      data: {
        token: 'mock-jwt-token-12345',
        type: 'Bearer',
        user: MOCK_USER,
        message: 'Login thành công (mock)',
      },
    })
  );

export const register = (data) =>
  withMockFallback(
    () => api.post('/users/register', data),
    () => ({
      data: {
        token: 'mock-jwt-token-12345',
        type: 'Bearer',
        user: {
          ...MOCK_USER,
          name: data.fullName || 'New User',
          email: data.email || 'new@iot.com',
          studentId: data.username || 'newuser',
        },
        message: 'Đăng ký thành công (mock)',
      },
    })
  );

// ============ DEVICES (UC02, UC04) ============
export const getDevices = () =>
  withMockFallback(
    () => api.get('/devices'),
    () => ({ data: MOCK_ACTUATORS })
  );

export const getActuators = () =>
  withMockFallback(
    () => api.get('/devices/actuators'),
    () => ({ data: MOCK_ACTUATORS })
  );

export const getDevice = (id) =>
  withMockFallback(
    () => api.get(`/devices/${id}`),
    () => ({ data: MOCK_ACTUATORS.find((d) => d.id === id) || MOCK_ACTUATORS[0] })
  );

export const controlDevice = (id, action) =>
  withMockFallback(
    () =>
      api.post(`/devices/${id}/control`, {
        action,
        username: localStorage.getItem('username'),
      }),
    () => {
      // Mock: cập nhật trạng thái device trong memory
      const device = MOCK_ACTUATORS.find((d) => d.id === id);
      if (device) {
        device.isActive = action === 'ON';
      } else if (id === 0) {
        // Toggle All
        MOCK_ACTUATORS.forEach((d) => {
          d.isActive = action === 'ON';
        });
      }
      return { data: { message: `Device ${id} ${action} thành công (mock)` } };
    }
  );

// ============ DATA SENSOR (UC01, UC03) ============
export const getLatestSensorData = () =>
  withMockFallback(
    () => api.get('/datasensor/latest'),
    () => ({ data: MOCK_LATEST_SENSOR_DATA })
  );

export const searchSensorData = (params) =>
  withMockFallback(
    () => api.get('/datasensor', { params }),
    () => paginateMockData(MOCK_SENSOR_RECORDS, params)
  );

export const getSensors = () =>
  withMockFallback(
    () => api.get('/datasensor/sensors'),
    () => ({ data: MOCK_SENSORS })
  );

// ============ HISTORY (UC05) ============
export const searchHistory = (params) =>
  withMockFallback(
    () => api.get('/history', { params }),
    () => paginateMockData(MOCK_HISTORY_RECORDS, params)
  );

export const getLatestDeviceHistory = (deviceId) =>
  withMockFallback(
    () => api.get(`/history/latest/${deviceId}`),
    () => {
      const latest = MOCK_HISTORY_RECORDS.find(
        (r) => (r.device?.id || 0) === deviceId
      );
      return { data: latest || MOCK_HISTORY_RECORDS[0] };
    }
  );

export const addHistoryRecord = (data) => createHistoryRecord(data);
export const updateHistoryRecord = (id, status) => updateHistoryStatus(id, status);

export default api;
