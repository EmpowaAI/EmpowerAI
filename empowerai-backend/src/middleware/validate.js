/**
 * Validation Middleware
 * Principal Engineer Level: Type-safe request validation
 */

const { validate } = require('../utils/validators');

/**
 * Create validation middleware for a specific schema
 * @param {z.ZodSchema} schema - Zod validation schema
 * @param {string} source - Where to validate from ('body', 'query', 'params')
 * @returns {Function} Express middleware
 */
const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const data = source === 'body' ? req.body : 
                   source === 'query' ? req.query : 
                   req.params;
      
      // Validate and sanitize data
      const validatedData = validate(schema, data);
      
      // Replace original data with validated data
      if (source === 'body') {
        req.body = validatedData;
      } else if (source === 'query') {
        req.query = validatedData;
      } else {
        req.params = validatedData;
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = validateRequest;

