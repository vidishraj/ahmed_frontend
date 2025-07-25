import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import '../App.css';
import logo from '../assets/logo.jpeg'; // adjust path if needed

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
    { to: '/dashboard', label: 'Dashboard', show: !!user },
    { to: '/upload', label: 'Upload Data', show: user?.role === 'admin' || user?.role === 'superadmin' },
    { to: '/role-management', label: 'Role Management', show: user?.role === 'superadmin' },
    { to: '/policy-files', label: 'Policy Files', show: !!user },
    { to: '/login', label: 'Logout', show: !!user, onClick: handleLogout },
  ];

  return (
    <header style={{ background: 'var(--color-darkest)', color: 'var(--color-lightest)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src={logo} alt="NCEC Logo" style={{ height: 40, marginRight: 15 }} />
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>NCEC Environmental Dashboard</h1>
      </div>
      <nav>
        <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, gap: '1.5rem' }}>
          {navLinks
            .filter(link => link.show)
            .map(link => (
              <li key={link.to}>
                {link.onClick ? (
                  <button
                    onClick={link.onClick}
                    style={{ background: 'none', border: 'none', color: 'var(--color-lightest)', cursor: 'pointer', fontSize: '1rem', textDecoration: 'none' }}
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    to={link.to}
                    style={{ color: 'var(--color-lightest)', textDecoration: 'none', fontWeight: 500 }}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header; 