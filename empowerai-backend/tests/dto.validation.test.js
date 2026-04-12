const { validationResult } = require('express-validator');

const { registerRules, validateRegister, toRegisterDTO } = require('../src/dtos/Authentication/RegisterDto');
const { loginRules, validateLogin, toLoginDTO } = require('../src/dtos/Authentication/LoginDto');
const { forgotPasswordRules, validateForgotPassword, toForgotPasswordDTO } = require('../src/dtos/Authentication/ForgotPasswordDto');
const { resetPasswordRules, validateResetPassword, toResetPasswordDTO } = require('../src/dtos/Authentication/ResetPasswordDto');
const { updateEmailRules, validateUpdateEmail, toUpdateEmailDTO } = require('../src/dtos/User/UpdateEmailDto');
const { changePasswordRules, validateChangePassword, toChangePasswordDTO } = require('../src/dtos/User/ChangePasswordDto');
const { updateUserRules, validateUpdateUser, toUpdateUserDTO } = require('../src/dtos/User/UpdateUserDto');

const runRules = async (rules, body) => {
  const req = { body };
  await Promise.all(rules.map((rule) => rule.run(req)));
  const errors = validationResult(req).array();
  return { req, errors };
};

describe('DTO validation', () => {
  test('RegisterDto rejects weak password', async () => {
    const { errors } = await runRules(registerRules, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'weakpass1',
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  test('RegisterDto accepts valid payload', async () => {
    const { errors } = await runRules(registerRules, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'StrongPass1!',
    });
    expect(errors.length).toBe(0);
  });

  test('LoginDto rejects invalid email', async () => {
    const { errors } = await runRules(loginRules, {
      email: 'bad-email',
      password: 'anything',
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  test('ForgotPasswordDto accepts valid email', async () => {
    const { errors } = await runRules(forgotPasswordRules, {
      email: 'test@example.com',
    });
    expect(errors.length).toBe(0);
  });

  test('ResetPasswordDto rejects bad token length', async () => {
    const { errors } = await runRules(resetPasswordRules, {
      token: 'abc',
      newPassword: 'StrongPass1!',
      confirmPassword: 'StrongPass1!',
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  test('ResetPasswordDto rejects password mismatch', async () => {
    const { errors } = await runRules(resetPasswordRules, {
      token: 'a'.repeat(64),
      newPassword: 'StrongPass1!',
      confirmPassword: 'Mismatch1!',
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  test('ResetPasswordDto accepts valid payload', async () => {
    const { errors } = await runRules(resetPasswordRules, {
      token: 'a'.repeat(64),
      newPassword: 'StrongPass1!',
      confirmPassword: 'StrongPass1!',
    });
    expect(errors.length).toBe(0);
  });

  test('UpdateEmailDto requires password', async () => {
    const { errors } = await runRules(updateEmailRules, {
      newEmail: 'new@example.com',
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  test('UpdateEmailDto accepts valid payload', async () => {
    const { errors } = await runRules(updateEmailRules, {
      newEmail: 'new@example.com',
      password: 'StrongPass1!',
    });
    expect(errors.length).toBe(0);
  });

  test('ChangePasswordDto rejects same new password', async () => {
    const { errors } = await runRules(changePasswordRules, {
      currentPassword: 'StrongPass1!',
      newPassword: 'StrongPass1!',
      confirmPassword: 'StrongPass1!',
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  test('ChangePasswordDto accepts valid payload', async () => {
    const { errors } = await runRules(changePasswordRules, {
      currentPassword: 'OldPass1!',
      newPassword: 'NewPass1!',
      confirmPassword: 'NewPass1!',
    });
    expect(errors.length).toBe(0);
  });

  test('UpdateUserDto blocks email/password updates', async () => {
    const { errors } = await runRules(updateUserRules, {
      email: 'nope@example.com',
      password: 'Nope1!',
    });
    expect(errors.length).toBeGreaterThan(0);
  });

  test('UpdateUserDto accepts valid profile update', async () => {
    const { errors } = await runRules(updateUserRules, {
      name: 'New Name',
      age: 22,
      skills: ['JavaScript', 'Node.js'],
      interests: ['AI'],
    });
    expect(errors.length).toBe(0);
  });
});

describe('DTO builders', () => {
  test('toRegisterDTO strips unknown fields', () => {
    const dto = toRegisterDTO({
      name: 'Test',
      email: 'test@example.com',
      password: 'StrongPass1!',
      extra: 'nope',
    });
    expect(dto.extra).toBeUndefined();
  });

  test('toUpdateUserDTO only allows profile fields', () => {
    const dto = toUpdateUserDTO({
      name: 'New Name',
      age: 30,
      email: 'nope@example.com',
      password: 'Nope1!',
      avatar: 'https://example.com/a.png',
    });
    expect(dto.email).toBeUndefined();
    expect(dto.password).toBeUndefined();
    expect(dto.avatar).toBe('https://example.com/a.png');
  });

  test('toResetPasswordDTO excludes confirmPassword', () => {
    const dto = toResetPasswordDTO({
      token: 'a'.repeat(64),
      newPassword: 'StrongPass1!',
      confirmPassword: 'StrongPass1!',
    });
    expect(dto.confirmPassword).toBeUndefined();
  });

  test('toChangePasswordDTO excludes confirmPassword', () => {
    const dto = toChangePasswordDTO({
      currentPassword: 'OldPass1!',
      newPassword: 'NewPass1!',
      confirmPassword: 'NewPass1!',
    });
    expect(dto.confirmPassword).toBeUndefined();
  });

  test('toForgotPasswordDTO only includes email', () => {
    const dto = toForgotPasswordDTO({
      email: 'test@example.com',
      extra: 'nope',
    });
    expect(Object.keys(dto)).toEqual(['email']);
  });

  test('toLoginDTO only includes email and password', () => {
    const dto = toLoginDTO({
      email: 'test@example.com',
      password: 'StrongPass1!',
      extra: 'nope',
    });
    expect(Object.keys(dto)).toEqual(['email', 'password']);
  });

  test('toUpdateEmailDTO only includes newEmail and password', () => {
    const dto = toUpdateEmailDTO({
      newEmail: 'new@example.com',
      password: 'StrongPass1!',
      extra: 'nope',
    });
    expect(Object.keys(dto)).toEqual(['newEmail', 'password']);
  });
});
