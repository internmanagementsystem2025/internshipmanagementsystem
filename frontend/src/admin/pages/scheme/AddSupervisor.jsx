import React, { useState, useRef } from 'react';
import axios from 'axios';

const AddSupervisor = () => {
  const [formData, setFormData] = useState({
    EMPLOYEE_NUMBER: '',
    EMPLOYEE_TITLE: '',
    EMPLOYEE_FIRST_NAME: '',
    EMPLOYEE_SURNAME: '',
    EMPLOYEE_DESIGNATION: '',
    email: '',
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
      EMPLOYEE_NUMBER: formData.EMPLOYEE_NUMBER.trim(),
      EMPLOYEE_TITLE: formData.EMPLOYEE_TITLE.trim(),
      EMPLOYEE_FIRST_NAME: formData.EMPLOYEE_FIRST_NAME.trim(),
      EMPLOYEE_SURNAME: formData.EMPLOYEE_SURNAME.trim(),
      EMPLOYEE_DESIGNATION: formData.EMPLOYEE_DESIGNATION.trim(),
      email: formData.email.trim(),
    };

    // Validation
    if (!trimmedData.EMPLOYEE_NUMBER) return setError('Employee Number is required');
    if (!trimmedData.EMPLOYEE_TITLE) return setError('Employee Title is required');
    if (!trimmedData.EMPLOYEE_FIRST_NAME) return setError('First Name is required');
    if (!trimmedData.EMPLOYEE_SURNAME) return setError('Surname is required');
    if (!trimmedData.EMPLOYEE_DESIGNATION) return setError('Designation is required');
    if (!trimmedData.email) return setError('Email is required');

    try {
      const res = await axios.post('http://localhost:5000/api/employees/add', trimmedData);
      setMessage(res.data.message || 'Supervisor added successfully');
      setFormData({
        EMPLOYEE_NUMBER: '',
        EMPLOYEE_TITLE: '',
        EMPLOYEE_FIRST_NAME: '',
        EMPLOYEE_SURNAME: '',
        EMPLOYEE_DESIGNATION: '',
        email: '',
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

      const res = await axios.post('http://localhost:5000/api/employees/upload', data, {
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
            name="EMPLOYEE_NUMBER"
            value={formData.EMPLOYEE_NUMBER}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Employee Title</label>
          <input
            type="text"
            className="form-control"
            name="EMPLOYEE_TITLE"
            value={formData.EMPLOYEE_TITLE}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>First Name</label>
          <input
            type="text"
            className="form-control"
            name="EMPLOYEE_FIRST_NAME"
            value={formData.EMPLOYEE_FIRST_NAME}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Surname</label>
          <input
            type="text"
            className="form-control"
            name="EMPLOYEE_SURNAME"
            value={formData.EMPLOYEE_SURNAME}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Designation</label>
          <input
            type="text"
            className="form-control"
            name="EMPLOYEE_DESIGNATION"
            value={formData.EMPLOYEE_DESIGNATION}
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
