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
//  MOCK FALLBACK WRAPPER
//  Gọi API thật trước → nếu lỗi (backend tắt) → dùng mock data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const withMockFallback = (apiCall, mockFn) => {
  return apiCall().catch((err) => {
    console.warn('⚠️ Backend không phản hồi, dùng dữ liệu mẫu (mock):', err.message);
    return mockFn();
  });
};

// ============ USER (UC06) ============
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
        ...MOCK_USER,
        name: data.name || 'New User',
        email: data.email || 'new@iot.com',
        username: data.username || 'newuser',
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
