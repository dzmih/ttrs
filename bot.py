import asyncio
import os

from aiogram import Bot, Dispatcher, Router
from aiogram.filters import Command, CommandStart
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, Message, WebAppInfo


router = Router()

WEB_APP_URL = os.getenv("WEB_APP_URL")

if not WEB_APP_URL or WEB_APP_URL == "HTTPS_URL_HERE":
    raise RuntimeError("Переменная окружения WEB_APP_URL не задана или содержит заглушку HTTPS_URL_HERE")


def leaderboard_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="Открыть Тетрис",
                    web_app=WebAppInfo(url=WEB_APP_URL),
                )
            ],
        ]
    )


@router.message(CommandStart())
async def start_handler(message: Message) -> None:
    """Отправляет приветствие и кнопку запуска Web App."""
    await message.answer(
        "Привет! Нажми кнопку ниже, чтобы открыть игру Тетрис внутри Telegram.",
        reply_markup=leaderboard_keyboard(),
    )


@router.message(Command("help"))
async def help_handler(message: Message) -> None:
    await message.answer(
        "Доступные команды:\n"
        "/start — открыть игру\n"
        "/help — показать список команд\n"
        "/stats — показать состояние статистики\n"
        "/top — показать топ\n"
        "/reset — сбросить локальные данные",
    )


@router.message(Command("stats"))
async def stats_handler(message: Message) -> None:
    await message.answer(
        "Статистика пока не подключена. Сейчас бот только открывает игру через кнопку /start."
    )


@router.message(Command("top"))
async def top_handler(message: Message) -> None:
    await message.answer(
        "Глобальный топ пока не ведётся. Если захочешь, я могу добавить сохранение результатов отдельно."
    )


@router.message(Command("reset"))
async def reset_handler(message: Message) -> None:
    await message.answer(
        "Сбрасывать сейчас нечего: бот не хранит локальные результаты или настройки."
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