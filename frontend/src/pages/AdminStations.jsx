import { useEffect, useState } from 'react';
import api from '../services/api';

const AdminStations = () => {
  const [stations, setStations] = useState([]);
  const [police, setPolice] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [deleteStationId, setDeleteStationId] = useState(null);
  const [transferStationId, setTransferStationId] = useState('');

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

  useEffect(() => { 
    fetchStations(); 
    fetchPolice();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/stations', { 
        name, 
        address
      });
      setName(''); 
      setAddress(''); 
      fetchStations();
      alert('Station added successfully');
    } catch(err) { 
      alert(err.response?.data?.message || 'Error'); 
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteStationId(id);
    setTransferStationId('');
  };

  const handleConfirmDelete = async () => {
    if (!transferStationId && stations.length > 1) {
       return alert('Please select a station to transfer the active cases to!');
    }
    
    try {
      await api.delete(`/admin/stations/${deleteStationId}?transferTo=${transferStationId}`);
      setDeleteStationId(null);
      fetchStations();
    } catch(err) { 
      alert('Error deleting'); 
    }
  };

  const handleCancelDelete = () => {
    setDeleteStationId(null);
    setTransferStationId('');
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Manage Police Stations</h2>
      <div className="grid grid-cols-2">
         <div className="card" style={{ alignSelf: 'start' }}>
            <h3>Add New Station</h3>
            <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
               <div className="form-group">
                 <label className="form-label">Name</label>
                 <input type="text" className="form-control" value={name} onChange={e=>setName(e.target.value)} required/>
               </div>
               <div className="form-group">
                 <label className="form-label">Address</label>
                 <input type="text" className="form-control" value={address} onChange={e=>setAddress(e.target.value)} required/>
               </div>

               <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}}>
                 Add Station
               </button>
            </form>
         </div>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stations.map(s => (
               <div key={s._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: 'var(--highlight-red)' }}>{s.name}</h4>
                    <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{s.address}</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                       <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', margin: 0 }}>
                          Station Head: {
                             (() => {
                                const head = police.find(p => p.policeStationId && p.policeStationId._id === s._id && p.role === 'station_head');
                                return head 
                                  ? <span style={{ color: '#10b981' }}>Yes ({head.name})</span> 
                                  : <span style={{ color: '#ef4444' }}>None Currently Assigned</span>;
                             })()
                          }
                       </p>
                       <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', margin: 0 }}>
                          Total Staff: <span style={{ color: 'var(--primary-color)' }}>{police.filter(p => p.policeStationId && p.policeStationId._id === s._id).length} Member(s)</span>
                       </p>
                    </div>
                  </div>
                  
                  {deleteStationId === s._id ? (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <select 
                          className="form-control" 
                          style={{ padding: '0.25rem', width: '200px', fontSize: '0.875rem' }}
                          value={transferStationId}
                          onChange={(e) => setTransferStationId(e.target.value)}
                        >
                           <option value="">-- Choose Transfer Station --</option>
                           {stations.filter(st => st._id !== s._id).map(st => (
                              <option key={st._id} value={st._id}>{st.name}</option>
                           ))}
                        </select>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                           <button onClick={handleCancelDelete} className="btn" style={{ padding: '0.25rem 0.5rem', background: '#94a3b8' }}>Cancel</button>
                           <button onClick={handleConfirmDelete} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }}>Transfer & Delete</button>
                        </div>
                     </div>
                  ) : (
                     <button onClick={() => handleDeleteClick(s._id)} className="btn btn-danger">Delete</button>
                  )}
               </div>
            ))}
            {stations.length === 0 && <p style={{ color: '#94a3b8' }}>No stations added yet.</p>}
         </div>
      </div>
    </div>
  )
}

export default AdminStations;
