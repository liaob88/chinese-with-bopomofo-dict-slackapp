const { createEventAdapter } = require('@slack/events-api');
const getTranslation = require('./services/translationApiService');
const postSlackMessage = require('./services/slackApiService');

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackEvents = createEventAdapter(slackSigningSecret);
const port = process.env.PORT || 3001;

slackEvents.on('app_mention', async event => {
  console.log('メッセージ受信');
  getTranslation(event.text)
    .then(res => {
      console.log('翻訳完了！');
      postSlackMessage(event.channel, res);
    })
    .then(res => {
      console.log('投稿完了!');
      return { statusCode: 200 };
    })
    .catch(error => {
      console.log(error);
      return;
    });
});

(async () => {
  const server = await slackEvents.start(port);
  console.log(`Listening for events on ${server.address().port}`);
})();
