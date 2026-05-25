import asyncio
import os

from aiogram import Bot, Dispatcher, Router
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo


router = Router()

WEB_APP_URL = os.getenv("WEB_APP_URL", "HTTPS_URL_HERE")


@router.message(CommandStart())
async def start_handler(message: Message) -> None:
    """Отправляет приветствие и кнопку запуска Web App."""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="Открыть Тетрис",
                    web_app=WebAppInfo(url=WEB_APP_URL),
                )
            ]
        ]
    )

    await message.answer(
        "Привет! Нажми кнопку ниже, чтобы открыть игру Тетрис внутри Telegram.",
        reply_markup=keyboard,
    )


async def main() -> None:
    token = os.getenv("BOT_TOKEN")
    if not token:
        raise RuntimeError("Переменная окружения BOT_TOKEN не задана")

    bot = Bot(token=token)
    dp = Dispatcher()
    dp.include_router(router)

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())