/**
 * AccountService
 * Handles account-related operations such as email verification and password resets.
 * Used by AuthService for registration and login flows, especially for sending verification emails.
 * Also used by other services/controllers for account management features.
 *
 * Note: AuthService depends on AccountService for email verification, but AccountService is standalone and can be used independently for other account-related features. 
 */
const crypto = require("crypto");
const logger = require("../utils/logger");
const { NotFoundError } = require("../utils/errors");
const EmailService = require("./emailService");

class AccountService {
  constructor(userRepository) {
    this.userRepo = userRepository;
    this.emailService = new EmailService();
  }

  //---------------------------------
  // Verify Email
  //---------------------------------

  async verifyEmail(dto, correlationId = null) {
    const { token: rawToken } = dto;
    const token = crypto.createHash("sha256").update(rawToken).digest("hex");

    const user = await this.userRepo.findByEmailToken(token);
    if (!user) {
      logger.warn("Invalid or expired verification token", { correlationId });
      throw new NotFoundError("Invalid or expired token");
    }

    user.isVerified = true;
    user.emailToken = null;
    user.emailTokenExpires = null;
    await user.save();

    logger.info("Email verified", { correlationId, userId: user._id });
    return user;
  }

  //---------------------------------
  // Send Verification Email
  //---------------------------------

  async sendVerificationEmail(email, token, correlationId = null) {
    logger.info(`Sending verification email to: ${email}`, { correlationId });
    await this.emailService.sendVerification(email, token);
    logger.info(`Verification email sent to: ${email}`, { correlationId });
  }

  //---------------------------------
  // Forgot Password
  //---------------------------------

  async forgotPassword(dto, correlationId = null) {
    const { email } = dto;

    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      logger.warn(`No account found with email: ${email}`, { correlationId });
      return true; // silently ignore
    }

    const raw = crypto.randomBytes(32).toString("hex");
    const token = crypto.createHash("sha256").update(raw).digest("hex");

    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 30 * 60 * 1000; // 30 mins
    await user.save();

    await this.emailService.sendReset(user.email, raw);

    logger.info("Password reset email sent", { correlationId, userId: user._id });
    return true;
  }

  //---------------------------------
  // Reset Password
  //---------------------------------

  async resetPassword(dto, correlationId = null) {
    const { token, newPassword } = dto;
    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await this.userRepo.findByResetToken(hashed);
    if (!user) {
      logger.warn("Invalid or expired reset token", { correlationId });
      throw new NotFoundError("Invalid or expired token");
    }

    user.password = newPassword; // your model should hash it
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    logger.info("Password reset successful", { correlationId, userId: user._id });
    return user;
  }
}

module.exports = AccountService;