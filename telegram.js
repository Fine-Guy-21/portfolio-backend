require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Initialize Telegram bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
  throw new Error('Telegram bot token and chat ID must be provided in .env');
}

const bot = new TelegramBot(token, { polling: false });

async function sendTelegramNotification(formData) {
  const { name, email, company, interests, message } = formData;

  const formattedMessage = `
📩 New Contact Form Submission

👤 Name: ${name}
📧 Email: ${email}
🏢 Company: ${company || 'Not provided'}
🎯 Interests: ${interests.join(', ')}
✉️ Message:
${message}

⏰ Received: ${new Date().toLocaleString()}

Reply via Email: mailto:${email}
  `;

  try {
    await bot.sendMessage(chatId, formattedMessage);
    console.log('Telegram notification sent successfully');
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    // Fail silently so it doesn't break the main flow
  }
}

module.exports = { sendTelegramNotification };