const httpRequest = require('./httpRequestService.js');

function getTranslation(term) {
  const keyword = removeMention(term);
  const japanese = getJapaneseTranslation(keyword);
  const chinese = getChineseTranslation(keyword);

  return Promise.all([japanese, chinese]);
}

function getJapaneseTranslation(term) {
  const options = {
    method: 'GET',
    url: process.env.GOOGLE_APP_SCRIPT_ENDPOINT,
    qs: {
      term
    }
  };
  return httpRequest(options);
}

function getChineseTranslation(term) {
  const options = {
    method: 'GET',
    url: 'https://pedia.cloud.edu.tw/api/v2/Detail',
    qs: {
      term,
      api_key: process.env.PEDIA_CLOUD_EDU_TW_API_KEY
    }
  };
  return httpRequest(options);
}

function removeMention(text) {
  return text.split(' ')[1];
}

module.exports = getTranslation;
