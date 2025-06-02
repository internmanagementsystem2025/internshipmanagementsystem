const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const Supervisor = require('../models/Supervisor');

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
    const supervisors = await Supervisor.find();
    res.json(supervisors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// POST add manually
router.post('/add', async (req, res) => {
  try {
    const {
        SUPERVISOR_NUMBER,
        SUPERVISOR_TITLE,
        SUPERVISOR_INITIALS,
        SUPERVISOR_FIRST_NAME,
        SUPERVISOR_SURNAME,
        SUPERVISOR_DESIGNATION,
        SUPERVISOR_OFFICE_PHONE,
        SUPERVISOR_MOBILE_PHONE,
        email,
        SUPERVISOR_SECTION,
        SUPERVISOR_DIVISION,
        SUPERVISOR_COST_CENTRE_CODE,
        SUPERVISOR_GROUP_NAME,
        SUPERVISOR_SALARY_GRADE,

    } = req.body;

    const emailExists = await Supervisor.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ error: 'Email must be unique' });
    }

    const empNumExists = await Supervisor.findOne({ SUPERVISOR_NUMBER });
    if (empNumExists) {
      return res.status(400).json({ error: 'Employee number must be unique' });
    }

    const newSupervisor = new Supervisor({
        SUPERVISOR_NUMBER,
        SUPERVISOR_TITLE,
        SUPERVISOR_INITIALS,
        SUPERVISOR_FIRST_NAME,
        SUPERVISOR_SURNAME,
        SUPERVISOR_DESIGNATION,
        SUPERVISOR_OFFICE_PHONE,
        SUPERVISOR_MOBILE_PHONE,
        email,
        SUPERVISOR_SECTION,
        SUPERVISOR_DIVISION,
        SUPERVISOR_COST_CENTRE_CODE,
        SUPERVISOR_GROUP_NAME,
        SUPERVISOR_SALARY_GRADE,

    });

    await newSupervisor.save();
    res.status(201).json({ message: 'Employee added' });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to add employee' });
  }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const updated = await Supervisor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee updated', supervisor: updated });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update employee' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Supervisor.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// POST Excel Upload (Improved)
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    const normalizeKey = key => key.toString().trim().toUpperCase();

    const requiredFields = [
      'SUPERVISOR_NUMBER',
      'SUPERVISOR_TITLE',
      'SUPERVISOR_INITIALS',
      'SUPERVISOR_FIRST_NAME',
      'SUPERVISOR_SURNAME',
      'SUPERVISOR_DESIGNATION',
      'SUPERVISOR_OFFICE_PHONE',
      'SUPERVISOR_MOBILE_PHONE',
      'EMAIL',
      'SUPERVISOR_SECTION',
      'SUPERVISOR_DIVISION',
      'SUPERVISOR_COST_CENTRE_CODE',
      'SUPERVISOR_GROUP_NAME',
      'SUPERVISOR_SALARY_GRADE',

    ];

    const successRows = [];
    const failedRows = [];

    for (const [index, row] of rawData.entries()) {
      const normalized = {};
      Object.keys(row).forEach(k => {
        normalized[normalizeKey(k)] = row[k].toString().trim();
      });

      const missing = requiredFields.filter(field => !normalized[field]);
      if (missing.length > 0) {
        failedRows.push({ row: index + 2, reason: `Missing fields: ${missing.join(', ')}`, rowData: normalized });
        continue;
      }

      if (normalized.EMAIL && !/^\S+@\S+\.\S+$/.test(normalized.EMAIL)) {
        failedRows.push({ row: index + 2, reason: 'Invalid email format', rowData: normalized });
        continue;
      }

      const supervisorData = {
        SUPERVISOR_NUMBER: normalized.SUPERVISOR_NUMBER,
        SUPERVISOR_TITLE: normalized.SUPERVISOR_TITLE || '',
        SUPERVISOR_INITIALS: normalized.SUPERVISOR_INITIALS || '',
        SUPERVISOR_FIRST_NAME: normalized.SUPERVISOR_FIRST_NAME,
        SUPERVISOR_SURNAME: normalized.SUPERVISOR_SURNAME,
        SUPERVISOR_DESIGNATION: normalized.SUPERVISOR_DESIGNATION,
        SUPERVISOR_OFFICE_PHONE: normalized.SUPERVISOR_OFFICE_PHONE || '',
        SUPERVISOR_MOBILE_PHONE: normalized.SUPERVISOR_MOBILE_PHONE || '',
        email: normalized.EMAIL,
        SUPERVISOR_SECTION: normalized.SUPERVISOR_SECTION || '',
        SUPERVISOR_DIVISION: normalized.SUPERVISOR_DIVISION || '',
        SUPERVISOR_COST_CENTRE_CODE: normalized.SUPERVISOR_COST_CENTRE_CODE || '',
        SUPERVISOR_GROUP_NAME: normalized.SUPERVISOR_GROUP_NAME || '',
        SUPERVISOR_SALARY_GRADE: normalized.SUPERVISOR_SALARY_GRADE || '',
      };

      try {
        const emailConflict = await Supervisor.findOne({
          email: supervisorData.email,
          SUPERVISOR_NUMBER: { $ne: supervisorData.SUPERVISOR_NUMBER },
        });

        if (emailConflict) {
          failedRows.push({ row: index + 2, reason: 'Email already in use by another employee', rowData: normalized });
          continue;
        }

        await Supervisor.findOneAndUpdate(
          { SUPERVISOR_NUMBER: supervisorData.SUPERVISOR_NUMBER },
          supervisorData,
          { upsert: true, new: true, runValidators: true }
        );
        successRows.push(index + 2);
      } catch (err) {
        failedRows.push({ row: index + 2, reason: `DB error: ${err.message}`, rowData: normalized });
      }
    }

    console.log("Upload Summary:");
    console.log("Successful Rows:", successRows.length);
    console.log("Failed Rows:", failedRows);

    res.json({
      message: 'Excel processed',
      successCount: successRows.length,
      failedCount: failedRows.length,
      failedRows,
    });
  } catch (err) {
    console.error('Error processing Excel:', err);
    res.status(500).json({ error: 'Failed to process Excel file' });
  }
});

module.exports = router;
