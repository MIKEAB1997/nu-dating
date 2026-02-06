import { processMessage } from '../routers/aiRouter.js';
import { downloadAndConvertToBase64, getMimeType } from '../utils/mediaDownloader.js';

/**
 * Handle video messages
 * @param {string} videoUrl - URL of the video
 * @param {string} caption - Optional caption/question about the video
 * @param {string} senderId - Sender's ID
 * @returns {Promise<string>} - AI response
 */
export async function handleVideoMessage(videoUrl, caption = '', senderId) {
  try {
    console.log(`\n🎥 Processing video from ${senderId}`);
    console.log(`Video URL: ${videoUrl}`);
    console.log(`Caption: ${caption || 'No caption'}`);

    // Download and convert video to base64
    console.log('📥 Downloading video...');
    const videoData = await downloadAndConvertToBase64(videoUrl);
    const mimeType = getMimeType(videoUrl);

    // Default prompt if no caption provided
    const prompt = caption || 'נתח את הסרטון הזה. מה קורה בו? תן תיאור מפורט של מה שאתה רואה ושומע.';

    // Process with AI (will be routed to Gemini)
    console.log('🤖 Analyzing video with Gemini...');
    const response = await processMessage(prompt, {
      mediaType: 'video',
      mediaData: videoData,
      mimeType: mimeType,
    });

    console.log('✅ Video processed successfully');
    return response;
  } catch (error) {
    console.error('Error handling video:', error);
    return 'סליחה, אני לא מצליח לנתח את הסרטון כרגע. ייתכן שהוא גדול מדי או בפורמט לא נתמך. נסה שוב עם סרטון קצר יותר.';
  }
}
