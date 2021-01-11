const { WebClient } = require('@slack/web-api');
const web = new WebClient(process.env.SLACK_TOKEN);

const attachments = [
  {
    text: '用語集に追加しますか？',
    fallback: '用語集に追加できません。',
    callback_id: 'wordbook_button',
    color: '#3AA3E3',
    attachment_type: 'default',
    actions: [
      {
        name: 'options',
        text: '追加',
        style: 'danger',
        type: 'button',
        value: 'true'
      },
      {
        name: 'options',
        text: '追加しない',
        type: 'button',
        value: 'false'
      }
    ]
  }
];

function postSuccessMessage(channel, searchResult) {
  const japanese = searchResult[0];
  const chinese = JSON.parse(searchResult[1]);
  const text = messageText(japanese, chinese);
  return web.chat.postMessage({
    channel,
    text,
    attachments,
    request_url: ''
  });
}

function postErrorMessage(channel) {
  const text = 'ごめんなさい、エラーが発生しました。。';
  return web.chat.postMessage({
    channel,
    text
  });
}

function messageText(japanese, chinese) {
  return `${chinese.title}の検索結果だよ！
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
