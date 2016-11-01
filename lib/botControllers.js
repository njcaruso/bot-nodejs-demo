var slackToken = process.env.slackToken;

var Botkit = require('botkit');

var controller = Botkit.slackbot({
  stats_optout: true,
  interactive_replies: true,
  debug: false,
});

function BotControllers() {
}

BotControllers.prototype.start = function() {
  controller.spawn({
    token: slackToken,
  }).startRTM();

  controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {
    bot.reply(message, 'Hello');
  });

  controller.hears(['awesome', 'best', 'great'], 'direct_message,direct_mention,mention', function(bot, message) {
    bot.reply(message, {
      text: 'Thanks!',
      attachments: [{
        text: 'You\'re the best!!!!!',
        image_url: 'http://vignette1.wikia.nocookie.net/unturned-bunker/images/0/0a/Meaning-of-vault-boy-thumbs-up-jpg.jpg/revision/latest?cb=20160316025719',
        color: '#764FA5',
      }],
    });
  });
};

module.exports = new BotControllers();
