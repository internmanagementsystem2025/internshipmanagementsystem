const Scheme = require('../models/Scheme');
const Intern = require('../models/Intern');

// Create a new scheme
exports.createScheme = async (req, res) => {
  try {
    const schemeData = {
      ...req.body,
      totalAllocatedCount: 0,
      totalEmptyCount: req.body.totalAllocation
    };

    const newScheme = new Scheme(schemeData);
    await newScheme.save();
    res.status(201).json({ message: 'Scheme created successfully', scheme: newScheme });
  } catch (err) {
    res.status(400).json({ error: 'Failed to create scheme', details: err.message });
  }
};

// Get all schemes
exports.getAllSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find();
    res.status(200).json(schemes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schemes', details: error.message });
  }
};

// Get a scheme by ID
exports.getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
    res.status(200).json(scheme);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scheme', details: error.message });
  }
};

// ✅ Update a scheme (with editComment)
exports.updateScheme = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle recalculation of totalEmptyCount if totalAllocation is changed
    if (updateData.totalAllocation !== undefined) {
      const existingScheme = await Scheme.findById(id);
      if (!existingScheme) return res.status(404).json({ error: 'Scheme not found' });

      updateData.totalEmptyCount = updateData.totalAllocation - existingScheme.totalAllocatedCount;
    }

    // Save edit comment if provided
    if (updateData.editComment !== undefined) {
      updateData.editComment = updateData.editComment.trim();
    }

    const updatedScheme = await Scheme.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedScheme) return res.status(404).json({ error: 'Scheme not found' });

    res.status(200).json({ message: 'Scheme updated successfully', scheme: updatedScheme });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update scheme', details: error.message });
  }
};

// Delete a scheme
exports.deleteScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndDelete(req.params.id);
    if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
    res.status(200).json({ message: 'Scheme deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete scheme', details: error.message });
  }
};

// Assign managers to a scheme with allocation counts
exports.assignManagers = async (req, res) => {
  try {
    const {
      generalManager,
      deputyManager,
      supervisor,
      generalManagerAllocation,
      deputyManagerAllocation,
      supervisorAllocation
    } = req.body;

    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ error: 'Scheme not found' });

    if (generalManager) {
      scheme.generalManager = {
        name: generalManager,
        allocationCount: generalManagerAllocation || scheme.generalManager?.allocationCount || 0,
        availableAllocation: generalManagerAllocation || 0,
        assignedCount: scheme.generalManager?.assignedCount || 0
      };
    }

    if (deputyManager) {
      scheme.deputyManager = {
        name: deputyManager,
        allocationCount: deputyManagerAllocation || scheme.deputyManager?.allocationCount || 0,
        availableAllocation: deputyManagerAllocation || 0,
        assignedCount: scheme.deputyManager?.assignedCount || 0
      };
    }

    if (supervisor) {
      scheme.supervisor = {
        name: supervisor,
        allocationCount: supervisorAllocation || scheme.supervisor?.allocationCount || 0,
        availableAllocation: supervisorAllocation || 0,
        assignedCount: scheme.supervisor?.assignedCount || 0
      };
    }

    await scheme.save();
    res.status(200).json({
      message: 'Managers assigned successfully with allocation counts',
      scheme
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign managers', details: error.message });
  }
};

// Recalculate allocation counts
exports.recalculateAllocation = async (req, res) => {
  try {
    const { id } = req.params;

    const scheme = await Scheme.findById(id);
    if (!scheme) return res.status(404).json({ error: 'Scheme not found' });

    const allocatedCount = await Intern.countDocuments({ schemeId: id });

    const generalManagerCount = await Intern.countDocuments({
      schemeId: id,
      managerType: 'generalManager'
    });

    const deputyManagerCount = await Intern.countDocuments({
      schemeId: id,
      managerType: 'deputyManager'
    });

    const supervisorCount = await Intern.countDocuments({
      schemeId: id,
      managerType: 'supervisor'
    });

    scheme.totalAllocatedCount = allocatedCount;
    scheme.totalEmptyCount = scheme.totalAllocation - allocatedCount;

    if (scheme.generalManager) {
      scheme.generalManager.assignedCount = generalManagerCount;
    }

    if (scheme.deputyManager) {
      scheme.deputyManager.assignedCount = deputyManagerCount;
    }

    if (scheme.supervisor) {
      scheme.supervisor.assignedCount = supervisorCount;
    }

    await scheme.save();

    res.status(200).json({
      message: 'Allocation counts recalculated successfully',
      scheme
    });
  } catch (error) {
    console.error('Recalculation error:', error);
    res.status(500).json({
      error: 'Failed to recalculate allocation counts',
      details: error.message
    });
  }
};
