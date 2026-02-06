import express from 'express';
import { validateConfig, config } from './src/config/env.js';
import { processIncomingMessage, sendSurpriseMessage } from './src/services/whatsapp-cloud.js';
import { startClaudeCodeMonitor } from './src/monitors/claudeCodeMonitor.js';
import { startDailyNotifications } from './src/schedulers/dailyNotifications.js';

const app = express();

// Middleware
app.use(express.json());

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  🍌 נאנו בננה (NANO BANANA) - WhatsApp AI Bot 🍌      ║');
console.log('║     Claude Sonnet 4.5 + Gemini AI Integration         ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

// Validate configuration
validateConfig();

// Webhook verification (required by WhatsApp)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('📞 Webhook verification request received');

  if (mode === 'subscribe' && token === config.whatsappVerifyToken) {
    console.log('✅ Webhook verified successfully!');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    res.sendStatus(403);
  }
});

// Webhook endpoint for receiving messages
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // Check if this is a WhatsApp message
    if (body.object === 'whatsapp_business_account') {
      // Extract message from webhook payload
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (messages && messages.length > 0) {
        const message = messages[0];

        // Process the message asynchronously
        processIncomingMessage(message).catch(error => {
          console.error('Error in background message processing:', error);
        });

        // Respond immediately to WhatsApp (required)
        res.sendStatus(200);
      } else {
        // Not a message (could be status update, etc.)
        res.sendStatus(200);
      }
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.sendStatus(500);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mode: 'whatsapp-cloud-api',
  });
});

// Test endpoint to send surprise message
app.post('/send-surprise', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    await sendSurpriseMessage(phoneNumber);
    res.json({ success: true, message: 'Surprise message sent!' });
  } catch (error) {
    console.error('Error sending surprise:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = config.port || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`\n📱 🍌 נאנו בננה is ready to receive messages!`);
  console.log(`\n💡 To send the surprise message, use:`);
  console.log(`   POST http://localhost:${PORT}/send-surprise`);
  console.log(`   Body: { "phoneNumber": "972555073355" }\n`);
  console.log(`⚠️  Important: You need to configure your webhook in Meta Developer Console:`);
  console.log(`   1. Go to https://developers.facebook.com/apps`);
  console.log(`   2. Select your app`);
  console.log(`   3. Go to WhatsApp > Configuration`);
  console.log(`   4. Set Webhook URL (use localtunnel)`);
  console.log(`   5. Set Verify Token: ${config.whatsappVerifyToken}\n`);

  // Start Claude Code monitor
  console.log('\n🔧 Starting monitors and schedulers...');
  try {
    startClaudeCodeMonitor();
    console.log('✅ Claude Code monitor started');
  } catch (error) {
    console.error('❌ Failed to start Claude Code monitor:', error.message);
  }

  // Start daily notifications scheduler
  try {
    startDailyNotifications();
    console.log('✅ Daily notifications scheduler started');
  } catch (error) {
    console.error('❌ Failed to start daily notifications:', error.message);
  }

  console.log('\n🎉 All systems ready! נאנו בננה is online! 🍌\n');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  process.exit(0);
});
