<template>
  <Teleport to="body">
    <Transition name="notification-modal">
      <div
        v-if="visible"
        class="notification-modal-overlay"
        @click.self="$emit('close')"
      >
        <div class="notification-modal-card">
          <!-- 헤더 -->
          <div class="notification-modal-header">
            <h2 class="notification-modal-title">알림</h2>
            <p v-if="unreadCount > 0" class="notification-modal-sub">
              읽지 않은 알림 {{ unreadCount }}개
            </p>
            <button
              type="button"
              class="notification-modal-close"
              aria-label="닫기"
              @click="$emit('close')"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          <!-- 본문 -->
          <div class="notification-modal-body">
            <div v-if="loading" class="notification-modal-loading">
              <div class="notification-spinner"></div>
              <p>알림을 불러오는 중...</p>
            </div>
            <div v-else-if="error" class="notification-modal-error">
              <p>{{ error }}</p>
              <button type="button" class="notification-retry-btn" @click="fetchNotifications">
                다시 시도
              </button>
            </div>
            <div v-else-if="notifications.length === 0" class="notification-modal-empty">
              <span class="notification-empty-icon"><svg class="nm-icon nm-icon--empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 16V11a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z"></path><path d="M10 20a2 2 0 004 0"></path></svg></span>
              <p class="notification-empty-title">알림이 없습니다</p>
              <p class="notification-empty-desc">새로운 알림이 도착하면 여기에 표시됩니다</p>
            </div>
            <div v-else class="notification-list">
              <div
                v-for="notification in notifications"
                :key="notification.id"
                :class="['notification-item', notification.isRead && 'notification-item--read']"
                @click="handleNotificationClick(notification)"
              >
                <button
                  type="button"
                  class="notification-delete-btn"
                  aria-label="알림 삭제"
                  @click.stop="handleDelete(notification.id)"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
                <div v-if="!notification.isRead" class="notification-dot" />
                <div :class="['notification-icon-wrap', getIconBgClass(notification.type)]">
                  <svg v-if="notification.type === 'APPROVE'" class="nm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12.5l4 4L19 7"></path></svg><svg v-else-if="notification.type === 'REJECT'" class="nm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"></path></svg><svg v-else-if="notification.type === 'APPLY'" class="nm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 7h18v10H3z"></path><path d="M3 8l9 6 9-6"></path></svg><svg v-else-if="notification.type === 'SCHEDULE_CHANGE'" class="nm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"></rect><path d="M3 10h18"></path><path d="M8 3v4M16 3v4"></path></svg><svg v-else-if="notification.type === 'SETTLEMENT_COMPLETE'" class="nm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M8.5 9.5c0-1 1-2 3-2 1.8 0 2.8.8 2.8 2 0 1.2-.8 1.8-2.3 2.2-1.4.3-2 .7-2 1.8v.2"></path><path d="M12 16.5v0"></path></svg><svg v-else-if="notification.type === 'REFUND'" class="nm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 7H5v4"></path><path d="M5 11a7 7 0 101.8-4.7"></path><path d="M12 8v8"></path><path d="M9.5 10.5h5"></path><path d="M9.5 13.5h5"></path></svg><svg v-else class="nm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 16V11a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z"></path><path d="M10 20a2 2 0 004 0"></path></svg>
                </div>
                <div class="notification-content">
                  <div class="notification-meta">
                    <span :class="['notification-badge', getBadgeClass(notification.type)]">
                      {{ typeLabel(notification.type) }}
                    </span>
                    <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
                  </div>
                  <p :class="['notification-message', !notification.isRead && 'notification-message--unread']">
                    {{ notification.message }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 전체 알림 페이지 링크 (선택) -->
          <div class="notification-modal-footer">
            <button
              type="button"
              class="notification-full-link"
              @click="goFullPage"
            >
              전체 알림 보기
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import axios from 'axios';
import dayjs from '@/plugins/dayjs';
import { setNotificationUnreadCount } from '@/store/notificationStore.js';

const API_BASE = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080';

function isRead(n) {
  return n === undefined ? false : n.isRead === true || n.read === true;
}

const TYPE_LABELS = {
  APPROVE: '가입승인',
  REJECT: '가입거절',
  APPLY: '가입신청',       
  SCHEDULE_CHANGE: '일정변경',
  SETTLEMENT_COMPLETE: '정산 완료',
  REFUND: '환불완료', 
};

export default {
  name: 'NotificationModalComponent',
  emits: ['close'],
  props: {
    visible: Boolean,
    onNavigate: { type: Function, default: null },
  },
  data() {
    return {
      notifications: [],
      loading: false,
      error: null,
    };
  },
  computed: {
    unreadCount() {
      return this.notifications.filter((n) => !n.isRead).length;
    },
  },
  watch: {
    visible(v) {
      if (v) {
        this.fetchNotifications();
      }
    },
  },
  methods: {
   async fetchNotifications() {
  this.loading = true;
  this.error = null;
  try {
    const { data } = await axios.get(`${API_BASE}/notifications/list`);
    const raw = Array.isArray(data) ? data : [];
    const all = raw.map((n) => ({ ...n, isRead: isRead(n) }));
    this.notifications = all.slice(0, 5);
    const unread = all.filter((n) => !n.isRead).length;
    setNotificationUnreadCount(unread);
  } catch (e) {
    this.error = e.response?.data?.message || '알림 목록을 불러오지 못했습니다.';
    this.notifications = [];
  } finally {
    this.loading = false;
  }
},
    getNotificationRoute(notification) {
      const type = (notification.type || '').toString();
      const refType = (notification.referenceType || '').toString().toUpperCase();
      const targetId = notification.targetId ?? notification.crewId ?? notification.meetingId;
      const crewId = notification.crewId ?? (refType === 'CREW' ? targetId : null);
      const meetingId = notification.meetingId ?? (refType === 'MEETING' ? targetId : null);

      const cId = targetId || crewId;
      if (type === 'APPLY' && cId) {
        return { path: `/crew/${cId}/manage` };
      }
      if (refType === 'CREW' && cId) {
        return { path: `/crew/${cId}` };
      }
      if (refType === 'MEETING' && (targetId || meetingId)) {
        const id = targetId || meetingId;
        return crewId ? { path: `/meeting/${id}`, query: { crewId } } : { path: `/meeting/${id}` };
      }
      if ((type === 'APPROVE' || type === 'REJECT') && cId) {
        return { path: `/crew/${cId}` };
      }
      if (type === 'SCHEDULE_CHANGE' && (targetId || meetingId)) {
        const id = targetId || meetingId;
        return crewId ? { path: `/meeting/${id}`, query: { crewId } } : { path: `/meeting/${id}` };
      }
      if (type === 'SETTLEMENT_COMPLETE' || type === 'REFUND' || refType === 'SETTLEMENT') {
        return { path: '/mypage', query: { section: 'settlement' } };
      }
      return null;
    },
    async handleNotificationClick(notification) {
      await this.handleMarkAsRead(notification.id);
      const route = this.getNotificationRoute(notification);
      if (route) {
        this.$emit('close');
        this.$router.push(route);
      }
    },
    async handleMarkAsRead(id) {
      const notification = this.notifications.find((n) => n.id === id);
      if (!notification || isRead(notification)) return;
      try {
        await axios.patch(`${API_BASE}/notifications/${id}/read`);
        notification.isRead = true;
        notification.read = true;
        const unread = this.notifications.filter((n) => !n.isRead).length;
        setNotificationUnreadCount(unread);
      } catch (err) {
        console.error('읽음 처리 실패:', err);
      }
    },
    async handleDelete(id) {
      try {
        await axios.delete(`${API_BASE}/notifications/${id}`);
        this.notifications = this.notifications.filter((n) => n.id !== id);
        const unread = this.notifications.filter((n) => !n.isRead).length;
        setNotificationUnreadCount(unread);
      } catch (err) {
        console.error('알림 삭제 실패:', err);
      }
    },
    goFullPage() {
      this.$emit('close');
      if (this.onNavigate) this.onNavigate('notification');
    },
    typeLabel(type) {
      return TYPE_LABELS[type] || type || '알림';
    },
    getIconBgClass(type) {
      switch (type) {
          case 'APPROVE': return 'icon-bg--green';
    case 'REJECT': return 'icon-bg--red';
    case 'APPLY': return 'icon-bg--sky';       // 추가
    case 'SCHEDULE_CHANGE': return 'icon-bg--sky';
    case 'SETTLEMENT_COMPLETE': return 'icon-bg--amber';
    case 'REFUND': return 'icon-bg--green';    // 추가
    default: return 'icon-bg--gray';
      }
    },
    getBadgeClass(type) {
      switch (type) {
       case 'APPROVE': return 'badge--green';
    case 'REJECT': return 'badge--red';
    case 'APPLY': return 'badge--sky';         // 추가
    case 'SCHEDULE_CHANGE': return 'badge--sky';
    case 'SETTLEMENT_COMPLETE': return 'badge--amber';
    case 'REFUND': return 'badge--green';      // 추가
    default: return 'badge--gray';
      }
    },

    formatTime(dateString) {
      if (!dateString) return '알 수 없음';
      const date = dayjs.utc(dateString).tz('Asia/Seoul');
      if (!date.isValid()) return '알 수 없음';
      const diffMs = dayjs().valueOf() - date.valueOf();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffMins < 1) return '방금 전';
      if (diffMins < 60) return `${diffMins}분 전`;
      if (diffHours < 24) return `${diffHours}시간 전`;
      if (diffDays === 1) return '어제';
      if (diffDays < 7) return `${diffDays}일 전`;
      return date.format('M월 D일');
    },

    // formatTime(dateString) {
    //   if (!dateString) return '알 수 없음';
    //   const now = new Date();
    //   const date = new Date(dateString);
    //   const diffMs = now.getTime() - date.getTime();
    //   const diffMins = Math.floor(diffMs / 60000);
    //   const diffHours = Math.floor(diffMs / 3600000);
    //   const diffDays = Math.floor(diffMs / 86400000);
    //   if (diffMins < 1) return '방금 전';
    //   if (diffMins < 60) return `${diffMins}분 전`;
    //   if (diffHours < 24) return `${diffHours}시간 전`;
    //   if (diffDays === 1) return '어제';
    //   if (diffDays < 7) return `${diffDays}일 전`;
    //   return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
    // },
  },
};
</script>

<style scoped>
.notification-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
  box-sizing: border-box;
}

.notification-modal-card {
  width: 100%;
  max-width: 420px;
  max-height: 85vh;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.notification-modal-header {
  flex-shrink: 0;
  padding: 18px 20px 14px;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
}

.notification-modal-title {
  font-size: 18px;
  font-weight: 800;
  color: #111;
  margin: 0;
}

.notification-modal-sub {
  font-size: 13px;
  color: #6b7280;
  margin: 4px 0 0;
}

.notification-modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
  border: none;
  background: #f3f4f6;
  border-radius: 10px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}

.notification-modal-close:hover {
  background: #e5e7eb;
  color: #111;
}

.notification-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.notification-modal-loading,
.notification-modal-error,
.notification-modal-empty {
  text-align: center;
  padding: 40px 20px;
}

.notification-modal-loading p,
.notification-modal-error p {
  margin-top: 12px;
  font-size: 14px;
  color: #6b7280;
}

.notification-modal-error p {
  color: #dc2626;
}

.notification-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #4FA8D8;
  border-radius: 50%;
  animation: notification-spin 0.7s linear infinite;
  margin: 0 auto;
}

@keyframes notification-spin {
  to { transform: rotate(360deg); }
}

.notification-retry-btn {
  margin-top: 12px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #4FA8D8;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.notification-retry-btn:hover {
  background: #e0f2fe;
}

.notification-empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.notification-empty-title {
  font-size: 16px;
  font-weight: 700;
  color: #111;
  margin: 0 0 6px;
}

.notification-empty-desc {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification-item {
  position: relative;
  display: flex;
  gap: 12px;
  padding: 14px 36px 14px 14px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.notification-delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.15s, color 0.15s;
}

.notification-delete-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.notification-item:hover {
  border-color: #4FA8D8;
  box-shadow: 0 4px 12px rgba(79, 168, 216, 0.15);
}

.notification-item--read {
  background: #f9fafb;
  border-color: #e5e7eb;
  opacity: 0.85;
}

.notification-dot {
  position: absolute;
  top: 14px;
  left: 14px;
  width: 8px;
  height: 8px;
  background: #4FA8D8;
  border-radius: 50%;
}

.notification-item .notification-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nm-icon {
  width: 1em;
  height: 1em;
  flex-shrink: 0;
}

.nm-icon--empty {
  width: 40px;
  height: 40px;
  color: #94a3b8;
}

.notification-icon-wrap .nm-icon {
  width: 22px;
  height: 22px;
}

.icon-bg--green { background: #dcfce7; }
.icon-bg--red { background: #fee2e2; }
.icon-bg--sky { background: #e0f2fe; }
.icon-bg--purple { background: #f3e8ff; }
.icon-bg--amber { background: #fef3c7; }
.icon-bg--gray { background: #f3f4f6; }

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.notification-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}

.badge--green { background: #dcfce7; color: #166534; }
.badge--red { background: #fee2e2; color: #991b1b; }
.badge--sky { background: #e0f2fe; color: #0369a1; }
.badge--purple { background: #f3e8ff; color: #6b21a8; }
.badge--amber { background: #fef3c7; color: #92400e; }
.badge--gray { background: #f3f4f6; color: #374151; }

.notification-time {
  font-size: 11px;
  color: #9ca3af;
  flex-shrink: 0;
}

.notification-message {
  font-size: 14px;
  line-height: 1.45;
  color: #374151;
  margin: 0;
}

.notification-message--unread {
  font-weight: 700;
  color: #111;
}

.notification-modal-footer {
  flex-shrink: 0;
  padding: 12px 20px 18px;
  border-top: 1px solid #e5e7eb;
}

.notification-full-link {
  width: 100%;
  padding: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #4FA8D8;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.notification-full-link:hover {
  background: #e0f2fe;
  border-color: #4FA8D8;
}

/* 트랜지션 */
.notification-modal-enter-active,
.notification-modal-leave-active {
  transition: opacity 0.2s ease;
}

.notification-modal-enter-from,
.notification-modal-leave-to {
  opacity: 0;
}

</style>



