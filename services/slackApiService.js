const { WebClient } = require('@slack/web-api');
const web = new WebClient(process.env.SLACK_TOKEN);

function postSuccessMessage(channel, searchResult) {
  const japanese = searchResult[0];
  const chinese = JSON.parse(searchResult[1]);
  const text = messageText(japanese, chinese);
  return postSlackMessage(channel, text);
}

function postErrorMessage(channel) {
  const text = 'ごめんなさい、エラーが発生しました。他の単語でお試しください。';
  return postSlackMessage(channel, text);
}

function postSlackMessage(channel, text) {
  return web.chat.postMessage({
    channel,
    text
  });
}

function messageText(japanese, chinese) {
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

module.exports = {
  postSuccessMessage,
  postErrorMessage
};
