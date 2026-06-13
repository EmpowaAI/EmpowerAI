const supabase = require('../../db/supabase');
const logger = require('../../utils/logger');

// ─── Password Reset ───────────────────────────────────────────────────────────

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email is required' });
    }

    // Always responds with the same message to prevent email enumeration
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/auth/reset-password`,
    });

    res.json({ status: 'success', message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    logger.error('forgotPassword error', { message: error.message });
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ status: 'error', message: 'New password is required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ status: 'error', message: 'Passwords do not match' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 8 characters' });
    }

    // This route requires an active Supabase session (user clicked the reset link)
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'error', message: 'Reset session token required' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ status: 'error', message: 'Invalid or expired reset link. Please request a new one.' });
    }

    const { error } = await supabase.auth.admin.updateUserById(user.id, { password: newPassword });
    if (error) {
      logger.error('resetPassword updateUserById error', { message: error.message });
      return res.status(400).json({ status: 'error', message: 'Failed to reset password. Please try again.' });
    }

    logger.info('Password reset', { userId: user.id });
    res.json({ status: 'success', message: 'Password reset successfully' });
  } catch (error) {
    logger.error('resetPassword error', { message: error.message });
    next(error);
  }
};

// ─── Email Change ─────────────────────────────────────────────────────────────

exports.requestEmailChange = async (req, res, next) => {
  try {
    const { newEmail } = req.body;
    const userId = req.user?.id;

    if (!newEmail) {
      return res.status(400).json({ status: 'error', message: 'New email is required' });
    }

    // Supabase sends a confirmation email to the new address automatically
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      email: newEmail,
    });

    if (error) {
      if (error.code === 'email_exists') {
        return res.status(409).json({ status: 'error', message: 'This email is already in use.' });
      }
      throw error;
    }

    res.json({ status: 'success', message: 'Verification email sent to your new address.' });
  } catch (error) {
    logger.error('requestEmailChange error', { message: error.message });
    next(error);
  }
};

// ─── Account Deletion ─────────────────────────────────────────────────────────

exports.requestAccountDeletion = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const email = req.user?.email;

    // Mark account as pending deletion
    await supabase.from('users').update({ flagged_for_deletion: true }).eq('id', userId);

    // Send confirmation email via Supabase Auth magic link
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/auth/confirm-delete`,
    }).catch(() => {
      // Non-fatal: user can still confirm deletion via admin
    });

    logger.info('Account deletion requested', { userId });
    res.json({ status: 'success', message: 'Deletion confirmation email sent.' });
  } catch (error) {
    logger.error('requestAccountDeletion error', { message: error.message });
    next(error);
  }
};

exports.confirmAccountDeletion = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Authentication required' });
    }

    // supabase.auth.admin.deleteUser cascades to the users table via FK
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      logger.error('confirmAccountDeletion error', { message: error.message });
      throw error;
    }

    logger.info('Account deleted', { userId });
    res.json({ status: 'success', message: 'Account deleted successfully.' });
  } catch (error) {
    logger.error('confirmAccountDeletion error', { message: error.message });
    next(error);
  }
};
