<template>
  <div class="crew-chat-wrap">

    <!-- 공지 배너 래퍼 -->
    <div v-if="latestNotice" class="notice-banner-wrap">

      <!-- 공지 배너 (접기/펼치기) -->
      <transition name="notice-slide">
        <div v-if="noticeBannerVisible" class="notice-banner">
          <div class="notice-banner-inner">
            <div class="notice-icon-wrap">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z"/>
              </svg>
            </div>
            <div class="notice-banner-body">
              <span class="notice-banner-label">공지사항</span>
              <p class="notice-banner-text">{{ latestNotice.message }}</p>
            </div>
            <button @click="noticeDropdownOpen = !noticeDropdownOpen" class="notice-more-btn">
              더보기
              <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                :style="{ transform: noticeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 220ms' }">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <button @click="noticeBannerVisible = false; noticeDropdownOpen = false" class="notice-collapse-btn" title="접기">
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/>
              </svg>
            </button>
          </div>

          <!-- 드롭다운: 배너 바로 아래 -->
          <transition name="dropdown-slide">
            <div v-if="noticeDropdownOpen" class="notice-dropdown">
              <div class="notice-dropdown-header">
                <span class="notice-dropdown-title">전체 공지 내역</span>
                <span class="notice-dropdown-count">{{ noticeMessages.length }}개</span>
              </div>
              <div class="notice-dropdown-body">
                <div v-if="noticeMessages.length === 0" class="notice-dropdown-empty">공지 내역이 없습니다</div>
                <div
                  v-for="(notice, index) in noticeMessages"
                  :key="notice.messageId"
                  class="notice-dropdown-item"
                  :class="{ 'is-latest': index === 0 }"
                >
                  <div class="notice-dropdown-item-meta">
                    <span class="notice-dropdown-tag" :class="index === 0 ? 'tag-new' : 'tag-old'">
                      {{ index === 0 ? '최신' : (index + 1) + '번째' }}
                    </span>
                    <span class="notice-dropdown-sender">{{ notice.senderNickname }}</span>
                  </div>
                  <p class="notice-dropdown-msg" :class="{ 'msg-latest': index === 0 }">{{ notice.message }}</p>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </transition>

      <!-- 배너 숨김 시 펼치기 탭 -->
      <transition name="fade">
        <div v-if="!noticeBannerVisible" class="notice-peek" @click="noticeBannerVisible = true">
          <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z"/>
          </svg>
          <span>공지 보기</span>
          <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </transition>

    </div>

    <!-- 메시지 영역 -->
    <div class="messages-wrap" ref="chatBox">
      <div v-if="isLoading" class="flex-center h-full">
        <div class="spinner"></div>
      </div>

      <div v-else>
        <div v-for="(msg, index) in messages" :key="index" class="mb-msg">

          <!-- 시스템 메시지 -->
          <div v-if="msg.messageType === 'ENTER' || msg.messageType === 'LEAVE'" class="sys-msg">
            <span>--- {{ msg.message }} ---</span>
          </div>

          <!-- NOTICE 공지 메시지 -->
          <div v-else-if="msg.messageType === 'NOTICE'">
            <div v-if="msg.senderEmail !== senderEmail" class="msg-row other">
              <img v-if="msg.senderProfileImage" :src="msg.senderProfileImage" class="feed-avatar" />
              <div v-else class="feed-avatar feed-avatar--ph">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
  <path
    fill-rule="evenodd"
    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z
       M3.751 20.105a8.25 8.25 0 0116.498 0
       .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5
       c-2.786 0-5.433-.608-7.812-1.7
       a.75.75 0 01-.437-.695z"
    clip-rule="evenodd"
  />
</svg>
              </div>
              <div class="msg-col" style="max-width:72%">
                <div class="sender-row">
                  <span class="sender-name">{{ msg.senderNickname }}</span>
                  <span class="notice-chip">
                    <svg width="9" height="9" fill="currentColor" viewBox="0 0 24 24"><path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z"/></svg>
                    공지
                  </span>
                </div>
                <div class="bubble bubble-notice-other">{{ msg.message }}</div>
                <span class="msg-time">{{ formatTime(msg.createdAt) }}</span>
              </div>
              <span v-if="msg.unreadCount > 0" class="unread-count">{{ msg.unreadCount }}</span>
            </div>
            <div v-else class="msg-row mine">
              <span v-if="msg.unreadCount > 0" class="unread-count">{{ msg.unreadCount }}</span>
              <div class="msg-col items-end" style="max-width:72%">
                <div class="sender-row justify-end">
                  <span class="notice-chip">
                    <svg width="9" height="9" fill="currentColor" viewBox="0 0 24 24"><path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z"/></svg>
                    공지
                  </span>
                </div>
                <div class="bubble bubble-notice-mine">{{ msg.message }}</div>
                <span class="msg-time">{{ formatTime(msg.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- 받은 메시지 (왼쪽) -->
          <div v-else-if="msg.senderEmail !== senderEmail" class="msg-row other">
            <img v-if="msg.senderProfileImage" :src="msg.senderProfileImage" class="feed-avatar" />
              <div v-else class="feed-avatar feed-avatar--ph">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
  <path
    fill-rule="evenodd"
    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z
       M3.751 20.105a8.25 8.25 0 0116.498 0
       .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5
       c-2.786 0-5.433-.608-7.812-1.7
       a.75.75 0 01-.437-.695z"
    clip-rule="evenodd"
  />
</svg>
              </div>
            <div class="msg-col" style="max-width:72%">
              <span class="sender-name" style="margin-bottom:4px;">{{ msg.senderNickname }}</span>
              <div class="bubble" :class="msg.imageUrls && msg.imageUrls.length && !msg.message ? 'bubble-img-only' : 'bubble-other'">
                <p v-if="msg.delYn === 'Y'" class="deleted-msg">삭제된 메시지입니다.</p>
                <template v-else>
                  <div v-if="msg.imageUrls && msg.imageUrls.length" class="img-carousel" @click.stop>
                    <img :src="msg.imageUrls[getCarouselIndex(msg.messageId)]" class="carousel-img"
                      @click="openImagePreview(msg.imageUrls, getCarouselIndex(msg.messageId))" />
                    <button v-if="msg.imageUrls.length > 1 && getCarouselIndex(msg.messageId) > 0"
                      class="carousel-arrow left" @click.stop="changeCarousel(msg.messageId, -1, msg.imageUrls.length)">
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
                      </svg>
                    </button>
                    <button v-if="msg.imageUrls.length > 1 && getCarouselIndex(msg.messageId) < msg.imageUrls.length - 1"
                      class="carousel-arrow right" @click.stop="changeCarousel(msg.messageId, 1, msg.imageUrls.length)">
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                    <span v-if="msg.imageUrls.length > 1" class="carousel-badge">
                      {{ getCarouselIndex(msg.messageId) + 1 }} / {{ msg.imageUrls.length }}
                    </span>
                  </div>
                  <p v-if="msg.message" class="msg-text">{{ msg.message }}</p>
                </template>
              </div>
              <span class="msg-time">{{ formatTime(msg.createdAt) }}</span>
            </div>
            <span v-if="msg.unreadCount > 0" class="unread-count">{{ msg.unreadCount }}</span>
          </div>

          <!-- 보낸 메시지 (오른쪽) -->
          <div v-else class="msg-row mine">
            <span v-if="msg.unreadCount > 0" class="unread-count">{{ msg.unreadCount }}</span>
            <div class="msg-col items-end" style="max-width:72%">
              <div class="bubble" :class="msg.imageUrls && msg.imageUrls.length && !msg.message ? 'bubble-img-only' : 'bubble-mine'"
                @contextmenu.prevent="handleContextMenu($event, msg)">
                <p v-if="msg.delYn === 'Y'" class="deleted-msg mine">삭제된 메시지입니다.</p>
                <template v-else>
                  <div v-if="msg.imageUrls && msg.imageUrls.length" class="img-carousel" @click.stop>
                    <img :src="msg.imageUrls[getCarouselIndex(msg.messageId)]" class="carousel-img"
                      @click="openImagePreview(msg.imageUrls, getCarouselIndex(msg.messageId))" />
                    <button v-if="msg.imageUrls.length > 1 && getCarouselIndex(msg.messageId) > 0"
                      class="carousel-arrow left" @click.stop="changeCarousel(msg.messageId, -1, msg.imageUrls.length)">
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
                      </svg>
                    </button>
                    <button v-if="msg.imageUrls.length > 1 && getCarouselIndex(msg.messageId) < msg.imageUrls.length - 1"
                      class="carousel-arrow right" @click.stop="changeCarousel(msg.messageId, 1, msg.imageUrls.length)">
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                    <span v-if="msg.imageUrls.length > 1" class="carousel-badge">
                      {{ getCarouselIndex(msg.messageId) + 1 }} / {{ msg.imageUrls.length }}
                    </span>
                  </div>
                  <p v-if="msg.message" class="msg-text white">
                    {{ msg.message }}
                    <span v-if="msg.editedYn === 'Y'" class="edited-tag mine">(수정됨)</span>
                  </p>
                </template>
              </div>
              <span class="msg-time">{{ formatTime(msg.createdAt) }}</span>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- 이미지 미리보기 바 -->
    <div v-if="selectedImages.length > 0" class="img-preview-bar">
      <div v-for="(img, index) in selectedImages" :key="index" class="img-preview-item">
        <img :src="img.preview" class="preview-thumb" />
        <button @click="removeImage(index)" class="preview-remove">
          <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 수정 모드 표시 -->
    <div v-if="isEditMode" class="mode-bar edit-bar">
      <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24" style="color:#F59E0B;flex-shrink:0">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
      </svg>
      <span style="color:#C2410C;font-weight:600;">메시지 수정 중</span>
      <button @click="cancelEdit" class="mode-cancel">취소</button>
    </div>

    <!-- 공지 모드 표시 -->
    <div v-if="isNoticeMode && !isEditMode" class="mode-bar notice-bar">
      <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24" style="color:#6B9EFF;flex-shrink:0">
        <path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z"/>
      </svg>
      <span style="color:#3A6FD8;font-weight:600;">공지 모드</span>
      <span style="color:#93C5FD;font-size:11px;">· 전송 시 공지로 등록됩니다</span>
    </div>

    <!-- 입력 영역 -->
    <div class="input-wrap">
      <button v-if="!isEditMode" @click="triggerFileInput" class="attach-btn">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color:#8FA3BF">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
      <input type="file" ref="fileInput" accept="image/*" multiple style="display:none" @change="handleFileSelect" />

      <input
        v-model="currentMessage"
        :placeholder="selectedImages.length > 0 ? '이미지 전송 모드 (텍스트 불가)' : isEditMode ? '수정할 메시지 입력...' : isNoticeMode ? '공지 내용 입력...' : '메시지를 입력하세요...'"
        class="msg-input"
        :class="{ 'notice-input': isNoticeMode, 'disabled-input': selectedImages.length > 0 }"
        :disabled="selectedImages.length > 0"
        @keyup.enter="isEditMode ? submitEditMessage() : sendMessage()"
      />

      <button @click="isEditMode ? submitEditMessage() : sendMessage()" class="send-btn">
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </button>

      <button v-if="!isEditMode && isNoticeAllowed" @click="isNoticeMode = !isNoticeMode"
        class="notice-toggle-btn" :class="{ active: isNoticeMode }">
        <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z"/>
        </svg>
        공지
      </button>
    </div>

    <!-- 이미지 전체보기 모달 -->
    <div v-if="imagePreviewDialog" class="img-modal" @click="imagePreviewDialog = false">
      <img :src="previewImageUrl" class="img-modal-img" @click.stop />
      <button v-if="previewImages.length > 1 && previewIndex > 0" class="img-modal-arrow left" @click.stop="changePreview(-1)">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <button v-if="previewImages.length > 1 && previewIndex < previewImages.length - 1" class="img-modal-arrow right" @click.stop="changePreview(1)">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
      <span v-if="previewImages.length > 1" class="img-modal-badge">
        {{ previewIndex + 1 }} / {{ previewImages.length }}
      </span>
      <button @click="imagePreviewDialog = false" class="img-modal-close">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- 우클릭 컨텍스트 메뉴 -->
    <div v-if="contextMenu.visible" class="ctx-menu"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }" @click.stop>
      <template v-if="contextMenu.msg && (!contextMenu.msg.imageUrls || !contextMenu.msg.imageUrls.length)">
        <button @click="startEditMessage(contextMenu.msg); contextMenu.visible = false" class="ctx-menu-item">수정</button>
        <div class="ctx-menu-divider"></div>
      </template>
      <button @click="deleteMessage(contextMenu.msg.messageId); contextMenu.visible = false" class="ctx-menu-item danger">삭제</button>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="deleteConfirmDialog" class="confirm-overlay">
      <div class="confirm-modal">
        <h3 class="confirm-title">메시지 삭제</h3>
        <p class="confirm-desc">이 메시지를 삭제하시겠습니까?</p>
        <div class="confirm-btns">
          <button @click="deleteConfirmDialog = false" class="confirm-btn cancel">취소</button>
          <button @click="confirmDelete" class="confirm-btn danger">삭제</button>
        </div>
      </div>
    </div>

    <!-- 공지 내역 시트 -->
    <div v-if="noticeHistoryDialog" class="sheet-overlay" @click.self="noticeHistoryDialog = false">
      <div class="sheet">
        <div class="sheet-handle-wrap"><div class="sheet-handle"></div></div>
        <div class="sheet-header">
          <div class="sheet-header-left">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style="color:#6B9EFF">
              <path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z"/>
            </svg>
            <span class="sheet-title">공지 내역</span>
            <span class="sheet-count">{{ noticeMessages.length }}개</span>
          </div>
          <button @click="noticeHistoryDialog = false" class="sheet-close">
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="sheet-body">
          <div v-if="noticeMessages.length === 0" class="empty-notice">
            <p>공지 내역이 없습니다</p>
          </div>
          <div v-for="(notice, index) in noticeMessages" :key="notice.messageId"
            class="notice-item" :class="index === 0 ? 'latest' : 'old'">
            <div class="notice-item-header">
              <span class="notice-item-tag" :class="index === 0 ? 'tag-latest' : 'tag-old'">
                {{ index === 0 ? '최신 공지' : `${index + 1}번째` }}
              </span>
              <span class="notice-item-sender">{{ notice.senderNickname }}</span>
            </div>
            <p class="notice-item-text" :class="{ 'text-latest': index === 0 }">{{ notice.message }}</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';
import axios from 'axios';
import dayjs from '@/plugins/dayjs';

const API_BASE = process.env.VUE_APP_API_BASE_URL;

export default {
  name: 'CrewChatInlineComponent',
  props: {
    roomId: { type: [Number, String], required: true },
  },
  data() {
    return {
      messages: [],
      isLoading: true,
      stompClient: null,
      token: '',
      senderEmail: null,
      currentMessage: '',
      selectedImages: [],
      isEditMode: false,
      editingMessageId: null,
      deleteConfirmDialog: false,
      messageToDelete: null,
      isNoticeMode: false,
      isNoticeAllowed: false,
      noticeHistoryDialog: false,
      noticeBannerVisible: true,   // ← 접기/펼치기 상태
      noticeDropdownOpen: false,   // ← 더보기 드롭다운 상태
      imagePreviewDialog: false,
      previewImageUrl: '',
      previewImages: [],
      previewIndex: 0,
      carouselIndex: {},
      contextMenu: { visible: false, x: 0, y: 0, msg: null },
    };
  },
  computed: {
    noticeMessages() {
      return this.messages.filter(m => m.messageType === 'NOTICE').slice().reverse();
    },
    latestNotice() {
      return this.noticeMessages.length > 0 ? this.noticeMessages[0] : null;
    },
  },
  async mounted() {
    this.token = localStorage.getItem('token') || '';
    if (this.token) {
      try {
        const payload = JSON.parse(atob(this.token.split('.')[1]));
        this.senderEmail = payload.sub;
      } catch (e) { /* noop */ }
    }
    await this.loadHistory();
    await this.markAsRead();
    await this.loadRole();
    this.connectWebSocket();
    document.addEventListener('click', this.closeContextMenu);
    document.addEventListener('contextmenu', this.closeContextMenu);
  },
  beforeUnmount() {
    this.disconnectWebSocket();
    document.removeEventListener('click', this.closeContextMenu);
    document.removeEventListener('contextmenu', this.closeContextMenu);
  },
  methods: {
    closeContextMenu() { this.contextMenu.visible = false; },
    getCarouselIndex(messageId) { return this.carouselIndex[messageId] ?? 0; },
    changeCarousel(messageId, direction, total) {
      const cur = this.carouselIndex[messageId] ?? 0;
      const next = Math.min(Math.max(cur + direction, 0), total - 1);
      this.carouselIndex = { ...this.carouselIndex, [messageId]: next };
    },
    async markAsRead() {
      try { await axios.post(`${API_BASE}/chat/room/${this.roomId}/read`); } catch (e) { /* noop */ }
    },
    async loadHistory() {
      try {
        const res = await axios.get(`${API_BASE}/chat/history/${this.roomId}`);
        this.messages = res.data ?? [];
      } catch (e) {
        console.error('채팅 히스토리 로드 실패:', e);
      } finally {
        this.isLoading = false;
        this.scrollToBottom();
      }
    },
    async loadRole() {
      try {
        const res = await axios.get(`${API_BASE}/chat/room/${this.roomId}/my-role`);
        this.isNoticeAllowed = res.data === 'OWNER' || res.data === 'MANAGER';
      } catch (e) {
        this.isNoticeAllowed = false;
      }
    },
    connectWebSocket() {
      if (this.stompClient && this.stompClient.connected) return;
      const sock = new SockJS(`${API_BASE}/connect`);
      this.stompClient = Stomp.over(sock);
      this.stompClient.debug = () => {};
      this.stompClient.connect(
        { Authorization: `Bearer ${this.token}` },
        () => {
          this.stompClient.subscribe(`/topic/read/${this.roomId}`, async () => {
            try {
              const res = await axios.get(`${API_BASE}/chat/history/${this.roomId}`);
              this.messages = res.data ?? [];
            } catch (e) { /* noop */ }
          }, { Authorization: `Bearer ${this.token}` });
          setTimeout(() => {
            this.stompClient.subscribe(`/topic/${this.roomId}`, (message) => {
              const parsed = JSON.parse(message.body);
              const idx = this.messages.findIndex(m => m.messageId === parsed.messageId);
              if (idx !== -1) { this.messages.splice(idx, 1, parsed); }
              else { this.messages.push(parsed); }
              this.$nextTick(() => this.scrollToBottom());
              if (parsed.senderEmail !== this.senderEmail) this.markAsRead();
            }, { Authorization: `Bearer ${this.token}` });
          }, 100);
        },
        (err) => console.error('WebSocket 연결 실패:', err)
      );
    },
    disconnectWebSocket() {
      if (this.stompClient && this.stompClient.connected) this.stompClient.disconnect();
    },
    sendMessage() {
      if (this.selectedImages.length > 0) { this.sendImageMessage(); return; }
      if (!this.currentMessage.trim()) return;
      this.stompClient.send(`/publish/${this.roomId}`, JSON.stringify({
        senderEmail: this.senderEmail,
        message: this.currentMessage,
        messageType: this.isNoticeMode ? 'NOTICE' : 'NORMAL',
      }), { Authorization: `Bearer ${this.token}` });
      this.currentMessage = '';
      this.isNoticeMode = false;
    },
    async sendImageMessage() {
      try {
        const imageUrls = await Promise.all(
          this.selectedImages.map(async (img) => {
            const { data: presignedUrl } = await axios.get(`${API_BASE}/chat/presigned-url`, { params: { fileName: img.file.name } });
            await fetch(presignedUrl, { method: 'PUT', body: img.file });
            return presignedUrl.split('?')[0];
          })
        );
        await axios.post(`${API_BASE}/chat/imageSend`, {
          roomId: this.roomId, senderEmail: this.senderEmail,
          message: this.currentMessage || '', images: imageUrls,
        });
        this.currentMessage = '';
        this.selectedImages = [];
        this.$nextTick(() => this.scrollToBottom());
      } catch (e) {
        console.error('이미지 전송 실패:', e);
        alert('이미지 전송에 실패했습니다.');
      }
    },
    handleContextMenu(event, msg) {
      event.stopPropagation();
      if (msg.senderEmail !== this.senderEmail || msg.delYn === 'Y') return;
      const rect = this.$el.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;
      if (x + 110 > rect.width) x = rect.width - 115;
      if (y + 80 > rect.height) y = y - 80;
      this.contextMenu = { visible: true, x, y, msg };
    },
    startEditMessage(msg) {
      this.isEditMode = true;
      this.currentMessage = msg.message;
      this.editingMessageId = msg.messageId;
    },
    async submitEditMessage() {
      if (!this.currentMessage.trim()) return;
      try {
        await axios.patch(`${API_BASE}/chat/message/update`, {
          messageId: this.editingMessageId, roomId: this.roomId, newContent: this.currentMessage,
        });
        this.cancelEdit();
      } catch (e) {
        alert('메시지 수정에 실패했습니다.');
      }
    },
    cancelEdit() {
      this.isEditMode = false;
      this.currentMessage = '';
      this.editingMessageId = null;
    },
    deleteMessage(messageId) {
      this.messageToDelete = messageId;
      this.deleteConfirmDialog = true;
    },
    async confirmDelete() {
      try {
        await axios.delete(`${API_BASE}/chat/message/${this.messageToDelete}/delete`);
        this.deleteConfirmDialog = false;
        this.messageToDelete = null;
      } catch (e) {
        alert('메시지 삭제에 실패했습니다.');
      }
    },
    triggerFileInput() { this.$refs.fileInput.click(); },
    handleFileSelect(event) {
      Array.from(event.target.files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => this.selectedImages.push({ file, preview: e.target.result });
          reader.readAsDataURL(file);
        }
      });
      event.target.value = '';
    },
    removeImage(index) { this.selectedImages.splice(index, 1); },
    openImagePreview(images, index = 0) {
      this.previewImages = Array.isArray(images) ? images : [images];
      this.previewIndex = index;
      this.previewImageUrl = this.previewImages[index];
      this.imagePreviewDialog = true;
    },
    changePreview(direction) {
      const next = Math.min(Math.max(this.previewIndex + direction, 0), this.previewImages.length - 1);
      this.previewIndex = next;
      this.previewImageUrl = this.previewImages[next];
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const box = this.$refs.chatBox;
        if (box) box.scrollTop = box.scrollHeight;
      });
    },
    formatTime(createdAt) {
      if (!createdAt) return '';
      const d = dayjs.utc(createdAt).tz('Asia/Seoul');
      const h = d.getHours();
      const m = String(d.getMinutes()).padStart(2, '0');
      return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${m}`;
    },
  },
};
</script>

<style scoped>
/* ── 전체 래퍼 ── */
.crew-chat-wrap {
  display: flex;
  flex-direction: column;
  height: 600px;
  background: #F0F4F8;
  border-radius: 18px;
  overflow: hidden;
  position: relative;
  font-family: 'Pretendard', -apple-system, sans-serif;
}

/* ────────────────────────────────────────────
   공지 배너
   ──────────────────────────────────────────── */
.notice-banner-wrap {
  flex-shrink: 0;
  position: relative;
}
.notice-banner {
  background: linear-gradient(135deg, #4A7FF7 0%, #7BB3FF 100%);
  overflow: visible;
  box-shadow: 0 4px 14px rgba(74, 127, 247, 0.38);
  position: relative;
  z-index: 10;
}
.notice-banner-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 14px;
}
.notice-icon-wrap {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}
.notice-banner-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.notice-banner-label {
  font-size: 10px;
  font-weight: 800;
  color: rgba(255,255,255,0.75);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.notice-banner-text {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  text-shadow: 0 1px 3px rgba(0,0,0,0.10);
}
.notice-more-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #4A7FF7;
  background: #fff;
  border: none;
  border-radius: 20px;
  padding: 5px 12px;
  flex-shrink: 0;
  transition: opacity 140ms, box-shadow 140ms;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0,0,0,0.14);
}
.notice-more-btn:hover { opacity: 0.88; }
.notice-collapse-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
  transition: background 140ms;
}
.notice-collapse-btn:hover { background: rgba(255, 255, 255, 0.40); }

/* 드롭다운 */
.notice-dropdown {
  background: #fff;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 8px 24px rgba(74,127,247,0.18);
  overflow: hidden;
  z-index: 9;
}
.notice-dropdown-header {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 14px 8px;
  border-bottom: 1px solid #EEF2F8;
}
.notice-dropdown-title {
  font-size: 12px;
  font-weight: 800;
  color: #2A3A55;
}
.notice-dropdown-count {
  font-size: 10px;
  font-weight: 700;
  background: #EEF4FF;
  color: #4A7FF7;
  border-radius: 20px;
  padding: 1px 7px;
}
.notice-dropdown-body {
  max-height: 200px;
  overflow-y: auto;
  padding: 8px 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.notice-dropdown-body::-webkit-scrollbar { width: 3px; }
.notice-dropdown-body::-webkit-scrollbar-thumb { background: #D5DCE6; border-radius: 2px; }
.notice-dropdown-empty {
  text-align: center;
  padding: 14px 0;
  font-size: 12px;
  color: #A0AEC0;
}
.notice-dropdown-item {
  padding: 9px 11px;
  border-radius: 12px;
  background: #F8FAFC;
  border: 1px solid #E8EDF2;
}
.notice-dropdown-item.is-latest {
  background: #EEF4FF;
  border-color: #B8D0FF;
}
.notice-dropdown-item-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
}
.notice-dropdown-tag {
  font-size: 9px;
  font-weight: 700;
  border-radius: 9999px;
  padding: 1px 7px;
}
.tag-new { background: #4A7FF7; color: #fff; }
.tag-old { background: #E2E8F0; color: #64748B; }
.notice-dropdown-sender { font-size: 11px; font-weight: 600; color: #64748B; }
.notice-dropdown-msg {
  font-size: 12px;
  color: #374151;
  line-height: 1.5;
  white-space: pre-wrap;
}
.notice-dropdown-msg.msg-latest { color: #1E40AF; }

/* 접힌 상태 탭 */
.notice-peek {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #4A7FF7 0%, #7BB3FF 100%);
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255,255,255,0.90);
  flex-shrink: 0;
  transition: opacity 140ms;
  box-shadow: 0 3px 10px rgba(74,127,247,0.32);
}
.notice-peek:hover { opacity: 0.88; }

/* 트랜지션 */
.notice-slide-enter-active,
.notice-slide-leave-active {
  transition: max-height 280ms ease, opacity 200ms ease;
  max-height: 80px;
  overflow: hidden;
}
.notice-slide-enter-from,
.notice-slide-leave-to {
  max-height: 0;
  opacity: 0;
}
.dropdown-slide-enter-active,
.dropdown-slide-leave-active {
  transition: max-height 260ms ease, opacity 180ms ease;
  max-height: 300px;
  overflow: hidden;
}
.dropdown-slide-enter-from,
.dropdown-slide-leave-to {
  max-height: 0;
  opacity: 0;
}
.fade-enter-active, .fade-leave-active { transition: opacity 200ms; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── 메시지 목록 ── */
.messages-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #F0F4F8;
}
.messages-wrap::-webkit-scrollbar { width: 3px; }
.messages-wrap::-webkit-scrollbar-thumb { background: #D5DCE6; border-radius: 2px; }
.mb-msg { margin-bottom: 10px; }
.flex-center { display: flex; align-items: center; justify-content: center; height: 100%; }

.sys-msg { display: flex; justify-content: center; margin: 6px 0; }
.sys-msg span { font-size: 10px; color: #A0AEC0; background: #E8EDF2; padding: 2px 10px; border-radius: 9999px; }

.msg-row { display: flex; align-items: flex-end; gap: 6px; }
.msg-row.other { justify-content: flex-start; }
.msg-row.mine  { justify-content: flex-end; }

.msg-avatar {
  width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
  background: #d1d5db;
  display: flex; align-items: center; justify-content: center;
  color: #fff; overflow: hidden;
}
.fill-img { width: 100%; height: 100%; object-fit: cover; }
.msg-avatar-icon { width: 15px; height: 15px; }
.msg-col { display: flex; flex-direction: column; gap: 2px; }
.msg-col.items-end { align-items: flex-end; }
.sender-row { display: flex; align-items: center; gap: 5px; margin-bottom: 3px; }
.sender-row.justify-end { justify-content: flex-end; }
.sender-name { font-size: 10px; font-weight: 700; color: #64748B; }
.notice-chip {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 9px; font-weight: 800; padding: 1px 6px;
  border-radius: 5px; background: #6B9EFF; color: #fff;
}

.bubble {
  padding: 8px 12px; word-break: break-word;
  font-size: .8rem; line-height: 1.55; cursor: pointer;
  transition: filter 120ms;
}
.bubble:hover { filter: brightness(.97); }
.bubble-other {
  background: #fff; color: #1E2B3C;
  border-radius: 3px 16px 16px 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}
.bubble-mine {
  background: #6B9EFF; color: #fff;
  border-radius: 16px 3px 16px 16px;
  box-shadow: 0 2px 8px rgba(107,158,255,.28);
}
.bubble-notice-other {
  background: #fff; color: #1E2B3C;
  border: 1.5px solid #A8C8FF;
  border-radius: 3px 16px 16px 16px;
  box-shadow: 0 1px 4px rgba(107,158,255,.1);
}
.bubble-notice-mine {
  background: #EEF4FF; color: #2A5FD4;
  border: 1.5px solid #A8C8FF;
  border-radius: 16px 3px 16px 16px;
}
.bubble-img-only { background: transparent; box-shadow: none; padding: 0; }

.msg-text { white-space: pre-wrap; }
.msg-text.white { color: #fff; }
.deleted-msg { font-size: .75rem; color: #A0AEC0; font-style: italic; }
.deleted-msg.mine { color: rgba(255,255,255,.55); }
.edited-tag { font-size: 9px; color: rgba(255,255,255,.55); margin-left: 3px; }
.msg-time { font-size: 9px; color: #A0AEC0; }
.unread-count { font-size: 10px; font-weight: 800; color: #6B9EFF; align-self: flex-end; margin-bottom: 16px; }

/* 캐러셀 */
.img-carousel { position: relative; width: 180px; height: 180px; border-radius: 12px; overflow: hidden; margin-bottom: 3px; background: #000; flex-shrink: 0; }
.carousel-img { width: 100%; height: 100%; object-fit: cover; cursor: pointer; display: block; }
.carousel-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 26px; height: 26px; border-radius: 50%; background: rgba(0,0,0,.45); color: #fff; display: flex; align-items: center; justify-content: center; z-index: 2; }
.carousel-arrow.left { left: 6px; }
.carousel-arrow.right { right: 6px; }
.carousel-badge { position: absolute; bottom: 7px; right: 8px; background: rgba(0,0,0,.5); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 9999px; pointer-events: none; }

/* 이미지 미리보기 바 */
.img-preview-bar { display: flex; gap: 6px; overflow-x: auto; padding: 7px 10px; background: #fff; border-top: 1px solid #E8EDF2; flex-shrink: 0; }
.img-preview-item { position: relative; flex-shrink: 0; }
.preview-thumb { width: 52px; height: 52px; object-fit: cover; border-radius: 10px; border: 1.5px solid #E8EDF2; }
.preview-remove { position: absolute; top: -5px; right: -5px; width: 16px; height: 16px; background: #F87171; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; }

/* 모드 바 */
.mode-bar { display: flex; align-items: center; gap: 6px; margin: 4px 8px 0; padding: 6px 10px; border-radius: 12px; font-size: .75rem; flex-shrink: 0; }
.edit-bar   { background: #FFF7ED; border: 1px solid #FED7AA; }
.notice-bar { background: #EEF4FF; border: 1px solid #C7DAFF; }
.mode-cancel { margin-left: auto; font-size: .72rem; font-weight: 800; color: #F59E0B; }

/* 입력 영역 */
.input-wrap {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 10px; background: #fff;
  border-top: 1px solid #E8EDF2; flex-shrink: 0;
}
.attach-btn {
  width: 34px; height: 34px; border-radius: 50%; background: #F0F4F8;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: background 140ms;
}
.attach-btn:hover { background: #E2E8F0; }
.msg-input {
  flex: 1; padding: 8px 14px; font-size: .8rem; outline: none;
  background: #F0F4F8; border: 1.5px solid transparent;
  border-radius: 20px; color: #1E2B3C;
  transition: border-color 150ms, background 150ms;
}
.msg-input:focus { border-color: #6B9EFF; background: #fff; }
.msg-input::placeholder { color: #B8C5D6; }
.msg-input.notice-input { background: #EEF4FF; border-color: #A8C8FF; color: #2A5FD4; }
.msg-input:disabled, .msg-input.disabled-input { background: #E8EDF2; color: #A0AEC0; cursor: not-allowed; border-color: transparent; }
.send-btn {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  background: #6B9EFF; color: #fff;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(107,158,255,.32);
  transition: filter 150ms, transform 150ms;
}
.send-btn:hover { filter: brightness(1.06); transform: scale(1.04); }
.notice-toggle-btn {
  display: flex; align-items: center; gap: 3px;
  padding: 0 9px; height: 34px; border-radius: 20px;
  font-size: .72rem; font-weight: 800; flex-shrink: 0;
  background: #EEF4FF; border: 1.5px solid #C7DAFF; color: #6B9EFF;
  transition: background 140ms, color 140ms;
}
.notice-toggle-btn.active { background: #6B9EFF; color: #fff; border-color: transparent; box-shadow: 0 2px 8px rgba(107,158,255,.32); }

/* 이미지 모달 */
.img-modal { position: absolute; inset: 0; z-index: 20; background: rgba(0,0,0,.85); display: flex; align-items: center; justify-content: center; }
.img-modal-img { max-width: 90%; max-height: 90%; object-fit: contain; border-radius: 14px; }
.img-modal-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,.15); color: #fff; display: flex; align-items: center; justify-content: center; transition: background 140ms; }
.img-modal-arrow:hover { background: rgba(255,255,255,.3); }
.img-modal-arrow.left { left: 16px; }
.img-modal-arrow.right { right: 16px; }
.img-modal-badge { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,.5); color: #fff; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; pointer-events: none; }
.img-modal-close { position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; background: rgba(255,255,255,.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; }

/* 컨텍스트 메뉴 */
.ctx-menu { position: absolute; min-width: 90px; background: #fff; border: 1px solid #E8EDF2; border-radius: 14px; box-shadow: 0 8px 24px rgba(0,0,0,.12); overflow: hidden; z-index: 30; }
.ctx-menu-item { width: 100%; text-align: left; padding: 9px 16px; font-size: .78rem; color: #374151; transition: background 120ms; display: block; }
.ctx-menu-item:hover { background: #F5F8FF; }
.ctx-menu-item.danger { color: #F87171; }
.ctx-menu-divider { height: 1px; background: #F0F4F8; }

/* 삭제 확인 모달 */
.confirm-overlay { position: absolute; inset: 0; z-index: 20; background: rgba(0,0,0,.32); display: flex; align-items: center; justify-content: center; }
.confirm-modal { background: #fff; border-radius: 22px; padding: 22px 20px; width: 260px; box-shadow: 0 16px 40px rgba(0,0,0,.16); }
.confirm-title { font-size: .9rem; font-weight: 800; color: #111827; margin-bottom: 4px; }
.confirm-desc  { font-size: .78rem; color: #6B7280; margin-bottom: 16px; }
.confirm-btns  { display: flex; gap: 8px; }
.confirm-btn   { flex: 1; padding: 8px; border-radius: 14px; font-size: .78rem; font-weight: 700; transition: filter 140ms; }
.confirm-btn:hover { filter: brightness(.96); }
.confirm-btn.cancel { background: #F0F4F8; color: #374151; }
.confirm-btn.danger { background: #F87171; color: #fff; }

/* 공지 내역 시트 */
.sheet-overlay { position: absolute; inset: 0; z-index: 20; background: rgba(0,0,0,.32); display: flex; align-items: flex-end; }
.sheet { width: 100%; background: #fff; border-radius: 18px 18px 0 0; max-height: 75%; display: flex; flex-direction: column; }
.sheet-handle-wrap { display: flex; justify-content: center; padding: 9px 0 4px; flex-shrink: 0; }
.sheet-handle { width: 32px; height: 3px; background: #DDE3EB; border-radius: 9999px; }
.sheet-header { display: flex; align-items: center; justify-content: space-between; padding: 6px 14px 10px; border-bottom: 1px solid #EEF2F7; flex-shrink: 0; }
.sheet-header-left { display: flex; align-items: center; gap: 6px; }
.sheet-title { font-size: .88rem; font-weight: 800; color: #111827; }
.sheet-count { font-size: 10px; font-weight: 700; background: #EEF4FF; color: #6B9EFF; border-radius: 9999px; padding: 1px 7px; }
.sheet-close { width: 26px; height: 26px; border-radius: 50%; background: #F0F4F8; display: flex; align-items: center; justify-content: center; color: #8FA3BF; }
.sheet-body { overflow-y: auto; padding: 10px 12px 14px; display: flex; flex-direction: column; gap: 8px; }
.empty-notice { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px 0; color: #A0AEC0; font-size: .82rem; }
.notice-item { border-radius: 14px; padding: 10px 12px; }
.notice-item.latest { background: #EEF4FF; border: 1.5px solid #A8C8FF; }
.notice-item.old    { background: #F8FAFC; border: 1px solid #E8EDF2; }
.notice-item-header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.notice-item-tag { font-size: 9px; font-weight: 700; border-radius: 9999px; padding: 1px 7px; }
.tag-latest { background: #6B9EFF; color: #fff; }
.tag-old    { background: #E8EDF2; color: #6B7280; }
.notice-item-sender { font-size: .75rem; font-weight: 600; color: #6B7280; }
.notice-item-text { font-size: .78rem; color: #374151; white-space: pre-wrap; line-height: 1.5; }
.notice-item-text.text-latest { color: #2A5FD4; }

/* 스피너 */
.spinner { width: 26px; height: 26px; border: 3px solid #E2E8F0; border-top-color: #6B9EFF; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>