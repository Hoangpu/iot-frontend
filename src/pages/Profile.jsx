import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import avatarImg from '../assets/hoangpu.jpg';
import { getUser } from '../services/api';

// ==============================================================
// CÁC ĐƯỜNG LINK DỰ ÁN (BẠN CÓ THỂ THAY ĐỔI TẠI ĐÂY KHI HOÀN THIỆN)
// ==============================================================
const DEFAULT_PROJECT_RESOURCES = {
  phone: '0975496316',
  email: 'maianhhoang123@gmail.com',
  github: 'https://github.com/Hoangpu',
  pdfReport: 'https://drive.google.com/file/d/BaoCao_CuoiKy_IOT.pdf',
  apiDoc: 'https://documenter.getpostman.com/view/48579292/2sBYHSxLRo',
  figma: 'https://www.figma.com/design/cLg7DnfLflfhnFXXu6bUol/IOT_UI?node-id=0-1&t=fMOu29unTpOKjclI-0',
};

const Profile = () => {
  const [resources, setResources] = useState(DEFAULT_PROJECT_RESOURCES);
  const [user, setUser] = useState({
    name: 'Mai Anh Hoàng',
    studentId: 'B23DCCN332',
  });

  useEffect(() => {
    // Profile cố định của người làm dự án, không tải từ backend hay localStorage
  }, []);

  return (
    <div className="profile-container-centered">
      <div className="profile-card-modern">
        {/* Avatar with Neon Green Dashed Ring */}
        <div className="profile-avatar-dashed-ring">
          <img
            src={avatarImg}
            alt="HoangPu Avatar"
            className="profile-avatar-img"
          />
        </div>

        {/* Username */}
        <h2 className="profile-username">{user.name}</h2>

        {/* ID Badge */}
        <div className="profile-id-badge">
          ID: {user.studentId}
        </div>

        {/* Divider */}
        <div className="profile-divider" />

        {/* Info Rows: PHONE, EMAIL, GITHUB, REPORT */}
        <div className="profile-info-list">
          <div className="profile-info-row">
            <span className="profile-info-label">PHONE</span>
            <span className="profile-info-val">{resources.phone}</span>
          </div>

          <div className="profile-info-row">
            <span className="profile-info-label">EMAIL</span>
            <span className="profile-info-val">{resources.email}</span>
          </div>

          <div className="profile-info-row">
            <span className="profile-info-label">GITHUB</span>
            <a
              href={resources.github}
              target="_blank"
              rel="noopener noreferrer"
              className="profile-link-cyan"
              title={resources.github}
            >
              {resources.github}
            </a>
          </div>

          <div className="profile-info-row">
            <span className="profile-info-label">REPORT</span>
            <a
              href={resources.pdfReport}
              target="_blank"
              rel="noopener noreferrer"
              className="profile-link-cyan"
              title={resources.pdfReport}
            >
              {resources.pdfReport}
            </a>
          </div>
        </div>

        {/* Action Buttons: View API Documentation & View Figma Design */}
        <div className="profile-actions">
          {/* Primary Button */}
          <a
            href={resources.apiDoc}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-profile-primary"
          >
            <BookOpen size={16} />
            View API Documentation
          </a>

          {/* Secondary Button: Link to Figma */}
          <a
            href={resources.figma}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-profile-secondary"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
              <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
              <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" />
              <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
              <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
            </svg>
            View Figma Design
          </a>
        </div>
      </div>
    </div>
  );
};

export default Profile;
