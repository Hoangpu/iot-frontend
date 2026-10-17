import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Check } from 'lucide-react';

import { register } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !username.trim() || !password.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp nhau');
      return;
    }
    if (!agreed) {
      setError('Bạn cần đồng ý với Điều khoản sử dụng và Chính sách bảo mật');
      return;
    }

    try {
      await register({ fullName, email, username, password });
      alert('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || 'Có lỗi xảy ra khi đăng ký');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-register">
        {/* Header */}
        <h1 className="auth-title">Tạo tài khoản mới</h1>
        <p className="auth-subtitle">Đăng ký thành viên hệ thống giám sát ENV-IQ</p>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Họ và tên */}
          <div className="auth-field">
            <label className="auth-label">Họ và tên</label>
            <div className="auth-input-wrapper">
              <User size={16} className="auth-input-icon" />
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setError('');
                }}
                className="auth-input"
                autoComplete="name"
                style={{ backgroundColor: '#000000', background: '#000000' }}
              />
            </div>
          </div>

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <div className="auth-input-wrapper">
              <Mail size={16} className="auth-input-icon" />
              <input
                type="email"
                placeholder="nguyenvana@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="auth-input"
                autoComplete="email"
                style={{ backgroundColor: '#000000', background: '#000000' }}
              />
            </div>
          </div>

          {/* Tên tài khoản */}
          <div className="auth-field">
            <label className="auth-label">Tên tài khoản</label>
            <div className="auth-input-wrapper">
              <User size={16} className="auth-input-icon" />
              <input
                type="text"
                placeholder="username123"
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
                autoComplete="new-password"
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

          {/* Xác nhận mật khẩu */}
          <div className="auth-field">
            <label className="auth-label">Xác nhận mật khẩu</label>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                className="auth-input"
                autoComplete="new-password"
                style={{ backgroundColor: '#000000', background: '#000000' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="auth-password-toggle"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Điều khoản sử dụng checkbox */}
          <div
            className="auth-checkbox-group"
            onClick={() => setAgreed(!agreed)}
          >
            <div className="auth-checkbox-custom">
              {agreed && <Check size={12} color="#00e676" strokeWidth={3} />}
            </div>
            <span className="auth-checkbox-label">
              Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật
            </span>
          </div>

          {/* Nút Đăng ký tài khoản */}
          <button type="submit" className="auth-submit-btn">
            Đăng ký tài khoản
          </button>
        </form>

        {/* Divider */}
        <div className="auth-simple-divider" />

        {/* Footer */}
        <div className="auth-footer">
          Đã có tài khoản?
          <Link to="/login" className="auth-footer-link">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
