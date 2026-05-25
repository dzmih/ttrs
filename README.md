# Tetris Mini App

Статическая игра Тетрис для Telegram Mini App и бот на Python.

## Что нужно для работы сайта

- `index.html`
- `game.js`

Эти файлы можно публиковать как статический сайт на Cloudflare Pages.

## Настройка Cloudflare Pages

1. Подключить GitHub-репозиторий.
2. Указать root directory как корень репозитория.
3. Build command оставить пустым.
4. Output directory оставить пустым или `.`.

## Что нужно для бота

- `bot.py`
- `requirements.txt`

### Запуск бота

```powershell
pip install -r requirements.txt
$env:BOT_TOKEN="your_token_here"
python bot.py
```

## Важно

В `bot.py` нужно заменить `HTTPS_URL_HERE` на реальный HTTPS-адрес опубликованной игры.
