import React, { useState, useEffect, useCallback } from 'react';
import {
  Thermometer, Droplets, Sun, Lightbulb, Laptop
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getLatestSensorData, getActuators, controlDevice, addHistoryRecord, updateHistoryRecord } from '../services/api';

const Dashboard = () => {
  // 2 Thiết bị: 2 LED
  const initialDevices = [
    { id: 1, name: 'LED 1', type: 'led', isActive: false, icon: Lightbulb },
    { id: 2, name: 'LED 2', type: 'led', isActive: false, icon: Lightbulb },
  ];

  // Dữ liệu sóng mẫu
  const defaultWaveData = [
    { time: '09:40:00', temperature: 26.5, humidity: 62.0, light: 480 },
    { time: '09:40:05', temperature: 26.5, humidity: 62.0, light: 480 },
    { time: '09:40:10', temperature: 26.5, humidity: 62.0, light: 480 },
    { time: '09:40:15', temperature: 26.6, humidity: 62.0, light: 480 },
    { time: '09:40:20', temperature: 26.5, humidity: 61.9, light: 480 },
    { time: '09:40:25', temperature: 26.5, humidity: 62.0, light: 480 },
    { time: '09:40:30', temperature: 26.5, humidity: 62.0, light: 480 },
  ];

  const [sensorData, setSensorData] = useState(defaultWaveData);
  const [devices, setDevices] = useState(initialDevices);
  const [latestValues, setLatestValues] = useState({
    temperature: '26.5',
    humidity: '62.0',
    light: '480',
  });
  const [controlling, setControlling] = useState({});

  // Nhóm dữ liệu cảm biến từ backend
  const groupSensorData = (rawData) => {
    if (!rawData || rawData.length === 0) return defaultWaveData;
    const timeMap = {};
    rawData.forEach((d) => {
      const timeStr = d.time
        ? new Date(d.time).toLocaleTimeString('vi-VN', {
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        })
        : '';
      if (!timeMap[timeStr]) {
        timeMap[timeStr] = { time: timeStr };
      }
      const type = d.sensor?.sensorType;
      const numVal = parseFloat(d.value) || 0;
      if (type === 'Nhiệt độ') {
        timeMap[timeStr].temperature = numVal;
      }
      if (type === 'Độ ẩm') {
        timeMap[timeStr].humidity = numVal;
      }
      if (type === 'Ánh sáng') {
        timeMap[timeStr].light = numVal;
      }
    });

    const list = Object.values(timeMap).reverse().slice(-10);
    return list.length >= 3 ? list : defaultWaveData;
  };

  // Fetch dữ liệu định kỳ
  const fetchInitialData = useCallback(async () => {
    try {
      const [sensorRes, deviceRes] = await Promise.all([
        getLatestSensorData().catch(() => null),
        getActuators().catch(() => null),
      ]);

      if (sensorRes && sensorRes.data && sensorRes.data.length > 0) {
        const rawData = sensorRes.data;
        setSensorData(groupSensorData(rawData));

        const latest = {};
        rawData.forEach((d) => {
          const type = d.sensor?.sensorType;
          if (type && !latest[type]) {
            latest[type] = d.value;
          }
        });
        setLatestValues({
          temperature: latest['Nhiệt độ'] !== undefined ? String(latest['Nhiệt độ']) : '26.5',
          humidity: latest['Độ ẩm'] !== undefined ? String(latest['Độ ẩm']) : '62.0',
          light: latest['Ánh sáng'] !== undefined ? String(latest['Ánh sáng']) : '480',
        });
      }

      if (deviceRes && deviceRes.data && Array.isArray(deviceRes.data) && deviceRes.data.length > 0) {
        const backendDevices = deviceRes.data;
        setDevices((prev) =>
          prev.map((dev) => {
            const matched = backendDevices.find((b) => b.id === dev.id);
            return matched
              ? { ...dev, isActive: Boolean(matched.isActive), id: matched.id, name: matched.name || dev.name }
              : dev;
          })
        );
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(fetchInitialData, 5000);
    return () => clearInterval(interval);
  }, [fetchInitialData]);

  // UC02 - Bật/Tắt thiết bị: Có khoảng loading trước khi đổi trạng thái, đồng thời ghi nhận LOADING vào Action History
  const handleToggleDevice = async (deviceId, currentState) => {
    const nextState = !currentState;
    const action = nextState ? 'ON' : 'OFF';
    const targetDev = devices.find((d) => d.id === deviceId);
    const deviceName = targetDev?.name || `LED ${deviceId}`;

    setControlling((prev) => ({ ...prev, [deviceId]: true }));

    const historyItem = addHistoryRecord({
      device: { id: deviceId, name: deviceName },
      action,
      status: 'LOADING',
      time: new Date().toISOString(),
      user: { name: 'Mai Anh Hoàng' },
    });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await controlDevice(deviceId, action);

      setDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, isActive: nextState } : d))
      );

      if (historyItem?.id) {
        updateHistoryRecord(historyItem.id, 'SUCCESS');
      }
    } catch (err) {
      console.warn('API call failed, kept visual state:', err);
      if (historyItem?.id) {
        updateHistoryRecord(historyItem.id, 'FAILED');
      }
    } finally {
      setControlling((prev) => ({ ...prev, [deviceId]: false }));
    }
  };

  const handleToggleAll = async () => {
    const isAllOn = devices.every((d) => d.isActive);
    const turnOn = !isAllOn;
    const action = turnOn ? 'ON' : 'OFF';

    setControlling({ 0: true, 1: true, 2: true });

    const historyItems = devices.map((dev) =>
      addHistoryRecord({
        device: { id: dev.id, name: dev.name },
        action,
        status: 'LOADING',
        time: new Date().toISOString(),
        user: { name: 'Mai Anh Hoàng' },
      })
    );

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await controlDevice(0, action);

      setDevices((prev) => prev.map((d) => ({ ...d, isActive: turnOn })));

      historyItems.forEach((item) => {
        if (item?.id) updateHistoryRecord(item.id, 'SUCCESS');
      });
    } catch (err) {
      console.warn('API call failed for Toggle All:', err);
      historyItems.forEach((item) => {
        if (item?.id) updateHistoryRecord(item.id, 'FAILED');
      });
    } finally {
      setControlling({});
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-chart-tooltip">
          <p className="tooltip-time">{label}</p>
          <p className="tooltip-val" style={{ color: '#ff2d55' }}>
            Temp: <strong>{data.temperature} °C</strong>
          </p>
          <p className="tooltip-val" style={{ color: '#38bdf8' }}>
            Humidity: <strong>{data.humidity} %</strong>
          </p>
          <p className="tooltip-val" style={{ color: '#fbbf24' }}>
            Light: <strong>{data.light} lx</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  const isAllOn = devices.every(d => d.isActive);

  return (
    <div className="dashboard-content-wrapper">
      <div className="dashboard-columns-layout">
        {/* Cột trái: Room Condition & Biểu đồ Sensor Data Waves */}
        <div className="dashboard-main-column">
          {/* Room Condition */}
          <div className="room-condition-block">
            <h2 className="room-condition-heading">Room Condition</h2>
            <div className="room-cards-grid">
              {/* Temperature Card */}
              <div className="room-metric-card">
                <div className="metric-card-top">
                  <span className="metric-name">Temperature</span>
                  <div className="metric-icon-circle icon-temp">
                    <Thermometer size={18} strokeWidth={2.2} />
                  </div>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value-number">{latestValues.temperature}</span>
                  <span className="metric-value-unit">°C</span>
                </div>
              </div>

              {/* Humidity Card */}
              <div className="room-metric-card">
                <div className="metric-card-top">
                  <span className="metric-name">Humidity</span>
                  <div className="metric-icon-circle icon-humid">
                    <Droplets size={18} strokeWidth={2.2} />
                  </div>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value-number">{latestValues.humidity}</span>
                  <span className="metric-value-unit">%</span>
                </div>
              </div>

              {/* Light Level Card */}
              <div className="room-metric-card">
                <div className="metric-card-top">
                  <span className="metric-name">Light Level</span>
                  <div className="metric-icon-circle icon-light">
                    <Sun size={18} strokeWidth={2.2} />
                  </div>
                </div>
                <div className="metric-card-bottom">
                  <span className="metric-value-number">{latestValues.light}</span>
                  <span className="metric-value-unit">lx</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sensor Data Waves Chart */}
          <div className="sensor-waves-card">
            <div className="waves-card-header">
              <h3 className="waves-card-title">Sensor Data Waves</h3>
              <div className="waves-legend">
                <div className="waves-legend-item">
                  <span className="legend-dot-circle dot-temp" />
                  <span className="legend-text">Temp</span>
                </div>
                <div className="waves-legend-item">
                  <span className="legend-dot-circle dot-humid" />
                  <span className="legend-text">Humidity</span>
                </div>
                <div className="waves-legend-item">
                  <span className="legend-dot-circle dot-light" />
                  <span className="legend-text">Light Level</span>
                </div>
              </div>
            </div>

            <div className="waves-chart-container">
              {/* Nhãn đơn vị trục Y bên trái và bên phải */}
              <div className="waves-y-units-left">
                <span className="y-unit-item y-unit-temp">°C</span> / <span className="y-unit-item y-unit-humid">%</span>
              </div>
              <div className="waves-y-units-right">
                <span className="y-unit-item y-unit-light">lx</span>
              </div>

              <ResponsiveContainer width="100%" height={290}>
                <LineChart
                  data={sensorData}
                  margin={{ top: 22, right: 10, left: -10, bottom: 6 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1c2333"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#1c2333' }}
                  />
                  {/* Cột Y bên trái: Nhiệt độ & Độ ẩm (0 - 100) */}
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    domain={[0, 100]}
                    ticks={[0, 20, 40, 60, 80, 100]}
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#1c2333' }}
                  />
                  {/* Cột Y bên phải: Ánh sáng (0 - 1000) */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 1000]}
                    ticks={[0, 200, 400, 600, 800, 1000]}
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#1c2333' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temperature"
                    stroke="#ff2d55"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                    name="Nhiệt độ"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="humidity"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                    name="Độ ẩm"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="light"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                    name="Ánh sáng"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Cột phải: On/Off Device */}
        <div className="dashboard-side-column">
          <div className="device-control-box">
            <h3 className="device-control-title">On/Off Device</h3>

            <div className="device-items-group">
              {/* Nút Bật/Tắt Tất Cả (Giữ nguyên form pill) */}
              <div className="device-card-row" style={{ marginBottom: '15px', borderBottom: '1px solid #1c2333', paddingBottom: '15px' }}>
                <div className="device-card-info">
                  <div className={`device-icon-wrapper ${isAllOn ? 'icon-on' : 'icon-off'}`}>
                    <Lightbulb size={20} />
                  </div>
                  <div className="device-label-col">
                    <span className="device-label-text">Tất cả đèn</span>
                    {controlling[0] && <span className="device-status-hint">Đang xử lý...</span>}
                  </div>
                </div>
                <button
                  type="button"
                  className={`device-toggle-pill ${isAllOn ? 'pill-active' : 'pill-inactive'} ${controlling[0] ? 'pill-loading' : ''}`}
                  onClick={handleToggleAll}
                  disabled={controlling[0] || controlling[1] || controlling[2]}
                >
                  <span className="toggle-slider-circle">
                    {controlling[0] && <span className="toggle-spinner-inner" />}
                  </span>
                </button>
              </div>
              {devices.map((device) => {
                const IconComp = device.icon;
                const isBusy = controlling[device.id];
                return (
                  <div key={device.id} className="device-card-row">
                    <div className="device-card-info">
                      <div className={`device-icon-wrapper ${device.isActive ? 'icon-on' : 'icon-off'}`}>
                        <IconComp size={20} />
                      </div>
                      <div className="device-label-col">
                        <span className="device-label-text">{device.name}</span>
                        {isBusy && <span className="device-status-hint">Đang xử lý...</span>}
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`device-toggle-pill ${device.isActive ? 'pill-active' : 'pill-inactive'} ${isBusy ? 'pill-loading' : ''}`}
                      onClick={() => handleToggleDevice(device.id, device.isActive)}
                      disabled={isBusy}
                      aria-label={`Toggle ${device.name}`}
                    >
                      <span className="toggle-slider-circle">
                        {isBusy && <span className="toggle-spinner-inner" />}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
