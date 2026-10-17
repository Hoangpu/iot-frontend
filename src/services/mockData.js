/**
 * ============================================================
 *  MOCK DATA - Dữ liệu mẫu cho IOT Frontend
 *  Khi backend không chạy, frontend sẽ dùng dữ liệu này.
 * ============================================================
 */

// ──────────────── Helper ────────────────
const now = new Date();
const ago = (minutes) => new Date(now.getTime() - minutes * 60 * 1000).toISOString();

// ──────────────── SENSORS ────────────────
export const MOCK_SENSORS = [
  { id: 1, name: 'ESP32_Node_01', sensorType: 'Nhiệt độ', unit: '°C' },
  { id: 2, name: 'ESP8266_Node_02', sensorType: 'Độ ẩm', unit: '%' },
  { id: 3, name: 'IoT_Room_Node', sensorType: 'Ánh sáng', unit: 'Lx' },
];

// ──────────────── ACTUATORS (Thiết bị điều khiển) ────────────────
export const MOCK_ACTUATORS = [
  { id: 1, name: 'LED 1', type: 'led', isActive: true },
  { id: 2, name: 'LED 2', type: 'led', isActive: false },
];

// ──────────────── LATEST SENSOR DATA (cho Dashboard chart) ────────────────
export const MOCK_LATEST_SENSOR_DATA = [];
for (let i = 29; i >= 0; i--) {
  const timeStr = ago(i * 0.5); // mỗi 30 giây
  // Nhiệt độ: dao động 24-32°C
  MOCK_LATEST_SENSOR_DATA.push({
    id: i * 3 + 1,
    value: (26 + Math.sin(i * 0.4) * 4 + (Math.random() - 0.5) * 1.5).toFixed(1),
    time: timeStr,
    sensor: { id: 1, name: 'ESP32_Node_01', sensorType: 'Nhiệt độ' },
  });
  // Độ ẩm: dao động 50-80%
  MOCK_LATEST_SENSOR_DATA.push({
    id: i * 3 + 2,
    value: (65 + Math.cos(i * 0.3) * 12 + (Math.random() - 0.5) * 3).toFixed(1),
    time: timeStr,
    sensor: { id: 2, name: 'ESP8266_Node_02', sensorType: 'Độ ẩm' },
  });
  // Ánh sáng: dao động 100-900 Lx
  MOCK_LATEST_SENSOR_DATA.push({
    id: i * 3 + 3,
    value: Math.round(450 + Math.sin(i * 0.25) * 300 + (Math.random() - 0.5) * 80).toString(),
    time: timeStr,
    sensor: { id: 3, name: 'IoT_Room_Node', sensorType: 'Ánh sáng' },
  });
}

// ──────────────── DATA SENSOR TABLE (cho trang DataSensor - 200 bản ghi) ────────────────
const SENSOR_CONFIGS = [
  { sensorId: 1, name: 'ESP32_Node_01', sensorType: 'Nhiệt độ', baseVal: 27, amplitude: 5, unit: '°C' },
  { sensorId: 2, name: 'ESP8266_Node_02', sensorType: 'Độ ẩm', baseVal: 65, amplitude: 15, unit: '%' },
  { sensorId: 3, name: 'IoT_Room_Node', sensorType: 'Ánh sáng', baseVal: 450, amplitude: 300, unit: 'Lx' },
];

export const MOCK_SENSOR_RECORDS = [];
for (let i = 0; i < 200; i++) {
  const cfg = SENSOR_CONFIGS[i % 3];
  const minutesAgo = i * 2; // mỗi 2 phút
  const val = cfg.sensorType === 'Ánh sáng'
    ? Math.round(cfg.baseVal + Math.sin(i * 0.15) * cfg.amplitude + (Math.random() - 0.5) * 60)
    : parseFloat((cfg.baseVal + Math.sin(i * 0.15) * cfg.amplitude + (Math.random() - 0.5) * 2).toFixed(1));
  MOCK_SENSOR_RECORDS.push({
    id: i + 1,
    value: String(val),
    time: ago(minutesAgo),
    sensor: {
      id: cfg.sensorId,
      name: cfg.name,
      sensorType: cfg.sensorType,
    },
  });
}

// ──────────────── ACTION HISTORY TABLE (cho trang ActionHistory - 150 bản ghi) ────────────────
const DEVICE_NAMES = ['LED 1', 'LED 2'];
const ACTIONS = ['ON', 'OFF'];
const STATUSES = ['SUCCESS', 'SUCCESS', 'SUCCESS', 'SUCCESS', 'FAILED']; // 80% success, 20% failed
const USERS = ['Mai Anh Hoàng', 'Admin', 'Nguyen Van A'];

export const MOCK_HISTORY_RECORDS = [];
for (let i = 0; i < 150; i++) {
  const minutesAgo = i * 3; // mỗi 3 phút
  MOCK_HISTORY_RECORDS.push({
    id: i + 1,
    action: ACTIONS[i % 2],
    status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
    time: ago(minutesAgo),
    device: {
      id: (i % 2) + 1,
      name: DEVICE_NAMES[i % 2],
    },
    user: {
      name: USERS[Math.floor(Math.random() * USERS.length)],
    },
  });
}

let currentHistoryId = 1000;

/**
 * Thêm bản ghi mới vào lịch sử (ví dụ với trạng thái LOADING)
 */
export const createHistoryRecord = (data = {}) => {
  currentHistoryId += 1;
  const newRecord = {
    id: currentHistoryId,
    action: data.action || 'ON',
    status: data.status || 'LOADING',
    time: data.time || new Date().toISOString(),
    device: data.device || { id: 1, name: 'LED 1' },
    user: data.user || { name: 'Mai Anh Hoàng' },
  };
  MOCK_HISTORY_RECORDS.unshift(newRecord);
  return newRecord;
};

/**
 * Cập nhật trạng thái bản ghi lịch sử (ví dụ từ LOADING -> SUCCESS)
 */
export const updateHistoryStatus = (id, newStatus) => {
  const rec = MOCK_HISTORY_RECORDS.find((r) => r.id === id);
  if (rec) {
    rec.status = newStatus;
  }
  return rec;
};

// ──────────────── USER (cho trang Profile) ────────────────
export const MOCK_USER = {
  id: 1,
  name: 'Mai Anh Hoàng',
  email: 'hoang.ma@iot-demo.com',
  username: 'hoangma',
  role: 'ADMIN',
  avatar: null,
};

// ──────────────── PAGINATION HELPER ────────────────
/**
 * Phân trang + lọc dữ liệu mẫu, trả về format giống Spring Boot Page<T>
 */
export function paginateMockData(allRecords, params = {}) {
  const page = parseInt(params.page) || 0;
  const size = parseInt(params.size) || 10;
  const sortDir = params.sortDir || 'desc';

  let filtered = [...allRecords];

  // Sắp xếp theo time
  filtered.sort((a, b) => {
    const ta = new Date(a.time).getTime();
    const tb = new Date(b.time).getTime();
    return sortDir === 'desc' ? tb - ta : ta - tb;
  });

  // Helper clean query unit
  const cleanUnit = (str) => {
    if (!str) return '';
    return String(str).toLowerCase().replace(/(\bđộ\b|°c|\bc\b|%|\blx\b|\blux\b)/gi, '').trim();
  };

  // Lọc theo condition & searchValue (DataSensor)
  const condition = params.condition;
  const rawSearch = (params.searchValue || '').trim();
  const cleanSearch = cleanUnit(rawSearch);

  if (condition === 'temperature' || (!condition && params.sensorType === 'Nhiệt độ')) {
    filtered = filtered.filter((r) => {
      const type = (r.sensor?.sensorType || r.sensor?.name || r.name || '').toLowerCase();
      if (!/nhiệt|temp/i.test(type)) return false;
      if (!rawSearch) return true;
      const vStr = String(r.value || '');
      const vNum = parseFloat(r.value);
      const qNum = parseFloat(cleanSearch);
      return vStr.includes(cleanSearch) || (!isNaN(vNum) && !isNaN(qNum) && Math.floor(vNum) === Math.floor(qNum));
    });
  } else if (condition === 'humidity' || (!condition && params.sensorType === 'Độ ẩm')) {
    filtered = filtered.filter((r) => {
      const type = (r.sensor?.sensorType || r.sensor?.name || r.name || '').toLowerCase();
      if (!/ẩm|humid/i.test(type)) return false;
      if (!rawSearch) return true;
      const vStr = String(r.value || '');
      const vNum = parseFloat(r.value);
      const qNum = parseFloat(cleanSearch);
      return vStr.includes(cleanSearch) || (!isNaN(vNum) && !isNaN(qNum) && Math.floor(vNum) === Math.floor(qNum));
    });
  } else if (condition === 'light' || (!condition && params.sensorType === 'Ánh sáng')) {
    filtered = filtered.filter((r) => {
      const type = (r.sensor?.sensorType || r.sensor?.name || r.name || '').toLowerCase();
      if (!/sáng|light/i.test(type)) return false;
      if (!rawSearch) return true;
      const vStr = String(r.value || '');
      return vStr.includes(cleanSearch);
    });
  } else if (condition === 'time') {
    if (rawSearch) {
      filtered = filtered.filter((r) => {
        const timeStr = new Date(r.time).toLocaleString('vi-VN');
        const rawTime = String(r.time || '');
        return timeStr.toLowerCase().includes(rawSearch.toLowerCase()) ||
               rawTime.toLowerCase().includes(rawSearch.toLowerCase());
      });
    }
  } else if (rawSearch) {
    // condition === 'all' hoặc không chọn condition nhưng có nhập searchValue
    filtered = filtered.filter((r) => {
      const type = (r.sensor?.sensorType || r.sensor?.name || r.name || '').toLowerCase();
      const vStr = String(r.value || '');
      const timeStr = new Date(r.time).toLocaleString('vi-VN');
      const rawTime = String(r.time || '');
      return type.includes(rawSearch.toLowerCase()) ||
             vStr.includes(cleanSearch) ||
             timeStr.toLowerCase().includes(rawSearch.toLowerCase()) ||
             rawTime.toLowerCase().includes(rawSearch.toLowerCase());
    });
  }

  // Lọc theo sensorName (DataSensor fallback)
  if (params.sensorName) {
    filtered = filtered.filter((r) => {
      const name = r.sensor?.name || r.name || '';
      return name === params.sensorName;
    });
  }

  // Lọc theo deviceName (ActionHistory)
  if (params.deviceName) {
    filtered = filtered.filter((r) => {
      const devName = typeof r.device === 'string' ? r.device : r.device?.name || '';
      return devName === params.deviceName;
    });
  }

  // Lọc theo action (ActionHistory)
  if (params.action) {
    filtered = filtered.filter((r) => r.action === params.action);
  }

  // Lọc theo status (ActionHistory)
  if (params.status) {
    filtered = filtered.filter((r) => {
      const s = String(r.status).toUpperCase();
      return s === String(params.status).toUpperCase();
    });
  }

  // Lọc theo searchTime (ActionHistory & fallback)
  if (params.searchTime) {
    const keyword = params.searchTime.toLowerCase();
    filtered = filtered.filter((r) => {
      const timeStr = new Date(r.time).toLocaleString('vi-VN');
      return timeStr.toLowerCase().includes(keyword);
    });
  }

  // Lọc theo khoảng thời gian
  if (params.startTime) {
    const startMs = new Date(params.startTime).getTime();
    if (!isNaN(startMs)) {
      filtered = filtered.filter((r) => new Date(r.time).getTime() >= startMs);
    }
  }
  if (params.endTime) {
    const endMs = new Date(params.endTime).getTime();
    if (!isNaN(endMs)) {
      filtered = filtered.filter((r) => new Date(r.time).getTime() <= endMs);
    }
  }

  const totalElements = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const start = page * size;
  const content = filtered.slice(start, start + size);

  return {
    data: {
      content,
      totalElements,
      totalPages,
      number: page,
      size,
      first: page === 0,
      last: page >= totalPages - 1,
    },
  };
}
