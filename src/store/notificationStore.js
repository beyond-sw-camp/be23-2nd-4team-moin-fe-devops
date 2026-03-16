import { ref } from "vue";

/** 헤더·알림 페이지에서 공유하는 읽지 않은 알림 개수 */
export const notificationUnreadCount = ref(0);

const NOTIFICATION_UNREAD_CHANGED = "notification-unread-changed";

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(NOTIFICATION_UNREAD_CHANGED));
  }
}

export function setNotificationUnreadCount(count) {
  notificationUnreadCount.value = Math.max(0, count);
  notifyChange();
}

export function incrementNotificationUnread() {
  notificationUnreadCount.value += 1;
  notifyChange();
}

export function decrementNotificationUnread() {
  if (notificationUnreadCount.value > 0) {
    notificationUnreadCount.value -= 1;
    notifyChange();
  }
}

export { NOTIFICATION_UNREAD_CHANGED };
