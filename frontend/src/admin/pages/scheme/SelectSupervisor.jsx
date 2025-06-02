import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const SelectSupervisor = () => {
    const [supervisors, setSupervisors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingSupervisor, setEditingSupervisor] = useState(null);
    const [formData, setFormData] = useState({
        SUPERVISOR_NUMBER: '',
        SUPERVISOR_TITLE: '',
        SUPERVISOR_INITIALS: '',
        SUPERVISOR_FIRST_NAME: '',
        SUPERVISOR_SURNAME: '',
        SUPERVISOR_DESIGNATION: '',
        SUPERVISOR_OFFICE_PHONE: '',
        SUPERVISOR_MOBILE_PHONE: '',
        email: '',
        SUPERVISOR_SECTION: '',
        SUPERVISOR_DIVISION: '',
        SUPERVISOR_COST_CENTRE_CODE: '',
        SUPERVISOR_GROUP_NAME: '',
        SUPERVISOR_SALARY_GRADE: '',

    });

    useEffect(() => {
        fetchSupervisors();
    }, []);

    const fetchSupervisors = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('http://localhost:5000/api/supervisors');
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
                await axios.delete(`http://localhost:5000/api/supervisors/${id}`);
                setSupervisors(prev => prev.filter(s => s._id !== id));
            } catch (err) {
                alert('Failed to delete supervisor');
            }
        }
    };

    const handleEditClick = sup => {
        setEditingSupervisor(sup);
        setFormData({
            SUPERVISOR_NUMBER: sup.SUPERVISOR_NUMBER || '',
            SUPERVISOR_TITLE: sup.SUPERVISOR_TITLE || '',
            SUPERVISOR_INITIALS: sup.SUPERVISOR_INITIALS || '',
            SUPERVISOR_FIRST_NAME: sup.SUPERVISOR_FIRST_NAME || '',
            SUPERVISOR_SURNAME: sup.SUPERVISOR_SURNAME || '',
            SUPERVISOR_DESIGNATION: sup.SUPERVISOR_DESIGNATION || '',
            SUPERVISOR_OFFICE_PHONE: sup.SUPERVISOR_OFFICE_PHONE || '',
            SUPERVISOR_MOBILE_PHONE: sup.SUPERVISOR_MOBILE_PHONE || '',
            email: sup.email || '',
            SUPERVISOR_SECTION: sup.SUPERVISOR_SECTION || '',
            SUPERVISOR_DIVISION: sup.SUPERVISOR_DIVISION || '',
            SUPERVISOR_COST_CENTRE_CODE: sup.SUPERVISOR_COST_CENTRE_CODE || '',
            SUPERVISOR_GROUP_NAME: sup.SUPERVISOR_GROUP_NAME || '',
            SUPERVISOR_SALARY_GRADE: sup.SUPERVISOR_SALARY_GRADE || '',
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
                `http://localhost:5000/api/supervisors/${editingSupervisor._id}`,
                formData
            );
            const updated = res.data.supervisor; // <-- updated line

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
                        <th>Employee Title</th>
                        <th>Full Name</th>
                        <th>Designation</th>
                        <th>Office Phone</th>
                        <th>Mobile Phone</th>
                        <th>Email</th>
                        <th>Section</th>
                        <th>Division</th>
                        <th>Cost Centre Code</th>
                        <th>Group Name</th>
                        <th>Salary Grade</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {supervisors.map((sup, index) => (
                        <tr key={sup._id || index}>
                            <td>{index + 1}</td>
                            <td>{sup.SUPERVISOR_NUMBER || 'N/A'}</td>
                            <td>{sup.SUPERVISOR_TITLE || 'N/A'}</td>
                            <td>{`${sup.SUPERVISOR_FIRST_NAME || ''} ${sup.SUPERVISOR_SURNAME || ''}`}</td>
                            <td>{sup.SUPERVISOR_DESIGNATION || 'N/A'}</td>
                            <td>{sup.SUPERVISOR_OFFICE_PHONE || 'N/A'}</td>
                            <td>{sup.SUPERVISOR_MOBILE_PHONE || 'N/A'}</td>
                            <td>{sup.email || 'N/A'}</td>
                            <td>{sup.SUPERVISOR_SECTION || 'N/A'}</td>
                            <td>{sup.SUPERVISOR_DIVISION || 'N/A'}</td>
                            <td>{sup.SUPERVISOR_COST_CENTRE_CODE || 'N/A'}</td>
                            <td>{sup.SUPERVISOR_GROUP_NAME || 'N/A'}</td>
                            <td>{sup.SUPERVISOR_SALARY_GRADE || 'N/A'}</td>
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
                                            type="SUPERVISOR_NUMBER"
                                            name="SUPERVISOR_NUMBER"
                                            value={formData.SUPERVISOR_NUMBER}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label>Employee Title</label>
                                        <input
                                            className="form-control"
                                            name="SUPERVISOR_TITLE"
                                            value={formData.SUPERVISOR_TITLE}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label>First Name</label>
                                        <input
                                            className="form-control"
                                            name="SUPERVISOR_FIRST_NAME"
                                            value={formData.SUPERVISOR_FIRST_NAME}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label>Surname</label>
                                        <input
                                            className="form-control"
                                            name="SUPERVISOR_SURNAME"
                                            value={formData.SUPERVISOR_SURNAME}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label>Designation</label>
                                        <input
                                            className="form-control"
                                            name="SUPERVISOR_DESIGNATION"
                                            value={formData.SUPERVISOR_DESIGNATION}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label>Office Phone</label>
                                        <input
                                            className="form-control"
                                            name="SUPERVISOR_OFFICE_PHONE"
                                            value={formData.SUPERVISOR_OFFICE_PHONE}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label>Mobile Phone</label>
                                        <input
                                            className="form-control"
                                            name="SUPERVISOR_MOBILE_PHONE"
                                            value={formData.SUPERVISOR_MOBILE_PHONE}
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
                                        <label>Section</label>
                                        <input
                                            className="form-control"
                                            name="SUPERVISOR_SECTION"
                                            value={formData.SUPERVISOR_SECTION}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label>Division</label>
                                        <input
                                            className="form-control"
                                            name="SUPERVISOR_DIVISION"
                                            value={formData.SUPERVISOR_DIVISION}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label>Cost Centre Code</label>
                                        <input
                                            className="form-control"
                                            name="SUPERVISOR_COST_CENTRE_CODE"
                                            value={formData.SUPERVISOR_COST_CENTRE_CODE}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label>Group Name</label>
                                        <input
                                            className="form-control"
                                            name="SUPERVISOR_GROUP_NAME"
                                            value={formData.SUPERVISOR_GROUP_NAME}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label>Salary Grade</label>
                                        <input
                                            className="form-control"
                                            name="SUPERVISOR_SALARY_GRADE"
                                            value={formData.SUPERVISOR_SALARY_GRADE}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="modal-footer">
                                        <button type="submit" className="btn btn-primary">Update</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => setEditingSupervisor(null)}>Cancel</button>
                                    </div>
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
