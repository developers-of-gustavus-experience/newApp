// utils/notifications.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { getTopTags } from './tracking';
import { newsData } from '../../constants/newsData';

const STORAGE_KEY = 'storedNotifications';
const DEFAULT_MAX_NOTIFICATIONS = 10;

export const getStoredNotifications = async () => {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
};

export const addNotificationArticle = async (article, max = DEFAULT_MAX_NOTIFICATIONS) => {
  const existing = await getStoredNotifications();

  const updated = [article, ...existing].slice(0, max);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // 🔔 Trigger local notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📢 New Notification',
      body: `${article.header}: ${article.details}`,
    },
    trigger: null, // Fire immediately
  });
};

export const startAutoNotificationLoop = (intervalMs = 10000, maxItems = DEFAULT_MAX_NOTIFICATIONS) => {
  setInterval(async () => {
    const topTags = await getTopTags();
    const candidates = newsData.filter((item) =>
      item.tags.some((tag) => topTags.includes(tag))
    );

    if (candidates.length > 0) {
      const selected = candidates[Math.floor(Math.random() * candidates.length)];
      await addNotificationArticle(selected, maxItems);
    }
  }, intervalMs);
};
