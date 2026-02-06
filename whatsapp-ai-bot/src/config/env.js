import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Anthropic (Claude)
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,

  // Google Gemini
  geminiApiKey: process.env.GEMINI_API_KEY,

  // WhatsApp
  whatsappToken: process.env.WHATSAPP_TOKEN,
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  whatsappVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN,

  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Cache
  cacheTTL: parseInt(process.env.CACHE_TTL || '3600', 10),
};

// Validate required environment variables
export function validateConfig() {
  // Gemini-only mode - Claude API not required
  const required = [
    'geminiApiKey',
  ];

  const missing = required.filter(key => !config[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file.'
    );
  }

  // Warn about WhatsApp configuration
  if (!config.whatsappToken || !config.whatsappPhoneNumberId) {
    console.warn('⚠️  WhatsApp API credentials not configured. Bot will not be able to send messages.');
  }

  console.log('✅ Configuration loaded successfully');
  console.log('ℹ️  Running in Gemini-only mode (automatic responses)');
}
