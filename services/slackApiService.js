const { WebClient } = require('@slack/web-api');
const web = new WebClient(process.env.SLACK_TOKEN);

async function postSlackMessage(postInfo) {
  try {
    await web.chat.postMessage({
      channel: postInfo.channel,
      text: formatText(postInfo.searchResult)
    });
    console.log('done!')
  } catch (error) {
    console.log(error);
    return;
  }
}

function formatText(materials) {
  return `
  "${materials.title}"の検索結果だよ！
  【注音字母】${materials.concise_dict.heteronyms[0].bopomofo}
  【ピンイン】${materials.concise_dict.heteronyms[0].pinyin}
  【中中訳】${definitionsText(materials.concise_dict.heteronyms[0].definitions)}
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
