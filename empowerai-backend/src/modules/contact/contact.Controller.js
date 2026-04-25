const contactService = require('./contact.Service'); 

const submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    await contactService.submitContactForm({ name, email, message });

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent. We will get back to you shortly.',
    });
  } catch (err) {
    if (err.message === 'Name, email, and message are required.' ||
        err.message === 'Invalid email address.') {
      return res.status(400).json({ success: false, message: err.message });
    }

    console.error('[ContactController] Unexpected error:', err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.',
    });
  }
};

module.exports = { submitContactForm };
