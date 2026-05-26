# tetris mini app

static tetris game for telegram mini app and a bot in python

## what is needed for the website to work

- `index.html`
- `game.js`

these files can be published as a static site on cloudflare pages

## cloudflare pages setup

1. connect github repository
2. specify root directory as the root of the repository
3. leave build command empty
4. leave output directory empty or `.`

## what is needed for the bot

- `bot.py`
- `requirements.txt`

The bot needs `WEB_APP_URL` set to the public HTTPS address of your Cloudflare Pages site.

### running the bot

```powershell
pip install -r requirements.txt
$env:BOT_TOKEN="your_token_here"
$env:WEB_APP_URL="https://your-site.pages.dev"
python bot.py

```

## important

set `WEB_APP_URL` to the actual HTTPS address of the published game before starting the bot
