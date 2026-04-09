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
      console.log('❌ VALIDATION FAILED');
      console.log('SOURCE:', source);
      console.log('INPUT:', data); // now safe

      if (error.errors) {
        console.log('DETAILS:', error.errors);
      }

      next(error);
    }
  };
};

module.exports = validateRequest;
    
