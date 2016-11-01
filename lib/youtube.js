module.exports = new YouTube();

var request = require('request');
var youtubeToken = process.env.youtubeToken;

function YouTube() {

}

/**
 * Searches youtube based on provided filter
 * @param  {Object} filter The search filter (documented below)
 * @param  {Function} cbYouTube The callback
 *
 * filter = {
    .where
    .type (optional) - defaults to video
    .limit (optional)
    .skip (optional)
    .order (optional)
}
 */
YouTube.prototype.search = function(filter, cbYouTube) {
  var _this = this;

  var url = 'https://www.googleapis.com/youtube/v3/search?part=snippet';
  url += '&key=' + youtubeToken;
  url += '&q=' + filter.where;

  if (!filter.type) {
    filter.type = 'video';
  }

  url += '&type=' + filter.type;

  if (filter.limit) {
    url += '&maxResults=' + filter.limit;
  }

  if (filter.skip) {
    url += '&pageToken=' + filter.skip;
  }

  if (filter.order) {
    url += '&order=' + filter.order;
  }

  if (filter.duration) {
    url += '&videoDuration=' + filter.duration;
  }

  if (filter.language) {
    url += '&relevanceLanguage=' + filter.language;
  }

  console.log('youtube: search: url = ', url);

  request({
    uri: url,
    json: true,
  }, function(errYouTubeSearch, resYouTubeSearch) {
    if (errYouTubeSearch) {
      console.error('youtube: errYouTubeSearch ', errYouTubeSearch);
      return cbYouTube(errYouTubeSearch);
    }

    var foundResults = resYouTubeSearch.body;

    if (!foundResults || !foundResults.items || foundResults.items.length === 0) {
      return cbYouTube();
    }

    var videoIds = [];
    foundResults.items.forEach(function(item) {
      videoIds.push(item.id.videoId);
    });

    _this.getVideoDetails(videoIds, function(errVideoDetails, foundVideoDetails) {
      if (errVideoDetails) {
        console.error('errVideoDetails = ', errVideoDetails);
        return cbYouTube(errVideoDetails);
      }

      return cbYouTube(null, foundVideoDetails);
    });
  });
};

/**
 * Retrieves a YouTube video based on the videoId
 * @param   {array} videoIds An array of videos Ids
 * @param  {Function} cbGetVideoDetails The callback
 */
YouTube.prototype.getVideoDetails = function(videoIds, cbGetVideoDetails) {
  var url = 'https://www.googleapis.com/youtube/v3/videos?';
  url += 'part=snippet,contentDetails,statistics,status';
  url += '&key=' + youtubeToken;
  url += '&id=' + videoIds.join(',');

  console.log('youtube: getVideoDetails: url = ', url);

  request({
    uri: url,
    json: true,
  }, function(errGetVideos, resGetVideos) {
    return cbGetVideoDetails(errGetVideos, resGetVideos.body);
  });
};

/**
 * Returns YouTube duration format in seconds
 * @param   {string} duration Like PT10M5S
 * @return  {string} seconds
 */
YouTube.prototype.getDurationToSeconds = function(duration) {
  var match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  var hours = (parseInt(match[1], 0) || 0);
  var minutes = (parseInt(match[2], 0) || 0);
  var seconds = (parseInt(match[3], 0) || 0);

  return hours * 3600 + minutes * 60 + seconds;
};
