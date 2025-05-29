import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const SelectSupervisor = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingSupervisor, setEditingSupervisor] = useState(null);
  const [formData, setFormData] = useState({
    EMPLOYEE_FIRST_NAME: '',
    EMPLOYEE_TITLE: '',
    EMPLOYEE_SURNAME: '',
    email: '',
    EMPLOYEE_DESIGNATION: '',
  });

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/employees');
      console.log('Fetched supervisors:', res.data);
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.supervisors || res.data.data || [];

      setSupervisors(data);
    } catch (err) {
      setError('Failed to load supervisors');
      setSupervisors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this supervisor?')) {
      try {
        await axios.delete(`http://localhost:5000/api/employees/${id}`);
        setSupervisors(prev => prev.filter(s => s._id !== id));
      } catch (err) {
        alert('Failed to delete supervisor');
      }
    }
  };

  const handleEditClick = sup => {
    setEditingSupervisor(sup);
    setFormData({
      EMPLOYEE_NUMBER: sup.EMPLOYEE_NUMBER || '',
      EMPLOYEE_TITLE: sup.EMPLOYEE_TITLE || '',
      EMPLOYEE_FIRST_NAME: sup.EMPLOYEE_FIRST_NAME || '',
      EMPLOYEE_SURNAME: sup.EMPLOYEE_SURNAME || '',
      email: sup.email || '',
      EMPLOYEE_DESIGNATION: sup.EMPLOYEE_DESIGNATION || '',
    });
  };

  const handleInputChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async e => {
    e.preventDefault();
  
    if (!editingSupervisor || !editingSupervisor._id) {
      alert('No supervisor selected for update.');
      return;
    }
  
    try {
      console.log('Updating supervisor id:', editingSupervisor._id, 'with data:', formData);
      const res = await axios.put(
        `http://localhost:5000/api/employees/${editingSupervisor._id}`,
        formData
      );
      const updated = res.data.employee; // <-- updated line
  
      setSupervisors(prev =>
        prev.map(s => (s._id === updated._id ? updated : s))
      );
      setEditingSupervisor(null);
    } catch (err) {
      alert('Failed to update supervisor');
    }
  };
  

  if (loading) return <div className="container mt-4">Loading supervisors...</div>;
  if (error) return <div className="container mt-4 text-danger">{error}</div>;
  if (supervisors.length === 0) return <div className="container mt-4">No supervisors found.</div>;

  return (
    <div className="container mt-4">
      <h2>Supervisor List</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Employee Number</th>
            <th>EMPLOYEE_TITLE</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Designation</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {supervisors.map((sup, index) => (
            <tr key={sup._id || index}>
              <td>{index + 1}</td>
              <td>{sup.EMPLOYEE_NUMBER || 'N/A'}</td>
              <td>{sup.EMPLOYEE_TITLE || 'N/A'}</td>
              <td>{`${sup.EMPLOYEE_FIRST_NAME || ''} ${sup.EMPLOYEE_SURNAME || ''}`}</td>
              <td>{sup.email || 'N/A'}</td>
              <td>{sup.EMPLOYEE_DESIGNATION || 'N/A'}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditClick(sup)}>
                  Edit
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(sup._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editingSupervisor && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <form onSubmit={handleUpdate}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Supervisor</h5>
                  <button type="button" className="btn-close" onClick={() => setEditingSupervisor(null)} />
                </div>
                <div className="modal-body">
                <div className="mb-2">
                <label>Employee Number</label>
                    <input
                      className="form-control"
                      type="EMPLOYEE_NUMBER"
                      name="EMPLOYEE_NUMBER"
                      value={formData.EMPLOYEE_NUMBER}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label>EMPLOYEE_TITLE</label>
                    <input
                      className="form-control"
                      name="EMPLOYEE_TITLE"
                      value={formData.EMPLOYEE_TITLE}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label>First Name</label>
                    <input
                      className="form-control"
                      name="EMPLOYEE_FIRST_NAME"
                      value={formData.EMPLOYEE_FIRST_NAME}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label>Surname</label>
                    <input
                      className="form-control"
                      name="EMPLOYEE_SURNAME"
                      value={formData.EMPLOYEE_SURNAME}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label>Email</label>
                    <input
                      className="form-control"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label>Designation</label>
                    <input
                      className="form-control"
                      name="EMPLOYEE_DESIGNATION"
                      value={formData.EMPLOYEE_DESIGNATION}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">Update</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingSupervisor(null)}>Cancel</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectSupervisor;
