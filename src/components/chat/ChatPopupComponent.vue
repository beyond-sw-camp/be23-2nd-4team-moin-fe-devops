<template>
  <Teleport to="body">
    <Transition name="popup">
      <div
        v-if="visible"
        class="chat-popup-wrapper"
        :style="wrapperStyle"
      >
        <template v-if="!isMinimized">
          <div class="rz rz-n"  @mousedown.stop="startResize($event, 'n')" />
          <div class="rz rz-s"  @mousedown.stop="startResize($event, 's')" />
          <div class="rz rz-w"  @mousedown.stop="startResize($event, 'w')" />
          <div class="rz rz-e"  @mousedown.stop="startResize($event, 'e')" />
          <div class="rz rz-nw" @mousedown.stop="startResize($event, 'nw')" />
          <div class="rz rz-ne" @mousedown.stop="startResize($event, 'ne')" />
          <div class="rz rz-sw" @mousedown.stop="startResize($event, 'sw')" />
          <div class="rz rz-se" @mousedown.stop="startResize($event, 'se')" />
        </template>

        <div class="chat-popup" :class="{ minimized: isMinimized }">

          <!-- 헤더 -->
          <div
            class="popup-header"
            @mousedown="startDrag"
            @touchstart.passive="startDragTouch"
            @dblclick="toggleMaximize"
          >
            <div class="popup-header-left">
              <button v-if="currentRoom" @click.stop="backToList" class="back-btn-hd">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
              </button>
              <div v-else class="popup-icon">
                <svg fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round"
                  stroke-linejoin="round" viewBox="0 0 24 24" width="14" height="14">
                  <path d="M21 3L12 12M21 3L14 21L12 12M21 3L3 10L12 12"/>
                </svg>
              </div>
              <span class="popup-title">{{ currentRoom ? currentRoom.roomName : '채팅' }}</span>
              <span v-if="currentRoom && currentRoom.memberCount" class="hd-chip">{{ currentRoom.memberCount }}명</span>
              <span v-if="!currentRoom && totalUnread > 0" class="unread-badge">{{ totalUnread > 99 ? '99+' : totalUnread }}</span>
            </div>

            <div class="win-btns">
              <button class="win-btn win-btn--min" @click.stop="toggleMinimize" title="최소화">
                <svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor">
                  <rect x="1" y="5.5" width="10" height="1.5" rx="0.5"/>
                </svg>
              </button>
              <button class="win-btn win-btn--max" @click.stop="toggleMaximize" :title="isMaximized ? '원래 크기' : '최대화'">
                <svg v-if="!isMaximized" viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="1.5" y="1.5" width="9" height="9" rx="1"/>
                </svg>
                <svg v-else viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="1.5" width="7.5" height="7.5" rx="1"/>
                  <path d="M1.5 3.5V10.5H8.5" stroke-linecap="round"/>
                </svg>
              </button>
              <button class="win-btn win-btn--close" @click.stop="$emit('close')" title="닫기">
                <svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor">
                  <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 바디 -->
          <div v-show="!isMinimized" class="popup-body">
            <div v-if="dmLoading" class="dm-loading-overlay">
              <div class="spinner"></div>
              <p>채팅방을 여는 중...</p>
            </div>

            <!-- 채팅방 목록 -->
            <div v-else-if="!currentRoom" class="list-view">
              <div class="search-wrap">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="color:#94a3b8;flex-shrink:0">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <input v-model="searchQuery" placeholder="채팅방 검색..." class="search-input" />
              </div>
              <div class="tabs">
                <button v-for="tab in tabs" :key="tab.value" @click="onTabChange(tab.value)"
                  :class="['tab-btn', activeTab === tab.value ? 'active' : '']">
                  {{ tab.label }}
                  <span v-if="getUnreadCount(tab.value) > 0" class="tab-badge">{{ getUnreadCount(tab.value) }}</span>
                </button>
              </div>
              <div class="room-list" v-if="!loadingList">
                <div v-if="filteredRooms.length === 0" class="empty-state">
                  <div class="empty-icon-wrap">
                    <div class="empty-icon-circle">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="empty-icon-svg empty-icon-bubble">
                        <path fill="#4FA8D8" d="M20 2H4C2.9 2 2 2.9 2 4v11c0 1.1.9 2 2 2h3.2L10 21l2.8-4H20c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                        <circle cx="8" cy="10.5" r="1.4" fill="#fff"/>
                        <circle cx="12" cy="10.5" r="1.4" fill="#fff"/>
                        <circle cx="16" cy="10.5" r="1.4" fill="#fff"/>
                      </svg>
                    </div>
                  </div>
                  <p>채팅방이 없습니다</p>
                </div>
                <div
                  v-for="room in filteredRooms"
                  :key="room.roomId"
                  @click="enterRoom(room)"
                  @contextmenu.prevent="room.isGroupChat === 'N' ? showContextMenu($event, room) : null"
                  class="room-item"
                >
                  <div class="room-avatar-wrap">
                    <div class="room-avatar">
                      <img v-if="room.chatRoomImage" :src="room.chatRoomImage" :alt="room.roomName" class="fill-img" />
                      <svg v-else-if="isGroupRoom(room)" fill="currentColor" viewBox="0 0 24 24" width="20" height="20" class="room-avatar-icon">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                      </svg>
                      <svg v-else fill="currentColor" viewBox="0 0 24 24" width="20" height="20" class="room-avatar-icon">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                      </svg>
                    </div>
                    <div v-if="room.unReadCount > 0" class="unread-dot-badge">{{ room.unReadCount > 99 ? '99+' : room.unReadCount }}</div>
                  </div>
                  <div class="room-info">
                    <div class="room-info-top">
                      <div class="room-name-wrap">
                        <span :class="['room-name', room.unReadCount > 0 ? 'bold' : '']">{{ room.roomName }}</span>
                        <span v-if="room.isGroupChat === 'Y' && room.memberCount" class="member-chip">{{ room.memberCount }}</span>
                      </div>
                      <span class="room-time">{{ formatTimeAgo(room.lastMessageTime) }}</span>
                    </div>
                    <p :class="['room-preview', room.unReadCount > 0 ? 'preview-bold' : '']">
                      {{ room.lastMessageContent || '사진을 보냈습니다.' }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="list-loading"><div class="spinner"></div></div>
            </div>

            <!-- 채팅방 상세 -->
            <ChatRoomComponent
              v-else
              :room-id="currentRoom.roomId"
              :room-name="currentRoom.roomName"
              :member-count="currentRoom.memberCount"
              @back="backToList"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- 우클릭 컨텍스트 메뉴 -->
  <Teleport to="body">
    <div
      v-if="contextMenu.visible"
      class="ctx-menu"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      @click.stop
    >
      <button class="ctx-item ctx-item--danger" @click="openLeaveConfirm(contextMenu.room)">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        채팅방 나가기
      </button>
    </div>
  </Teleport>

  <!-- 채팅방 나가기 확인 모달 -->
  <Teleport to="body">
    <div v-if="leaveConfirmDialog" class="ctx-overlay" @click="leaveConfirmDialog = false">
      <div class="ctx-modal" @click.stop>
        <h3 class="ctx-modal-title">채팅방 나가기</h3>
        <p class="ctx-modal-desc">채팅방을 나가시겠습니까?<br/>나가면 대화 내용이 삭제됩니다.</p>
        <div class="ctx-modal-btns">
          <button class="ctx-modal-cancel" @click="leaveConfirmDialog = false">취소</button>
          <button class="ctx-modal-confirm" @click="confirmLeave">나가기</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import axios from 'axios';
import ChatRoomComponent from './ChatRoomComponent.vue';
import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';
import { OPEN_DM_CHAT } from '@/store/chatStore.js';
import dayjs from '@/plugins/dayjs'; // ✅ [추가] UTC→KST 변환을 위한 dayjs import

const API_BASE = process.env.VUE_APP_API_BASE_URL;

const RZ        = 5;
const HEADER_H  = 42;
const MIN_W     = 300;
const MIN_H     = 400;
const DEFAULT_W = 370;
const DEFAULT_H = 580;

export default {
  name: 'ChatPopupComponent',
  components: { ChatRoomComponent },
  props: {
    visible:        { type: Boolean,          default: false },
    targetDmUserId: { type: [Number, String], default: null  },
    targetDmCrewId: { type: [Number, String], default: null  },
  },
  emits: ['close', 'dm-opened', 'open'],
  data() {
    return {
      isMinimized:    false,
      isMaximized:    false,
      prevSize:       null,
      currentRoom:    null,
      dmLoading:      false,

      // ✅ 팝업이 닫혀있을 때 DM 요청을 임시 보관
      pendingDmUserId: null,
      pendingDmCrewId: null,

      pos:  { x: window.innerWidth - DEFAULT_W - 24, y: window.innerHeight - DEFAULT_H - 24 },
      size: { w: DEFAULT_W, h: DEFAULT_H },

      dragging:   false,
      dragOffset: { x: 0, y: 0 },

      resizing:    false,
      resizeDir:   '',
      resizeStart: { mx: 0, my: 0, w: 0, h: 0, px: 0, py: 0 },

      searchQuery: '',
      activeTab:   'all',
      tabs: [
        { value: 'all',  label: '전체' },
        { value: 'crew', label: '크루' },
        { value: 'dm',   label: '1:1'  },
      ],
      allList:     [],
      crewList:    [],
      dmList:      [],
      loadingList: false,

      contextMenu: { visible: false, x: 0, y: 0, room: null },
      leaveConfirmDialog: false,
      leaveTargetRoom:    null,
      stompClient:        null,
      roomSubscriptions:  {},
    };
  },

  computed: {
    wrapperStyle() {
      const pad = this.isMinimized ? 0 : RZ;
      return {
        position:  'fixed',
        left:      `${this.pos.x - pad}px`,
        top:       `${this.pos.y - pad}px`,
        width:     `${this.size.w + pad * 2}px`,
        height:    this.isMinimized ? `${HEADER_H}px` : `${this.size.h + pad * 2}px`,
        padding:   `${pad}px`,
        boxSizing: 'border-box',
        zIndex:    9999,
        transition: (this.dragging || this.resizing)
          ? 'none'
          : 'height 200ms cubic-bezier(.4,0,.2,1)',
      };
    },
    totalUnread() {
      return this.allList.reduce((s, r) => s + (r.unReadCount || 0), 0);
    },
    filteredRooms() {
      const list = this.activeTab === 'crew' ? this.crewList
                 : this.activeTab === 'dm'   ? this.dmList : this.allList;
      const q = this.searchQuery.toLowerCase();
      const filtered = q ? list.filter(r => r.roomName.toLowerCase().includes(q)) : [...list];
      return filtered.sort((a, b) => {
        // ✅ [수정] new Date() → dayjs.utc()로 교체: UTC 문자열을 명확히 파싱
        const tA = a.lastMessageTime ? dayjs.utc(a.lastMessageTime).valueOf() : 0;
        const tB = b.lastMessageTime ? dayjs.utc(b.lastMessageTime).valueOf() : 0;
        return tB - tA;
      });
    },
  },

  watch: {
    visible(v) {
      if (v) {
        this.isMinimized = false;
        this.isMaximized = false;
        this.resetPosition();

        // ✅ 이벤트로 들어온 pending DM 처리 우선
        if (this.pendingDmUserId && this.pendingDmCrewId) {
          this.openDmRoom(this.pendingDmUserId, this.pendingDmCrewId);
          this.pendingDmUserId = null;
          this.pendingDmCrewId = null;
        } else if (this.targetDmUserId && this.targetDmCrewId) {
          this.openDmRoom(this.targetDmUserId, this.targetDmCrewId);
        } else {
          this.fetchAllRooms();
        }
      } else {
        this.currentRoom = null;
        this.dmLoading   = false;
        this.disconnectWebSocket();
      }
    },
    targetDmUserId(userId) {
      if (userId && this.visible) this.openDmRoom(userId, this.targetDmCrewId);
    },
  },

  mounted() {
    window.addEventListener('resize', this.onWindowResize);
    document.addEventListener('click', this.hideContextMenu);
    // ✅ 전역 DM 이벤트 수신 등록
    window.addEventListener(OPEN_DM_CHAT, this.onOpenDmChatEvent);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
    document.removeEventListener('click', this.hideContextMenu);
    window.removeEventListener(OPEN_DM_CHAT, this.onOpenDmChatEvent);
    this.removeDragListeners();
    this.removeResizeListeners();
    this.disconnectWebSocket();
  },

  methods: {
    // ✅ 전역 DM 이벤트 핸들러
    onOpenDmChatEvent(event) {
      const { userId, crewId } = event.detail || {};
      if (!userId || !crewId) return;

      if (this.visible) {
        // 팝업이 이미 열려있으면 바로 DM방 열기
        this.openDmRoom(userId, crewId);
      } else {
        // 팝업이 닫혀있으면 pending 저장 후 부모에게 열기 요청
        this.pendingDmUserId = userId;
        this.pendingDmCrewId = crewId;
        this.$emit('open'); // 부모: chatVisible = true
      }
    },

    showContextMenu(e, room) {
      e.stopPropagation();
      const menuW = 160, menuH = 40;
      this.contextMenu = {
        visible: true,
        x: Math.min(e.clientX, window.innerWidth - menuW),
        y: Math.min(e.clientY, window.innerHeight - menuH),
        room,
      };
    },

    hideContextMenu() {
      this.contextMenu.visible = false;
    },

    openLeaveConfirm(room) {
      this.leaveTargetRoom = room;
      this.leaveConfirmDialog = true;
      this.hideContextMenu();
    },

    async confirmLeave() {
      if (!this.leaveTargetRoom) return;
      try {
        await axios.delete(`${API_BASE}/chat/room/private/${this.leaveTargetRoom.roomId}/leave`);
        this.allList = this.allList.filter(r => r.roomId !== this.leaveTargetRoom.roomId);
        this.dmList  = this.dmList.filter(r => r.roomId !== this.leaveTargetRoom.roomId);
      } catch (e) {
        const status = e.response?.status;
        const msg    = e.response?.data?.message;
        if (status === 400 && msg) alert(msg);
        else if (status === 500 || !msg) alert('채팅방 나가기에 실패했습니다. 잠시 후 다시 시도해주세요.');
        else alert(msg);
      } finally {
        this.leaveConfirmDialog = false;
        this.leaveTargetRoom = null;
      }
    },

    // ✅ crewId 파라미터 추가 + JSON body로 전송
    async openDmRoom(userId, crewId) {
      if (!userId || !crewId) {
        console.warn('[ChatPopup] openDmRoom: userId 또는 crewId 누락', { userId, crewId });
        return;
      }
      this.dmLoading = true;
      this.currentRoom = null;

      try {
        // ✅ JSON body로 전송 (백엔드 @RequestBody PrivateRoomCreateDto에 맞춤)
        const { data } = await axios.post(
          `${API_BASE}/chat/room/private/create`,
          {
            otherMemberId: userId,
            crewId: crewId,
          }
        );

        const roomId = data.roomId;
        const roomName = data.roomName;

        // ✅ 방 생성/조회 후 최신 목록 다시 fetch
        await this.fetchAllRooms();

        // ✅ 최신 목록에서 방 찾기, 없으면(메시지 없는 새 방) 백엔드에서 받은 roomName 사용
        const found = this.allList.find(r => r.roomId === roomId);
        this.currentRoom = found || { roomId, roomName, memberCount: null, isGroupChat: 'N' };
        this.$emit('dm-opened');
      } catch (e) {
        const msg = e.response?.data?.message;
        if (msg) alert(msg);
        else console.error('[ChatPopupComponent] DM방 열기 실패:', e);
      } finally {
        this.dmLoading = false;
      }
    },

    connectWebSocket() {
      if (this.stompClient) return;
      const token = localStorage.getItem('token');
      if (!token) return;

      const socket = new SockJS(`${API_BASE}/connect`);
      this.stompClient = Stomp.over(socket);
      this.stompClient.debug = () => {};

      this.stompClient.connect(
        { Authorization: `Bearer ${token}` },
        () => {
          this.allList.forEach(room => this.subscribeRoom(room.roomId));
        },
        (err) => {
          console.error('[ChatPopup] WS 연결 실패:', err);
          this.stompClient = null;
        }
      );
    },

    disconnectWebSocket() {
      if (this.stompClient?.connected) this.stompClient.disconnect();
      this.stompClient = null;
      this.roomSubscriptions = {};
    },

    subscribeRoom(roomId) {
      if (!this.stompClient || this.roomSubscriptions[roomId]) return;
      const token = localStorage.getItem('token');
      const sub = this.stompClient.subscribe(
        `/topic/${roomId}`,
        (frame) => this.onNewMessage(roomId, JSON.parse(frame.body)),
        { Authorization: `Bearer ${token}` }
      );
      this.roomSubscriptions[roomId] = sub;
    },

    onNewMessage(roomId, msg) {
      if (this.currentRoom?.roomId === roomId) return;
      const updateList = (list) => {
        const room = list.find(r => r.roomId === roomId);
        if (!room) return;
        room.unReadCount = (room.unReadCount || 0) + 1;
        room.lastMessageContent = msg.messageType === 'IMAGE'
          ? '사진을 보냈습니다.'
          : (msg.message || '사진을 보냈습니다.');
        // ✅ new Date().toISOString()은 이미 UTC 형식이므로 그대로 유지
        room.lastMessageTime = new Date().toISOString();
      };
      updateList(this.allList);
      updateList(this.crewList);
      updateList(this.dmList);
      window.dispatchEvent(new CustomEvent('chat-unread-changed'));
    },

    resetPosition() {
      this.size = { w: DEFAULT_W, h: DEFAULT_H };
      this.pos  = {
        x: window.innerWidth  - DEFAULT_W - 24,
        y: window.innerHeight - DEFAULT_H - 24,
      };
    },

    onWindowResize() {
      if (this.isMaximized) this.applyMaximize();
      else this.clampPosition();
    },

    clampPosition() {
      const h = this.isMinimized ? HEADER_H : this.size.h;
      this.pos.x = Math.min(Math.max(-(this.size.w - 100), this.pos.x), window.innerWidth - 100);
      this.pos.y = Math.min(Math.max(0, this.pos.y), window.innerHeight - h);
    },

    toggleMinimize() {
      if (this.isMaximized) {
        this.isMaximized = false;
        if (this.prevSize) {
          this.pos  = { ...this.prevSize.pos };
          this.size = { ...this.prevSize.size };
          this.prevSize = null;
        }
      }
      this.isMinimized = !this.isMinimized;
    },

    toggleMaximize() {
      if (this.isMinimized) { this.isMinimized = false; return; }
      if (this.isMaximized) {
        this.isMaximized = false;
        if (this.prevSize) {
          this.pos  = { ...this.prevSize.pos };
          this.size = { ...this.prevSize.size };
          this.prevSize = null;
        }
      } else {
        this.prevSize = { pos: { ...this.pos }, size: { ...this.size } };
        this.isMaximized = true;
        this.applyMaximize();
      }
    },

    applyMaximize() {
      this.pos  = { x: 0, y: 0 };
      this.size = { w: window.innerWidth, h: window.innerHeight };
    },

    startDrag(e) {
      if (e.target.closest('button')) return;
      if (this.isMaximized) return;
      this.dragging   = true;
      this.dragOffset = { x: e.clientX - this.pos.x, y: e.clientY - this.pos.y };
      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup',   this.stopDrag);
      document.body.style.userSelect = 'none';
    },
    onDrag(e) {
      if (!this.dragging) return;
      this.pos.x = e.clientX - this.dragOffset.x;
      this.pos.y = e.clientY - this.dragOffset.y;
      this.clampPosition();
    },
    stopDrag() {
      this.dragging = false;
      document.body.style.userSelect = '';
      this.removeDragListeners();
    },
    removeDragListeners() {
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup',   this.stopDrag);
    },

    startDragTouch(e) {
      if (e.target.closest('button')) return;
      if (this.isMaximized) return;
      const t = e.touches[0];
      this.dragging   = true;
      this.dragOffset = { x: t.clientX - this.pos.x, y: t.clientY - this.pos.y };
      document.addEventListener('touchmove', this.onDragTouch, { passive: false });
      document.addEventListener('touchend',  this.stopDragTouch);
    },
    onDragTouch(e) {
      if (!this.dragging) return;
      e.preventDefault();
      const t = e.touches[0];
      this.pos.x = t.clientX - this.dragOffset.x;
      this.pos.y = t.clientY - this.dragOffset.y;
      this.clampPosition();
    },
    stopDragTouch() {
      this.dragging = false;
      document.removeEventListener('touchmove', this.onDragTouch);
      document.removeEventListener('touchend',  this.stopDragTouch);
    },

    startResize(e, dir) {
      if (this.isMaximized) return;
      this.resizing  = true;
      this.resizeDir = dir;
      this.resizeStart = {
        mx: e.clientX, my: e.clientY,
        w: this.size.w, h: this.size.h,
        px: this.pos.x, py: this.pos.y,
      };
      document.addEventListener('mousemove', this.onResize);
      document.addEventListener('mouseup',   this.stopResize);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = this.getCursor(dir);
    },
    onResize(e) {
      if (!this.resizing) return;
      this.applyResize(e.clientX - this.resizeStart.mx, e.clientY - this.resizeStart.my);
    },
    stopResize() {
      this.resizing = false;
      document.body.style.userSelect = '';
      document.body.style.cursor     = '';
      this.removeResizeListeners();
    },
    removeResizeListeners() {
      document.removeEventListener('mousemove', this.onResize);
      document.removeEventListener('mouseup',   this.stopResize);
    },

    applyResize(dx, dy) {
      const { w, h, px, py } = this.resizeStart;
      const dir = this.resizeDir;
      let newW = w, newH = h, newX = px, newY = py;

      if (dir.includes('e')) newW = Math.max(MIN_W, w + dx);
      if (dir.includes('w')) { newW = Math.max(MIN_W, w - dx); newX = px + (w - newW); }
      if (dir.includes('s')) newH = Math.max(MIN_H, h + dy);
      if (dir.includes('n')) { newH = Math.max(MIN_H, h - dy); newY = py + (h - newH); }

      newY = Math.max(0, newY);
      newX = Math.max(-(newW - 100), Math.min(window.innerWidth - 100, newX));

      this.size.w = newW;
      this.size.h = newH;
      this.pos.x  = newX;
      this.pos.y  = newY;
    },

    getCursor(dir) {
      return { n:'n-resize', s:'s-resize', e:'e-resize', w:'w-resize',
               ne:'ne-resize', nw:'nw-resize', se:'se-resize', sw:'sw-resize' }[dir] || 'default';
    },

    async fetchAllRooms() {
      this.loadingList = true;
      try {
        const { data } = await axios.get(`${API_BASE}/chat/my/all`);
        this.allList = Array.isArray(data) ? data : [];
        this.connectWebSocket();
      } finally {
        this.loadingList = false;
      }
    },

    async onTabChange(tab) {
      this.activeTab = tab;
      if (tab === 'crew' && this.crewList.length === 0) {
        const { data } = await axios.get(`${API_BASE}/chat/my/groupRooms`);
        this.crewList = Array.isArray(data) ? data : [];
      } else if (tab === 'dm' && this.dmList.length === 0) {
        const { data } = await axios.get(`${API_BASE}/chat/my/privateRooms`);
        this.dmList = Array.isArray(data) ? data : [];
      }
    },

    getUnreadCount(tab) {
      const list = tab === 'crew' ? this.crewList : tab === 'dm' ? this.dmList : this.allList;
      return list.reduce((s, r) => s + (r.unReadCount || 0), 0);
    },

    isGroupRoom(room) {
      return room && (room.isGroupChat === 'Y' || room.isGroupChat === true);
    },

    enterRoom(room) {
      this.currentRoom = room;
      [this.allList, this.crewList, this.dmList].forEach(list => {
        const f = list.find(r => r.roomId === room.roomId);
        if (f) f.unReadCount = 0;
      });
    },

    backToList() {
      this.currentRoom = null;
      this.disconnectWebSocket();
      this.fetchAllRooms();
    },

    // ✅ [수정] formatTimeAgo: new Date() → dayjs.utc()로 교체
    // K8s 배포 후 서버에서 UTC 시간이 내려올 때 정확한 차이 계산을 위해
    // dayjs.utc(dt).valueOf()로 UTC 기준 ms 타임스탬프를 구하고
    // dayjs().valueOf()와 비교 (두 값 모두 ms 단위 절대값이므로 시간대 무관)
    formatTimeAgo(dt) {
      if (!dt) return '';
      const diff = Math.floor(
        (dayjs().valueOf() - dayjs.utc(dt).valueOf()) / 60000
      );
      if (diff < 1)  return '방금 전';
      if (diff < 60) return `${diff}분 전`;
      const h = Math.floor(diff / 60);
      if (h < 24)    return `${h}시간 전`;
      return `${Math.floor(h / 24)}일 전`;
    },
  },
};
</script>

<style scoped>
.ctx-menu {
  position: fixed;
  z-index: 99999;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,.12);
  overflow: hidden;
  min-width: 150px;
  animation: ctxIn 120ms ease;
}
@keyframes ctxIn {
  from { opacity: 0; transform: scale(.95) translateY(-4px); }
  to   { opacity: 1; transform: scale(1)  translateY(0); }
}
.ctx-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  font-size: .82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 120ms;
}
.ctx-item--danger { color: #EF4444; }
.ctx-item--danger:hover { background: #FEF2F2; }
.ctx-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(0,0,0,.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.ctx-modal {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 300px;
  box-shadow: 0 16px 48px rgba(0,0,0,.18);
}
.ctx-modal-title { font-size: 1rem; font-weight: 800; color: #111827; margin-bottom: 8px; }
.ctx-modal-desc  { font-size: .82rem; color: #6B7280; line-height: 1.6; margin-bottom: 20px; }
.ctx-modal-btns  { display: flex; gap: 10px; }
.ctx-modal-cancel {
  flex: 1; padding: 9px; border-radius: 10px;
  border: 1px solid #E5E7EB; font-size: .82rem;
  font-weight: 600; color: #6B7280;
  transition: background 140ms; cursor: pointer;
}
.ctx-modal-cancel:hover  { background: #F9FAFB; }
.ctx-modal-confirm {
  flex: 1; padding: 9px; border-radius: 10px;
  background: #EF4444; font-size: .82rem;
  font-weight: 700; color: #fff;
  transition: background 140ms; cursor: pointer;
}
.ctx-modal-confirm:hover { background: #DC2626; }
.chat-popup-wrapper { box-sizing: border-box; }
.chat-popup {
  width: 100%; height: 100%;
  border-radius: 12px;
  background: #F4F6F9;
  box-shadow: 0 20px 60px rgba(17,24,39,.18), 0 4px 16px rgba(59,130,246,.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.popup-enter-active { animation: popIn 240ms cubic-bezier(.34,1.56,.64,1); }
.popup-leave-active { animation: popOut 180ms ease-in forwards; }
@keyframes popIn  { from { opacity:0; transform:scale(.9) translateY(12px); transform-origin:bottom right; } to { opacity:1; transform:scale(1) translateY(0); } }
@keyframes popOut { from { opacity:1; transform:scale(1) translateY(0); transform-origin:bottom right; } to { opacity:0; transform:scale(.9) translateY(12px); } }
.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 0 10px;
  height: 42px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #3B82F6, #60A5FA);
  user-select: none;
  cursor: grab;
  border-radius: 12px 12px 0 0;
}
.popup-header:active { cursor: grabbing; }
.popup-header-left { display:flex; align-items:center; gap:7px; min-width:0; flex:1; overflow:hidden; }
.back-btn-hd {
  width:26px; height:26px; border-radius:6px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  color:rgba(255,255,255,.85); transition:background 140ms; cursor:pointer;
}
.back-btn-hd:hover { background:rgba(255,255,255,.2); }
.popup-icon {
  width:26px; height:26px; border-radius:6px; flex-shrink:0;
  background:rgba(255,255,255,.2);
  display:flex; align-items:center; justify-content:center;
}
.popup-title { font-size:.88rem; font-weight:800; color:#fff; letter-spacing:-.02em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.hd-chip { background:rgba(255,255,255,.2); color:#fff; font-size:10px; font-weight:700; border-radius:9999px; padding:1px 7px; flex-shrink:0; }
.unread-badge { background:#fff; color:#3B82F6; font-size:10px; font-weight:800; border-radius:9999px; padding:1px 7px; flex-shrink:0; }
.win-btns { display:flex; align-items:center; gap:2px; flex-shrink:0; margin-left:8px; }
.win-btn {
  width:28px; height:28px; border-radius:6px;
  display:flex; align-items:center; justify-content:center;
  color:rgba(255,255,255,.85); transition:background 140ms; cursor:pointer; flex-shrink:0;
}
.win-btn:hover { background:rgba(255,255,255,.2); color:#fff; }
.popup-body { flex:1; display:flex; flex-direction:column; overflow:hidden; }
.dm-loading-overlay {
  flex:1; display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  gap:12px; background:#fff; color:#64748b;
  font-size:13px; font-weight:600;
}
.list-view { display:flex; flex-direction:column; height:100%; overflow:hidden; background:#fff; }
.search-wrap { display:flex; align-items:center; gap:7px; padding:9px 12px 7px; border-bottom:1px solid #F0F4F8; }
.search-input { flex:1; font-size:.82rem; outline:none; color:#374151; background:transparent; }
.search-input::placeholder { color:#CBD5E1; }
.tabs { display:flex; border-bottom:1px solid #F0F4F8; }
.tab-btn { flex:1; height:36px; font-size:.78rem; font-weight:600; color:#94A3B8; border-bottom:2px solid transparent; transition:color 150ms, border-color 150ms; display:flex; align-items:center; justify-content:center; gap:4px; cursor:pointer; }
.tab-btn.active { color:#3B82F6; border-bottom-color:#3B82F6; }
.tab-badge { background:#3B82F6; color:#fff; font-size:9px; font-weight:800; border-radius:9999px; padding:0 5px; line-height:15px; }
.room-list { flex:1; overflow-y:auto; }
.room-list::-webkit-scrollbar { width:3px; }
.room-list::-webkit-scrollbar-thumb { background:#E2E8F0; border-radius:2px; }
.empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:36px 20px; color:#94A3B8; gap:8px; font-size:.82rem; }
.empty-icon-wrap { display:flex; justify-content:center; margin-bottom:12px; }
.empty-icon-circle { width:72px; height:72px; border-radius:50%; background:#EBF6FC; display:flex; align-items:center; justify-content:center; }
.empty-icon-circle .empty-icon-svg { width:36px; height:36px; }
.room-item { display:flex; align-items:center; gap:10px; padding:10px 12px; cursor:pointer; transition:background 140ms; border-bottom:1px solid #F8FAFC; }
.room-item:hover { background:#F8FAFC; }
.room-avatar-wrap { position:relative; flex-shrink:0; }
.room-avatar { width:44px; height:44px; border-radius:9999px; background:#d1d5db; display:flex; align-items:center; justify-content:center; color:#fff; overflow:hidden; }
.fill-img { width:100%; height:100%; object-fit:cover; }
.unread-dot-badge { position:absolute; top:-3px; right:-3px; background:#3B82F6; color:#fff; font-size:9px; font-weight:800; border-radius:9999px; min-width:17px; height:17px; display:flex; align-items:center; justify-content:center; padding:0 3px; border:1.5px solid #fff; }
.room-info { flex:1; min-width:0; }
.room-info-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:2px; }
.room-name-wrap { display:flex; align-items:center; gap:4px; min-width:0; }
.room-name { font-size:.82rem; font-weight:600; color:#1E293B; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.room-name.bold { font-weight:800; }
.member-chip { font-size:9px; background:#EFF6FF; color:#3B82F6; border:1px solid #BFDBFE; border-radius:9999px; padding:0 5px; flex-shrink:0; }
.room-time { font-size:9px; color:#94A3B8; flex-shrink:0; }
.room-preview { font-size:.75rem; color:#94A3B8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.room-preview.preview-bold { color:#374151; font-weight:600; }
.list-loading { display:flex; align-items:center; justify-content:center; padding:36px; }
.spinner { width:26px; height:26px; border:3px solid #E2E8F0; border-top-color:#3B82F6; border-radius:9999px; animation:spin .7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.rz { position:absolute; z-index:10; }
.rz-n  { top:0;    left:8px;  right:8px;  height:5px; cursor:n-resize;  }
.rz-s  { bottom:0; left:8px;  right:8px;  height:5px; cursor:s-resize;  }
.rz-w  { left:0;   top:8px;   bottom:8px; width:5px;  cursor:w-resize;  }
.rz-e  { right:0;  top:8px;   bottom:8px; width:5px;  cursor:e-resize;  }
.rz-nw { top:0; left:0;   width:10px; height:10px; cursor:nw-resize; }
.rz-ne { top:0; right:0;  width:10px; height:10px; cursor:ne-resize; }
.rz-sw { bottom:0; left:0;  width:10px; height:10px; cursor:sw-resize; }
.rz-se { bottom:0; right:0; width:10px; height:10px; cursor:se-resize; }
</style>