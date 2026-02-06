import { processMessage } from '../routers/aiRouter.js';
import { downloadAndConvertToBase64, getMimeType } from '../utils/mediaDownloader.js';

/**
 * Handle image messages
 * @param {string} imageUrl - URL of the image
 * @param {string} caption - Optional caption/question about the image
 * @param {string} senderId - Sender's ID
 * @returns {Promise<string>} - AI response
 */
export async function handleImageMessage(imageUrl, caption = '', senderId) {
  try {
    console.log(`\n🖼️ Processing image from ${senderId}`);
    console.log(`Image URL: ${imageUrl}`);
    console.log(`Caption: ${caption || 'No caption'}`);

    // Download and convert image to base64
    const imageData = await downloadAndConvertToBase64(imageUrl);
    const mimeType = getMimeType(imageUrl);

    // Default prompt if no caption provided
    const prompt = caption || 'מה אתה רואה בתמונה הזו? תן תיאור מפורט.';

    // Process with AI
    const response = await processMessage(prompt, {
      mediaType: 'image',
      mediaData: imageData,
      mimeType: mimeType,
      mediaUrl: imageUrl,
    });

    console.log('✅ Image processed successfully');
    return response;
  } catch (error) {
    console.error('Error handling image:', error);
    return 'סליחה, אני לא מצליח לנתח את התמונה כרגע. נסה שוב מאוחר יותר.';
  }
}
