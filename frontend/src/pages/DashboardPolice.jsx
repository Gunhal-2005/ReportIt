import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Sent': return 'badge-sent';
    case 'Viewed': return 'badge-viewed';
    case 'In Progress': return 'badge-progress';
    case 'Action Taken': return 'badge-action';
    default: return 'badge-sent';
  }
};

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const DashboardPolice = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/police/complaints');
        setComplaints(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>
        {user.role === 'station_head' ? 'Station Complaints' : 'My Assigned Complaints'} ({complaints.length})
      </h2>

      <div className="grid grid-cols-2">
        {complaints.map(c => (
          <div key={c._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>{c.type}</h3>
              <span className={`badge ${getStatusBadgeClass(c.status)}`}>{c.status}</span>
            </div>
            <p style={{ color: '#94a3b8', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
              Date: {new Date(c.createdAt).toLocaleDateString()} | Address: {c.address || 'Not provided'}
            </p>
            <p style={{ color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              User: {c.userId.name} ({c.userId.email}) {c.phoneNumber && `| Phone: ${c.phoneNumber}`}
            </p>
            <p style={{ marginBottom: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {c.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                 Assigned to: {c.assignedPoliceMemberId ? c.assignedPoliceMemberId.name : 'Unassigned'}
               </span>
               <Link to={`/complaint/${c._id}`} className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}>
                  Manage
               </Link>
            </div>
          </div>
        ))}
        {complaints.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
             No complaints assigned to this station.
          </div>
        )}
      </div>
    </div>
  );
};
export default DashboardPolice;
