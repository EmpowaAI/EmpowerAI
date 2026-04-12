const User          = require('./../user/user.Model');
const PendingUser   = require('./PendingUser.Model');
const CvProfile     = require('../cvAnalyser/cvAnalyser.Model');
const EconomicTwin  = require('../twinBuilder/twinBuilder.Model');
const logger        = require('../../utils/logger');
const crypto        = require('crypto');
const emailService  = require('../../intergration/email/email.Service');

const { NotFoundError, UnauthorizedError } = require('../../utils/errors');

const { toForgotPasswordDTO } = require('./userAccount.Dto/ForgotPasswordDto');
const { toResetPasswordDTO }  = require('./userAccount.Dto/ResetPasswordDto');
const { toChangePasswordDTO } = require('./userAccount.Dto/ChangePasswordDto');
const { toGetUserDTO }        = require('../user/use.Dtos/GetUserDto');


class UserAccountService {

 
  async verifyEmail(rawToken, correlationId = null) {
    const token = crypto.createHash('sha256').update(rawToken).digest('hex');

    const pending = await PendingUser.findOne({
      emailToken:        token,
      emailTokenExpires: { $gt: Date.now() },
    }).select('+password +consentTimestamp +consentIp');

    if (!pending) {
      throw new NotFoundError('Invalid or expired verification token');
    }

  
    const alreadyVerified = await User.findOne({ email: pending.email });
    if (alreadyVerified) {
      await PendingUser.findByIdAndDelete(pending._id);
      logger.warn('Duplicate verification attempt', { correlationId, email: pending.email });
      return toGetUserDTO(alreadyVerified);
    }

    const user = new User({
      name:       pending.name,
      email:      pending.email,
      password:   pending.password,
      isVerified: true,

      
      consentDataProcessing: pending.consentDataProcessing,
      consentProfileSharing: pending.consentProfileSharing,
      consentAiProcessing:   pending.consentAiProcessing,
      consentTimestamp:      pending.consentTimestamp,
      consentIp:             pending.consentIp,
    });

    user.$locals.skipHash = true;
    await user.save();

    await PendingUser.findByIdAndDelete(pending._id);

    logger.info('Email verified - user promoted from pending', {
      correlationId,
      userId: user._id,
      email:  user.email,
      consentDataProcessing: user.consentDataProcessing,
      consentProfileSharing: user.consentProfileSharing,
      consentAiProcessing:   user.consentAiProcessing,
    });

    return toGetUserDTO(user);
  }



  async forgotPassword(rawData) {
    const dto  = toForgotPasswordDTO(rawData);
    const user = await User.findOne({ email: dto.email });
    if (!user) return; 

    const raw    = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(raw).digest('hex');

    user.resetToken        = hashed;
    user.resetTokenExpires = Date.now() + 1_800_000;

    await user.save();
    await emailService.sendReset(user.email, raw);
  }


  async resetPassword(rawData) {
    const dto    = toResetPasswordDTO(rawData);
    const hashed = crypto.createHash('sha256').update(dto.token).digest('hex');

    const user = await User.findOne({
      resetToken:        hashed,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) throw new NotFoundError('Invalid token');

    user.password          = dto.newPassword;
    user.resetToken        = null;
    user.resetTokenExpires = null;

    await user.save();
  }


  async changePassword(userId, rawData) {
    const dto  = toChangePasswordDTO(rawData);
    const user = await User.findById(userId).select('+password');
    if (!user) throw new NotFoundError('User not found');

    const ok = await user.correctPassword(dto.currentPassword);
    if (!ok) throw new UnauthorizedError('Wrong password');

    user.password = dto.newPassword;
    await user.save();
  }


  async requestEmailChange(userId, rawData) {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new NotFoundError('User not found');

    const dto    = rawData;
    const raw    = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(raw).digest('hex');

    user.pendingEmail      = dto.newEmail;
    user.emailToken        = hashed;
    user.emailTokenExpires = Date.now() + 3_600_000;

    await user.save();
    await emailService.sendEmailChange(dto.newEmail, raw);
  }


  async confirmEmailChange(rawToken) {
    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await User.findOne({
      emailToken:        hashed,
      emailTokenExpires: { $gt: Date.now() },
    });

    if (!user) throw new NotFoundError('Invalid token');

    user.email        = user.pendingEmail;
    user.pendingEmail = null;

    await user.save();
  }


  async requestAccountDeletion(userId) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const raw    = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(raw).digest('hex');

    user.deleteToken        = hashed;
    user.deleteTokenExpires = Date.now() + 900_000; // 15 minutes

    await user.save();
    await emailService.sendAccountDeletion(user.email, raw);
  }


  async confirmAccountDeletion(rawToken) {
    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await User.findOne({
      deleteToken:        hashed,
      deleteTokenExpires: { $gt: Date.now() },
    });

    if (!user) throw new NotFoundError('Invalid or expired deletion token');

    const userId = user._id;

    await EconomicTwin.deleteOne({ user: userId });

  
    await CvProfile.deleteOne({ user: userId });

  
    await User.findByIdAndDelete(userId);

    logger.info('Account and all associated data deleted (POPIA)', {
      userId,
      email:     user.email,
      deletedAt: new Date().toISOString(),
    });
  }

}

module.exports = new UserAccountService();
