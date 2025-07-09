import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import '../App.css';

interface NavLink {
  to: string;
  label: string;
  show?: boolean;
  onClick?: () => void;
}

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const navLinks: NavLink[] = [
    { to: '/dashboard', label: 'Dashboard', show: user?.role === 'user' || user?.role === 'admin' || user?.role === 'superadmin'  },
    { to: '/upload', label: 'Upload', show: user?.role === 'admin' || user?.role === 'superadmin' },
    { to: '/role-management', label: 'Role Management', show: user?.role === 'superadmin' },
    user
      ? { to: '#', label: 'Logout', show: true, onClick: handleLogout }
      : { to: '/login', label: 'Login', show: true },
  ];

  return (
    <header>
      <div className="header-logo">
        <img src="/src/assets/logo.jpeg" alt="Logo" style={{ height: 32, borderRadius: '50%' }} />
        NCEC-DOA
      </div>
      <nav className="header-nav">
        {navLinks.filter(link => link.show).map((link) =>
          link.onClick ? (
            <a key={link.label} href="#" onClick={e => { e.preventDefault(); link.onClick && link.onClick(); }}>{link.label}</a>
          ) : (
            <Link key={link.to} to={link.to}>{link.label}</Link>
          )
        )}
      </nav>
    </header>
  );
};

export default Header; 