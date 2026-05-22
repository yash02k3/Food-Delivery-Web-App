import Notification from '../models/Notification.js';

export const createNotification = async (userId, { type, title, message, data }) => {
  return Notification.create({ user: userId, type, title, message, data });
};
