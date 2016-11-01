# bot-nodejs-demo
Demo of building a chatbot "bot" with NodeJS

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

Get a demo token here: https://api.slack.com/docs/oauth-test-tokens

To run type `npm run dev` however, you'll need environment variables for:
- YouTube
- API.ai
- Slack

So you'll probably need to type in `export aiToken=xxx && export slackToken=yyy && export youtubeToken=zzz && npm run dev` where x y and z are appropriate token/keys
