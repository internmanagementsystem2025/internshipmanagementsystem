const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const Employee = require('../models/Employee');

// Multer config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed (.xls, .xlsx)'));
    }
  },
});

// GET all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// POST add manually
router.post('/add', async (req, res) => {
  try {
    const {
      EMPLOYEE_NUMBER,
      EMPLOYEE_TITLE,
      EMPLOYEE_FIRST_NAME,
      EMPLOYEE_SURNAME,
      EMPLOYEE_DESIGNATION,
      EMPLOYEE_IMM_ES_SERVICE_NO,
      email,
    } = req.body;

    const newEmployee = new Employee({
      EMPLOYEE_NUMBER,
      EMPLOYEE_TITLE,
      EMPLOYEE_FIRST_NAME,
      EMPLOYEE_SURNAME,
      EMPLOYEE_DESIGNATION,
      EMPLOYEE_IMM_ES_SERVICE_NO,
      email,
    });

    await newEmployee.save();
    res.status(201).json({ message: 'Employee added' });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.email) return res.status(400).json({ error: 'Email must be unique' });
      if (error.keyPattern?.EMPLOYEE_NUMBER) return res.status(400).json({ error: 'Employee number must be unique' });
      return res.status(400).json({ error: 'Duplicate key error' });
    }
    res.status(400).json({ error: error.message || 'Failed to add employee' });
  }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee updated', employee: updated });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update employee' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Employee.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// POST Excel Upload
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    const normalizeKey = key => key.toString().trim().toUpperCase();

    const requiredFields = [
      'EMPLOYEE_NUMBER',
      'EMPLOYEE_TITLE',
      'EMPLOYEE_FIRST_NAME',
      'EMPLOYEE_SURNAME',
      'EMPLOYEE_DESIGNATION',
      'EMAIL',
    ];

    const successRows = [];
    const failedRows = [];

    for (const [index, row] of rawData.entries()) {
      const normalized = {};
      Object.keys(row).forEach(k => {
        normalized[normalizeKey(k)] = row[k];
      });

      const missing = requiredFields.filter(field => !normalized[field] || normalized[field].toString().trim() === '');
      if (missing.length > 0) {
        failedRows.push({ row: index + 2, reason: `Missing: ${missing.join(', ')}` });
        continue;
      }

      if (normalized.EMAIL && !/^\S+@\S+\.\S+$/.test(normalized.EMAIL)) {
        failedRows.push({ row: index + 2, reason: 'Invalid email format' });
        continue;
      }

      const employeeData = {
        EMPLOYEE_NUMBER: normalized.EMPLOYEE_NUMBER,
        EMPLOYEE_TITLE: normalized.EMPLOYEE_TITLE || '',
        EMPLOYEE_FIRST_NAME: normalized.EMPLOYEE_FIRST_NAME,
        EMPLOYEE_SURNAME: normalized.EMPLOYEE_SURNAME,
        EMPLOYEE_DESIGNATION: normalized.EMPLOYEE_DESIGNATION,
        EMPLOYEE_IMM_ES_SERVICE_NO: normalized.EMPLOYEE_IMM_ES_SERVICE_NO || '',
        email: normalized.EMAIL,
      };

      try {
        await Employee.findOneAndUpdate(
          { EMPLOYEE_NUMBER : employeeData.EMPLOYEE_NUMBER },
          employeeData,
          { upsert: true, new: true, runValidators: true }
        );
        successRows.push(index + 2);
      } catch (err) {
        let reason = err.message;
        if (err.code === 11000) {
          if (err.keyPattern?.email) reason = 'Duplicate email';
          else if (err.keyPattern?.employee_code) reason = 'Duplicate employee_code';
        }
        failedRows.push({ row: index + 2, reason });
      }
    }

    res.json({
      message: 'Excel processed',
      successCount: successRows.length,
      failedCount: failedRows.length,
      failedRows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process Excel file' });
  }
});

module.exports = router;
