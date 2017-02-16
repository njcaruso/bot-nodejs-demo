# bot-nodejs-demo
Demo of building a chatbot "bot" with NodeJS

An accompanying presentation is in the folder `\presentation\20161101 - Bots.pptx`

*Be sure to run `npm update` to ensure the latest dependent libraries are updated.*

## Stage 1
### git branch `stage-1-base-nodejs`
This is just the barebones structure for a Restify config to work with MS Azure

You can test this by running
`npm run dev`

and then navigating to `http://localhost:8080/echo/test`, you should then see in your browser:
```
{"name": "test"}
```

## Stage 2
### git branch `stage-2-basic-bot`

This is a continuation from Stage 1, but introduces
- Slack
- Howdy Botkit
- A very basic interaction

### Prerequisites
- `npm i botkit --save` (or if in branch, `npm update`).  This is the botkit framework to make it easy to interface with Slack.
- Create a Slack account/team
- Create a bot by going here:
https://{YOUR TEAM ID}.slack.com/apps/build/custom-integration

This is a CUSTOM bot, and not intended for public dissemination.  A public bot requires public registration, and is outside the scope of this project.

Get the OAUTH token that may look like xoxb-1234567...

NodeJS will expect this token under the environment variable slackToken.

### Testing
- The Slack user can type:
  - `Hi`, and the bot returns `hello`

To run type `npm run dev` however, you'll need environment variables for the Slack Token.

So you'll probably need to type in `export slackToken=yyy && npm run dev` where yyy is the appropriate token/keys

## Stage 3
### git branch `stage-3-youtube-bot`

This is a continuation from Stage 2, but introduces YouTube functionality so our bot can now search for videos

### Prerequisites
- Need to get Google key to search YouTube.  Go to https://console.developers.google.com/.
  - Click on API Manager, and generate a new API key.
  - Go to Library -> YouTube Data API -> ENABLE the YouTube API (this may take several minutes)
- With the new Youtube API key, we will now query for YouTube Videos

### Testing
- The Slack user can type:
  - `Hi`, and the bot returns `hello`
  - `search videos about food`, and the bot returns the top 3 youtube results

To run you'll now need to provide the Google key environment variable as `youtubeToken` so the command will be `export slackToken=yyy &&& export youtubeToken=zzz &&& npm run dev` where yyy and zzz are the appropriate token/keys

## Stage 4
### git branch `stage-4-nlp`

This is a continuation from Stage 3, and now introduces Natural Language Processing.

There are several vendors that support NLP capabilities to include:
wit.ai (Facebook)
api.ai (Google)
luis.ai (Microsoft)
...to name just a few

We'll be using `api.ai`

### Prerequisites
- `npm i apiai --save` (or if in branch, `npm update`).  This is the api.ai lib.
- `npm i cuid --save` (or if in branch, `npm update`).  This is a lib to create unique Ids that api.ai needs to maintain sessions.
- Go to https://api.ai
  - Create an "agent"
  - Get access token, we'll use this in an environment variable called aiToken
  - Restore or Import from Zip file the pre-built agent `nlp-ai-lib/search-youtube.zip`

### Testing
- The Slack user can type:
  - `Hi`, and the bot returns `hello`
  - `search videos about food`, and the bot returns the top 3 youtube results
  - `search for short videos about cats`
  - `search for the most viewed videos about cats`

To run you'll now need to provide the api.ai oauth token environment variable as `aiToken` so the command will be `export aiToken=xxx &&& export slackToken=yyy &&& export youtubeToken=zzz &&& npm run dev` where xxx, yyy and zzz are the appropriate token/keys.

## Stage 5
### git branch `stage-5-conversations`

This is a continuation from Stage 4, and now adds the concept of an interactive conversation.

### Prerequisites
- Update the agent in api.ai and in the `search` `Intent` require the actions of `term`, `duration` and `order`.  This will invoke a conversation with the bot if it does not have those fields.

### Testing
- To test the conversation first type the word `bored`, like `I'm bored`, that triggers the code to have a conversation:
  - `search for videos about cats`.  This should then stage "how much time do you have?"
  - `not much`. The bot should then ask "What sort order do you want that?"
  - `most viewed`.  Then the bot should return results

Follow the same steps in Stage 4 to run.
