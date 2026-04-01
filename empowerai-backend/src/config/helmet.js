const helmet = require('helmet');

module.exports = helmet({
  crossOriginEmbedderPolicy: false,
});