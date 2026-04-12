const User        = require('../user/user.Model');
const PendingUser  = require('../userAccount/PendingUser.Model');
const crypto       = require('crypto');
const jwt          = require('jsonwebtoken');
const emailService = require('../../intergration/email/email.Service');

const { toRegisterDTO } = require('./authentication.Dto/RegisterDto');
const { toLoginDTO }    = require('./authentication.Dto/LoginDto');
const { ConflictError, UnauthorizedError } = require('../../utils/errors');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

class AuthenticationService {



  async register(rawData, correlationId, clientIp) {
    const dto = toRegisterDTO(rawData);

  
    if (!dto.consentDataProcessing || !dto.consentProfileSharing) {
      throw new ConflictError(
        'Required POPIA consents must be accepted to register.'
      );
    }

    // ─── Duplicate check ───────────────────────────────────────────────────────
    const exists =
      (await User.findOne({ email: dto.email })) ||
      (await PendingUser.findOne({ email: dto.email }));

    if (exists) throw new ConflictError('Email already in use');

    // ─── Email verification token ──────────────────────────────────────────────
    const rawToken  = crypto.randomBytes(32).toString('hex');
    const emailToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    // ─── Create PendingUser with POPIA consent fields ──────────────────────────
    const pending = await PendingUser.create({
      name:     dto.name,
      email:    dto.email,
      password: dto.password,

      emailToken,
      emailTokenExpires: Date.now() + 3_600_000, // 1 hour

      // POPIA consent
      consentDataProcessing: dto.consentDataProcessing,
      consentProfileSharing: dto.consentProfileSharing,
      consentAiProcessing:   dto.consentAiProcessing,
      consentTimestamp:      new Date(),
      consentIp:             clientIp || null,
    });

    await emailService.sendVerification(pending.email, rawToken);

    return { id: pending._id, email: pending.email };
  }

  /**
   * Login an existing verified user.
   * Updates lastActiveAt on every successful login.
   */
  async login(rawData, correlationId) {
    const dto = toLoginDTO(rawData);

    const user = await User.findOne({ email: dto.email }).select('+password');
    if (!user) throw new UnauthorizedError('Invalid credentials');

    if (!user.isVerified) {
      throw new UnauthorizedError('Verify email first');
    }

    const ok = await user.correctPassword(dto.password);
    if (!ok) throw new UnauthorizedError('Invalid credentials');

    // ─── Update last active timestamp ─────────────────────────────────────────
    // Keeps the inactivity-deletion cron job accurate.
    await User.findByIdAndUpdate(user._id, { lastActiveAt: new Date() });

    const token = signToken(user._id);

    return {
      token,
      user: {
        id:    user._id,
        email: user.email,
        name:  user.name,
      },
    };
  }
}

module.exports = new AuthenticationService();
