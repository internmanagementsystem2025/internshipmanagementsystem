import React, { useState } from "react";
import axios from "axios";
import employeeBg from "../../../assets/employee-bg.png";


function AddEmployee() {
  const [employee, setEmployee] = useState({
    employee_code: '',
    full_name: '',
    email: '',
    department: '',
    job_title: '',
    hierarchy_level: '',
    division_code: '',
    cost_center: '',
    grade_level: '',
    joining_date: ''
  });

  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('${import.meta.env.VITE_BASE_URL}/employees/add', employee);
      alert('✅ Employee added successfully');
      setEmployee({
        employee_code: '',
        full_name: '',
        email: '',
        department: '',
        job_title: '',
        hierarchy_level: '',
        division_code: '',
        cost_center: '',
        grade_level: '',
        joining_date: ''
      });
    } catch (error) {
      alert(`❌ ${error.response?.data?.error || 'Something went wrong'}`);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select an Excel file first.');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('${import.meta.env.VITE_BASE_URL}/employees/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      alert('✅ Employees uploaded successfully');
      setFile(null);
    } catch (error) {
      alert(`❌ ${error.response?.data?.error || 'Something went wrong during upload'}`);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* ✅ Background image using imported variable */}
      <div
        style={{
          backgroundImage: `url(${employeeBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          opacity: 0.2,
        }}
      />

      {/* Foreground content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10 col-12">

              {/* Add Employee Form */}
              <div className="card shadow-sm mb-5">
                <div className="card-header bg-primary text-white">
                  <h4 className="mb-0">Add New Employee Manually</h4>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit} className="row g-3">
                    {Object.keys(employee).map((key) => (
                      <div className="col-md-6" key={key}>
                        <label htmlFor={key} className="form-label text-capitalize fw-semibold">
                          {key.replace(/_/g, ' ')}
                        </label>
                        <input
                          id={key}
                          type={key.includes('date') ? 'date' : key === 'email' ? 'email' : 'text'}
                          className="form-control form-control-lg"
                          name={key}
                          value={employee[key]}
                          onChange={handleChange}
                          required
                          placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                        />
                      </div>
                    ))}
                    <div className="col-12 text-center mt-3">
                      <button type="submit" className="btn btn-success btn-lg px-5 shadow-sm">
                        Add Employee
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Excel Upload */}
              <div className="card shadow-sm">
                <div className="card-header bg-info text-white">
                  <h4 className="mb-0">Upload Employees from Excel</h4>
                </div>
                <div className="card-body">
                  <form onSubmit={handleUpload}>
                    <div className="mb-4">
                      <label htmlFor="file" className="form-label fw-semibold">
                        Select Excel File
                      </label>
                      <input
                        type="file"
                        id="file"
                        accept=".xlsx, .xls"
                        className="form-control form-control-lg"
                        onChange={handleFileChange}
                      />
                      {file && (
                        <small className="text-muted mt-2 d-block">
                          Selected file: <strong>{file.name}</strong>
                        </small>
                      )}
                    </div>
                    <div className="d-flex flex-column flex-md-row align-items-center gap-3">
                      <button type="submit" className="btn btn-primary btn-lg shadow-sm flex-grow-1">
                        Upload File
                      </button>
                      <a
                        href="/templates/excel_template.xlsx"
                        className="btn btn-outline-secondary btn-lg shadow-sm flex-grow-1 text-center"
                        download
                      >
                        Download Template
                      </a>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddEmployee;
