import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testFetch() {
  try {
    const params = {
      page: 0,
      size: 10,
      sortBy: 'time',
      sortDir: 'desc',
    };
    console.log("Fetching sensor data...", params);
    const resSensor = await api.get('/datasensor', { params });
    console.log("DataSensor:", resSensor.data.content ? resSensor.data.content.length : 'no content');
    
    console.log("Fetching history data...", params);
    const resHistory = await api.get('/history', { params });
    console.log("History:", resHistory.data.content ? resHistory.data.content.length : 'no content');
  } catch (err) {
    console.error("API Error:", err.message, err.response?.data);
  }
}

testFetch();
