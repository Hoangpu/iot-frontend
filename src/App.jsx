import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, History, Radio, User, Calendar, LogOut } from 'lucide-react';
import logoPtit from './assets/logo-ptit.jpg';
import avatarImg from './assets/avatar.jpg';
import Dashboard from './pages/Dashboard';
import DataSensor from './pages/DataSensor';
import ActionHistory from './pages/ActionHistory';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/history', icon: History, label: 'On/Off History' },
    { path: '/sensors', icon: Radio, label: 'Data Sensor' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-container">
          <img
            src={logoPtit}
            alt="PTIT Logo"
            className="logo-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/150x60?text=PTIT+Logo";
            }}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const IconComp = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${active ? 'nav-active' : ''}`}
            >
              <div className={`nav-icon-wrapper ${active ? 'nav-icon-active' : ''}`}>
                <IconComp size={18} />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

const Header = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatHeaderDate = (d) => {
    const day = d.getDate();
    const suffix =
      day === 1 || day === 21 || day === 31 ? 'st' :
      day === 2 || day === 22 ? 'nd' :
      day === 3 || day === 23 ? 'rd' : 'th';

    const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const year = d.getFullYear();
    const timeStr = d.toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    return {
      dateStr: `${weekday}, ${day}${suffix} ${month} ${year}`,
      timeStr: `${timeStr}`,
    };
  };

  const { dateStr, timeStr } = formatHeaderDate(time);

  return (
    <header className="app-header">
      <div className="header-time">
        <Calendar size={15} />
        <span>{dateStr}</span>
        <span className="header-dot">•</span>
        <span className="header-clock">{timeStr}</span>
      </div>

      <div className="header-user">
        <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="header-user-info">
            <span className="header-user-name">{localStorage.getItem('username') || 'User'}</span>
            <span className="header-user-email"></span>
          </div>
          <img
            src={avatarImg}
            alt="Avatar"
            className="header-avatar"
          />
        </Link>
        <Link to="/login" title="Đăng nhập / Đăng xuất" style={{ color: '#64748b', display: 'flex', alignItems: 'center', padding: '6px', borderRadius: '6px', transition: 'all 0.2s' }}>
          <LogOut size={16} />
        </Link>
      </div>
    </header>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<ActionHistory />} />
            <Route path="/sensors" element={<DataSensor />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
