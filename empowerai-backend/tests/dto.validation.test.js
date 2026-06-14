const { validationResult } = require('express-validator');

const { updateUserRules, toUpdateUserDTO } = require('../src/modules/user/use.Dtos/UpdateUserDto');
const { registerSchema, loginSchema } = require('../src/utils/validators');

const runRules = async (rules, body) => {
  const req = { body };
  await Promise.all(rules.map((rule) => rule.run(req)));
  return validationResult(req).array();
};

describe('UpdateUserDto — express-validator', () => {
  test('rejects attempt to change email', async () => {
    const errors = await runRules(updateUserRules, { email: 'new@email.com' });
    expect(errors.some((e) => e.path === 'email')).toBe(true);
  });

  test('rejects attempt to change password', async () => {
    const errors = await runRules(updateUserRules, { password: 'NewPass1!' });
    expect(errors.some((e) => e.path === 'password')).toBe(true);
  });

  test('rejects name shorter than 2 characters', async () => {
    const errors = await runRules(updateUserRules, { name: 'X' });
    expect(errors.some((e) => e.path === 'name')).toBe(true);
  });

  test('rejects age below 13', async () => {
    const errors = await runRules(updateUserRules, { age: 10 });
    expect(errors.some((e) => e.path === 'age')).toBe(true);
  });

  test('accepts a valid profile update', async () => {
    const errors = await runRules(updateUserRules, {
      name: 'Zanele Mokoena',
      age: 24,
      province: 'Gauteng',
      skills: ['React', 'Node.js'],
      about: 'Frontend developer based in Soweto.',
    });
    expect(errors).toHaveLength(0);
  });
});

describe('toUpdateUserDTO — field allowlist', () => {
  test('strips disallowed fields', () => {
    const dto = toUpdateUserDTO({
      name: 'Sipho',
      email: 'should-be-stripped@example.com',
      admin: true,
      age: 22,
    });
    expect(dto.email).toBeUndefined();
    expect(dto.admin).toBeUndefined();
    expect(dto.name).toBe('Sipho');
    expect(dto.age).toBe(22);
  });

  test('passes through all allowed fields', () => {
    const input = {
      name: 'Lerato',
      age: 28,
      province: 'Western Cape',
      education: 'BCom',
      skills: ['SQL', 'Python'],
      interests: ['Data science'],
      about: 'Data analyst.',
      summary: 'Five years experience.',
    };
    const dto = toUpdateUserDTO(input);
    for (const key of Object.keys(input)) {
      expect(dto[key]).toEqual(input[key]);
    }
  });
});

describe('Zod validator schemas', () => {
  test('registerSchema rejects password without uppercase', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'weakpassword1',
    });
    expect(result.success).toBe(false);
  });

  test('registerSchema rejects password without a digit', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'WeakPassword',
    });
    expect(result.success).toBe(false);
  });

  test('registerSchema accepts a strong password', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'StrongPass1',
    });
    expect(result.success).toBe(true);
  });

  test('loginSchema rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
  });

  test('loginSchema rejects invalid email format', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'anypass' });
    expect(result.success).toBe(false);
  });

  test('loginSchema accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'anypassword' });
    expect(result.success).toBe(true);
  });
});
