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
      return { statusCode: 200 };
    })
    .catch(error => {
      console.log(error);
      postErrorMessage(event.channel);
      return { statusCode: 200 };
    });
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
  writeOnSpreadsheet(wordData, e.channel).then(() => {
    respond({
      statusCode: 200,
      text: wordData,
      replace_original: true,
      attachments: [
        {
          text: '用語集に追加しました！。ご利用いただきありがとうございました！'
        }
      ]
    });
    console.log('SpreadSheet への書き込み終了！');
  });
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

async function writeOnSpreadsheet(wordData, channel) {
  const doc = new GoogleSpreadsheetService();
  try {
    await doc.initSheet();
    await doc.addToSpreadSheet(wordData);
    return;
  } catch (error) {
    postErrorMessage(channel);
  }
}

app.listen(port, () => {
  console.log(`Listening for events on ${port}`);
});
