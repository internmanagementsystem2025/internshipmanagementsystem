const express = require('express');
const schemeController = require('../controllers/schemeController');

const router = express.Router();

router.post('/', schemeController.createScheme);
router.get('/', schemeController.getAllSchemes);
router.get('/:id', schemeController.getSchemeById);
router.put('/:id', schemeController.updateScheme);
router.delete('/:id', schemeController.deleteScheme);
router.put('/:id/assign-managers', schemeController.assignManagers);
router.post('/:id/recalculate', schemeController.recalculateAllocation);

module.exports = router;
