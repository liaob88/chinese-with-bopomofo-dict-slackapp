const { WebClient } = require('@slack/web-api');
const web = new WebClient(process.env.SLACK_TOKEN);

function postSlackMessage(channel, searchResult) {
  const japanese = searchResult[0];
  const chinese = JSON.parse(searchResult[1]);

  return web.chat.postMessage({
    channel,
    text: translatedText(japanese, chinese)
  });
}

function translatedText(japanese, chinese) {
  return `
  "${chinese.title}"の検索結果だよ！
  【注音字母】${chinese.concise_dict.heteronyms[0].bopomofo}
  【ピンイン】${chinese.concise_dict.heteronyms[0].pinyin}
  【日本語訳】${japanese}
  【中中訳】${definitionsText(chinese.concise_dict.heteronyms[0].definitions)}
  `;
}

function definitionsText(definitions) {
  let text = '\n';
  definitions.forEach(def => {
    text += def.def + '\n';
  });
  return text;
}

module.exports = postSlackMessage;
