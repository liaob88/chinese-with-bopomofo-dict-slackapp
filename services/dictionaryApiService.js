const httpRequest = require('./httpRequestService.js');

function getTranslation(term) {
  const options = {
    method: 'GET',
    url: 'https://pedia.cloud.edu.tw/api/v2/Detail',
    qs: {
      term: term,
      api_key: process.env.PEDIA_CLOUD_EDU_TW_API_KEY
    }
  };
  return httpRequest(options);
}

module.exports = getTranslation;
