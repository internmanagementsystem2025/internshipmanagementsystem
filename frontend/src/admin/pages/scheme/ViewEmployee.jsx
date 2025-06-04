import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { FaSortAlphaDown, FaSortAlphaUp } from 'react-icons/fa';

const API_URL = `${import.meta.env.VITE_BASE_URL}/employees`;


const ViewEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-CA') : '';

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(API_URL);
      const employeesWithId = res.data.filter(emp => emp._id);
      setEmployees(employeesWithId);

      const map = {};
      employeesWithId.forEach(emp => {
        map[emp._id] = emp.full_name;
      });
      setEmployeeMap(map);

      setEmployeeOptions(
        employeesWithId.map(emp => ({
          id: emp._id,
          name: emp.full_name,
        }))
      );
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchEmployees();
      } catch (err) {
        console.error('Error deleting employee:', err);
      }
    }
  };

  const openEditModal = (emp) => {
    setSelectedEmployee({ ...emp });
    setEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    const { _id, ...updateData } = selectedEmployee;
    try {
      await axios.put(`${API_URL}/${_id}`, updateData);
      setEditModal(false);
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (err) {
      console.error('Error updating employee:', err);
      alert('Failed to update employee');
    }
  };

  const employeeOptionsFiltered = employeeOptions
    .filter(option => option.id !== selectedEmployee?._id)
    .map(emp => ({ value: emp.id, label: emp.name }));

  const selectedSubordinates = selectedEmployee?.subordinates?.map((id) => {
    const emp = employeeOptions.find((e) => e.id === id);
    return emp ? { value: emp.id, label: emp.name } : null;
  })?.filter(Boolean) || [];

  const getStatusBadge = (status) => {
    const color = {
      active: 'success',
      inactive: 'secondary',
      terminated: 'danger',
    }[status] || 'dark';
    return <span className={`badge bg-${color}`}>{status}</span>;
  };

  const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  const filteredEmployees = employees
    .filter(emp =>
      emp.full_name.toLowerCase().includes(searchTerm) ||
      emp.employee_code.toLowerCase().includes(searchTerm)
    )
    .sort((a, b) => {
      if (!sortBy) return 0;
      const aVal = a[sortBy]?.toLowerCase?.() || a[sortBy];
      const bVal = b[sortBy]?.toLowerCase?.() || b[sortBy];
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });

  return (
    <div className="container-fluid py-4 px-3 px-md-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
        <h2 className="text-primary mb-3 mb-md-0 me-md-3 text-nowrap">Employee Management</h2>
        <input
          type="text"
          className="form-control w-100 w-md-50"
          placeholder="Search by Name or Code..."
          onChange={handleSearch}
        />
      </div>

      <div
        className="table-responsive bg-white shadow rounded p-3"
        style={{ maxHeight: '75vh', overflowX: 'auto', overflowY: 'auto' }}
      >
        <table className="table table-hover align-middle table-bordered text-nowrap">
          <thead className="table-light">
            <tr>
              <th onClick={() => toggleSort('employee_code')} style={{ cursor: 'pointer' }}>
                Code {sortBy === 'employee_code' && (sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />)}
              </th>
              <th onClick={() => toggleSort('full_name')} style={{ cursor: 'pointer' }}>
                Name {sortBy === 'full_name' && (sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />)}
              </th>
              <th>Email</th>
              <th>Department</th>
              <th>Job Title</th>
              <th>Hierarchy</th>
              <th>Division</th>
              <th>Cost Center</th>
              <th>Grade</th>
              <th>Join Date</th>
              <th>Subordinates</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => (
              <tr key={emp._id}>
                <td>{emp.employee_code}</td>
                <td>{emp.full_name}</td>
                <td>{emp.email}</td>
                <td>{emp.department}</td>
                <td>{emp.job_title}</td>
                <td>{emp.hierarchy_level}</td>
                <td>{emp.division_code}</td>
                <td>{emp.cost_center}</td>
                <td>{emp.grade_level}</td>
                <td>{formatDate(emp.joining_date)}</td>
                <td>
                  {emp.subordinates?.length ? (
                    <ul className="mb-0 ps-3">
                      {emp.subordinates.map(subId => (
                        <li key={subId}>{employeeMap[subId] || subId}</li>
                      ))}
                    </ul>
                  ) : <small>No subordinates</small>}
                </td>
                <td>{getStatusBadge(emp.status)}</td>
                <td>
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => openEditModal(emp)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(emp._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editModal && selectedEmployee && (
        <div className="modal show fade d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content shadow-lg">
              <div className="modal-header bg-dark text-white">
                <h5 className="modal-title">Edit Employee</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setEditModal(false);
                    setSelectedEmployee(null);
                  }}
                ></button>
              </div>
              <div className="modal-body row g-3">
                {[
                  'employee_code', 'full_name', 'email', 'department', 'job_title',
                  'hierarchy_level', 'division_code', 'cost_center', 'grade_level'
                ].map((field) => (
                  <div className="col-md-6" key={field}>
                    <label className="form-label text-capitalize">{field.replace(/_/g, ' ')}</label>
                    <input
                      type={field === 'email' ? 'email' : 'text'}
                      className="form-control"
                      name={field}
                      value={selectedEmployee[field] || ''}
                      onChange={handleEditChange}
                      disabled={field === 'employee_code'}
                    />
                  </div>
                ))}

                <div className="col-12">
                  <label className="form-label">Subordinates</label>
                  <Select
                    isMulti
                    name="subordinates"
                    options={employeeOptionsFiltered}
                    value={selectedSubordinates}
                    onChange={(selected) => {
                      const selectedIds = selected.map((item) => item.value);
                      setSelectedEmployee((prev) => ({
                        ...prev,
                        subordinates: selectedIds,
                      }));
                    }}
                    classNamePrefix="select"
                    placeholder="Select subordinates..."
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-select"
                    value={selectedEmployee.status || 'active'}
                    onChange={handleEditChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditModal(false)}>Cancel</button>
                <button className="btn btn-success" onClick={handleEditSave}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewEmployees;
