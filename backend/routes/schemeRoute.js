// const express = require('express');
// const schemeController = require('../controllers/schemeController');

// const router = express.Router();

// router.post('/', schemeController.createScheme);
// router.get('/', schemeController.getAllSchemes);
// router.get('/:id', schemeController.getSchemeById);
// router.put('/:id', schemeController.updateScheme);
// router.delete('/:id', schemeController.deleteScheme);
// router.put('/:id/assign-managers', schemeController.assignManagers);
// router.post('/:id/recalculate', schemeController.recalculateAllocation);

// module.exports = router;


const express = require('express');
const router = express.Router();
const SchemeController = require('../controllers/schemeController');

// ✅ Create a new scheme
router.post('/', SchemeController.createScheme);

// ✅ Get all schemes
router.get('/', SchemeController.getAllSchemes);

// ✅ Get a specific scheme by ID
router.get('/:id', SchemeController.getSchemeById);

// ✅ Update a scheme (includes editComment support)
router.put('/:id', SchemeController.updateScheme);

// ✅ Delete a scheme
router.delete('/:id', SchemeController.deleteScheme);

// ✅ Assign managers with allocation counts
router.put('/:id/assign-managers', SchemeController.assignManagers);

// ✅ Recalculate allocation counts for a scheme
router.post('/:id/recalculate', SchemeController.recalculateAllocation);

module.exports = router;
