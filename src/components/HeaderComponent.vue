<template>
  <header class="sticky top-0 z-50 header-glass">
    <div class="w-full px-5">
      <div class="flex items-center h-16 gap-3">
        <!-- 로고 -->
        <div
          class="flex items-center gap-2 cursor-pointer flex-shrink-0 select-none"
          @click="onNavigate('/')"
        >
          <LogoComponent class-name="w-9 h-9" type="default" />
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-extrabold tracking-tight text-gray-900">모인</span>
            <span class="text-xs text-gray-400 font-medium tracking-wide">moin</span>
          </div>
        </div>

        <!-- 중앙 문구 -->
        <div class="flex-1 hidden md:flex justify-center">
          <span class="tagline-text cursor-pointer select-none" @click="onNavigate('/')">우리 동네 취미 모임 플랫폼</span>
        </div>

        <!-- 우측 메뉴 -->
        <div class="flex items-center gap-1 flex-shrink-0">
          <!-- 관리자 버튼 -->
          <button
            v-if="isLoggedIn && isAdminRole"
            @click="onNavigate('admin')"
            class="btn-admin"
          >
            <span>🛡️</span>
            <span class="text-sm font-semibold hidden sm:inline">관리자</span>
          </button>

          <!-- 채팅 버튼 → 팝업 토글 -->
          <button
            @click="toggleChatPopup"
            class="icon-btn relative"
            aria-label="채팅"
            :class="{ 'icon-btn-active': chatPopupVisible }"
          >
            <svg fill="none" stroke="#4FA8D8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="width:22px;height:22px;">
              <path d="M21 3L12 12M21 3L14 21L12 12M21 3L3 10L12 12"/>
            </svg>
            <!-- ✅ unreadChatCount > 0 일 때만 점 표시 -->
            <span v-if="isLoggedIn && unreadChatCount > 0" class="chat-dot" />
          </button>

          <!-- 알림 버튼 → 모달 열기 -->
          <button @click="toggleNotificationModal" class="icon-btn relative" aria-label="알림">
            <svg fill="currentColor" viewBox="0 0 24 24" style="width:22px;height:22px;color:#4FA8D8;">
              <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"/>
            </svg>
            <span v-if="isLoggedIn && unreadCount > 0" class="badge">
              {{ unreadCount > 99 ? "99+" : unreadCount }}
            </span>
          </button>

          <!-- 마이페이지 -->
          <button @click="guardedNavigate('mypage')" class="profile-btn" aria-label="마이페이지">
            <div class="avatar">
              <img
                v-if="isLoggedIn && userProfileImage"
                :src="userProfileImage"
                alt="프로필"
                class="avatar-img"
              />
              <div v-else class="avatar-placeholder feed-avatar--ph">
                <svg class="avatar-placeholder-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z
                       M3.751 20.105a8.25 8.25 0 0116.498 0
                       .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5
                       c-2.786 0-5.433-.608-7.812-1.7
                       a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </button>

          <!-- 로그아웃/로그인 -->
          <button v-if="isLoggedIn" @click="onLogout" class="text-btn">로그아웃</button>
          <button v-else @click="onNavigate('login')" class="btn-primary">로그인</button>
        </div>
      </div>
    </div>
  </header>

  <!-- ✅ @open 추가 -->
  <ChatPopupComponent
    :visible="chatPopupVisible && isLoggedIn"
    :target-dm-user-id="targetDmUserId"
    @close="chatPopupVisible = false"
    @open="chatPopupVisible = true"
    @dm-opened="targetDmUserId = null"
  />

  <!-- 알림 모달 -->
  <NotificationModalComponent
    :visible="notificationModalVisible && isLoggedIn"
    :on-navigate="onNavigate"
    @close="notificationModalVisible = false"
  />
</template>

<script>
import axios from 'axios';
import { EventSourcePolyfill } from 'event-source-polyfill';
import LogoComponent from './user/LogoComponent.vue';
import {
  notificationUnreadCount,
  setNotificationUnreadCount,
  incrementNotificationUnread,
  NOTIFICATION_UNREAD_CHANGED,
} from '@/store/notificationStore.js';
import ChatPopupComponent from './chat/ChatPopupComponent.vue';
import NotificationModalComponent from './crew/NotificationModalComponent.vue';
import { OPEN_DM_CHAT } from '@/store/chatStore.js';

const API_BASE = process.env.VUE_APP_API_BASE_URL;

function getRoleFromToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || payload.roles || payload.auth || null;
  } catch {
    return null;
  }
}

export default {
  name: 'HeaderComponent',
  components: { LogoComponent, ChatPopupComponent, NotificationModalComponent },
  props: {
    isLoggedIn: Boolean,
    onNavigate: Function,
    onLogout: Function,
  },
  data() {
    return {
      eventSource: null,
      unreadCount: 0,
      userInitial: '나',
      userProfileImage: null,
      unreadChatCount: 0,
      chatPopupVisible: false,
      targetDmUserId: null,
      notificationModalVisible: false,
      // ✅ WebSocket 관련
      chatStompClient: null,
      chatRoomSubscriptions: {}, // { roomId: subscription } - 중복 구독 방지
    };
  },
  computed: {
    isAdminRole() {
      const role = getRoleFromToken();
      if (!role) return false;
      if (Array.isArray(role)) return role.some(r => String(r).includes('ADMIN'));
      return role === 'ROLE_ADMIN' || role === 'ADMIN';
    },
  },
  watch: {
    isLoggedIn: {
      immediate: true,
      async handler(loggedIn) {
        if (loggedIn) {
          await this.refreshTokenIfNeeded();
          this.connectNotificationSSE();
          this.fetchNotificationUnreadCount();
          this.fetchUserProfile();
          // ✅ 로그인 시 채팅 WebSocket 연결 (팝업 닫혀도 항상 유지)
          this.connectChatWebSocket();
        } else {
          this.disconnectNotificationSSE();
          this.disconnectChatWebSocket();
          setNotificationUnreadCount(0);
          this.userInitial = '나';
          this.userProfileImage = null;
          this.unreadChatCount = 0;
          this.chatPopupVisible = false;
          this.targetDmUserId = null;
        }
      },
    },
  },
  mounted() {
    this.unreadCount = notificationUnreadCount.value;

    this._boundSyncUnreadCount = () => {
      this.unreadCount = notificationUnreadCount.value;
    };
    window.addEventListener(NOTIFICATION_UNREAD_CHANGED, this._boundSyncUnreadCount);

    // ✅ chat-unread-changed: 읽음 처리 후 정확한 수 반영
    this._boundSyncChatUnread = () => { this.fetchUnreadChatCount(); };
    window.addEventListener('chat-unread-changed', this._boundSyncChatUnread);

    // ✅ chat-rooms-updated: 새 방 생성 시 추가 구독
    this._boundRoomsUpdated = (e) => {
      const roomIds = e.detail?.roomIds || [];
      roomIds.forEach(roomId => this.subscribeChatRoom(roomId));
    };
    window.addEventListener('chat-rooms-updated', this._boundRoomsUpdated);

    // ✅ OPEN_DM_CHAT 이벤트
    this._boundOpenDmChat = (e) => {
      if (!this.isLoggedIn) return;
      const { userId, crewId } = e.detail || {};
      if (!userId || !crewId) return;
      this.targetDmUserId = userId;
      this.chatPopupVisible = true;
    };
    window.addEventListener(OPEN_DM_CHAT, this._boundOpenDmChat);
  },
  beforeUnmount() {
    this.disconnectNotificationSSE();
    this.disconnectChatWebSocket();
    window.removeEventListener(NOTIFICATION_UNREAD_CHANGED, this._boundSyncUnreadCount);
    window.removeEventListener('chat-unread-changed', this._boundSyncChatUnread);
    window.removeEventListener('chat-rooms-updated', this._boundRoomsUpdated);
    window.removeEventListener(OPEN_DM_CHAT, this._boundOpenDmChat);
  },
  methods: {
    async refreshTokenIfNeeded() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (Date.now() >= payload.exp * 1000) {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) return;
          const res = await axios.post(`${API_BASE}/user/refresh-at`, { refreshToken });
          localStorage.setItem('token', res.data.accessToken);
        }
      } catch { /* 갱신 실패 시 무시 */ }
    },

    toggleNotificationModal() {
      if (!this.isLoggedIn) {
        this.onNavigate('login');
        return;
      }
      this.notificationModalVisible = !this.notificationModalVisible;
      if (this.notificationModalVisible) {
        this.unreadCount = 0;
        setNotificationUnreadCount(0);
      }
    },

    toggleChatPopup() {
      if (!this.isLoggedIn) {
        this.onNavigate('login');
        return;
      }
      this.chatPopupVisible = !this.chatPopupVisible;
      if (this.chatPopupVisible) {
        // ✅ 팝업 열 때 점 즉시 제거
        this.unreadChatCount = 0;
        this.targetDmUserId = null;
      }
    },

    // ✅ API 재조회로 정확한 읽지 않은 수 반영
    async fetchUnreadChatCount() {
      try {
        const { data } = await axios.get(`${API_BASE}/chat/my/all`);
        const list = Array.isArray(data) ? data : [];
        this.unreadChatCount = list.reduce((sum, room) => sum + (room.unReadCount || 0), 0);
      } catch {
        this.unreadChatCount = 0;
      }
    },

    async fetchUserProfile() {
      try {
        const { data } = await axios.get(`${API_BASE}/user/info-from`);
        const nickname = data.nickname || data.email || '';
        this.userInitial = nickname.charAt(0) || '나';
        this.userProfileImage = data.profileImageUrl || null;
      } catch { /* 기본값 유지 */ }
    },

    guardedNavigate(page) {
      if (!this.isLoggedIn) {
        this.onNavigate('login');
      } else {
        this.onNavigate(page);
      }
    },

    // ✅ 채팅 WebSocket 연결 - 팝업 닫혀도 항상 유지
    async connectChatWebSocket() {
      if (this.chatStompClient) return;
      const token = localStorage.getItem('token');
      if (!token) return;

      // 전체 방 목록 조회
      let roomIds = [];
      try {
        const { data } = await axios.get(`${API_BASE}/chat/my/all`);
        const list = Array.isArray(data) ? data : [];
        roomIds = list.map(r => r.roomId);
        this.unreadChatCount = list.reduce((sum, r) => sum + (r.unReadCount || 0), 0);
      } catch {
        return;
      }

      const SockJS = (await import('sockjs-client')).default;
      const Stomp  = (await import('webstomp-client')).default;

      const socket = new SockJS(`${API_BASE}/connect`);
      this.chatStompClient = Stomp.over(socket);
      this.chatStompClient.debug = () => {};

      this.chatStompClient.connect(
        { Authorization: `Bearer ${token}` },
        () => {
          // ✅ 로그인 시점의 전체 방 구독
          roomIds.forEach(roomId => this.subscribeChatRoom(roomId));
        },
        () => {
          this.chatStompClient = null;
          this.chatRoomSubscriptions = {};
        }
      );
    },

    // ✅ 개별 방 구독 (중복 구독 방지)
    subscribeChatRoom(roomId) {
      if (!this.chatStompClient?.connected) return;
      if (this.chatRoomSubscriptions[roomId]) return; // 이미 구독 중이면 스킵

      const token = localStorage.getItem('token');
      const sub = this.chatStompClient.subscribe(
        `/topic/${roomId}`,
        () => {
          // ✅ 팝업이 닫혀있을 때만 unreadCount 증가
          if (!this.chatPopupVisible) {
            this.unreadChatCount += 1;
          }
        },
        { Authorization: `Bearer ${token}` }
      );
      this.chatRoomSubscriptions[roomId] = sub;
    },

    disconnectChatWebSocket() {
      if (this.chatStompClient?.connected) {
        this.chatStompClient.disconnect();
      }
      this.chatStompClient = null;
      this.chatRoomSubscriptions = {};
    },

    async connectNotificationSSE() {
      if (this.eventSource) return;

      let token = localStorage.getItem('token');
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (Date.now() >= payload.exp * 1000) {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) return;
          const res = await axios.post(`${API_BASE}/user/refresh-at`, { refreshToken });
          localStorage.setItem('token', res.data.accessToken);
          token = res.data.accessToken;
        }
      } catch {
        return;
      }

      this.eventSource = new EventSourcePolyfill(`${API_BASE}/notifications/connect`, {
        headers: { Authorization: `Bearer ${token}` },
        heartbeatTimeout: 60000,
      });

      this.eventSource.addEventListener('notification', () => {
        incrementNotificationUnread();
      });

      this.eventSource.onerror = async () => {
        this.eventSource.close();
        this.eventSource = null;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) return;
          const res = await axios.post(`${API_BASE}/user/refresh-at`, { refreshToken });
          localStorage.setItem('token', res.data.accessToken);
        } catch {
          return;
        }

        setTimeout(() => {
          this.connectNotificationSSE();
        }, 3000);
      };
    },

    disconnectNotificationSSE() {
      if (!this.eventSource) return;
      this.eventSource.close();
      this.eventSource = null;
      axios.delete(`${API_BASE}/notifications/disconnect`).catch(() => {});
    },

    async fetchNotificationUnreadCount() {
      try {
        const { data } = await axios.get(`${API_BASE}/notifications/list`);
        const list = Array.isArray(data) ? data : [];
        const count = list.filter(n => !(n.isRead === true || n.read === true)).length;
        setNotificationUnreadCount(count);
      } catch {
        setNotificationUnreadCount(0);
      }
    },
  },
};
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable.css');

.chat-dot {
  position: absolute;
  top: 1px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: linear-gradient(135deg, #4FA8D8, #6BB8E0);
  box-shadow: 0 4px 8px rgba(79, 168, 216, 0.45);
  border: 1.5px solid white;
}

.header-glass {
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(229, 231, 235, 0.7);
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.06);
}

.tagline-text {
  font-family: Pretendard, Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: rgba(17, 24, 39, 0.78);
  position: relative;
  padding: 6px 10px;
}
.tagline-text::after {
  content: '';
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 3px;
  height: 8px;
  border-radius: 9999px;
  background: linear-gradient(90deg, rgba(79,168,216,0), rgba(79,168,216,0.22), rgba(79,168,216,0));
}

.icon-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 160ms ease, transform 160ms ease;
}
.icon-btn:hover { background: rgba(17, 24, 39, 0.04); transform: translateY(-1px); }
.icon-btn:active { transform: translateY(0px); }

.icon-btn-active {
  background: rgba(79, 168, 216, 0.1) !important;
  transform: translateY(0) !important;
}

.badge {
  position: absolute;
  top: 1px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #4FA8D8, #6BB8E0);
  box-shadow: 0 8px 18px rgba(79, 168, 216, 0.35);
}

.profile-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 160ms ease;
}
.profile-btn:hover { background: rgba(17, 24, 39, 0.04); }

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 800;
  font-size: 0.95rem;
  background: transparent;
  box-shadow: none;
}
.avatar-img { width: 100%; height: 100%; border-radius: 9999px; object-fit: cover; }
.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-placeholder-icon { width: 18px; height: 18px; color: rgba(255,255,255,0.92); }

.btn-primary {
  margin-left: 4px;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #4FA8D8, #6BB8E0);
  transition: transform 160ms ease, filter 160ms ease;
  box-shadow: 0 12px 26px rgba(79, 168, 216, 0.28);
}
.btn-primary:hover { transform: translateY(-1px); filter: brightness(1.02); }
.btn-primary:active { transform: translateY(0px); }

.text-btn {
  margin-left: 4px;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #4b5563;
  transition: background-color 160ms ease, color 160ms ease;
}
.text-btn:hover { color: #111827; background: rgba(17, 24, 39, 0.04); }

.btn-admin {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 12px;
  color: #fff;
  font-weight: 800;
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
  box-shadow: 0 12px 26px rgba(124, 58, 237, 0.22);
  transition: transform 160ms ease, filter 160ms ease;
}
.btn-admin:hover { transform: translateY(-1px); filter: brightness(1.02); }
.btn-admin:active { transform: translateY(0px); }
</style>