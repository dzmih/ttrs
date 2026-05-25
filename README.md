# tetris mini app

static tetris game for telegram mini app and a bot in python

## what is needed for the website to work

* `index.html`
* `game.js`

these files can be published as a static site on cloudflare pages

## cloudflare pages setup

1. connect github repository
2. specify root directory as the root of the repository
3. leave build command empty
4. leave output directory empty or `.`

## what is needed for the bot

* `bot.py`
* `requirements.txt`

### running the bot

```powershell
pip install -r requirements.txt
$env:BOT_TOKEN="your_token_here"
python bot.py

```

## important

in `bot.py` you need to replace `HTTPS_URL_HERE` with the actual HTTPS address of the published game
