import { Router, Request, Response } from 'express';
import SystemConfig from '../models/SystemConfig';
import { authenticate, AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

/**
 * Public System Status & Version Check
 * GET /api/system/status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    let config = await SystemConfig.findOne({ key: 'global' });
    if (!config) {
      config = await SystemConfig.create({
        key: 'global',
        maintenanceMode: false,
      });
    }

    // Allow overriding via environment variable
    const envMaintenance = process.env.MAINTENANCE_MODE === 'true';
    const maintenanceActive = envMaintenance || config.maintenanceMode;

    return res.status(200).json({
      success: true,
      data: {
        maintenanceMode: maintenanceActive,
        maintenanceMessage: config.maintenanceMessage,
        minRequiredVersion: config.minRequiredVersion,
        latestVersion: config.latestVersion,
        apkDownloadUrl: config.apkDownloadUrl || 'https://giet-a-event-manager.onrender.com/download/app',
      },
    });
  } catch (error) {
    console.error('[SystemRoutes] status error:', error);
    // Graceful fallback to avoid blocking users if DB read fails temporarily
    return res.status(200).json({
      success: true,
      data: {
        maintenanceMode: false,
        maintenanceMessage: '',
        minRequiredVersion: '1.0.0',
        latestVersion: '1.0.0',
        apkDownloadUrl: 'https://giet-a-event-manager.onrender.com/download/app',
      },
    });
  }
});

/**
 * Admin: Toggle Maintenance Mode & Update Messages
 * PUT /api/system/maintenance
 */
router.put('/maintenance', authenticate, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    if (authReq.user?.role !== UserRole.ADMIN) {
      return res.status(403).json({ success: false, error: { message: 'Only admins can manage maintenance mode' } });
    }

    const { maintenanceMode, maintenanceMessage, minRequiredVersion, latestVersion, apkDownloadUrl } = req.body;

    const updateFields: any = {
      updatedBy: authReq.user.id,
    };

    if (typeof maintenanceMode === 'boolean') updateFields.maintenanceMode = maintenanceMode;
    if (maintenanceMessage && typeof maintenanceMessage === 'string') updateFields.maintenanceMessage = maintenanceMessage.trim();
    if (minRequiredVersion && typeof minRequiredVersion === 'string') updateFields.minRequiredVersion = minRequiredVersion.trim();
    if (latestVersion && typeof latestVersion === 'string') updateFields.latestVersion = latestVersion.trim();
    if (apkDownloadUrl && typeof apkDownloadUrl === 'string') updateFields.apkDownloadUrl = apkDownloadUrl.trim();

    const config = await SystemConfig.findOneAndUpdate(
      { key: 'global' },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: `Maintenance mode is now ${config.maintenanceMode ? 'ENABLED (Users blocked with message)' : 'DISABLED (Normal operations resumed)'}`,
      data: config,
    });
  } catch (error) {
    console.error('[SystemRoutes] toggle maintenance error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to update system config' } });
  }
});

export default router;
