import React, { useEffect, useState } from 'react';
import { type DashboardUser, type UserRole } from '../types/user';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest, createUser, deleteUser } from '../api';
import UserManagementModal from '../components/UserManagementModal';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

interface UserRow extends DashboardUser {}

const roles: UserRole[] = ['user', 'admin', 'superadmin'];
const PAGE_SIZE = 10;

const fetchUsers = async (token: string) => {
  return apiRequest('/api/user-list/', { method: 'GET' }, token);
};

const updateUserRole = async (uid: string, role: string, token: string) => {
  return apiRequest('/api/user-role/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({ uid, role }),
  }, token);
};

const RoleManagement: React.FC = () => {
  const { firebaseUser } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editRoles, setEditRoles] = useState<{ [uid: string]: UserRole }>({});
  const [showModal, setShowModal] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      if (!firebaseUser) throw new Error('Not authenticated');
      const token = await firebaseUser.getIdToken();
      const data = await fetchUsers(token);
      setUsers(data.users);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [firebaseUser]);

  const paginatedUsers = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(users.length / PAGE_SIZE);

  const handleRoleChange = (uid: string, role: UserRole) => {
    setEditRoles(prev => ({ ...prev, [uid]: role }));
  };

  const handleSaveRole = async (uid: string) => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      await updateUserRole(uid, editRoles[uid], token);
      setUsers(users => users.map(u => u.uid === uid ? { ...u, role: editRoles[uid] } : u));
      setEditRoles(prev => { const p = { ...prev }; delete p[uid]; return p; });
      toast.success('Role updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to change user role');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = (uid: string) => {
    setEditRoles(prev => { const p = { ...prev }; delete p[uid]; return p; });
  };

  const handleCreateUser = async (userData: { email: string; password: string; role: string; displayName?: string }) => {
    if (!firebaseUser) throw new Error('Not authenticated');
    const token = await firebaseUser.getIdToken();
    await createUser(userData, token);
    await loadUsers(); // Refresh the user list
  };

  const handleDeleteUser = async (uid: string, email: string) => {
    if (!firebaseUser) return;
    
    if (!window.confirm(`Are you sure you want to delete user: ${email}?`)) {
      return;
    }

    setLoading(true);
    try {
      const token = await firebaseUser.getIdToken();
      await deleteUser(uid, token);
      setUsers(users => users.filter(u => u.uid !== uid));
      toast.success('User deleted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    if (!window.confirm(`Send password reset email to: ${email}?`)) {
      return;
    }

    setLoading(true);
    try {
      const actionCodeSettings = {
        url: 'https://ncec-doe.com/login',     // <‑‑ change to whatever route you want
        handleCodeInApp: true,                 // keeps it in web context
      };
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      toast.success(`Password reset email sent to ${email}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0' }}>
        <h1 style={{ textAlign: 'center', fontSize: '2.5rem', color: '#256541', margin: 0 }}>Role Management</h1>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: '#256541',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: 8,
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(38,101,65,0.2)',
          }}
        >
          + Add User
        </button>
      </div>
      
      <div style={{ background: '#eaf6ef', padding: '2rem', borderRadius: 16, maxWidth: 1200, margin: '2rem auto', boxShadow: '0 2px 12px rgba(38,101,65,0.10)' }}>
        {loading && <div>Loading...</div>}
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '1.1rem' }}>
          <thead>
            <tr style={{ background: '#256541', color: '#fff' }}>
              <th style={{ padding: 12, borderTopLeftRadius: 8 }}>UID</th>
              <th style={{ padding: 12 }}>Email</th>
              <th style={{ padding: 12 }}>Name</th>
              <th style={{ padding: 12 }}>Role</th>
              <th style={{ padding: 12, borderTopRightRadius: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map(user => {
              const isEditing = editRoles[user.uid] !== undefined && editRoles[user.uid] !== user.role;
              return (
                <tr key={user.uid} style={{ background: '#fff', borderBottom: '1px solid #d6e5db' }}>
                  <td style={{ padding: 10, fontSize: '0.9rem' }}>{user.uid.substring(0, 8)}...</td>
                  <td style={{ padding: 10 }}>{user.email}</td>
                  <td style={{ padding: 10 }}>{user.displayName || 'N/A'}</td>
                  <td style={{ padding: 10 }}>
                    <select
                      value={editRoles[user.uid] !== undefined ? editRoles[user.uid] : user.role}
                      onChange={e => handleRoleChange(user.uid, e.target.value as UserRole)}
                      disabled={loading || user.role === 'superadmin'}
                      style={{ padding: 6, borderRadius: 6, minWidth: 120, background: '#eaf6ef', border: '1px solid #256541', fontWeight: 500 }}
                    >
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: 10 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {isEditing && (
                        <>
                          <button
                            style={{ background: '#256541', color: '#fff', padding: '0.4rem 0.8rem', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                            onClick={() => handleSaveRole(user.uid)}
                            disabled={loading}
                          >
                            Save
                          </button>
                          <button
                            style={{ background: '#eaf6ef', color: '#256541', padding: '0.4rem 0.8rem', border: '1px solid #256541', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                            onClick={() => handleCancelEdit(user.uid)}
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      <button
                        style={{ background: '#f39c12', color: '#fff', padding: '0.4rem 0.8rem', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                        onClick={() => user.email && handleResetPassword(user.email)}
                        disabled={loading}
                      >
                        Reset Password
                      </button>
                      {user.role !== 'superadmin' && (
                        <button
                          style={{ background: '#e74c3c', color: '#fff', padding: '0.4rem 0.8rem', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                          onClick={() => user.email && handleDeleteUser(user.uid, user.email)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.6rem 1.4rem', borderRadius: 8, border: 'none', background: '#256541', color: '#fff', fontWeight: 600, cursor: page === 1 ? 'not-allowed' : 'pointer' }}>Prev</button>
          <span style={{ alignSelf: 'center', fontWeight: 500 }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '0.6rem 1.4rem', borderRadius: 8, border: 'none', background: '#256541', color: '#fff', fontWeight: 600, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>Next</button>
        </div>
      </div>

      <UserManagementModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUserCreated={() => loadUsers()}
        onCreateUser={handleCreateUser}
      />
    </div>
  );
};

export default RoleManagement; 