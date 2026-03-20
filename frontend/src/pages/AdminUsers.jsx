import { useEffect, useState } from 'react';
import api from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleBlock = async (id) => {
    if(window.confirm('Toggle block status for this user?')) {
      try {
        await api.put(`/admin/users/${id}/toggle-block`);
        fetchUsers();
      } catch(err) { alert('Error updating status'); }
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Manage Users</h2>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
           <thead>
             <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
               <th style={{ padding: '0.75rem' }}>Name</th>
               <th style={{ padding: '0.75rem' }}>Email</th>
               <th style={{ padding: '0.75rem' }}>Joined</th>
               <th style={{ padding: '0.75rem' }}>Status</th>
               <th style={{ padding: '0.75rem' }}>Action</th>
             </tr>
           </thead>
           <tbody>
             {users.map(u => (
               <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                 <td style={{ padding: '0.75rem' }}>{u.name}</td>
                 <td style={{ padding: '0.75rem' }}>{u.email}</td>
                 <td style={{ padding: '0.75rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                 <td style={{ padding: '0.75rem' }}>
                    <span className={`badge ${u.isBlocked ? 'badge-sent' : 'badge-action'}`}>
                      {u.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                 </td>
                 <td style={{ padding: '0.75rem' }}>
                   <button onClick={() => handleToggleBlock(u._id)} className={`btn ${u.isBlocked ? 'btn-primary' : 'btn-danger'}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                     {u.isBlocked ? 'Unblock' : 'Block'}
                   </button>
                 </td>
               </tr>
             ))}
           </tbody>
        </table>
        {users.length === 0 && <p style={{ color: '#94a3b8', padding: '1rem', textAlign: 'center' }}>No users found.</p>}
      </div>
    </div>
  )
}
export default AdminUsers;
