import React, { useState, useRef } from 'react';
import axios from 'axios';

const AddSupervisor = () => {
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
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" && selectedFile.type !== "application/vnd.ms-excel") {
      setError('Please upload a valid Excel file (.xls or .xlsx)');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleAddSupervisor = async e => {
    e.preventDefault();
    setMessage('');
    setError('');

    const trimmedData = {
      SUPERVISOR_NUMBER: formData.SUPERVISOR_NUMBER.trim(),
      SUPERVISOR_TITLE: formData.SUPERVISOR_TITLE.trim(),
      SUPERVISOR_INITIALS: formData.SUPERVISOR_INITIALS.trim(),
      SUPERVISOR_FIRST_NAME: formData.SUPERVISOR_FIRST_NAME.trim(),
      SUPERVISOR_SURNAME: formData.SUPERVISOR_SURNAME.trim(),
      SUPERVISOR_DESIGNATION: formData.SUPERVISOR_DESIGNATION.trim(),
      SUPERVISOR_OFFICE_PHONE: formData.SUPERVISOR_OFFICE_PHONE.trim(),
      SUPERVISOR_MOBILE_PHONE: formData.SUPERVISOR_MOBILE_PHONE.trim(),
      email: formData.email.trim(),
      SUPERVISOR_SECTION: formData.SUPERVISOR_SECTION.trim(),
      SUPERVISOR_DIVISION: formData.SUPERVISOR_DIVISION.trim(),
      SUPERVISOR_COST_CENTRE_CODE: formData.SUPERVISOR_COST_CENTRE_CODE.trim(),
      SUPERVISOR_GROUP_NAME: formData.SUPERVISOR_GROUP_NAME.trim(),
      SUPERVISOR_SALARY_GRADE: formData.SUPERVISOR_SALARY_GRADE.trim(),
    };
    

    // Validation
    if (!trimmedData.SUPERVISOR_NUMBER) return setError('Employee Number is required');
    if (!trimmedData.SUPERVISOR_TITLE) return setError('Employee Title is required');
    if (!trimmedData.SUPERVISOR_INITIALS) return setError('Initials are required');
    if (!trimmedData.SUPERVISOR_FIRST_NAME) return setError('First Name is required');
    if (!trimmedData.SUPERVISOR_SURNAME) return setError('Surname is required');
    if (!trimmedData.SUPERVISOR_DESIGNATION) return setError('Designation is required');
    if (!trimmedData.SUPERVISOR_OFFICE_PHONE) return setError('Office Phone is required');
    if (!trimmedData.SUPERVISOR_MOBILE_PHONE) return setError('Mobile Phone is required');
    if (!trimmedData.email) return setError('Email is required');
    if (!trimmedData.SUPERVISOR_SECTION) return setError('Section is required');
    if (!trimmedData.SUPERVISOR_DIVISION) return setError('Division is required');
    if (!trimmedData.SUPERVISOR_COST_CENTRE_CODE) return setError('Cost Centre Code is required');
    if (!trimmedData.SUPERVISOR_GROUP_NAME) return setError('Group Name is required');
    if (!trimmedData.SUPERVISOR_SALARY_GRADE) return setError('Salary Grade is required');


    try {
      const res = await axios.post('http://localhost:5000/api/supervisors/add', trimmedData);
      setMessage(res.data.message || 'Supervisor added successfully');
      setFormData({
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
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add supervisor');
    }
  };

  const handleUploadExcel = async e => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!file) {
      setError('Please select an Excel file');
      return;
    }

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await axios.post('http://localhost:5000/api/supervisors/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(res.data.message || 'Excel uploaded successfully');
      if (res.data.failedCount > 0) {
        setError(`Failed rows: ${res.data.failedCount}`);
      }

      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload Excel file');
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '600px' }}>
      <h2>Add Supervisor</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleAddSupervisor} className="mb-4">
        <div className="mb-3">
          <label>Employee Number</label>
          <input
            type="text"
            className="form-control"
            name="SUPERVISOR_NUMBER"
            value={formData.SUPERVISOR_NUMBER}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Employee Title</label>
          <input
            type="text"
            className="form-control"
            name="SUPERVISOR_TITLE"
            value={formData.SUPERVISOR_TITLE}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Employee Initials</label>
          <input
            type="text"
            className="form-control"
            name="SUPERVISOR_INITIALS"
            value={formData.SUPERVISOR_INITIALS}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>First Name</label>
          <input
            type="text"
            className="form-control"
            name="SUPERVISOR_FIRST_NAME"
            value={formData.SUPERVISOR_FIRST_NAME}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Surname</label>
          <input
            type="text"
            className="form-control"
            name="SUPERVISOR_SURNAME"
            value={formData.SUPERVISOR_SURNAME}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Designation</label>
          <input
            type="text"
            className="form-control"
            name="SUPERVISOR_DESIGNATION"
            value={formData.SUPERVISOR_DESIGNATION}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Office Phone</label>
          <input
            type="int"
            className="form-control"
            name="SUPERVISOR_OFFICE_PHONE"
            value={formData.SUPERVISOR_OFFICE_PHONE}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Mobile Phone</label>
          <input
            type="int"
            className="form-control"
            name="SUPERVISOR_MOBILE_PHONE"
            value={formData.SUPERVISOR_MOBILE_PHONE}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Section</label>
          <input
            type="text"
            className="form-control"
            name="SUPERVISOR_SECTION"
            value={formData.SUPERVISOR_SECTION}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Division</label>
          <input
            type="text"
            className="form-control"
            name="SUPERVISOR_DIVISION"
            value={formData.SUPERVISOR_DIVISION}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Cost Centre Code</label>
          <input
            type="text"
            className="form-control"
            name="SUPERVISOR_COST_CENTRE_CODE"
            value={formData.SUPERVISOR_COST_CENTRE_CODE}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Group Name</label>
          <input
            type="text"
            className="form-control"
            name="SUPERVISOR_GROUP_NAME"
            value={formData.SUPERVISOR_GROUP_NAME}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Salary Grade</label>
          <input
            type="text"
            className="form-control"
            name="SUPERVISOR_SALARY_GRADE"
            value={formData.SUPERVISOR_SALARY_GRADE}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">Add Supervisor</button>
      </form>

      <h4>Upload Excel</h4>
      <form onSubmit={handleUploadExcel}>
        <input type="file" onChange={handleFileChange} ref={fileInputRef} accept=".xlsx,.xls" />
        <button type="submit" className="btn btn-secondary mt-2">Upload</button>
      </form>
    </div>
  );
};

export default AddSupervisor;
