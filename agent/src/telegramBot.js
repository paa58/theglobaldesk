import TelegramBot from 'node-telegram-bot-api';
import { publishPost } from './publisher.js';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const pending = new Map();
let counter = 0;

export function askApproval(article) {
  const id = String(counter++);
  pending.set(id, article);

  const caption = `📰 *${article.title}*\n\n${article.body.slice(0, 300)}...\n\n🔗 Fonte: ${article.sourceUrl}`;

  bot.sendMessage(process.env.TELEGRAM_CHAT_ID, caption, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        { text: '✅ Aprovar e publicar', callback_data: `approve:${id}` },
        { text: '❌ Rejeitar', callback_data: `reject:${id}` },
      ]],
    },
  });
}

bot.on('callback_query', async (query) => {
  const [action, id] = query.data.split(':');
  const article = pending.get(id);
  if (!article) return bot.answerCallbackQuery(query.id, { text: 'Expirado.' });

  if (action === 'approve') {
    await publishPost(article);
    await bot.answerCallbackQuery(query.id, { text: 'Publicado!' });
    await bot.editMessageText(`✅ Publicado: ${article.title}`, {
      chat_id: query.message.chat.id, message_id: query.message.message_id,
    });
  } else {
    await bot.answerCallbackQuery(query.id, { text: 'Rejeitado.' });
    await bot.editMessageText(`❌ Rejeitado: ${article.title}`, {
      chat_id: query.message.chat.id, message_id: query.message.message_id,
    });
  }
  pending.delete(id);
});

export { bot };
