const { createEventAdapter } = require('@slack/events-api');
const getTranslation = require('./services/dictionaryApiService');
const postSlackMessage = require('./services/slackApiService');

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackEvents = createEventAdapter(slackSigningSecret);
const port = 3001;

slackEvents.on('message', event => {
  getTranslation(event.text)
    .then(res => {
      const postInfoObject = {
        channel: event.channel,
        searchResult: JSON.parse(res)
      };
      postSlackMessage(postInfoObject);
    })
    .catch(error => {
      return;
    });
});

(async () => {
  const server = await slackEvents.start(port);
  console.log(`Listening for events on ${server.address().port}`);
})();
