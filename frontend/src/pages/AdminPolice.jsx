import { useEffect, useState } from 'react';
import api from '../services/api';

const AdminPolice = () => {
  const [police, setPolice] = useState([]);
  const [stations, setStations] = useState([]);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('police');
  const [policeStationId, setPoliceStationId] = useState('');
  
  const [editPoliceId, setEditPoliceId] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [editStationId, setEditStationId] = useState('');
  const [replacementHeadId, setReplacementHeadId] = useState('');

  const [deletePoliceId, setDeletePoliceId] = useState(null);
  const [transferTargetId, setTransferTargetId] = useState('');

  const fetchData = async () => {
    try {
      const pRes = await api.get('/admin/police');
      setPolice(pRes.data);
      const sRes = await api.get('/admin/stations');
      setStations(sRes.data);
    } catch(err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/police', { name, email, password, role, policeStationId });
      setName(''); setEmail(''); setPassword(''); setPoliceStationId(''); setRole('police');
      fetchData();
      alert('Police member added successfully');
    } catch(err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDeleteClick = (id) => {
    setDeletePoliceId(id);
    setTransferTargetId('');
  };

  const handleConfirmDelete = async () => {
    try {
      let query = '';
      if (transferTargetId) {
         if (transferTargetId.startsWith('user_')) {
            query = `?transferToUserId=${transferTargetId.replace('user_', '')}`;
         } else if (transferTargetId.startsWith('station_')) {
            query = `?transferToStationId=${transferTargetId.replace('station_', '')}`;
         }
      }
      await api.delete(`/admin/police/${deletePoliceId}${query}`);
      setDeletePoliceId(null);
      fetchData();
    } catch(err) { alert('Error deleting'); }
  };

  const handleEditClick = (p) => {
    setEditPoliceId(p._id);
    setEditRole(p.role);
    setEditStationId(p.policeStationId ? p.policeStationId._id : '');
    setReplacementHeadId('');
  };

  const handleUpdate = async (p) => {
    const isLeavingHeadVacuum = p.role === 'station_head' && (editRole !== 'station_head' || editStationId !== (p.policeStationId ? p.policeStationId._id : ''));
    
    if (isLeavingHeadVacuum) {
        const availableReplacements = police.filter(pol => pol.policeStationId && pol.policeStationId._id === p.policeStationId?._id && pol._id !== p._id && pol.role === 'police');
        if (availableReplacements.length > 0 && !replacementHeadId) {
           return alert('You must select a replacement Station Head before transferring/demoting the current one!');
        } else if (availableReplacements.length === 0) {
           return alert('Action Blocked! You cannot transfer/demote this Head because there are no other officers at this station to replace them. Hire a new officer there first!');
        }
    }

    try {
      await api.put(`/admin/police/${p._id}${replacementHeadId ? `?replacementHeadId=${replacementHeadId}` : ''}`, { role: editRole, policeStationId: editStationId });
      setEditPoliceId(null);
      setReplacementHeadId('');
      fetchData();
    } catch(err) { alert(err.response?.data?.message || 'Error updating. Check if the station already has a Head.'); }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Manage Police Members</h2>
      <div className="grid grid-cols-2">
         <div className="card" style={{ alignSelf: 'start' }}>
            <h3>Create Police Account</h3>
            <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
               <div className="form-group"><label className="form-label">Name</label><input type="text" className="form-control" value={name} onChange={e=>setName(e.target.value)} required/></div>
               <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-control" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
               <div className="form-group"><label className="form-label">Temporary Password</label><input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
               <div className="form-group">
                 <label className="form-label">Role</label>
                 <select className="form-control" value={role} onChange={e=>setRole(e.target.value)} required>
                    <option value="police">Police Member</option>
                    <option value="station_head">Station Head</option>
                 </select>
               </div>
               <div className="form-group">
                 <label className="form-label">Assign Station</label>
                 <select className="form-control" value={policeStationId} onChange={e=>setPoliceStationId(e.target.value)} required>
                    <option value="">-- Select Station --</option>
                    {stations.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                 </select>
               </div>
               <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Create Account</button>
            </form>
         </div>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {police.map(p => (
               <div key={p._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {editPoliceId === p._id ? (
                     <div style={{ flex: 1, marginRight: '1rem' }}>
                        <h4 style={{ color: 'var(--highlight-red)', marginBottom: '0.5rem' }}>{p.name} ({p.email})</h4>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                           <select className="form-control" style={{ padding: '0.25rem', width: 'auto' }} value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                              <option value="police">Police Member</option>
                              <option value="station_head">Station Head</option>
                           </select>
                           <select className="form-control" style={{ padding: '0.25rem', width: '150px' }} value={editStationId} onChange={(e) => setEditStationId(e.target.value)}>
                              <option value="">-- No Station --</option>
                              {stations.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                           </select>
                           
                           {p.role === 'station_head' && (editRole !== 'station_head' || editStationId !== (p.policeStationId ? p.policeStationId._id : '')) && (
                              <select className="form-control" style={{ padding: '0.25rem', width: '150px', border: '1px solid #ef4444' }} value={replacementHeadId} onChange={(e) => setReplacementHeadId(e.target.value)}>
                                 <option value="">-- Pick New Head --</option>
                                 {police.filter(pol => pol.policeStationId && pol.policeStationId._id === p.policeStationId?._id && pol._id !== p._id && pol.role === 'police').map(rep => (
                                    <option key={rep._id} value={rep._id}>{rep.name}</option>
                                 ))}
                              </select>
                           )}
                        </div>
                     </div>
                  ) : (
                     <div>
                       <h4 style={{ color: 'var(--highlight-red)' }}>{p.name}</h4>
                       <p style={{ fontSize: '0.875rem' }}>{p.email}</p>
                       <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Station: {p.policeStationId ? p.policeStationId.name : 'Unassigned'} | Role: {p.role === 'station_head' ? 'Station Head' : 'Police Officer'}</p>
                     </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                     {editPoliceId === p._id ? (
                        <>
                           <button onClick={() => setEditPoliceId(null)} className="btn" style={{ padding: '0.25rem 0.5rem', background: '#94a3b8' }}>Cancel</button>
                           <button onClick={() => handleUpdate(p)} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }}>Save</button>
                        </>
                     ) : deletePoliceId === p._id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                           <select 
                             className="form-control" 
                             style={{ padding: '0.25rem', width: '250px', fontSize: '0.875rem' }}
                             value={transferTargetId}
                             onChange={(e) => setTransferTargetId(e.target.value)}
                           >
                              <option value="">-- Fallback to Station Head --</option>
                              <optgroup label="Police Members">
                                 {police.filter(pol => pol._id !== p._id).map(pol => (
                                    <option key={`user_${pol._id}`} value={`user_${pol._id}`}>Officer {pol.name}</option>
                                 ))}
                              </optgroup>
                              <optgroup label="Entire Stations">
                                 {stations.map(st => (
                                    <option key={`station_${st._id}`} value={`station_${st._id}`}>Station: {st.name}</option>
                                 ))}
                              </optgroup>
                           </select>
                           <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => setDeletePoliceId(null)} className="btn" style={{ padding: '0.25rem 0.5rem', background: '#94a3b8' }}>Cancel</button>
                              <button onClick={handleConfirmDelete} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }}>Transfer & Delete</button>
                           </div>
                        </div>
                     ) : (
                        <>
                           <button onClick={() => handleEditClick(p)} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }}>Edit</button>
                           <button onClick={() => handleDeleteClick(p._id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }}>Delete</button>
                        </>
                     )}
                  </div>
               </div>
            ))}
            {police.length === 0 && <p style={{ color: '#94a3b8' }}>No police members added yet.</p>}
         </div>
      </div>
    </div>
  )
}
export default AdminPolice;
