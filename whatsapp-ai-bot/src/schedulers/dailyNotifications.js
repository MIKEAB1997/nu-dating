import cron from 'node-cron';
import { sendTextMessage } from '../services/whatsapp-cloud.js';
import { getAllTasks } from '../monitors/claudeCodeMonitor.js';

const USER_PHONE = '972555073355'; // Miki's number

/**
 * Start daily notification scheduler
 */
export function startDailyNotifications() {
  console.log('📅 Setting up daily notifications...');

  // Daily summary at 18:00 (6 PM) Israel time
  // Cron format: minute hour day month day-of-week
  const dailySummarySchedule = '0 18 * * *';

  if (!cron.validate(dailySummarySchedule)) {
    console.error('❌ Invalid cron schedule for daily summary');
    return;
  }

  // Schedule daily summary
  cron.schedule(dailySummarySchedule, async () => {
    console.log('⏰ Running daily summary...');
    await sendDailySummary();
  });

  console.log('✅ Daily notifications scheduled (18:00 Israel time)');

  // Optional: Weekly summary on Friday evening
  // cron.schedule('0 17 * * 5', async () => {
  //   await sendWeeklySummary();
  // });
}

/**
 * Send daily summary of tasks
 */
async function sendDailySummary() {
  try {
    console.log('📊 Generating daily summary...');

    const tasks = getAllTasks();

    if (tasks.length === 0) {
      console.log('ℹ️ No tasks to summarize today');
      return;
    }

    // Calculate statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTasks = tasks.filter(t => {
      const taskDate = new Date(t.createdAt || t.updatedAt);
      return taskDate >= today;
    });

    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;

    // Get projects worked on today
    const projects = new Set();
    todayTasks.forEach(t => {
      if (t.project) {
        projects.add(t.project);
      }
    });

    const message =
      `📊 *סיכום יומי - ${formatDate(new Date())}*\n\n` +
      `📈 *סטטיסטיקות:*\n` +
      `✅ משימות שהושלמו: ${completed}\n` +
      `⏳ משימות בביצוע: ${inProgress}\n` +
      `📝 משימות ממתינות: ${pending}\n` +
      `📁 סה"כ משימות: ${tasks.length}\n\n` +
      (projects.size > 0
        ? `🚀 *היום עבדת על:*\n${Array.from(projects).map(p => `• ${p}`).join('\n')}\n\n`
        : '') +
      (todayTasks.length > 0
        ? `✨ *פעילות היום:* ${todayTasks.length} משימות\n\n`
        : '💤 לא היו משימות חדשות היום\n\n') +
      `💪 עבודה מעולה!\n` +
      `🎯 מחר יום חדש!\n\n` +
      `🍌 נאנו בננה - הבוט החכם שלך`;

    await sendTextMessage(USER_PHONE, message);
    console.log('📨 Daily summary sent successfully');
  } catch (error) {
    console.error('Error sending daily summary:', error);
  }
}

/**
 * Send weekly summary (optional - can be enabled)
 */
async function sendWeeklySummary() {
  try {
    console.log('📊 Generating weekly summary...');

    const tasks = getAllTasks();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekTasks = tasks.filter(t => {
      const taskDate = new Date(t.createdAt || t.updatedAt);
      return taskDate >= weekAgo;
    });

    const completed = weekTasks.filter(t => t.status === 'completed').length;
    const totalTasks = weekTasks.length;

    const message =
      `📊 *סיכום שבועי - שבוע ${getWeekNumber()}*\n\n` +
      `🎯 *הישגים השבוע:*\n` +
      `✅ ${completed} משימות הושלמו\n` +
      `📁 סה"כ ${totalTasks} משימות\n` +
      `📈 שיעור הצלחה: ${totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0}%\n\n` +
      `💪 שבת שלום!\n\n` +
      `🍌 נאנו בננה - הבוט החכם שלך`;

    await sendTextMessage(USER_PHONE, message);
    console.log('📨 Weekly summary sent successfully');
  } catch (error) {
    console.error('Error sending weekly summary:', error);
  }
}

/**
 * Format date in Hebrew
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date
 */
function formatDate(date) {
  return date.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

/**
 * Get current week number
 * @returns {number} - Week number
 */
function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
}

/**
 * Send custom notification (can be called manually)
 * @param {string} message - Message to send
 */
export async function sendCustomNotification(message) {
  try {
    const fullMessage = `${message}\n\n🍌 נאנו בננה - הבוט החכם שלך`;
    await sendTextMessage(USER_PHONE, fullMessage);
    console.log('📨 Custom notification sent');
    return true;
  } catch (error) {
    console.error('Error sending custom notification:', error);
    return false;
  }
}
