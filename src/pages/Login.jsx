import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tên tài khoản và mật khẩu');
      return;
    }

    // Giả lập kiểm tra tài khoản
    if (username !== 'admin' || password !== '123456') {
      setError('Tên tài khoản hoặc mật khẩu không chính xác');
      return;
    }

    // Giả lập đăng nhập thành công và chuyển đến Dashboard
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('username', username);
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header */}
        <h1 className="auth-title">Chào mừng</h1>
        <p className="auth-subtitle">Vui lòng đăng nhập để tiếp tục quản lý hệ thống</p>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Tên tài khoản */}
          <div className="auth-field">
            <label className="auth-label">Tên tài khoản</label>
            <div className="auth-input-wrapper">
              <User size={16} className="auth-input-icon" />
              <input
                type="text"
                placeholder="Nhập tên tài khoản hoặc email"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="auth-input"
                autoComplete="username"
                style={{ backgroundColor: '#000000', background: '#000000' }}
              />
            </div>
          </div>

          {/* Mật khẩu */}
          <div className="auth-field">
            <label className="auth-label">Mật khẩu</label>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="auth-input"
                autoComplete="current-password"
                style={{ backgroundColor: '#000000', background: '#000000' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-password-toggle"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Quên mật khẩu */}
          <Link to="/forgot-password" onClick={(e) => { e.preventDefault(); alert('Chức năng đặt lại mật khẩu sẽ được hỗ trợ qua backend!'); }} className="auth-forgot-link">
            Quên mật khẩu?
          </Link>

          {/* Nút Đăng nhập */}
          <button type="submit" className="auth-submit-btn">
            Đăng nhập
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>hoặc đăng nhập bằng</span>
        </div>

        {/* Social login buttons */}
        <div className="auth-social-row">
          <button
            type="button"
            onClick={() => alert('Đăng nhập Google sẽ được tích hợp với OAuth backend!')}
            className="auth-social-btn"
          >
            {/* Google Icon */}
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 12s.6 3.6 1.6 5.6l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
              />
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={() => alert('Đăng nhập Github sẽ được tích hợp với OAuth backend!')}
            className="auth-social-btn"
          >
            {/* Github Icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Github
          </button>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          Chưa có tài khoản?
          <Link to="/register" className="auth-footer-link">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
