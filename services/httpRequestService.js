const request = require('request-promise');

function httpRequest(options) {
  return request(options);
}

module.exports = httpRequest;
