var slackToken = process.env.slackToken;

var Botkit = require('botkit');
var youtube = require('./youtube');

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

  controller.hears(['search'], 'direct_message,direct_mention,mention', function(bot, message) {
    var term = message.text.replace('search videos about', '').trim();

    searchYouTube(bot, message, term);
  });
};

function searchYouTube(bot, message, term, cbSearchYouTube) {
  var searchText = 'ok, I\'ll search for videos about ' + term;

  var youtubeQuery = {
    limit: 3,
    where: term,
  };

  bot.reply(message, {
    text: searchText,
  });

  youtube.search(youtubeQuery, function(errSearchingYoutube, foundResults) {
    if (errSearchingYoutube) {
      console.error('errSearchingYoutube = ', errSearchingYoutube);
      return;
    }

    var slackResponse = {
      attachments: [],
    };

    if (!foundResults || !foundResults.items || foundResults.items.length === 0) {
      bot.reply(message, {
        text: 'no results were found',
      });
    }

    foundResults.items.forEach(function(item) {
      // console.log('item = ', item);
      var description = item.snippet.description;
      if (description.length > 200) {
        description = description.substr(0, 197) + '...';
      }

      var clipDuration = youtube.getDurationToSeconds(item.contentDetails.duration);
      clipDuration = new Date(clipDuration * 1000).toISOString().substr(11, 8);

      var formattedDate = new Date(item.snippet.publishedAt).getTime() / 1000;

      var attachment = {
        title: item.snippet.title,
        text: description,
        color: '#e52d27',
        title_link: 'https://www.youtube.com/watch?v=' + item.id,
        thumb_url: item.snippet.thumbnails.medium.url,
        footer: item.snippet.channelTitle,
        // author_link: 'https://www.youtube.com/channel/' + item.snippet.channelId,
        ts: formattedDate,
        fields: [{
          title: 'Views',
          value: item.statistics.viewCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
          short: true,
        }, {
          title: 'Likes',
          value: item.statistics.likeCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
          short: true,
        }, {
          title: 'Duration',
          value: clipDuration,
        }],
      };
      slackResponse.attachments.push(attachment);
    });

    bot.reply(message, slackResponse);
    if (cbSearchYouTube) {
      setTimeout(function() {
        return cbSearchYouTube();
      }, 100);
    }
  });
}

module.exports = new BotControllers();
