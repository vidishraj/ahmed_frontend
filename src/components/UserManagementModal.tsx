import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
  onCreateUser: (userData: { email: string; password: string; role: string; displayName?: string }) => Promise<void>;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
  onCreateUser,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user',
    displayName: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    if (!email.endsWith('@ncec.gov.sa')) {
      return 'Email must end with @ncec.gov.sa';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: { [key: string]: string } = {};
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    
    if (Object.values(newErrors).some(error => error)) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onCreateUser(formData);
      setFormData({ email: '', password: '', role: 'user', displayName: '' });
      setErrors({});
      onUserCreated();
      onClose();
      toast.success('User created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: '', password: '', role: 'user', displayName: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: '2rem',
        width: '90%',
        maxWidth: 500,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: '#256541', fontSize: '1.5rem' }}>Add New User</h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666',
              padding: '0.25rem',
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="user@ncec.gov.sa"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `2px solid ${errors.email ? '#e74c3c' : '#ddd'}`,
                borderRadius: 8,
                fontSize: '1rem',
                outline: 'none',
              }}
            />
            {errors.email && (
              <div style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {errors.email}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Minimum 6 characters"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `2px solid ${errors.password ? '#e74c3c' : '#ddd'}`,
                borderRadius: 8,
                fontSize: '1rem',
                outline: 'none',
              }}
            />
            {errors.password && (
              <div style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {errors.password}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="role" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Role *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #ddd',
                borderRadius: 8,
                fontSize: '1rem',
                outline: 'none',
                backgroundColor: '#fff',
              }}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="displayName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Display Name (Optional)
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              placeholder="Full name"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #ddd',
                borderRadius: 8,
                fontSize: '1rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: '0.75rem 1.5rem',
                border: '2px solid #256541',
                borderRadius: 8,
                backgroundColor: 'transparent',
                color: '#256541',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: 8,
                backgroundColor: loading ? '#ccc' : '#256541',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagementModal; 