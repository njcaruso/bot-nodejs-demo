var slackToken = process.env.slackToken;
var aiToken = process.env.aiToken;

var Botkit = require('botkit');
var youtube = require('./youtube');
var apiai = require('apiai');
var ai = apiai(aiToken);
var cuid = require('cuid');

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
    // Example 1: Basic
    // bot.reply(message, 'Hello');

    bot.reply(message, {
      text: 'Hi there',
      attachments: [{
        text: 'you are the best!',
        image_url: 'http://vignette1.wikia.nocookie.net/unturned-bunker/images/0/0a/Meaning-of-vault-boy-thumbs-up-jpg.jpg/revision/latest?cb=20160316025719',
        color: '#764FA5',
      }],
    });
  });

  controller.hears(['advanced'], 'direct_message,direct_mention,mention', function(bot, message) {
    startNewConversation(bot, message);
  });

  controller.hears(['search'], 'direct_message,direct_mention,mention', function(bot, message) {
    // var term = message.text.replace('search videos about', '').trim();

    var aiRequest = ai.textRequest(message.text);
    var sessionId = cuid();
    console.log('sessionId = ', sessionId);
    aiRequest.sessionId = sessionId;
    aiRequest.on('response', function(aiResponse) {
      console.log(aiResponse);
      var result = aiResponse.result;

      searchYouTube(bot, message, result);
    });

    aiRequest.on('error', function(error) {
      console.log(error);
    });

    aiRequest.end();
  });
};

function searchYouTube(bot, message, result, cbSearchYouTube) {
  if (!result.parameters || !result.parameters.term1) {
    bot.reply(message, 'Sorry, I do not understand...');
    return;
  }

  var term1 = result.parameters.term1;
  var term2 = result.parameters.term2;
  var notTerm1 = result.parameters.notTerm1;
  var duration = result.parameters.duration;
  var order = result.parameters.order;
  var language = result.parameters.language;

  var searchText = 'ok, I\'ll search for videos about ';

  var youtubeQuery = {
    limit: 3,
  };

  if (language) {
    youtubeQuery.language = language;
    if (language === 'fr') {
      searchText = 'ok, I\'ll search for videos in French about ';
    } else if (language === 'es') {
      searchText = 'ok, I\'ll search for videos in Spanish about ';
    }
  }

  var search = term1;
  searchText += term1;

  if (term2) {
    search = term1 + '|' + term2;
    searchText += ' and ' + term2;
  }
  if (notTerm1) {
    search += ' -' + notTerm1;
    searchText += ' but not ' + notTerm1;
  }

  youtubeQuery.where = encodeURIComponent(search);

  if (duration) {
    youtubeQuery.duration = duration;
    searchText = searchText.replace('search for', 'search for ' + duration);
  }

  if (order) {
    youtubeQuery.order = order;
    searchText += ' ordered by ' + order;
  }

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

function startNewConversation(bot, message) {
  var msgHdr = 'botController: startNewConversation: ';

  bot.createConversation(message, function(errCreatingConv, convo) {
    if (errCreatingConv) {
      console.error(msgHdr + 'errCreatingConv = ', errCreatingConv);
      return;
    }

    var sessionId = cuid();
    convo.setVar('sessionId', sessionId);

    askAI(bot, 'How can I help you?', convo);
    convo.activate();
  });
}

function askAI(bot, msg, convo) {
  convo.ask({
    text: msg,
  }, function(msgResp, convoResp) {
    var text = msgResp.text.toLowerCase();

    var byeMessage = ['end', 'bye spark', 'bye', 'cancel', 'goodbye'];
    if (byeMessage.indexOf(text) >= 0) {
      bot.reply(msgResp, 'goodbye, have a great day!');
      convoResp.stop();
      return;
    }

    var aiRequest = ai.textRequest(text);
    var sessionId = convo.vars.sessionId;
    console.log('!!! sessionId = ', sessionId);
    aiRequest.sessionId = sessionId;

    aiRequest.on('response', function(response) {
      console.log(response);

      var result = response.result;

      if ((result.fulfillment.speech.length > 0) && (result.fulfillment.speech.indexOf('ok') < 0)) {
        askAI(bot, result.fulfillment.speech, convoResp);
        convoResp.next();
      } else {
        searchYouTube(bot, msgResp, result, function() {
          convoResp.stop();
          startNewConversation(bot, msgResp);
        });
      }
    });

    aiRequest.on('error', function(error) {
      console.log(error);
    });

    aiRequest.end();
  });
}

module.exports = new BotControllers();
