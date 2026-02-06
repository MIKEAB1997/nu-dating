import fs from 'fs';
import path from 'path';
import { sendTextMessage } from '../services/whatsapp-cloud.js';

const STATUS_FILE = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.claude/status/tasks.json'
);

const USER_PHONE = '972555073355'; // Miki's number

/**
 * Monitor Claude Code status file for changes
 */
export function startClaudeCodeMonitor() {
  console.log('🔍 Starting Claude Code monitor...');

  try {
    // Ensure status directory exists
    const statusDir = path.dirname(STATUS_FILE);
    if (!fs.existsSync(statusDir)) {
      fs.mkdirSync(statusDir, { recursive: true });
      console.log(`✅ Created status directory: ${statusDir}`);
    }

    // Create empty status file if doesn't exist
    if (!fs.existsSync(STATUS_FILE)) {
      const initialData = {
        tasks: [],
        lastUpdate: new Date().toISOString(),
      };
      fs.writeFileSync(STATUS_FILE, JSON.stringify(initialData, null, 2));
      console.log(`✅ Created status file: ${STATUS_FILE}`);
    }

    // Watch for file changes
    fs.watch(STATUS_FILE, { persistent: true }, async (eventType) => {
      if (eventType === 'change') {
        console.log('📝 Status file changed, processing...');
        await handleStatusChange();
      }
    });

    console.log(`✅ Claude Code monitor active!`);
    console.log(`📁 Watching: ${STATUS_FILE}`);
  } catch (error) {
    console.error('❌ Error starting Claude Code monitor:', error);
    console.log('⚠️ Monitor will not be available until this is fixed');
  }
}

/**
 * Handle status file changes
 */
async function handleStatusChange() {
  try {
    // Read the status file
    const fileContent = fs.readFileSync(STATUS_FILE, 'utf-8');
    const data = JSON.parse(fileContent);
    const tasks = data.tasks || [];

    // Find recently completed tasks that haven't been notified
    const completedTasks = tasks.filter(t =>
      t.status === 'completed' && !t.notified
    );

    if (completedTasks.length === 0) {
      console.log('ℹ️ No new completed tasks to notify');
      return;
    }

    console.log(`📨 Found ${completedTasks.length} completed task(s) to notify`);

    // Send notification for each completed task
    for (const task of completedTasks) {
      await sendTaskCompletionNotification(task);

      // Mark as notified
      task.notified = true;
      task.notifiedAt = new Date().toISOString();
    }

    // Save updated status
    data.lastUpdate = new Date().toISOString();
    fs.writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2));
    console.log('✅ Status file updated with notification flags');
  } catch (error) {
    console.error('Error handling status change:', error);
  }
}

/**
 * Send task completion notification via WhatsApp
 * @param {Object} task - The completed task
 */
async function sendTaskCompletionNotification(task) {
  const completedTime = task.completedAt
    ? new Date(task.completedAt).toLocaleTimeString('he-IL')
    : 'לא ידוע';

  const message =
    `🎉 *משימה הושלמה!*\n\n` +
    `✅ ${task.content}\n` +
    `⏱️ זמן השלמה: ${completedTime}\n` +
    `📁 קבצים שונו: ${task.filesChanged || 0}\n` +
    `🧪 בדיקות: ${task.testsRun ? 'עברו ✓' : 'לא בוצעו'}\n\n` +
    `💪 עבודה מעולה!\n\n` +
    `🍌 נאנו בננה - הבוט החכם שלך`;

  try {
    await sendTextMessage(USER_PHONE, message);
    console.log(`📨 Sent completion notification for: "${task.content}"`);
  } catch (error) {
    console.error('Error sending notification:', error);
    // Don't throw - we don't want to crash the monitor
  }
}

/**
 * Manually update task status (can be called from external scripts)
 * @param {Object} taskData - Task data to add/update
 */
export function updateTaskStatus(taskData) {
  try {
    const fileContent = fs.readFileSync(STATUS_FILE, 'utf-8');
    const data = JSON.parse(fileContent);

    // Find existing task or add new one
    const existingIndex = data.tasks.findIndex(t => t.id === taskData.id);

    if (existingIndex >= 0) {
      // Update existing task
      data.tasks[existingIndex] = {
        ...data.tasks[existingIndex],
        ...taskData,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Add new task
      data.tasks.push({
        ...taskData,
        createdAt: new Date().toISOString(),
        notified: false,
      });
    }

    data.lastUpdate = new Date().toISOString();
    fs.writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2));
    console.log(`✅ Task status updated: ${taskData.content || taskData.id}`);

    return true;
  } catch (error) {
    console.error('Error updating task status:', error);
    return false;
  }
}

/**
 * Get all tasks from status file
 * @returns {Array} - List of tasks
 */
export function getAllTasks() {
  try {
    const fileContent = fs.readFileSync(STATUS_FILE, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.tasks || [];
  } catch (error) {
    console.error('Error reading tasks:', error);
    return [];
  }
}
