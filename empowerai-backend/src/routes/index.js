const router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/account', require('./account'));
router.use('/twin', require('./twin'));
router.use('/opportunities', require('./opportunities'));
router.use('/cv', require('./cv'));
router.use('/interview', require('./interview'));
router.use('/chat', require('./chat'));
router.use('/rss', require('./rss'));
router.use('/admin', require('./admin'));
router.use('/user', require('./user'));
router.use('/applications', require('./applications'));

module.exports = router;