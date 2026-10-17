import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchSensorData } from '../services/api';

const DataSensor = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // "Applied" filter values — only used for fetching/filtering
  const [condition, setCondition] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [sortDir, setSortDir] = useState('desc');

  // "Staged" input values — what the user sees/edits before clicking search icon / Enter
  const [inputCondition, setInputCondition] = useState('all');
  const [inputSearchValue, setInputSearchValue] = useState('');
  const [inputSortDir, setInputSortDir] = useState('desc');

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Dynamic placeholder based on selected condition
  const getPlaceholder = () => {
    switch (inputCondition) {
      case 'temperature':
        return 'Search temperature ';
      case 'humidity':
        return 'Search humidity ';
      case 'light':
        return 'Search light ';
      case 'time':
        return 'Search by time...';
      default:
        return 'Search...';
    }
  };

  // Helper clean query unit (e.g. "26 độ", "26°C", "60%", "450 lx" -> "26", "60", "450")
  const cleanQuery = (q) => {
    if (!q) return '';
    return String(q).toLowerCase().replace(/(\bđộ\b|°c|\bc\b|%|\blx\b|\blux\b)/gi, '').trim();
  };

  // Apply all staged filters on search icon click or Enter
  const handleSearch = () => {
    setCondition(inputCondition);
    setSearchValue(inputSearchValue);
    setSortDir(inputSortDir);
    setPage(0);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Format ID: 1024 -> #1024
  const formatId = (id) => {
    if (typeof id === 'string' && id.startsWith('#')) return id;
    return `#${String(id).padStart(4, '0')}`;
  };

  // Format Local Time: YYYY-MM-DD HH:mm:ss
  const formatLocalTime = (timeStr) => {
    if (!timeStr) return '--';
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return String(timeStr);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch {
      return String(timeStr);
    }
  };

  // Standardize Sensor Name to humidity / light / temperature
  const getSensorName = (row) => {
    const name = row.name || row.sensor?.name || '';
    const sensorType = row.type || row.sensor?.sensorType || '';
    const combined = `${name} ${sensorType}`.toLowerCase();

    if (/nhiệt|temp/i.test(combined)) return 'temperature';
    if (/ẩm|humid/i.test(combined)) return 'humidity';
    if (/sáng|light/i.test(combined)) return 'light';
    return name || 'unknown';
  };

  // Standardize Sensor Display Value
  const getDisplayValue = (row) => {
    if (row.displayValue) return row.displayValue;
    const sensorName = getSensorName(row);
    const val = parseFloat(row.value);
    if (isNaN(val)) return '--';
    if (sensorName === 'temperature') return `${val.toFixed(1)}°C`;
    if (sensorName === 'humidity') return `${val.toFixed(1)}%`;
    if (sensorName === 'light') return `${Math.round(val)} Lx`;
    return `${val}`;
  };

  // Fetch real data from backend / mock (uses applied filter values)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: pageSize,
        sortBy: 'time',
        sortDir,
        condition,
        searchValue,
      };

      if (condition === 'temperature') params.sensorType = 'Nhiệt độ';
      else if (condition === 'humidity') params.sensorType = 'Độ ẩm';
      else if (condition === 'light') params.sensorType = 'Ánh sáng';

      if (condition === 'time') {
        params.searchTime = searchValue;
      }

      const res = await searchSensorData(params);
      if (res?.data) {
        setRecords(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setRecords([]);
        setTotalElements(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
      setRecords([]);
      setTotalElements(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, condition, searchValue, sortDir]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter records (client-side fallback & smart matching)
  const filteredRecords = useMemo(() => {
    return records.filter((row) => {
      const sensorName = getSensorName(row);
      const timeStr = formatLocalTime(row.time);
      const valStr = String(row.value ?? '');
      const displayVal = getDisplayValue(row);

      const cleaned = cleanQuery(searchValue);
      const lowerSearch = searchValue.toLowerCase().trim();

      if (condition === 'temperature') {
        if (sensorName !== 'temperature') return false;
        if (!searchValue) return true;
        const vNum = parseFloat(row.value);
        const qNum = parseFloat(cleaned);
        return (
          valStr.includes(cleaned) ||
          displayVal.toLowerCase().includes(lowerSearch) ||
          (!isNaN(vNum) && !isNaN(qNum) && Math.floor(vNum) === Math.floor(qNum))
        );
      }

      if (condition === 'humidity') {
        if (sensorName !== 'humidity') return false;
        if (!searchValue) return true;
        const vNum = parseFloat(row.value);
        const qNum = parseFloat(cleaned);
        return (
          valStr.includes(cleaned) ||
          displayVal.toLowerCase().includes(lowerSearch) ||
          (!isNaN(vNum) && !isNaN(qNum) && Math.floor(vNum) === Math.floor(qNum))
        );
      }

      if (condition === 'light') {
        if (sensorName !== 'light') return false;
        if (!searchValue) return true;
        return (
          valStr.includes(cleaned) ||
          displayVal.toLowerCase().includes(lowerSearch)
        );
      }

      if (condition === 'time') {
        if (!searchValue) return true;
        return (
          timeStr.toLowerCase().includes(lowerSearch) ||
          String(row.time).toLowerCase().includes(lowerSearch)
        );
      }

      // condition === 'all'
      if (!searchValue) return true;
      return (
        sensorName.toLowerCase().includes(lowerSearch) ||
        valStr.includes(cleaned) ||
        displayVal.toLowerCase().includes(lowerSearch) ||
        timeStr.toLowerCase().includes(lowerSearch)
      );
    });
  }, [records, condition, searchValue]);

  const displayItems = filteredRecords;
  const currentTotal = totalElements;
  const currentTotalPages = totalPages;

  const startItem = currentTotal === 0 ? 0 : page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, currentTotal);

  return (
    <div className="history-page-container">
      <div className="history-card">
        {/* Card Header */}
        <div className="history-card-header">
          <h2 className="history-card-title">Sensor Telemetry Stream</h2>

          {/* Filters on Top Right */}
          <div className="history-filters-group">
            {/* Condition Filter (All / temperature / humidity / light / time) */}
            <div className="history-select-wrapper">
              <select
                value={inputCondition}
                onChange={(e) => setInputCondition(e.target.value)}
                className="history-select"
              >
                <option value="all">All</option>
                <option value="temperature">temperature</option>
                <option value="humidity">humidity</option>
                <option value="light">light</option>
                <option value="time">time</option>
              </select>
              <ChevronDown size={14} className="history-select-arrow" />
            </div>

            {/* Search Input with 🔍 Icon */}
            <div className="history-search-box">
              <Search
                size={20}
                className="search-icon search-icon-clickable"
                onClick={handleSearch}
                title="Search"
              />
              <input
                type="text"
                placeholder={getPlaceholder()}
                value={inputSearchValue}
                onChange={(e) => setInputSearchValue(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="history-search-input"
              />
            </div>

            {/* Sort by Time */}
            <div className="history-select-wrapper">
              <select
                value={inputSortDir}
                onChange={(e) => setInputSortDir(e.target.value)}
                className="history-select"
              >
                <option value="desc">Time: Newest</option>
                <option value="asc">Time: Oldest</option>
              </select>
              <ChevronDown size={14} className="history-select-arrow" />
            </div>
          </div>
        </div>

        {/* Table — 4 columns: ID, Name, Value, Time */}
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>ID</th>
                <th style={{ width: '25%' }}>Name</th>
                <th style={{ width: '25%' }}>Value</th>
                <th style={{ width: '35%' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Loading telemetry records...
                  </td>
                </tr>
              ) : displayItems.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No sensor telemetry records found
                  </td>
                </tr>
              ) : (
                displayItems.map((row) => {
                  const name = getSensorName(row);
                  const displayVal = getDisplayValue(row);

                  return (
                    <tr key={row.id} className="history-table-row">
                      <td className="col-id">{formatId(row.id)}</td>
                      <td className="col-sensor-name">{name}</td>
                      <td className="col-sensor-value">{displayVal}</td>
                      <td className="col-time">{formatLocalTime(row.time)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div className="history-footer">
          <div className="history-rows-per-page">
            <span>Rows per page:</span>
            <div className="history-rows-select-wrapper">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(0);
                }}
                className="history-rows-select"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown size={12} className="history-rows-arrow" />
            </div>
          </div>

          <div className="history-pagination-ctrls">
            <span className="history-pagination-info">
              {startItem}-{endItem} of {currentTotal}
            </span>
            <div className="history-pagination-buttons">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="history-pagination-btn"
                title="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(currentTotalPages - 1, p + 1))}
                disabled={page >= currentTotalPages - 1}
                className="history-pagination-btn"
                title="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSensor;
