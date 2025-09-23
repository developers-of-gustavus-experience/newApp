// hooks/useNotifications.ts

import { useEffect, useState } from 'react';
import { getStoredNotifications } from '../utils/notifications';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [latest, setLatest] = useState(null);

  const refresh = async () => {
    const data = await getStoredNotifications();
    setNotifications(data);
    setLatest(data[0] || null);
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000); // Check every 5s for updates
    return () => clearInterval(interval);
  }, []);

  return { notifications, latest, refresh };
};
