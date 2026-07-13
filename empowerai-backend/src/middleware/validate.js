/**
 * Validation Middleware
 * Principal Engineer Level: Type-safe request validation
 */

const { validate } = require('../utils/validators');
const logger = require('../utils/logger');

/**
 * Create validation middleware for a specific schema
 * @param {z.ZodSchema} schema - Zod validation schema
 * @param {string} source - Where to validate from ('body', 'query', 'params')
 * @returns {Function} Express middleware
 */

      // Validate and sanitize data
     const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    let data; // 👈 move outside try

    try {
      data =
        source === 'body' ? req.body :
        source === 'query' ? req.query :
        req.params;

      const validatedData = validate(schema, data);

      if (source === 'body') {
        req.body = validatedData;
      } else if (source === 'query') {
        req.query = validatedData;
      } else {
        req.params = validatedData;
      }

      next();
    } catch (error) {
      // Log field names only - request bodies can contain passwords/CV text
      logger.warn('Request validation failed', {
        source,
        fields: data && typeof data === 'object' ? Object.keys(data) : [],
        issues: error.errors?.map((e) => ({ path: e.path?.join('.'), message: e.message })),
      });

      next(error);
    }
  };
};

module.exports = validateRequest;
    
