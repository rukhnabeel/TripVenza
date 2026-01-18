const SystemSetting = require('../models/SystemSetting');

// @desc    Get system maintenance status
// @route   GET /api/system/maintenance
// @access  Public (or semi-private, needed for frontend check)
const getMaintenanceStatus = async (req, res) => {
    try {
        let setting = await SystemSetting.findOne({ key: 'maintenance_mode' });

        if (!setting) {
            // Default to false if not set
            return res.json({ maintenanceMode: false });
        }

        res.json({ maintenanceMode: setting.value });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Toggle maintenance mode
// @route   POST /api/system/maintenance
// @access  Private/Admin
const toggleMaintenanceMode = async (req, res) => {
    try {
        const { enabled } = req.body;

        let setting = await SystemSetting.findOne({ key: 'maintenance_mode' });

        if (setting) {
            setting.value = enabled;
            setting.updatedBy = req.user._id;
            await setting.save();
        } else {
            setting = await SystemSetting.create({
                key: 'maintenance_mode',
                value: enabled,
                description: 'Global maintenance mode switch',
                updatedBy: req.user._id
            });
        }

        res.json({
            message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
            maintenanceMode: setting.value
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getMaintenanceStatus,
    toggleMaintenanceMode
};
