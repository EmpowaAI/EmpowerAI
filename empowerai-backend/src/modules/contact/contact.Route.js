const express = require('express');
const router = express.Router();
const { submitContactForm } = require('./contact.Controller');

router.post('/', submitContactForm);

module.exports = router;
