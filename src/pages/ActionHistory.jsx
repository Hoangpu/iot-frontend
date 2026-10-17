import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { searchHistory, getActuators } from '../services/api';

// Removed mock records generation

const ActionHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // "Applied" filter values — only used for fetching/filtering
  const [searchTime, setSearchTime] = useState('');
  const [sortDir, setSortDir] = useState('desc');
  const [deviceFilter, setDeviceFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // "Staged" input values — what the user sees/edits before clicking search
  const [inputSearchTime, setInputSearchTime] = useState('');
  const [inputSortDir, setInputSortDir] = useState('desc');
  const [inputDeviceFilter, setInputDeviceFilter] = useState('');
  const [inputActionFilter, setInputActionFilter] = useState('');
  const [inputStatusFilter, setInputStatusFilter] = useState('');

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Device list for dropdown - only LED 1 and LED 2
  const [deviceList, setDeviceList] = useState(['LED 1', 'LED 2']);

  // Apply all staged filters on search icon click or Enter
  const handleSearch = () => {
    setSearchTime(inputSearchTime);
    setSortDir(inputSortDir);
    setDeviceFilter(inputDeviceFilter);
    setActionFilter(inputActionFilter);
    setStatusFilter(inputStatusFilter);
    setPage(0);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Format ID: 56 -> #0056
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

  // Standardize Device Name
  const getDeviceName = (row) => {
    if (typeof row.device === 'string' && row.device) return row.device;
    if (row.deviceName) return row.deviceName;
    if (row.device?.name) return row.device.name;
    if (row.actuator?.name) return row.actuator.name;
    return 'Unknown Device';
  };

  // Standardize Status Text
  const formatStatus = (status) => {
    if (!status) return 'Success';
    const s = String(status).toUpperCase();
    if (s === 'SUCCESS') return 'Success';
    if (s === 'FAILED') return 'Failed';
    if (s === 'LOADING') return 'Loading';
    return status;
  };

  // Get Performer Name
  const getPerformerName = (row) => {
    if (typeof row.user === 'string' && row.user) return row.user;
    if (row.performer) return row.performer;
    if (row.user?.name) return row.user.name;
    if (row.userName) return row.userName;
    return 'Mai Anh Hoàng';
  };

  // Fetch real data from backend (uses applied filter values)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: pageSize,
        sortBy: 'time',
        sortDir,
      };
      if (actionFilter) params.action = actionFilter;
      if (deviceFilter) params.deviceName = deviceFilter;
      if (statusFilter) params.status = statusFilter;
      if (searchTime) params.searchTime = searchTime;

      const res = await searchHistory(params);
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
  }, [page, pageSize, actionFilter, deviceFilter, statusFilter, searchTime, sortDir]);

  // Load actuators for device filter options - only keep LED 1 and LED 2
  useEffect(() => {
    getActuators()
      .then((res) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const names = res.data
            .map((d) => d.name)
            .filter((name) => name === 'LED 1' || name === 'LED 2');
          if (names.length > 0) {
            setDeviceList(Array.from(new Set(names)));
          }
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((row) => {
      const devName = getDeviceName(row);
      const status = formatStatus(row.status);
      const timeStr = formatLocalTime(row.time);

      if (deviceFilter && devName !== deviceFilter) return false;
      if (actionFilter && row.action !== actionFilter) return false;
      if (statusFilter && status !== statusFilter) return false;
      if (searchTime && !timeStr.toLowerCase().includes(searchTime.toLowerCase())) return false;

      return true;
    });
  }, [records, deviceFilter, actionFilter, statusFilter, searchTime]);

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
          <h2 className="history-card-title">Device Interaction History</h2>

          {/* Filters on Top Right */}
          <div className="history-filters-group">
            {/* Search by time input */}
            <div className="history-search-box">
              <Search
                size={20}
                className="search-icon search-icon-clickable"
                onClick={handleSearch}
              />
              <input
                type="text"
                placeholder="Search by time..."
                value={inputSearchTime}
                onChange={(e) => setInputSearchTime(e.target.value)}
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

            {/* Device Filter */}
            <div className="history-select-wrapper">
              <select
                value={inputDeviceFilter}
                onChange={(e) => setInputDeviceFilter(e.target.value)}
                className="history-select"
              >
                <option value="">Device: All</option>
                {deviceList.map((d) => (
                  <option key={d} value={d}>
                    Device: {d}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="history-select-arrow" />
            </div>

            {/* Action Filter */}
            <div className="history-select-wrapper">
              <select
                value={inputActionFilter}
                onChange={(e) => setInputActionFilter(e.target.value)}
                className="history-select"
              >
                <option value="">Action: All</option>
                <option value="ON">Action: ON</option>
                <option value="OFF">Action: OFF</option>
              </select>
              <ChevronDown size={14} className="history-select-arrow" />
            </div>

            {/* Status Filter */}
            <div className="history-select-wrapper">
              <select
                value={inputStatusFilter}
                onChange={(e) => setInputStatusFilter(e.target.value)}
                className="history-select"
              >
                <option value="">Status: All</option>
                <option value="Success">Status: Success</option>
                <option value="Failed">Status: Failed</option>
                <option value="Loading">Status: Loading</option>
              </select>
              <ChevronDown size={14} className="history-select-arrow" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th style={{ width: '10%' }}>ID</th>
                <th style={{ width: '22%' }}>Device</th>
                <th style={{ width: '24%' }}>Action</th>
                <th style={{ width: '16%' }}>Status</th>
                <th style={{ width: '28%' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No interaction records found
                  </td>
                </tr>
              ) : (
                displayItems.map((row) => {
                  const devName = getDeviceName(row);
                  const status = formatStatus(row.status);
                  const isOff = String(row.action).toUpperCase() === 'OFF';
                  const performerName = getPerformerName(row);

                  return (
                    <tr key={row.id} className="history-table-row">
                      <td className="col-id">{formatId(row.id)}</td>
                      <td className="col-device">{devName}</td>
                      <td>
                        <div className="action-cell-content">
                          <span className={`action-pill-badge ${isOff ? 'action-pill-off' : 'action-pill-on'}`}>
                            {row.action}
                          </span>
                          <span className="action-performer-name">
                            {performerName}
                          </span>
                        </div>
                      </td>
                      <td className="col-status">
                        {status === 'Loading' ? (
                          <span className="status-loading-badge">
                            <span className="status-loading-pulse" />
                            Loading
                          </span>
                        ) : (
                          status
                        )}
                      </td>
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

export default ActionHistory;
