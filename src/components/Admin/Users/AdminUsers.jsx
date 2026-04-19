import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch users');
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const { data } = await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => (u._id === userId ? data : u)));
      toast.success('User role updated');
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  return (
    <div className="admin-users-page">
      <div className="admin-users-container">
        <div className="admin-users-header">
          <h2>User Accounts</h2>
          <p>Manage registered accounts and assign administrator privileges.</p>
        </div>

        {loading ? <p>Loading users...</p> : (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Contact Info</th>
                  <th>Joined</th>
                  <th>System Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-profile-cell">
                        {user.image ? (
                          <img src={user.image} alt={user.username} className="user-avatar-small" />
                        ) : (
                          <div className="user-avatar-fallback-small">
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="user-info-text">
                          <div>{(user.firstName || user.lastName) ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.username}</div>
                          <span>@{user.username}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="user-info-text">
                        <div>{user.phone}</div>
                        <span>{user.email || 'No email provided'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="user-info-text">
                        <div>{new Date(user.createdAt).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td>
                      <select
                        className={`role-select badge-${user.role}`}
                        value={user.role}
                        onChange={(e) => updateUserRole(user._id, e.target.value)}
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
