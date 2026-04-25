const emailService = require('../../intergration/email/email.Service');

const submitContactForm = async ({ name, email, message }) => {
  if (!name || !email || !message) {
    throw new Error('Name, email, and message are required.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email address.');
  }

  await emailService.sendFeedback(email, name, message);
};

module.exports = { submitContactForm };
