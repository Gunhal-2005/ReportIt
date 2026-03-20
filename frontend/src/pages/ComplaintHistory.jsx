import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Sent': return 'badge-sent';
    case 'Viewed': return 'badge-viewed';
    case 'In Progress': return 'badge-progress';
    case 'Action Taken': return 'badge-action';
    case 'Cancelled': return 'badge-danger';
    default: return 'badge-sent';
  }
};

const ComplaintHistory = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [editModeId, setEditModeId] = useState(null);
  const [editData, setEditData] = useState({ type: '', address: '', description: '', phoneNumber: '' });

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleEditInit = (c) => {
    setEditModeId(c._id);
    setEditData({ type: c.type, address: c.address, description: c.description, phoneNumber: c.phoneNumber || '' });
  };

  const submitEdit = async (id) => {
    if (!editData.phoneNumber || !/^\d{10}$/.test(editData.phoneNumber)) {
       return alert('Please enter a valid 10-digit phone number');
    }
    try {
      await api.put(`/complaints/${id}`, editData);
      setEditModeId(null);
      fetchComplaints();
    } catch (err) { alert(err.response?.data?.message || 'Error updating'); }
  };

  const handleRequestCancel = async (id) => {
    if(window.confirm('Are you sure you want to request cancellation for this complaint?')) {
      try {
        await api.put(`/complaints/${id}/request-cancel`);
        alert('Cancellation request has been securely dispatched to the Administrator.');
        fetchComplaints();
      } catch (err) { alert(err.response?.data?.message || 'Error cancelling'); }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>My Complaints ({complaints.length})</h2>
        <Link to="/submit-complaint" className="btn btn-primary">File New Complaint</Link>
      </div>

      <div className="grid grid-cols-2">
        {complaints.map(c => (
          <div key={c._id} className="card">
            {editModeId === c._id ? (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem' }}>Edit Complaint</h3>
                  <select className="form-control" value={editData.type} onChange={e=>setEditData({...editData, type: e.target.value})}>
                    <option value="Harassment">Harassment</option>
                    <option value="Theft">Theft</option>
                    <option value="Accident">Accident</option>
                    <option value="Online Fraud">Online Fraud</option>
                    <option value="Office Harassment">Office Harassment</option>
                  </select>
                  <input type="text" className="form-control" value={editData.address} onChange={e=>setEditData({...editData, address: e.target.value})} placeholder="Incident Address" />
                  <input type="text" className="form-control" value={editData.phoneNumber} onChange={e=>setEditData({...editData, phoneNumber: e.target.value})} placeholder="Phone Number" />
                  <textarea className="form-control" value={editData.description} onChange={e=>setEditData({...editData, description: e.target.value})} placeholder="Detailed Description"></textarea>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                     <button onClick={() => setEditModeId(null)} className="btn" style={{ background: '#94a3b8', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Cancel</button>
                     <button onClick={() => submitEdit(c._id)} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Save Changes</button>
                  </div>
               </div>
            ) : (
               <>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'flex-start' }}>
                   <h3 style={{ fontSize: '1.25rem', flex: 1 }}>
                      {c.type}
                      {c.cancelRequested && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>Cancellation Pending...</div>}
                   </h3>
                   <span className={`badge ${getStatusBadgeClass(c.status)}`}>{c.status}</span>
                 </div>
                 <p style={{ color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                   Date: {new Date(c.createdAt).toLocaleDateString()} | Address: {c.address || 'Not provided'} {c.phoneNumber && `| Phone: ${c.phoneNumber}`}
                 </p>
                 <p style={{ marginBottom: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                   {c.description}
                 </p>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', flex: 1 }}>
                       Station: <strong style={{ color: 'var(--text-light)' }}>{c.policeStationId ? c.policeStationId.name : 'Pending Assignment'}</strong>
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                       {c.status === 'Sent' && !c.cancelRequested && (
                          <button onClick={() => handleEditInit(c)} className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>Edit</button>
                       )}
                       {c.status !== 'Cancelled' && c.status !== 'Action Taken' && !c.cancelRequested && (
                          <button onClick={() => handleRequestCancel(c._id)} className="btn btn-danger" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>Cancel</button>
                       )}
                       <Link to={`/complaint/${c._id}`} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                          View
                       </Link>
                    </div>
                 </div>
               </>
            )}
          </div>
        ))}
        {complaints.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
             No complaints found.
          </div>
        )}
      </div>
    </div>
  );
};
export default ComplaintHistory;
