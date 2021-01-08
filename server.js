const { createEventAdapter } = require('@slack/events-api');
const { createMessageAdapter } = require('@slack/interactive-messages');
const getTranslation = require('./services/translationApiService');
const {
  postSuccessMessage,
  postErrorMessage
} = require('./services/slackApiService');

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

slackInteractive.action('wordbook_button', e => {
  const isAdded = e.actions[0].value === 'true';
  if (!isAdded) {
    return {
      text: e.original_message.text,
      replace_original: true,
      attachments: [
        {
          text: '用語集には追加しません。ご利用いただきありがとうございました！'
        }
      ]
    };
  }
});

app.listen(port, () => {
  console.log(`Listening for events on ${port}`);
});
