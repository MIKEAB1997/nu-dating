import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

import { handleTextMessage } from '../handlers/textHandler.js';
import { handleImageMessage } from '../handlers/imageHandler.js';
import { handleVideoMessage } from '../handlers/videoHandler.js';

let client = null;

/**
 * Initialize WhatsApp client
 * @returns {Promise<Client>} - WhatsApp client instance
 */
export async function initializeWhatsApp() {
  console.log('🚀 Initializing WhatsApp client...');

  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  // QR Code for authentication
  client.on('qr', (qr) => {
    console.log('\n📱 Scan this QR code with your WhatsApp mobile app:\n');
    qrcode.generate(qr, { small: true });
    console.log('\n');
  });

  // Ready event
  client.on('ready', () => {
    console.log('✅ WhatsApp client is ready!');
    console.log('🤖 Bot is now listening for messages...\n');
  });

  // Authentication success
  client.on('authenticated', () => {
    console.log('✅ WhatsApp authentication successful!');
  });

  // Authentication failure
  client.on('auth_failure', (msg) => {
    console.error('❌ WhatsApp authentication failed:', msg);
  });

  // Disconnected
  client.on('disconnected', (reason) => {
    console.log('⚠️ WhatsApp client disconnected:', reason);
  });

  // Handle incoming messages
  client.on('message', async (message) => {
    try {
      // Ignore messages from self
      if (message.fromMe) return;

      // Ignore group messages (optional)
      if (message.from.includes('@g.us')) {
        console.log('📢 Ignoring group message');
        return;
      }

      const senderId = message.from;
      const senderName = (await message.getContact()).pushname || senderId;

      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📨 New message from: ${senderName} (${senderId})`);

      let response;

      // Handle different message types
      if (message.hasMedia) {
        const media = await message.downloadMedia();

        if (media.mimetype.startsWith('image/')) {
          // Image message
          console.log('📷 Message type: Image');
          response = await handleImageMessage(
            `data:${media.mimetype};base64,${media.data}`,
            message.body || '',
            senderId
          );
        } else if (media.mimetype.startsWith('video/')) {
          // Video message
          console.log('🎬 Message type: Video');
          response = await handleVideoMessage(
            `data:${media.mimetype};base64,${media.data}`,
            message.body || '',
            senderId
          );
        } else {
          response = 'סליחה, אני תומך רק בתמונות וסרטונים כרגע. נסה לשלוח תמונה, סרטון או הודעת טקסט.';
        }
      } else {
        // Text message
        console.log('💬 Message type: Text');
        response = await handleTextMessage(message.body, senderId);
      }

      // Send response
      console.log(`\n💬 Sending response...`);
      await message.reply(response);
      console.log(`✅ Response sent successfully!`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    } catch (error) {
      console.error('❌ Error processing message:', error);

      try {
        await message.reply('סליחה, אירעה שגיאה בעיבוד ההודעה. נסה שוב מאוחר יותר.');
      } catch (replyError) {
        console.error('Failed to send error message:', replyError);
      }
    }
  });

  // Initialize the client
  await client.initialize();

  return client;
}

/**
 * Get WhatsApp client instance
 * @returns {Client|null} - WhatsApp client
 */
export function getClient() {
  return client;
}

/**
 * Stop WhatsApp client
 */
export async function stopWhatsApp() {
  if (client) {
    await client.destroy();
    console.log('👋 WhatsApp client stopped');
  }
}
