import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { login, loading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) navigate('/home');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      setSubmitting(false); // Re-enable the button on error
    }
    // Note: setSubmitting(false) is not called on success because the user will be redirected
  };

  return (
    <div style={{ maxWidth: 400, margin: '3rem auto', background: 'var(--color-light)', borderRadius: 12, padding: '2rem', boxShadow: '0 2px 8px rgba(38,101,65,0.08)' }}>
      <h1 style={{ textAlign: 'center' }}>Login</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: 4 }}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--color-dark)', fontSize: 16 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: 4 }}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--color-dark)', fontSize: 16 }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12, textAlign: 'center' }}>{error}</div>}
        <button
          type="submit"
          disabled={submitting || loading}
          style={{ width: '100%', background: 'var(--color-darkest)', color: 'var(--color-lightest)', padding: '0.75rem', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, cursor: submitting || loading ? 'not-allowed' : 'pointer', opacity: submitting || loading ? 0.7 : 1 }}
        >
          {submitting || loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login; 