import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Download media from URL
 * @param {string} url - Media URL
 * @param {string} outputPath - Optional output path
 * @returns {Promise<Buffer>} - Media buffer
 */
export async function downloadMedia(url, outputPath = null) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 seconds timeout
    });

    const buffer = Buffer.from(response.data);

    // Save to file if output path is provided
    if (outputPath) {
      await fs.writeFile(outputPath, buffer);
      console.log(`✅ Media saved to: ${outputPath}`);
    }

    return buffer;
  } catch (error) {
    console.error('Error downloading media:', error);
    throw new Error(`Failed to download media: ${error.message}`);
  }
}

/**
 * Convert buffer to base64
 * @param {Buffer} buffer - Media buffer
 * @returns {string} - Base64 encoded string
 */
export function bufferToBase64(buffer) {
  return buffer.toString('base64');
}

/**
 * Download and convert media to base64
 * @param {string} url - Media URL
 * @returns {Promise<string>} - Base64 encoded media
 */
export async function downloadAndConvertToBase64(url) {
  const buffer = await downloadMedia(url);
  return bufferToBase64(buffer);
}

/**
 * Get MIME type from URL or filename
 * @param {string} urlOrFilename - URL or filename
 * @returns {string} - MIME type
 */
export function getMimeType(urlOrFilename) {
  const ext = path.extname(urlOrFilename).toLowerCase();

  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
  };

  return mimeTypes[ext] || 'application/octet-stream';
}
