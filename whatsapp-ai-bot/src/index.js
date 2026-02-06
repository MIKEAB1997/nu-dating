import { validateConfig } from './config/env.js';
import { initializeWhatsApp, stopWhatsApp } from './services/whatsapp.js';

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║         WhatsApp AI Bot with Multimodal AI          ║');
  console.log('║          Claude + Gemini Integration                ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  try {
    // Validate configuration
    validateConfig();
    console.log('');

    // Initialize WhatsApp
    await initializeWhatsApp();

    // Handle process termination
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Shutting down gracefully...');
      await stopWhatsApp();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n\n🛑 Shutting down gracefully...');
      await stopWhatsApp();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Start the bot
main().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
