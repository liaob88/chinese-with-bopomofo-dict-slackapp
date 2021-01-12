const { createEventAdapter } = require('@slack/events-api');
const { createMessageAdapter } = require('@slack/interactive-messages');
const getTranslation = require('./services/translationApiService');
const {
  postSuccessMessage,
  postErrorMessage
} = require('./services/slackApiService');
const GoogleSpreadsheetService = require('./services/googleSpreadsheetService');

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackEvents = createEventAdapter(slackSigningSecret);
const slackInteractive = createMessageAdapter(slackSigningSecret);

const port = process.env.PORT || 3001;
const app = require('express')();

app.use('/slack/events', slackEvents.expressMiddleware());
app.use('/interactive', slackInteractive.expressMiddleware());

slackEvents.on('app_mention', async event => {
  console.log('メッセージ受信');
  getTranslation(event.text)
    .then(res => {
      console.log('翻訳完了！');
      postSuccessMessage(event.channel, res);
    })
    .then(res => {
      console.log('投稿完了!');
    })
    .catch(error => {
      console.log(error);
      postErrorMessage(event.channel);
      return { statusCode: 200 };
    });
  // 再送対策
  return {
    statusCode: 200,
    body: 'OK'
  };
});

slackInteractive.action('wordbook_button', (e, respond) => {
  const wordData = e.original_message.text;
  const answer = e.actions[0].value === 'true';
  if (!answer) {
    return {
      text: wordData,
      replace_original: true,
      attachments: [
        {
          text: '用語集には追加しません。ご利用いただきありがとうございました！'
        }
      ]
    };
  }
  console.log('書き込み開始');
  writeOnSpreadsheet(wordData, e.channel.id, respond);
  return {
    text: wordData,
    statusCode: 200,
    replace_original: true,
    attachments: [
      {
        text: '用語集に書き込み中です...'
      }
    ]
  };
});

async function writeOnSpreadsheet(wordData, channel, respond) {
  const doc = new GoogleSpreadsheetService();
  try {
    await doc.initSheet();
    await doc.addToSpreadSheet(wordData);
    await respond({
      statusCode: 200,
      text: wordData,
      replace_original: true,
      attachments: [
        {
          text: '用語集に追加しました！。ご利用いただきありがとうございました！'
        }
      ]
    });
    console.log('書き込み完了');
  } catch (error) {
    console.log(error);
    postErrorMessage(channel);
  }
}

app.listen(port, () => {
  console.log(`Listening for events on ${port}`);
});
