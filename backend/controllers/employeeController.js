// const Employee = require('../models/Employee');
// const xlsx = require('xlsx');

// exports.uploadExcel = async (req, res) => {
//   try {
//     const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const employees = xlsx.utils.sheet_to_json(sheet);

//     for (let emp of employees) {
//       await Employee.findOneAndUpdate(
//         { EMPLOYEE_NUMBER: emp.EMPLOYEE_NUMBER },
//         emp,
//         { upsert: true, new: true }
//       );
//     }

//     res.status(200).json({ message: 'Upload successful' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getHierarchy = async (req, res) => {
//   const { empNo } = req.params;

//   const hierarchy = [];

//   async function buildTree(currentNo, level = 0) {
//     const children = await Employee.find({ EMPLOYEE_IMM_ES_SERVICE_NO: currentNo });

//     for (let child of children) {
//       hierarchy.push({ level, ...child.toObject() });
//       await buildTree(child.EMPLOYEE_NUMBER, level + 1);
//     }
//   }

//   try {
//     await buildTree(empNo);
//     res.status(200).json(hierarchy);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getByDesignation = async (req, res) => {
//   const { designation } = req.params;
//   try {
//     const list = await Employee.find({
//       EMPLOYEE_DESIGNATION: new RegExp(designation, 'i'),
//     });
//     res.status(200).json(list);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// exports.addEmployee = async (req, res) => {
//     try {
//       const newEmployee = new Employee(req.body);
//       await newEmployee.save();
//       res.status(201).json({ message: 'Employee added successfully' });
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   };
  