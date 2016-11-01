# bot-nodejs-demo
Demo of building a chatbot "bot" with NodeJS

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
- Create a Spark account/team
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
