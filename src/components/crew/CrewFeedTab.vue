<template>
  <div>
    <!-- 로딩 스켈레톤 -->
    <div v-if="loading && feeds.length === 0" class="space-y-6">
      <div
        v-for="i in 3"
        :key="i"
        class="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse"
      >
        <div class="p-3 flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-gray-200" />
          <div class="flex flex-col gap-1.5">
            <div class="w-24 h-3 bg-gray-200 rounded" />
            <div class="w-16 h-2.5 bg-gray-200 rounded" />
          </div>
        </div>
        <div class="w-full bg-gray-200" style="aspect-ratio: 4/3; max-height: 400px" />
        <div class="px-4 py-3 flex flex-col gap-2">
          <div class="w-20 h-3 bg-gray-200 rounded" />
          <div class="w-full h-3 bg-gray-200 rounded" />
          <div class="w-2/3 h-3 bg-gray-200 rounded" />
        </div>
      </div>
    </div>

    <!-- 피드 목록 -->
    <div v-else-if="feeds.length > 0" class="feed-grid">
      <div
        v-for="feed in feeds"
        :key="feed.feedId"
        class="bg-white border border-gray-200 rounded-xl feed-card"
      >
        <!-- 작성자 정보 + 더보기 메뉴 -->
        <div class="feed-card-head">
          <img
            v-if="feed.profileImageUrl"
            :src="feed.profileImageUrl"
            :alt="feed.nickname"
            class="feed-avatar"
          />
          <div v-else class="feed-avatar feed-avatar--ph">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path fill-rule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0
                  .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75
                  0 01-.437-.695z"
                clip-rule="evenodd"/>
            </svg>
          </div>

          <div class="flex-1 min-w-0">
            <p class="feed-nickname">{{ feed.nickname }}</p>
            <p class="feed-date">{{ formatDate(feed.createdTime) }}</p>
          </div>

          <div v-if="feed.isMyPost" class="relative">
            <button
              @click.stop="toggleMenu(feed.feedId)"
              class="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path fill-rule="evenodd" d="M4.5 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clip-rule="evenodd"/>
              </svg>
            </button>
            <div
              v-if="openMenuId === feed.feedId"
              class="absolute right-0 top-7 z-20 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden w-24"
            >
              <button
                @click.stop="goToEdit(feed)"
                class="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="13" height="13" style="color:#6b7280;">
                  <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z"/>
                </svg>
                수정
              </button>
              <button
                @click.stop="confirmDelete(feed)"
                class="w-full px-3 py-2 text-xs text-left text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                  <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd"/>
                </svg>
                삭제
              </button>
            </div>
          </div>
        </div>

        <!-- 이미지 캐러셀 -->
        <div
          v-if="feed.imageUrls && feed.imageUrls.length > 0"
          class="relative w-full feed-image-wrap feed-image-hover-zone"
          @mouseenter="hoveredFeedId = feed.feedId"
          @mouseleave="hoveredFeedId = null"
        >
          <img
            :src="feed.imageUrls[feed._currentImageIndex || 0]"
            alt="Feed content"
            class="feed-image-img"
            style="cursor: zoom-in;"
            @click.stop="openLightbox(feed, feed._currentImageIndex || 0)"
          />

          <template v-if="feed.imageUrls.length > 1">
            <div
              class="carousel-overlay-badge"
              :class="{ 'carousel-overlay--visible': hoveredFeedId === feed.feedId }"
            >
              {{ (feed._currentImageIndex || 0) + 1 }} / {{ feed.imageUrls.length }}
            </div>

            <button
              v-if="(feed._currentImageIndex || 0) > 0"
              class="carousel-btn carousel-btn--left"
              :class="{ 'carousel-overlay--visible': hoveredFeedId === feed.feedId }"
              @click.stop="prevImage(feed)"
              aria-label="이전 이미지"
            >
              <span class="carousel-btn-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></span>
            </button>

            <button
              v-if="(feed._currentImageIndex || 0) < feed.imageUrls.length - 1"
              class="carousel-btn carousel-btn--right"
              :class="{ 'carousel-overlay--visible': hoveredFeedId === feed.feedId }"
              @click.stop="nextImage(feed)"
              aria-label="다음 이미지"
            >
              <span class="carousel-btn-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></span>
            </button>

            <div class="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
              <span
                v-for="(_, idx) in feed.imageUrls"
                :key="idx"
                class="w-1 h-1 rounded-full transition-colors"
                :class="(feed._currentImageIndex || 0) === idx ? 'bg-white' : 'bg-white/50'"
              />
            </div>
          </template>
        </div>

        <!-- 내용 & 액션 -->
        <div class="feed-card-body">
          <p class="feed-content">{{ getDisplayContent(feed) }}</p>
          <button
            v-if="isContentLong(feed)"
            type="button"
            class="feed-content-toggle"
            @click="toggleContentExpand(feed.feedId)"
          >
            {{ isContentExpanded(feed.feedId) ? '접기' : '더보기' }}
          </button>
          <div v-if="extractTags(feed.content).length" class="feed-hashtag-row">
            <span
              v-for="(tag, i) in extractTags(feed.content)"
              :key="i"
              class="feed-hashtag"
            >#{{ tag }}</span>
          </div>

          <div class="flex items-center gap-3 mt-2">
            <button
              class="flex items-center gap-1 transition-opacity"
              :class="{ 'hover:opacity-70': canInteractWithFeed, 'opacity-50 cursor-not-allowed': !canInteractWithFeed }"
              :disabled="!canInteractWithFeed || likeLoadingSet.has(feed.feedId)"
              @click="toggleLike(feed)"
            >
              <svg v-if="feed.isLiked" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="color:#ef4444;">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.75 3c1.99 0 3.751.984 4.75 2.455A5.75 5.75 0 0117.25 3c3.036 0 5.5 2.322 5.5 5.25 0 3.926-2.438 7.111-4.735 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16" style="color:#374151;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
              </svg>
              <span class="text-xs font-medium text-gray-700">{{ feed.likeCount }}</span>
            </button>

            <button
              @click="toggleCommentPanel(feed)"
              class="flex items-center gap-1 transition-opacity"
              :class="{ 'hover:opacity-70': canInteractWithFeed, 'opacity-50 cursor-not-allowed': !canInteractWithFeed }"
              :disabled="!canInteractWithFeed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16" style="color:#374151;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>
              </svg>
              <span class="text-xs font-medium text-gray-700">{{ feed.commentCount }}</span>
            </button>
          </div>
        </div>

        <!-- 댓글창 -->
        <FeedDetailModal
          :modelValue="openCommentFeedId === feed.feedId"
          :feedId="feed.feedId"
          :myNickname="myNickname"
          :myProfileImageUrl="myProfileImage || ''"
          @update:modelValue="(val) => { if (!val) openCommentFeedId = null; }"
          @comment-count-changed="onCommentCountChanged"
          @report="(targetType, targetId) => $emit('report', targetType, targetId)"
        />
      </div>

      <div v-if="!isLastPage" ref="scrollTrigger" class="scroll-trigger-sentinel" aria-hidden="true"></div>
      <div v-if="loading && feeds.length > 0" class="flex justify-center py-3">
        <span class="text-sm text-gray-500">불러오는 중...</span>
      </div>
    </div>

    <!-- 피드 없음 -->
    <div v-else class="text-center py-12 bg-white rounded-xl border border-gray-200">
     <div class="empty-icon-wrap">
      <div style="width:72px;height:72px;border-radius:50%;background:#EBF6FC;display:flex;align-items:center;justify-content:center;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:36px;height:36px;color:#4FA8D8;">
          <path fill-rule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clip-rule="evenodd"/>
        </svg>
      </div>
    </div>
      <p class="text-gray-500 mb-2">아직 작성된 피드가 없습니다</p>
      <p v-if="membershipStatus === 'APPROVED'" class="text-sm text-gray-400">
        첫 번째 피드를 작성해보세요!
      </p>
    </div>

    <!-- 에러 -->
    <div
      v-if="error"
      class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center"
    >
      {{ error }}
    </div>

    <!-- 삭제 확인 모달 -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white p-6 rounded-2xl shadow-lg max-w-xs w-full">
        <h3 class="text-base font-bold text-gray-900 mb-2">피드를 삭제할까요?</h3>
        <p class="text-sm text-gray-500 mb-5">삭제된 피드는 복구할 수 없습니다.</p>
        <div class="flex gap-3">
          <button
            @click="showDeleteModal = false"
            class="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >취소</button>
          <button
            @click="deleteFeed"
            :disabled="deleteLoading"
            class="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
          >{{ deleteLoading ? "삭제 중..." : "삭제" }}</button>
        </div>
      </div>
    </div>

    <!-- 피드 수정 모달 -->
    <FeedEditPageComponent
      v-if="showEditModal && editTargetFeed"
      :feed-id="editTargetFeed.feedId"
      :initial-image-urls="editTargetFeed.imageUrls || []"
      :crew-id="crewId"
      :crew-name="crewName"
      @close="showEditModal = false"
      @submitted="onFeedEdited"
    />

    <!-- 라이트박스 -->
    <teleport to="body">
      <div
        v-if="lightbox.visible"
        class="lightbox-backdrop"
        @click.self="closeLightbox"
        @keydown.esc="closeLightbox"
        tabindex="0"
        ref="lightboxEl"
      >
        <button class="lightbox-close" @click="closeLightbox">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd"/>
          </svg>
        </button>

        <button
          v-if="lightbox.index > 0"
          class="lightbox-arrow lightbox-arrow--left"
          @click.stop="lightboxPrev"
          aria-label="이전 이미지"
        >
          <span class="lightbox-arrow-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></span>
        </button>

        <div class="lightbox-img-wrap" @click.stop>
          <img
            :src="lightbox.imageUrls[lightbox.index]"
            class="lightbox-img"
            alt="확대 이미지"
          />
          <div v-if="lightbox.imageUrls.length > 1" class="lightbox-counter">
            {{ lightbox.index + 1 }} / {{ lightbox.imageUrls.length }}
          </div>
          <div v-if="lightbox.imageUrls.length > 1" class="lightbox-dots">
            <span
              v-for="(_, idx) in lightbox.imageUrls"
              :key="idx"
              class="lightbox-dot"
              :class="{ 'lightbox-dot--active': lightbox.index === idx }"
              @click.stop="lightbox.index = idx"
            />
          </div>
        </div>

        <button
          v-if="lightbox.index < lightbox.imageUrls.length - 1"
          class="lightbox-arrow lightbox-arrow--right"
          @click.stop="lightboxNext"
          aria-label="다음 이미지"
        >
          <span class="lightbox-arrow-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></span>
        </button>
      </div>
    </teleport>
  </div>
</template>

<script>
import axios from "axios";
import FeedDetailModal from "@/components/feed/FeedDetailModal.vue";
import FeedEditPageComponent from "@/components/feed/FeedEditPageComponent.vue";
import dayjs from "@/plugins/dayjs";

export default {
  name: "CrewFeedTab",
  components: { FeedDetailModal, FeedEditPageComponent },

  props: {
    membershipStatus: { type: String, default: "NONE" },
    myNickname: { type: String, default: "" },
     myProfileImage: { type: String, default: null },
    crewId: { type: [Number, String], required: true },
    crewName: { type: String, default: "" },
    feedRefreshKey: { type: Number, default: 0 },
  },

  data() {
    return {
      feeds: [],
      loading: false,
      error: null,
      token: "",
      currentPage: 0,
      pageSize: 5,
      isLastPage: false,
      likeLoadingSet: new Set(),
      openMenuId: null,
      showDeleteModal: false,
      deleteTargetFeed: null,
      deleteLoading: false,
      openCommentFeedId: null,
      scrollObserver: null,
      hoveredFeedId: null,
      // 수정 모달
      showEditModal: false,
      editTargetFeed: null,
      lightbox: {
        visible: false,
        imageUrls: [],
        index: 0,
      },
      expandedContentFeedIds: {},
    };
  },

  created() {
    this.token = localStorage.getItem("token") || "";
  },

  mounted() {
    document.addEventListener("click", this.closeMenu);
    document.addEventListener("keydown", this.onKeydown);
    this.initScrollObserver();
  },

  beforeUnmount() {
    document.removeEventListener("click", this.closeMenu);
    document.removeEventListener("keydown", this.onKeydown);
    if (this.scrollObserver) this.scrollObserver.disconnect();
  },

  computed: {
    canInteractWithFeed() {
      return this.membershipStatus === "APPROVED";
    },
  },

  watch: {
    isLastPage(val) {
      if (val && this.scrollObserver) this.scrollObserver.disconnect();
    },
    crewId: { immediate: true, handler() { this.resetAndFetch(); } },
    feedRefreshKey(newVal, oldVal) { if (newVal !== oldVal) this.resetAndFetch(); },
    "lightbox.visible"(val) {
      document.body.style.overflow = val ? "hidden" : "";
      if (val) this.$nextTick(() => this.$refs.lightboxEl?.focus());
    },
  },

  methods: {
    initScrollObserver() {
      this.scrollObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !this.loading && !this.isLastPage) this.loadMore();
        },
        { root: null, rootMargin: "0px 0px 20% 0px", threshold: 0 }
      );
      this.observeScrollTrigger();
    },
    observeScrollTrigger() {
      this.$nextTick(() => {
        if (this.$refs.scrollTrigger && this.scrollObserver) this.scrollObserver.observe(this.$refs.scrollTrigger);
      });
    },

    extractText(content) {
      if (!content) return "";
      return content.split("\n").filter((line) => !line.trim().startsWith("#")).join("\n").trim();
    },

    getDisplayContent(feed) {
      const full = this.extractText(feed.content);
      if (full.length <= 400) return full;
      return this.isContentExpanded(feed.feedId) ? full : full.slice(0, 400);
    },
    isContentLong(feed) {
      return this.extractText(feed.content).length > 400;
    },
    isContentExpanded(feedId) {
      return !!this.expandedContentFeedIds[feedId];
    },
    toggleContentExpand(feedId) {
      this.expandedContentFeedIds = { ...this.expandedContentFeedIds, [feedId]: !this.expandedContentFeedIds[feedId] };
    },

    extractTags(content) {
      if (!content) return [];
      return (content.match(/#([^\s#]+)/g) || []).map((t) => t.slice(1));
    },

    resetAndFetch() {
      this.feeds = [];
      this.currentPage = 0;
      this.isLastPage = false;
      this.error = null;
      this.openCommentFeedId = null;
      this.fetchFeeds();
    },

    async fetchFeeds() {
      if (this.loading || this.isLastPage) return;
      this.token = localStorage.getItem("token") || "";
      this.loading = true;
      this.error = null;
      try {
        const { data } = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/feed/crew/${this.crewId}`,
          {
            headers: { Authorization: `Bearer ${this.token}` },
            params: { page: this.currentPage, size: this.pageSize, sort: "createdTime,desc" },
          }
        );
        const base = (process.env.VUE_APP_API_BASE_URL || '').replace(/\/$/, '');
        const ensureAbsolute = (url) => {
          if (!url || typeof url !== 'string') return url;
          if (/^https?:\/\//i.test(url)) return url;
          return base ? base + (url.startsWith('/') ? url : `/${url}`) : url;
        };
        const toAbsoluteUrls = (arr) => (arr || []).map(ensureAbsolute).filter(Boolean);
        const newFeeds = (data.content ?? data).map((f) => {
          const raw = f.imageUrls ?? f.images ?? f.imageUrlList ?? (f.feedImages && f.feedImages.map(x => x.url || x)) ?? [];
          const rawUrls = Array.isArray(raw) ? raw : [];
          return {
            ...f,
            imageUrls: toAbsoluteUrls(rawUrls.map(u => typeof u === 'string' ? u : (u && (u.url || u.src)) ? (u.url || u.src) : '').filter(Boolean)),
            isLiked: f.isLiked ?? f.liked ?? false,
            likeCount: Number(f.likeCount ?? 0),
            _currentImageIndex: 0,
          };
        });
        this.feeds = [...this.feeds, ...newFeeds];
        this.isLastPage = data.last ?? true;
      } catch (err) {
        console.error("[CrewFeedTab] 피드 조회 실패:", err);
        this.error = "피드를 불러오는 중 오류가 발생했습니다.";
      } finally {
        this.loading = false;
        this.observeScrollTrigger();
      }
    },

    loadMore() { this.currentPage += 1; this.fetchFeeds(); },
    toggleMenu(feedId) { this.openMenuId = this.openMenuId === feedId ? null : feedId; },
    closeMenu() { this.openMenuId = null; },

    // 라우터 이동 대신 모달 오픈
    goToEdit(feed) {
      this.openMenuId = null;
      this.editTargetFeed = feed;
      this.showEditModal = true;
    },

    // 수정 완료 후 피드 목록 새로고침
    onFeedEdited() {
      this.showEditModal = false;
      this.editTargetFeed = null;
      this.resetAndFetch();
    },

    confirmDelete(feed) {
      this.openMenuId = null;
      this.deleteTargetFeed = feed;
      this.showDeleteModal = true;
    },

    async deleteFeed() {
      if (!this.deleteTargetFeed || this.deleteLoading) return;
      this.deleteLoading = true;
      try {
        await axios.delete(
          `${process.env.VUE_APP_API_BASE_URL}/feed/detail/delete/${this.deleteTargetFeed.feedId}`,
          { headers: { Authorization: `Bearer ${this.token}` } }
        );
        this.feeds = this.feeds.filter((f) => f.feedId !== this.deleteTargetFeed.feedId);
        if (this.openCommentFeedId === this.deleteTargetFeed.feedId) this.openCommentFeedId = null;
        this.showDeleteModal = false;
        this.deleteTargetFeed = null;
      } catch (err) {
        console.error("[CrewFeedTab] 삭제 실패:", err);
        this.error = "삭제에 실패했습니다.";
        this.showDeleteModal = false;
      } finally {
        this.deleteLoading = false;
      }
    },

    toggleCommentPanel(feed) {
      if (!this.canInteractWithFeed) return;
      this.openCommentFeedId = this.openCommentFeedId === feed.feedId ? null : feed.feedId;
    },

    onCommentCountChanged({ feedId, count }) {
      const feed = this.feeds.find((f) => f.feedId === feedId);
      if (feed) feed.commentCount = count;
    },

    prevImage(feed) { if ((feed._currentImageIndex || 0) > 0) feed._currentImageIndex--; },
    nextImage(feed) {
      if ((feed._currentImageIndex || 0) < feed.imageUrls.length - 1) feed._currentImageIndex++;
    },

    openLightbox(feed, index) {
      this.lightbox.imageUrls = feed.imageUrls;
      this.lightbox.index = index;
      this.lightbox.visible = true;
    },
    closeLightbox() { this.lightbox.visible = false; },
    lightboxPrev() { if (this.lightbox.index > 0) this.lightbox.index--; },
    lightboxNext() {
      if (this.lightbox.index < this.lightbox.imageUrls.length - 1) this.lightbox.index++;
    },
    onKeydown(e) {
      if (!this.lightbox.visible) return;
      if (e.key === "Escape") this.closeLightbox();
      if (e.key === "ArrowLeft") this.lightboxPrev();
      if (e.key === "ArrowRight") this.lightboxNext();
    },

    async toggleLike(feed) {
      if (!this.canInteractWithFeed) return;
      if (this.likeLoadingSet.has(feed.feedId)) return;
      if (!this.token) { this.$router.push('/login'); return; }
      const prevLiked = feed.isLiked;
      const prevCount = feed.likeCount;
      feed.isLiked = !prevLiked;
      feed.likeCount = prevLiked ? prevCount - 1 : prevCount + 1;
      this.likeLoadingSet = new Set([...this.likeLoadingSet, feed.feedId]);
      try {
        if (prevLiked) {
          await axios.delete(
            `${process.env.VUE_APP_API_BASE_URL}/feed/like/${feed.feedId}`,
            { headers: { Authorization: `Bearer ${this.token}` } }
          );
          feed.isLiked = false;
        } else {
          await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/feed/like/${feed.feedId}`,
            null,
            { headers: { Authorization: `Bearer ${this.token}` } }
          );
          feed.isLiked = true;
        }
      } catch {
        feed.isLiked = prevLiked;
        feed.likeCount = prevCount;
      } finally {
        const next = new Set(this.likeLoadingSet);
        next.delete(feed.feedId);
        this.likeLoadingSet = next;
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return "";
      const diff = dayjs().valueOf() - dayjs.utc(dateStr).valueOf();
      // const diff = Date.now() - new Date(dateStr).getTime();
      const m = Math.floor(diff / 60000);
      if (m < 1) return "방금 전";
      if (m < 60) return `${m}분 전`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h}시간 전`;
      const d = Math.floor(h / 24);
      if (d < 7) return `${d}일 전`;
      return new Date(dateStr).toLocaleDateString("ko-KR");
    },
  },
};
</script>

<style scoped>
.feed-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}
.scroll-trigger-sentinel {
  height: 1px;
  width: 100%;
  pointer-events: none;
  visibility: hidden;
}
.feed-card { max-width: 100%; }
.feed-card-head { padding: 10px 12px; display: flex; align-items: center; gap: 10px; }
.feed-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.feed-avatar--ph {
  background: #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.feed-nickname { font-weight: 700; font-size: 13px; color: #111; margin: 0; line-height: 1.2; }
.feed-date { font-size: 11px; color: #6b7280; margin: 2px 0 0; }

.feed-image-wrap {
  width: 85%;
  height: 360px;
  margin: 0 auto;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}
.feed-image-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.feed-card-body { padding: 10px 12px 12px; }
.feed-content { font-size: 13px; color: #374151; line-height: 1.45; margin: 0 0 6px; }
.feed-content-toggle {
  font-size: 13px; color: #4FA8D8; background: none; border: none; padding: 0; cursor: pointer;
  margin-top: 2px; font-weight: 500;
}
.feed-content-toggle:hover { text-decoration: underline; }
.feed-hashtag-row { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px; }
.feed-hashtag {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 600;
  color: #4fa8d8;
  background: #e8f4fb;
  border: 1px solid #c8e8f8;
  line-height: 1.4;
}

.empty-icon-wrap { display: flex; justify-content: center; margin-bottom: 12px; }

.carousel-overlay-badge,
.carousel-btn { opacity: 0; pointer-events: none; transition: opacity 0.2s ease; }
.carousel-overlay--visible { opacity: 1 !important; pointer-events: auto !important; }
.carousel-overlay-badge {
  position: absolute; top: 6px; right: 6px;
  background: rgba(0,0,0,0.5); color: #fff;
  font-size: 10px; font-weight: 600;
  padding: 2px 6px; border-radius: 999px; line-height: 1.4; z-index: 5;
}
.carousel-btn {
  position: absolute;
  top: 0; bottom: 0; margin: auto 0;
  background: rgba(0,0,0,0.4); color: #fff;
  border: none; border-radius: 50%;
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 5; padding: 0;
}
.carousel-btn-icon { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
.carousel-btn-icon svg { width: 14px; height: 14px; flex-shrink: 0; }
.carousel-btn:hover { background: rgba(0,0,0,0.65); }
.carousel-btn--left  { left: 6px; }
.carousel-btn--right { right: 6px; }

.lightbox-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.88);
  z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  outline: none;
}
.lightbox-close {
  position: absolute; top: 16px; right: 20px;
  color: #fff; background: rgba(255,255,255,0.15);
  border: none; border-radius: 50%;
  width: 36px; height: 36px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  z-index: 10; transition: background 0.2s;
}
.lightbox-close:hover { background: rgba(255,255,255,0.3); }
.lightbox-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,0.15); color: #fff;
  border: none; border-radius: 50%;
  width: 48px; height: 48px; padding: 0;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  z-index: 10; transition: background 0.2s;
}
.lightbox-arrow-icon { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
.lightbox-arrow-icon svg { width: 22px; height: 22px; flex-shrink: 0; }
.lightbox-arrow:hover { background: rgba(255,255,255,0.3); }
.lightbox-arrow--left  { left: 20px; }
.lightbox-arrow--right { right: 20px; }
.lightbox-img-wrap {
  position: relative; max-width: 90vw; max-height: 90vh;
  display: flex; flex-direction: column; align-items: center;
}
.lightbox-img { max-width: 90vw; max-height: 82vh; object-fit: contain; border-radius: 8px; display: block; user-select: none; }
.lightbox-counter { margin-top: 10px; color: rgba(255,255,255,0.75); font-size: 13px; font-weight: 500; }
.lightbox-dots { display: flex; gap: 6px; margin-top: 8px; }
.lightbox-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.4); cursor: pointer; transition: background 0.2s; }
.lightbox-dot--active { background: #fff; }
</style>