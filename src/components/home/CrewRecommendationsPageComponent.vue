<template>
  <div class="page-root">
    <!-- ======= LNB (공통 컴포넌트) ======= -->
    <LnbMenuComponent
      active-nav="recommendations"
      :category-options="categoryOptions"
      :selected-category-values="selectedCategory ? [selectedCategory] : []"
      category-mode="single"
      :recent-crews="recentCrewsWithLabel"
      @nav-click="onLnbNavClick"
      @category-clear="selectCategory('')"
      @category-toggle="onCategoryToggle"
      @category-click="val => $router.push({ path: '/crew/search', query: val ? { category: val } : {} })"
      @recent-clear="clearRecent"
      @recent-remove="removeRecent"
      @recent-click="(id) => $router.push('/crew/' + id)"
    />

    <!-- ======= 메인 ======= -->
    <main class="main">
      <!-- 페이지 헤더 -->
      <div class="page-hd">
        <h1 class="page-title">
          추천 크루
          <span v-if="selectedCategory" class="page-cat-label">
            — {{ catLabel(selectedCategory) }}
          </span>
        </h1>
        <span class="page-count">{{ filteredCrews.length }}개</span>
      </div>

      <!-- 로딩 스켈레톤 -->
      <div v-if="isLoading" class="crew-grid">
        <div v-for="i in 6" :key="i" class="crew-card skeleton-card">
          <div class="skeleton card-thumb-area"></div>
          <div
            class="card-body"
            style="gap: 8px; display: flex; flex-direction: column"
          >
            <div class="sk-line" style="width: 40%; height: 11px"></div>
            <div class="sk-line" style="width: 70%; height: 14px"></div>
            <div class="sk-line" style="width: 55%; height: 11px"></div>
          </div>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div v-else-if="filteredCrews.length === 0" class="empty-wrap">
        <p class="empty-title">추천 크루가 없습니다</p>
        <p class="empty-desc">
          프로필에 관심 카테고리와 지역을 설정하면<br />맞춤 크루를 추천해드려요
        </p>
      </div>

      <!-- 크루 그리드 (홈 카드 형식) -->
      <div v-else class="crew-grid">
        <div
          v-for="crew in filteredCrews"
          :key="crew.crewId"
          class="crew-card"
          @click="goDetail(crew)"
        >
          <div class="card-thumb-area">
            <img
              v-if="crew.crewImageUrl || crew.crewImage"
              :src="crew.crewImageUrl || crew.crewImage"
              :alt="crew.crewName"
              class="card-thumb-img"
            />
            <div v-else class="card-thumb-ph">
              <svg fill="currentColor" viewBox="0 0 24 24" style="width:56px;height:56px;color:#fff;opacity:0.7;">
                <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
              </svg>
            </div>
            <div class="card-top-badges">
              <span
                class="cat-badge"
                :style="{ '--cat-bg': catColor(crew.categoryType) }"
                >{{ categoryLabel(crew.categoryType) }}</span
              >
            </div>
            <button
              type="button"
              class="fav-btn"
              :class="crew.favorite && 'fav-on'"
              @click.stop="toggleFavorite(crew)"
              :disabled="crew._favLoading"
            >
              <svg v-if="crew.favorite" fill="#FF6B6B" viewBox="0 0 24 24" style="width:16px;height:16px;">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <svg v-else fill="none" stroke="#aaa" stroke-width="2" viewBox="0 0 24 24" style="width:16px;height:16px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
            <div class="card-overlay">
              <h3 class="card-crew-name">{{ crew.crewName }}</h3>
            </div>
          </div>

          <div class="card-body">
            <p class="card-region">
              <svg fill="currentColor" viewBox="0 0 24 24" style="width:12px;height:12px;flex-shrink:0;color:#4FA8D8;">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              {{
                formatLocation(
                  crew.region || crew.activityRegion,
                  crew.district || crew.activityDistrict,
                )
              }}
            </p>
            <div class="card-stats">
              <span class="stat-item stat-flex">
                <svg fill="currentColor" viewBox="0 0 24 24" style="width:12px;height:12px;color:#bbb;">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                {{ crew.currentMemberCount ?? 0 }}/{{ (crew.maxMemberCount || crew.maxMembers) ?? 0 }}명
              </span>
              <span v-if="crewRating(crew)" class="stat-sep">·</span>
              <span v-if="crewRating(crew)" class="stat-item stat-rating stat-flex">
                <svg fill="#f59e0b" viewBox="0 0 24 24" style="width:12px;height:12px;">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                {{ Number(crewRating(crew)).toFixed(1) }}
              </span>
              <span class="stat-sep">·</span>
              <span class="stat-item stat-flex">
                <svg fill="currentColor" viewBox="0 0 24 24" style="width:12px;height:12px;color:#bbb;">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                {{ crew.viewCount ?? 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 더보기 -->
      <div v-if="!isLoading && hasMore" class="more-wrap">
        <button class="more-btn" @click="loadMore" :disabled="isLoadingMore">
          <span v-if="isLoadingMore" class="spin"></span>
          <span v-else
            >더보기 <em>({{ remainCount }}개 남음)</em></span
          >
        </button>
      </div>
      <div
        v-if="!isLoading && !hasMore && filteredCrews.length > 0"
        class="end-msg"
      >
        모든 추천 크루를 불러왔습니다
      </div>
    </main>
  </div>
</template>

<script>
import axios from "axios";

const API = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || "http://localhost:8080",
});
API.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const PAGE_SIZE = 10;
const RECENT_KEY = "recentCrews";

const CATEGORY_OPTIONS = [
  { label: "운동/스포츠", value: "SPORT", color: "#FF6B35" },
  { label: "독서", value: "BOOK", color: "#4C9BE8" },
  { label: "요리/제조", value: "COOK", color: "#F5A623" },
  { label: "취미/DIY", value: "DIY", color: "#7ED321" },
  { label: "여행", value: "TRAVEL", color: "#9B59B6" },
  { label: "어학", value: "LANGUAGE", color: "#1ABC9C" },
  { label: "자동차", value: "CAR", color: "#E74C3C" },
  { label: "게임/오락", value: "GAME", color: "#3498DB" },
  { label: "문화/공연", value: "CULTURE", color: "#E91E63" },
  { label: "반려동물", value: "PET", color: "#795548" },
];

import LnbMenuComponent from "@/components/common/LnbMenuComponent.vue";

export default {
  name: "RecommendedCrewPage",
  components: { LnbMenuComponent },
  data() {
    return {
      categoryOptions: CATEGORY_OPTIONS,
      selectedCategory: "",
      crews: [],
      page: 0,
      totalElements: 0,
      hasMore: false,
      isLoading: false,
      isLoadingMore: false,
      recentCrews: [],
    };
  },
  computed: {
    recentCrewsWithLabel() {
      return this.recentCrews.map((c) => ({
        ...c,
        crewImage: c.crewImage || c.crewImageUrl,
        categoryLabel: this.categoryLabel(c.categoryType || c.category),
      }));
    },
    filteredCrews() {
      if (!this.selectedCategory) return this.crews;
      return this.crews.filter((c) => c.categoryType === this.selectedCategory);
    },
    remainCount() {
      return Math.min(this.totalElements - this.crews.length, PAGE_SIZE);
    },
  },
  async mounted() {
    this.loadRecentCrews();
    await this.fetchCrews(false);
  },
  methods: {
    // ── 유틸 ──
    formatLocation(region, district) {
      const r = (region || "").trim(),
        d = (district || "").trim();
      if (!r && !d) return "지역 미설정";
      return r && d ? `${r} ${d}` : r || d;
    },
    categoryLabel(type) {
      return (
        CATEGORY_OPTIONS.find((c) => c.value === type)?.label ?? (type || "")
      );
    },
    catLabel(type) {
      return CATEGORY_OPTIONS.find((c) => c.value === type)?.label ?? "";
    },
    catColor(type) {
      return CATEGORY_OPTIONS.find((c) => c.value === type)?.color ?? "#4FA8D8";
    },
    crewRating(crew) {
      return crew.ratingAvg ?? crew.averageRating ?? null;
    },
    normalizeCrew(c) {
      const rating = c.ratingAvg ?? c.averageRating ?? null;
      return { ...c, ratingAvg: rating, averageRating: rating, favorite: c.favorite === true, _favLoading: false };
    },

    // ── 카테고리 선택 ──
    selectCategory(val) {
      this.selectedCategory = val;
    },
    onCategoryToggle(value) {
      this.selectedCategory = this.selectedCategory === value ? "" : value;
    },
    onLnbNavClick(key) {
      if (key === "home") this.$router.push("/");
      else if (key === "my-crews") this.$router.push("/my/crews");
      else if (key === "recommendations")
        this.$router.push("/crew/recommendations");
      else if (key === "rising") this.$router.push("/crew/rising-crews");
      else if (key === "meetings") this.$router.push("/my/meetings");
      else if (key === "recent") this.$router.push("/my/recent");
    },

    // ── 크루 상세 이동 + 최근 본 크루 저장 ──
    goDetail(crew) {
      try {
        const list = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
        const entry = {
          crewId: crew.crewId,
          crewName: crew.crewName,
          crewImage: crew.crewImageUrl || crew.crewImage,
          categoryType: crew.categoryType,
          region: crew.region || crew.activityRegion,
          district: crew.district,
        };
        localStorage.setItem(
          RECENT_KEY,
          JSON.stringify(
            [entry, ...list.filter((x) => x.crewId !== crew.crewId)].slice(
              0,
              10,
            ),
          ),
        );
        this.loadRecentCrews();
      } catch (_) {
        void _; /* localStorage 실패 시 무시 */
      }
      this.$router.push("/crew/" + crew.crewId);
    },

    // ── 최근 본 크루 ──
    loadRecentCrews() {
      try {
        this.recentCrews = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      } catch {
        this.recentCrews = [];
      }
    },
    removeRecent(id) {
      this.recentCrews = this.recentCrews.filter((c) => c.crewId !== id);
      localStorage.setItem(RECENT_KEY, JSON.stringify(this.recentCrews));
    },
    clearRecent() {
      this.recentCrews = [];
      localStorage.setItem(RECENT_KEY, "[]");
    },

    // ── API ──
    async fetchCrews(append = false) {
      if (append) this.isLoadingMore = true;
      else {
        this.isLoading = true;
        this.page = 0;
        this.crews = [];
      }
      try {
        const res = await API.get("/crew/recommendations", {
          params: { page: this.page, size: PAGE_SIZE, sort: "id,desc" },
        });
        const data = res.data;
        const content = (data?.content || []).map(this.normalizeCrew);
        this.crews = append ? [...this.crews, ...content] : content;
        this.totalElements = data?.totalElements ?? this.crews.length;
        this.hasMore = data?.last !== undefined ? !data.last : false;
      } catch {
        // 폴백: /crew/popular
        try {
          const res = await API.get("/crew/popular");
          this.crews = (Array.isArray(res.data) ? res.data : []).map(
            this.normalizeCrew,
          );
          this.totalElements = this.crews.length;
          this.hasMore = false;
        } catch {
          this.crews = [];
        }
      } finally {
        this.isLoading = false;
        this.isLoadingMore = false;
      }
    },

    async loadMore() {
      this.page++;
      await this.fetchCrews(true);
    },

  async toggleFavorite(crew) {
  if (!localStorage.getItem("token")) {
    alert("로그인이 필요합니다.");
    return;
  }
  if (crew._favLoading) return;

  crew._favLoading = true;
  try {
    let res;
    if (crew.favorite) {
      // 이미 찜 상태면 → 취소
      res = await API.delete(`/crew/${crew.crewId}/favorite`);
    } else {
      // 찜 안 된 상태면 → 찜하기
      res = await API.post(`/crew/${crew.crewId}/favorite`);
    }
    crew.favorite = res.data === true; // POST면 true, DELETE면 false
  } catch (e) {
    alert(e.response?.data?.message || "찜 처리에 실패했습니다.");
  } finally {
    crew._favLoading = false;
  }
},
  },
};
</script>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.page-root {
  display: flex;
  min-height: 100vh;
  background: #f9f9f9;
  font-family: "Pretendard", "Apple SD Gothic Neo", -apple-system, sans-serif;
  width: 100%;
}

/* ══════════ 메인 ══════════ */
.main {
  flex: 1;
  min-width: 0;
  padding: 24px 28px 60px;
}

/* 페이지 헤더 */
.page-hd {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 20px;
}
.page-title {
  font-size: 20px;
  font-weight: 800;
  color: #111;
}
.page-cat-label {
  font-size: 15px;
  font-weight: 500;
  color: #888;
}
.page-count {
  font-size: 13px;
  color: #aaa;
}

/* ══ 3열 그리드 ══ */
.crew-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

/* ══ 카드 ══ */
.crew-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  transition: transform 0.16s, box-shadow 0.16s;
}
.crew-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
}

/* 이미지 영역 */
.card-thumb-area {
  position: relative;
  aspect-ratio: 4 / 3;
  height: auto;
  overflow: hidden;
  background: #1a1a2e;
}
.card-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}
.crew-card:hover .card-thumb-img {
  transform: scale(1.04);
}
.card-thumb-ph {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E7F3FF;
}
/* 상단 배지 */
.card-top-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 6px;
  align-items: center;
}
.cat-badge {
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.35) 0%,
    rgba(80, 80, 80, 0.3) 100%
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  letter-spacing: 0.1px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

/* 찜하기 버튼 */
.fav-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform 0.15s;
  z-index: 2;
}
.fav-btn:hover {
  transform: scale(1.15);
}

/* 하단 오버레이 + 크루명 */
.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 44px 14px 14px;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.78) 0%,
    transparent 100%
  );
}
.card-crew-name {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  line-height: 1.3;
  letter-spacing: -0.3px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 카드 바디 */
.card-body {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.card-region {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 3px;
}
.card-stats {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.stat-item {
  font-size: 11.5px;
  color: #bbb;
}
.stat-flex {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.stat-rating {
  color: #f59e0b;
  font-weight: 600;
}
.stat-sep {
  font-size: 10px;
  color: #ddd;
}

/* 스켈레톤 */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 400px;
  animation: shimmer 1.4s infinite;
  border: none !important;
}
.sk-line {
  border-radius: 5px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 400px;
  animation: shimmer 1.4s infinite;
}
.skeleton-card .card-thumb-area {
  height: 200px;
}
.skeleton-card .card-body {
  padding: 14px 16px 18px;
}
@keyframes shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}

/* 빈 상태 */
.empty-wrap {
  text-align: center;
  padding: 80px 0;
}
.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}
.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #aaa;
  margin-bottom: 8px;
}
.empty-desc {
  font-size: 12.5px;
  color: #ccc;
  line-height: 1.7;
}

/* 더보기 */
.more-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
.more-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 36px;
  background: #fff;
  border: 1.5px solid #e0e0e0;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: all 0.15s;
}
.more-btn em {
  font-style: normal;
  font-size: 12px;
  color: #aaa;
  font-weight: 400;
}
.more-btn:hover:not(:disabled) {
  border-color: #4fa8d8;
  color: #4fa8d8;
  background: #fff8f5;
}
.more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.spin {
  width: 16px;
  height: 16px;
  border: 2px solid #4fa8d8;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.end-msg {
  text-align: center;
  padding: 28px;
  font-size: 13px;
  color: #ccc;
}

/* ══ 반응형 ══ */
@media (max-width: 1100px) {
  .crew-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 900px) {
  .main {
    padding: 16px 14px 48px;
  }
  .crew-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }
  .card-thumb-area {
    height: 170px;
  }
  .card-crew-name {
    font-size: 15px;
  }
}
@media (max-width: 640px) {
  .crew-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .main {
    padding: 12px 12px 48px;
  }
  .card-thumb-area {
    height: 150px;
  }
}
</style>

