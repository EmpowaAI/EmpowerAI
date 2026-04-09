const User = require('../user/user.Model');
const PendingUser = require('../userAccount/PendingUser.Model');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const emailService = require('../../intergration/email/email.Service');

const { toRegisterDTO } = require('./authentication.Dto/RegisterDto');
const { toLoginDTO } = require('./authentication.Dto/LoginDto');
const { ConflictError, UnauthorizedError } = require('../../utils/errors');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

class AuthenticationService {

  async register(rawData) {
    const dto = toRegisterDTO(rawData);

    const exists = await User.findOne({ email: dto.email }) ||
                   await PendingUser.findOne({ email: dto.email });

    if (exists) throw new ConflictError('Email already in use');

    const rawToken = crypto.randomBytes(32).toString('hex');
    const emailToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const pending = await PendingUser.create({
      ...dto,
      emailToken,
      emailTokenExpires: Date.now() + 3600000,
    });

    await emailService.sendVerification(pending.email, rawToken);

    return { id: pending._id, email: pending.email };
  }


  async login(rawData) {
    const dto = toLoginDTO(rawData);

    const user = await User.findOne({ email: dto.email }).select('+password');
    if (!user) throw new UnauthorizedError('Invalid credentials');

    if (!user.isVerified) {
      throw new UnauthorizedError('Verify email first');
    }

    

    const ok = await user.correctPassword(dto.password);
    if (!ok) throw new UnauthorizedError('Invalid credentials');

    const token = signToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    };
  }
}

module.exports = new AuthenticationService();