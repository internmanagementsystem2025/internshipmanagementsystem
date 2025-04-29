import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Container,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { FiFileText, FiUpload } from "react-icons/fi";
import axios from "axios";
import * as XLSX from "xlsx"; // Import the xlsx library

const BulkCVUpload = ({ darkMode }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadErrors, setUploadErrors] = useState([]);

  // Function to validate the Excel file
  const validateExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // Log all sheet names in the workbook
        console.log("Sheet names in the workbook:", workbook.SheetNames);

        // Log the content of each sheet
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          console.log(`Rows in sheet "${sheetName}":`, rows);
        });

        // Assuming the first sheet is used
        const sheetName = "Sheet1"; // Explicitly specify the sheet name
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
          reject(`The sheet "${sheetName}" does not exist in the Excel file.`);
          return;
        }

        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Extract headers from the correct row (e.g., row 0 or row 1)
        const headers = rows[0].map((header) => header.trim()); // Trim headers to remove extra spaces
        console.log("Headers in the Excel file (trimmed):", headers);

        // Check if required columns are present
        const requiredColumns = [
          "Full Name",
          "Name with Initials",
          "Gender",
          "Postal Address",
          "District",
          "Birthday",
          "NIC",
          "Mobile Number",
          "Email",
          "Institute",
        ];

        const missingColumns = requiredColumns.filter(
          (col) => !headers.includes(col)
        );

        if (missingColumns.length > 0) {
          reject(
            `The Excel file is missing the following required columns: ${missingColumns.join(
              ", "
            )}`
          );
        }

        // Skip empty rows instead of rejecting the file
        const dataRows = rows.slice(1); // Skip the header row
        const nonEmptyRows = dataRows.filter((row) =>
          row.some((cell) => cell !== null && cell !== "" && cell !== undefined)
        );

        if (nonEmptyRows.length === 0) {
          reject("The Excel file does not contain any valid data rows.");
        }

        resolve();
      };
      reader.onerror = (error) => reject("Error reading the file.");
      reader.readAsArrayBuffer(file);
    });
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    try {
      // Validate the file before uploading
      await validateExcelFile(file);

      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authenticated. Please log in.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/cvs/bulk-upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.errors && response.data.errors.length > 0) {
        setUploadErrors(response.data.errors);
        setError("Some CVs could not be uploaded. See details below.");
        setSuccess(null);
      } else {
        setSuccess("File uploaded successfully!");
        setError(null);
        setUploadErrors([]);
      }
    } catch (err) {
      setError(
        err.message ||
          "Error uploading file. Please check the file format and try again."
      );
      setSuccess(null);
      console.error("Upload error:", err);
    }
  };

  return (
    <Container
      fluid
      className={`p-4 ${
        darkMode ? "bg-dark text-light" : "bg-light text-dark"
      }`}
    >
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className={darkMode ? "bg-secondary text-light" : ""}>
            <Card.Body>
              <Card.Title className="text-center mb-4">
                <FiFileText size={30} className="me-2" />
                Bulk CV Upload
              </Card.Title>

              {/* Download Templates Section */}
              <div className="mb-4">
                <h5>Download Templates:</h5>
                <Button
                  variant="primary"
                  className="me-2"
                  href="/templates/Data_Entry_Operator_Template.xlsx"
                  download="Data_Entry_Operator_Template.xlsx"
                >
                  Download Data Entry Operator Template
                </Button>
                <Button
                  variant="success"
                  href="/templates/Internship_Template.xlsx"
                  download
                >
                  Download Internship Template
                </Button>
              </div>

              {/* Upload Section */}
              <Form onSubmit={handleFileUpload}>
                <Form.Group controlId="formFile" className="mb-3">
                  <Form.Label>
                    Upload Excel File <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                  />
                  <Form.Text className="text-muted">
                    Please upload an Excel file in the provided template format.
                  </Form.Text>
                </Form.Group>

                <Button
                  variant={darkMode ? "light" : "primary"}
                  type="submit"
                  className="w-100"
                >
                  <FiUpload className="me-2" />
                  Upload
                </Button>
              </Form>

              {/* Error and Success Messages */}
              {error && (
                <Alert variant="danger" className="mt-3">
                  {error}
                </Alert>
              )}
              {success && (
                <Alert variant="success" className="mt-3">
                  {success}
                </Alert>
              )}

              {/* Display backend validation errors*/}
              {uploadErrors.length > 0 && (
                <div className="mt-3">
                  <h5>Upload Errors:</h5>
                  {uploadErrors.map((err, index) => (
                    <Alert key={index} variant="danger" className="mt-2">
                      Row {err.row}: {err.message}
                    </Alert>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BulkCVUpload;
