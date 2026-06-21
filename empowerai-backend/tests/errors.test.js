'use strict';

const {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  InternalServerError,
  ServiceUnavailableError,
} = require('../src/utils/errors');

describe('AppError — base class', () => {
  test('sets message, statusCode, status, and isOperational', () => {
    const err = new AppError('something broke', 422);
    expect(err.message).toBe('something broke');
    expect(err.statusCode).toBe(422);
    expect(err.status).toBe('fail');
    expect(err.isOperational).toBe(true);
  });

  test('status is "error" for 5xx codes', () => {
    const err = new AppError('server issue', 500);
    expect(err.status).toBe('error');
  });

  test('is an instance of Error', () => {
    expect(new AppError('msg', 400)).toBeInstanceOf(Error);
  });

  test('captures a stack trace', () => {
    const err = new AppError('oops', 400);
    expect(err.stack).toBeDefined();
  });
});

describe('BadRequestError', () => {
  test('defaults to 400 with generic message', () => {
    const err = new BadRequestError();
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Bad request');
    expect(err.isOperational).toBe(true);
  });

  test('accepts a custom message', () => {
    const err = new BadRequestError('Please analyse your CV first');
    expect(err.message).toBe('Please analyse your CV first');
  });

  test('is operational — routes through handleOperationalError, not handleProgrammingError', () => {
    const err = new BadRequestError('invalid input');
    expect(err.isOperational).toBe(true);
  });

  test('name is BadRequestError', () => {
    expect(new BadRequestError().name).toBe('BadRequestError');
  });
});

describe('UnauthorizedError', () => {
  test('uses status code 401', () => {
    expect(new UnauthorizedError().statusCode).toBe(401);
  });
  test('defaults to "Unauthorized"', () => {
    expect(new UnauthorizedError().message).toBe('Unauthorized');
  });
  test('is operational', () => {
    expect(new UnauthorizedError().isOperational).toBe(true);
  });
});

describe('ForbiddenError', () => {
  test('uses status code 403', () => {
    expect(new ForbiddenError().statusCode).toBe(403);
  });
});

describe('NotFoundError', () => {
  test('uses status code 404', () => {
    expect(new NotFoundError().statusCode).toBe(404);
  });
  test('defaults to "Resource not found"', () => {
    expect(new NotFoundError().message).toBe('Resource not found');
  });
  test('is operational', () => {
    expect(new NotFoundError().isOperational).toBe(true);
  });
});

describe('ConflictError', () => {
  test('uses status code 409', () => {
    expect(new ConflictError().statusCode).toBe(409);
  });
});

describe('ValidationError', () => {
  test('uses status code 422', () => {
    expect(new ValidationError().statusCode).toBe(422);
  });
  test('is operational', () => {
    expect(new ValidationError().isOperational).toBe(true);
  });
});

describe('RateLimitError', () => {
  test('uses status code 429', () => {
    expect(new RateLimitError().statusCode).toBe(429);
  });
  test('stores retryAfter when provided', () => {
    const err = new RateLimitError('slow down', 60);
    expect(err.retryAfter).toBe(60);
  });
  test('is operational', () => {
    expect(new RateLimitError().isOperational).toBe(true);
  });
});

describe('InternalServerError', () => {
  test('uses status code 500', () => {
    expect(new InternalServerError().statusCode).toBe(500);
  });
  test('status is "error" (5xx)', () => {
    expect(new InternalServerError().status).toBe('error');
  });
});

describe('ServiceUnavailableError', () => {
  test('uses status code 503', () => {
    expect(new ServiceUnavailableError().statusCode).toBe(503);
  });
  test('stores service name when provided', () => {
    const err = new ServiceUnavailableError('AI service down', 'openai');
    expect(err.service).toBe('openai');
  });
});

describe('Operational flag — the chain that matters', () => {
  test('all custom error classes are operational', () => {
    const operational = [
      new BadRequestError(),
      new UnauthorizedError(),
      new ForbiddenError(),
      new NotFoundError(),
      new ConflictError(),
      new ValidationError(),
      new RateLimitError(),
      new InternalServerError(),
      new ServiceUnavailableError(),
    ];
    for (const err of operational) {
      expect(err.isOperational).toBe(true);
    }
  });

  test('plain Error is NOT operational', () => {
    const err = new Error('something random');
    expect(err.isOperational).toBeUndefined();
  });
});
