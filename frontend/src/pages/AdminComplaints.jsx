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

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [stations, setStations] = useState([]);
  const [police, setPolice] = useState([]);
  
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  
  const fetchAll = async () => {
    try {
      const res = await api.get('/admin/complaints');
      setComplaints(res.data);
    } catch(err) { console.error(err); }
  };

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await api.get('/admin/stations');
        setStations(res.data);
      } catch(err) { console.error(err); }
    };
    const fetchPolice = async () => {
      try {
        const res = await api.get('/admin/police');
        setPolice(res.data);
      } catch(err) { console.error(err); }
    };
    fetchAll();
    fetchStations();
    fetchPolice();
  }, []);

  const handleAssign = async (id, stationId) => {
    try {
      await api.put(`/admin/complaints/${id}/assign`, { policeStationId: stationId });
      alert('Assigned successfully!');
      fetchAll(); 
    } catch(err) { alert(err.response?.data?.message || 'Error assigning'); }
  };

  const handleNotify = async (id) => {
    try {
      await api.post(`/admin/complaints/${id}/notify`);
      alert('Urgent text/email dispatched to the handling officer!');
    } catch(err) { alert(err.response?.data?.message || 'Error sending reminder'); }
  };

  const handleCancelClick = async (id) => {
    const reason = window.prompt('MANDATORY: Please type an official reason for cancelling this complaint. This reason will be emailed directly to the user:');
    
    if (reason === null) return; // Administrator hit ESC or cancel on the typing prompt
    if (reason.trim() === '') return alert('Action Blocked: You must provide a valid text reason to cancel a complaint.');
    
    try {
      await api.put(`/admin/complaints/${id}/cancel`, { reason: reason.trim() });
      alert('Complaint Killed successfully! Cancellation email has been sent to the user.');
      fetchAll();
    } catch(err) { alert(err.response?.data?.message || 'Error cancelling complaint'); }
  };

  const filteredComplaints = complaints.filter(c => {
    let matchStatus = true;
    let matchDate = true;
    
    if (filterStatus !== 'All') {
       matchStatus = c.status === filterStatus;
    }
    if (filterDate) {
       const complaintDate = new Date(c.createdAt).toISOString().split('T')[0];
       matchDate = complaintDate === filterDate;
    }
    
    return matchStatus && matchDate;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
         <h2 style={{ margin: 0 }}>All Complaints</h2>
         
         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filter Status:</label>
               <select className="form-control" style={{ padding: '0.25rem 0.5rem', width: 'auto' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Sent">Sent</option>
                  <option value="Viewed">Viewed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Action Taken">Action Taken</option>
                  <option value="Cancelled">Cancelled</option>
               </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filter Date:</label>
               <input 
                  type="date" 
                  className="form-control" 
                  style={{ padding: '0.25rem 0.5rem', width: 'auto' }} 
                  value={filterDate} 
                  onChange={(e) => setFilterDate(e.target.value)} 
               />
               {filterDate && (
                  <button onClick={() => setFilterDate('')} className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'var(--border-color)' }}>Clear</button>
               )}
            </div>
         </div>
      </div>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
           <thead>
             <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
               <th style={{ padding: '0.75rem' }}>User</th>
               <th style={{ padding: '0.75rem' }}>Type</th>
               <th style={{ padding: '0.75rem' }}>Address</th>
               <th style={{ padding: '0.75rem' }}>Station</th>
               <th style={{ padding: '0.75rem' }}>Status</th>
               <th style={{ padding: '0.75rem' }}>Date</th>
               <th style={{ padding: '0.75rem' }}>Action</th>
             </tr>
           </thead>
           <tbody>
             {filteredComplaints.map(c => (
               <tr key={c._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                 <td style={{ padding: '0.75rem' }}>
                    {c.userId?.name}
                    {c.phoneNumber && <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>{c.phoneNumber}</div>}
                    {c.cancelRequested && <div style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.25rem' }}>Cancellation Requested!</div>}
                 </td>
                 <td style={{ padding: '0.75rem' }}>{c.type}</td>
                 <td style={{ padding: '0.75rem' }}>{c.address || 'Not provided'}</td>
                 <td style={{ padding: '0.75rem' }}>
                    <select 
                      className="form-control" 
                      style={{ padding: '0.25rem', fontSize: '0.875rem', width: 'auto', display: 'inline-block' }}
                      onChange={(e) => handleAssign(c._id, e.target.value)} 
                      value={c.policeStationId?._id || ""}
                    >
                      <option value="" disabled>-- Assign Station --</option>
                      {stations.map(s => {
                         const hasHead = police.some(p => p.role === 'station_head' && p.policeStationId && p.policeStationId._id === s._id);
                         return (
                           <option key={s._id} value={s._id} disabled={!hasHead}>
                             {s.name} {!hasHead ? '(No Head)' : ''}
                           </option>
                         );
                      })}
                    </select>
                 </td>
                 <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                       <span className={`badge ${getStatusBadgeClass(c.status)}`}>{c.status}</span>
                       {(c.status === 'Viewed' || c.status === 'In Progress' || c.status === 'Sent') && c.policeStationId && (
                           <button onClick={() => handleNotify(c._id)} className="btn btn-primary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>Remind</button>
                       )}
                    </div>
                 </td>
                 <td style={{ padding: '0.75rem' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                 <td style={{ padding: '0.75rem' }}>
                   <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Link to={`/complaint/${c._id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                        View
                      </Link>
                      {c.status !== 'Cancelled' && c.status !== 'Action Taken' && (
                         <button onClick={() => handleCancelClick(c._id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Cancel</button>
                      )}
                   </div>
                 </td>
               </tr>
             ))}
           </tbody>
        </table>
        {filteredComplaints.length === 0 && <p style={{ padding: '1rem', textAlign: 'center' }}>No complaints found matching your filters.</p>}
      </div>
    </div>
  )
}
export default AdminComplaints;
