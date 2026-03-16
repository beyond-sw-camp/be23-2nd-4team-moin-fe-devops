<template>
  <div class="page-root notification-page-root">
    <LnbMenuComponent
      :active-nav="null"
      :category-options="categoryOptions"
      :selected-category-values="[]"
      @nav-click="onLnbNavClick"
      @category-click="onLnbCategoryClick"
    />

    <main class="main notification-main">
      <!-- 로딩 -->
      <div v-if="loading" class="notification-loading">
        <div class="spinner-lg"></div>
      </div>

      <template v-else>
        <div class="notification-wrap">
          <div class="section">
            <!-- 에러 -->
            <div v-if="error" class="notification-error-inner">
              <p>{{ error }}</p>
              <button type="button" class="btn-retry" @click="fetchNotifications">다시 시도</button>
            </div>

            <!-- 알림 없음 -->
            <div v-else-if="notifications.length === 0" class="empty-state">
              <div class="empty-icon"><svg class="np-icon np-icon--empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 16V11a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z"></path><path d="M10 20a2 2 0 004 0"></path></svg></div>
              <p class="empty-text">알림이 없습니다</p>
              <p class="empty-desc">새로운 알림이 도착하면 여기에 표시됩니다</p>
            </div>

            <!-- 알림 카드 목록 -->
            <div v-else class="notification-card-list">
              <div
                v-for="notification in notifications"
                :key="notification.id"
                :class="['card-item', 'notification-card-item', notification.isRead && 'notification-card-item--read']"
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
                <div class="notif-row">
                  <div v-if="!notification.isRead" class="notif-dot"></div>
                  <div :class="['notif-icon-wrap', getIconBgClass(notification.type)]">
                    <svg v-if="notification.type === 'APPROVE'" class="np-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12.5l4 4L19 7"></path></svg><svg v-else-if="notification.type === 'REJECT'" class="np-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"></path></svg><svg v-else-if="notification.type === 'APPLY'" class="np-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 7h18v10H3z"></path><path d="M3 8l9 6 9-6"></path></svg><svg v-else-if="notification.type === 'SCHEDULE_CHANGE'" class="np-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"></rect><path d="M3 10h18"></path><path d="M8 3v4M16 3v4"></path></svg><svg v-else-if="notification.type === 'SETTLEMENT_COMPLETE'" class="np-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M8.5 9.5c0-1 1-2 3-2 1.8 0 2.8.8 2.8 2 0 1.2-.8 1.8-2.3 2.2-1.4.3-2 .7-2 1.8v.2"></path><path d="M12 16.5v0"></path></svg><svg v-else-if="notification.type === 'REFUND'" class="np-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 7H5v4"></path><path d="M5 11a7 7 0 101.8-4.7"></path><path d="M12 8v8"></path><path d="M9.5 10.5h5"></path><path d="M9.5 13.5h5"></path></svg><svg v-else class="np-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 16V11a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z"></path><path d="M10 20a2 2 0 004 0"></path></svg>
                  </div>
                  <div class="notif-body">
                    <div class="notif-meta">
                      <span :class="['notif-badge', getBadgeClass(notification.type)]">
                        {{ typeLabel(notification.type) }}
                      </span>
                      <span class="notif-time">{{ formatTime(notification.createdAt) }}</span>
                    </div>
                    <p :class="['notif-message', !notification.isRead && 'notif-message--unread']">
                      {{ notification.message }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script>
import axios from "axios";
import dayjs from "@/plugins/dayjs";
import LnbMenuComponent from "@/components/common/LnbMenuComponent.vue";
import { setNotificationUnreadCount } from "@/store/notificationStore.js";

const API_BASE = process.env.VUE_APP_API_BASE_URL || "http://localhost:8080";

function isRead(n) {
  return n === undefined ? false : n.isRead === true || n.read === true;
}

const TYPE_LABELS = {
  APPROVE: "가입승인",
  REJECT: "가입거절",
   APPLY: "가입신청", 
  SCHEDULE_CHANGE: "일정변경",
  SETTLEMENT_COMPLETE: "정산 완료",
   REFUND: "환불완료",
};

const CATEGORY_OPTIONS = [
  { label: "운동/스포츠", value: "SPORT" },
  { label: "독서", value: "BOOK" },
  { label: "요리/제조", value: "COOK" },
  { label: "취미/DIY", value: "DIY" },
  { label: "여행", value: "TRAVEL" },
  { label: "어학", value: "LANGUAGE" },
  { label: "자동차", value: "CAR" },
  { label: "게임/오락", value: "GAME" },
  { label: "문화/공연", value: "CULTURE" },
  { label: "반려동물", value: "PET" },
];

export default {
  name: "NotificationPageComponent",
  components: { LnbMenuComponent },
  props: {
    onNavigate: Function,
  },
  data() {
    return {
      notifications: [],
      loading: true,
      error: null,
      categoryOptions: CATEGORY_OPTIONS,
    };
  },
  computed: {
    unreadCount() {
      return this.notifications.filter((n) => !n.isRead).length;
    },
  },
  async mounted() {
    await this.fetchNotifications();
  },
  methods: {
    onLnbNavClick(key) {
      if (key === "home") this.$router.push("/");
      else if (key === "my-crews") this.$router.push("/my/crews");
      else if (key === "recommendations") this.$router.push("/crew/recommendations");
      else if (key === "rising") this.$router.push("/crew/rising-crews");
      else if (key === "meetings") this.$router.push("/my/meetings");
      else if (key === "recent") this.$router.push("/my/recent");
    },
    onLnbCategoryClick(value) {
      this.$router.push({ path: "/crew/search", query: value ? { category: value } : {} });
    },
    async fetchNotifications() {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await axios.get(`${API_BASE}/notifications/list`);
        const raw = Array.isArray(data) ? data : [];
        this.notifications = raw.map((n) => ({ ...n, isRead: isRead(n) }));
        const unread = this.notifications.filter((n) => !n.isRead).length;
        setNotificationUnreadCount(unread);
      } catch (e) {
        this.error =
          e.response?.data?.message || "알림 목록을 불러오지 못했습니다.";
        this.notifications = [];
      } finally {
        this.loading = false;
      }
    },
    getNotificationRoute(notification) {
      const type = (notification.type || "").toString();
      const refType = (notification.referenceType || "").toString().toUpperCase();
      const targetId = notification.targetId ?? notification.crewId ?? notification.meetingId;
      const crewId = notification.crewId ?? (refType === "CREW" ? targetId : null);
      const meetingId = notification.meetingId ?? (refType === "MEETING" ? targetId : null);

      const cId = targetId || crewId;
      if (type === "APPLY" && cId) {
        return { path: `/crew/${cId}/manage` };
      }
      if (refType === "CREW" && cId) {
        return { path: `/crew/${cId}` };
      }
      if (refType === "MEETING" && (targetId || meetingId)) {
        const id = targetId || meetingId;
        return crewId ? { path: `/meeting/${id}`, query: { crewId } } : { path: `/meeting/${id}` };
      }
      if ((type === "APPROVE" || type === "REJECT") && cId) {
        return { path: `/crew/${cId}` };
      }
      if (type === "SCHEDULE_CHANGE" && (targetId || meetingId)) {
        const id = targetId || meetingId;
        return crewId ? { path: `/meeting/${id}`, query: { crewId } } : { path: `/meeting/${id}` };
      }
      if (type === "SETTLEMENT_COMPLETE" || type === "REFUND" || refType === "SETTLEMENT") {
        return { path: "/mypage", query: { section: "settlement" } };
      }
      return null;
    },
    async handleNotificationClick(notification) {
      await this.handleMarkAsRead(notification.id);
      const route = this.getNotificationRoute(notification);
      if (route) this.$router.push(route);
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
      } catch (e) {
        console.error("읽음 처리 실패:", e);
      }
    },
    async handleDelete(id) {
      try {
        await axios.delete(`${API_BASE}/notifications/${id}`);
        this.notifications = this.notifications.filter((n) => n.id !== id);
        const unread = this.notifications.filter((n) => !n.isRead).length;
        setNotificationUnreadCount(unread);
      } catch (e) {
        console.error("알림 삭제 실패:", e);
      }
    },
    typeLabel(type) {
      return TYPE_LABELS[type] || type || "알림";
    },
    getIconBgClass(type) {
      switch (type) {
        case "APPROVE": return "icon-bg--green";
    case "REJECT": return "icon-bg--red";
    case "APPLY": return "icon-bg--sky";        
    case "SCHEDULE_CHANGE": return "icon-bg--sky";
    case "SETTLEMENT_COMPLETE": return "icon-bg--amber";
    case "REFUND": return "icon-bg--green";     
    default: return "icon-bg--gray";
      }
    },
    getBadgeClass(type) {
      switch (type) {
        case "APPROVE": return "badge--green";
    case "REJECT": return "badge--red";
    case "APPLY": return "badge--sky";          
    case "SCHEDULE_CHANGE": return "badge--sky";
    case "SETTLEMENT_COMPLETE": return "badge--amber";
    case "REFUND": return "badge--green";      
    default: return "badge--gray";
      }
    },

    // ✅ 수정 후
    formatTime(dateString) {
      if (!dateString) return "알 수 없음";
      const date = dayjs.utc(dateString).tz("Asia/Seoul");
      if (!date.isValid()) return "알 수 없음";
      const diffMs = dayjs().valueOf() - date.valueOf();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffMins < 1) return "방금 전";
      if (diffMins < 60) return `${diffMins}분 전`;
      if (diffHours < 24) return `${diffHours}시간 전`;
      if (diffDays === 1) return "어제";
      if (diffDays < 7) return `${diffDays}일 전`;
      return date.format("M월 D일");
    },
    // formatTime(dateString) {
    //   if (!dateString) return "알 수 없음";
    //   const now = new Date();
    //   const date = new Date(dateString);
    //   const diffMs = now.getTime() - date.getTime();
    //   const diffMins = Math.floor(diffMs / 60000);
    //   const diffHours = Math.floor(diffMs / 3600000);
    //   const diffDays = Math.floor(diffMs / 86400000);
    //   if (diffMins < 1) return "방금 전";
    //   if (diffMins < 60) return `${diffMins}분 전`;
    //   if (diffHours < 24) return `${diffHours}시간 전`;
    //   if (diffDays === 1) return "어제";
    //   if (diffDays < 7) return `${diffDays}일 전`;
    //   return date.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
    // },
  },
};
</script>

<style scoped>
.page-root.notification-page-root {
  display: flex;
  min-height: 100vh;
  background: #f4f4f4;
  font-family: "Pretendard", "Apple SD Gothic Neo", -apple-system, sans-serif;
  width: 100%;
}

.main.notification-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 28px 0;
}

.notification-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
}

.spinner-lg {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #4FA8D8;
  border-radius: 50%;
  animation: notif-spin 0.7s linear infinite;
}

@keyframes notif-spin {
  to { transform: rotate(360deg); }
}

.notification-wrap {
  flex: 1;
  min-height: 0;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
}

.page-head {
  margin-bottom: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.4px;
  margin: 0 0 6px;
}

.title-sparkle {
  color: #4FA8D8;
}

.page-sub {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

/* 섹션: 위아래 꽉 차게 */
.section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 0;
  border: none;
  border-top: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  padding: 22px 26px;
  margin: 0;
}

.sec-label-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.sec-num {
  font-size: 11px;
  font-weight: 900;
  color: #4FA8D8;
  background: #EBF6FC;
  padding: 3px 8px;
  border-radius: 6px;
  flex-shrink: 0;
}

.sec-title {
  font-size: 14.5px;
  font-weight: 800;
  color: #0f172a;
  flex: 1;
}

.notification-error-inner {
  text-align: center;
  padding: 32px 20px;
}

.notification-error-inner p {
  color: #dc2626;
  font-size: 14px;
  margin-bottom: 12px;
}

.btn-retry {
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 600;
  color: #4FA8D8;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-retry:hover {
  background: #e0f2fe;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  line-height: 1;
}

.empty-text {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 6px;
}

.empty-desc {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.notification-card-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-item.notification-card-item {
  position: relative;
  background: #fafbfc;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 18px 44px 18px 20px;
  margin-bottom: 0;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.notification-delete-btn {
  position: absolute;
  top: 14px;
  right: 14px;
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

.card-item.notification-card-item:hover {
  border-color: #4FA8D8;
  background: #f8fbfd;
}

.notification-card-item--read {
  background: #f8fafc;
  opacity: 0.9;
}

.notif-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  position: relative;
}

.notification-card-item:not(.notification-card-item--read) .notif-row {
  padding-left: 16px;
}

.notif-dot {
  position: absolute;
  top: 18px;
  left: 0;
  width: 8px;
  height: 8px;
  background: #4FA8D8;
  border-radius: 50%;
}

.notif-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.np-icon { width: 1em; height: 1em; flex-shrink: 0; }
.np-icon--sparkle { width: 0.9em; height: 0.9em; vertical-align: -0.08em; }
.np-icon--empty { width: 48px; height: 48px; color: #94a3b8; }
.notif-icon-wrap .np-icon { width: 22px; height: 22px; }

.icon-bg--green { background: #dcfce7; }
.icon-bg--red { background: #fee2e2; }
.icon-bg--sky { background: #e0f2fe; }
.icon-bg--purple { background: #f3e8ff; }
.icon-bg--amber { background: #fef3c7; }
.icon-bg--gray { background: #f3f4f6; }

.notif-body {
  flex: 1;
  min-width: 0;
}

.notif-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.notif-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 8px;
}

.badge--green { background: #dcfce7; color: #166534; }
.badge--red { background: #fee2e2; color: #991b1b; }
.badge--sky { background: #e0f2fe; color: #0369a1; }
.badge--purple { background: #f3e8ff; color: #6b21a8; }
.badge--amber { background: #fef3c7; color: #92400e; }
.badge--gray { background: #f3f4f6; color: #374151; }

.notif-time {
  font-size: 12px;
  color: #9ca3af;
  flex-shrink: 0;
}

.notif-message {
  font-size: 14px;
  line-height: 1.5;
  color: #475569;
  margin: 0;
}

.notif-message--unread {
  font-weight: 700;
  color: #0f172a;
}

@media (max-width: 900px) {
  .main.notification-main {
    padding: 16px 14px 60px;
  }
}

@media (max-width: 600px) {
  .main.notification-main {
    padding: 12px 12px 60px;
  }
  .section {
    padding: 18px 18px;
  }
}
</style>




