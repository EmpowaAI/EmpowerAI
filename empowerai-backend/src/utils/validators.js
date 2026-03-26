/**
 * Input Validation Schemas
 * Principal Engineer Level: Type-safe validation with Zod
 */

const { z } = require('zod');

/**
 * User registration validation schema
 */
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  ),
  age: z.number().int().min(16, 'Age must be at least 16').max(100, 'Age must be less than 100').optional(),
  province: z.string().max(50).optional(),
  education: z.string().max(200).optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
});

/**
 * User login validation schema
 */
const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Twin creation validation schema
 */
const createTwinSchema = z.object({
  skills: z.array(z.string()).optional(),
  experience: z.union([z.string(), z.object({}).passthrough()]).optional(),
  interests: z.array(z.string()).optional(),
  education: z.string().optional(),
});

/**
 * Simulation validation schema
 */
const simulationSchema = z.object({
  pathIds: z.array(z.string()).optional(),
});

/**
 * CV analysis validation schema
 */
const cvAnalysisSchema = z.object({
  cvText: z.string().min(10, 'CV text must be at least 10 characters').max(50000, 'CV text is too long'),
  jobRequirements: z.union([z.string().max(5000), z.array(z.string())]).optional(),
});

/**
 * Chat message validation schema
 */
const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000, 'Message is too long'),
});

/**
 * Interview start validation schema
 */
const interviewStartSchema = z.object({
  type: z.enum(['tech', 'behavioral', 'non-tech'], {
    errorMap: () => ({ message: 'Interview type must be tech, behavioral, or non-tech' }),
  }),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  company: z.string().max(100).optional(),
  cvData: z.object({}).passthrough().optional(),
  jobDescription: z.string().max(10_000).optional(),
});

/**
 * Interview answer validation schema
 */
const interviewAnswerSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  response: z.string().min(1, 'Response is required').max(5000, 'Response is too long'),
  cvData: z.object({}).passthrough().optional(),
});

/**
 * Validate request data against schema
 * @param {z.ZodSchema} schema - Zod validation schema
 * @param {object} data - Data to validate
 * @returns {object} - Validated and sanitized data
 * @throws {ValidationError} - If validation fails
 */
const validate = (schema, data) => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new (require('./errors').ValidationError)('Validation failed', errors);
    }
    throw error;
  }
};

module.exports = {
  registerSchema,
  loginSchema,
  createTwinSchema,
  simulationSchema,
  cvAnalysisSchema,
  interviewStartSchema,
  interviewAnswerSchema,
  chatMessageSchema,
  validate,
};

