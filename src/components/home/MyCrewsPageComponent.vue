<template>
  <div class="page-root">
    <!-- ======= LNB (공통 컴포넌트) ======= -->
    <LnbMenuComponent
      active-nav="my-crews"
      :category-options="categoryOptions"
      :selected-category-values="selectedCategoryValues"
      category-mode="single"
      @nav-click="onLnbNavClick"
      @category-toggle="onCategoryToggle"
      @category-click="val => $router.push({ path: '/crew/search', query: val ? { category: val } : {} })"
      @category-clear="$router.push('/')"
    />

    <!-- ======= 메인 ======= -->
    <main class="main">
      <!-- 페이지 헤더 -->
      <div class="page-hd">
        <div class="page-hd-left">
          <h1 class="page-title">내 크루</h1>
          <span v-if="!isLoading" class="page-count">{{ crews.length }}개</span>
        </div>
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
      <div v-else-if="crews.length === 0" class="empty-wrap">
        <p class="empty-title">참여 중인 크루가 없습니다</p>
        <p class="empty-desc">새로운 크루에 가입해서 활동을 시작해보세요!</p>
        <button class="empty-cta" @click="$router.push('/')">
          크루 둘러보기
        </button>
      </div>

      <!-- 크루 카드 그리드 -->
      <div v-else class="crew-grid">
        <div
          v-for="crew in crews"
          :key="crew.crewId"
          class="crew-card"
          @click="goDetail(crew)"
        >
          <!-- 이미지 영역 (홈 크루 카드 형식) -->
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
              <span
                v-if="crew.role === 'OWNER'"
                class="role-badge role-badge--leader"
                >크루장</span
              >
              <span
                v-else-if="crew.role === 'MANAGER'"
                class="role-badge role-badge--staff"
                >운영진</span
              >
            </div>

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
                {{ crew.currentMemberCount ?? 0 }}/{{ crew.maxMembers ?? 0 }}명
              </span>
              <span v-if="crew.ratingAvg" class="stat-sep">·</span>
              <span v-if="crew.ratingAvg" class="stat-item stat-rating stat-flex">
                <svg fill="#f59e0b" viewBox="0 0 24 24" style="width:12px;height:12px;">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                {{ Number(crew.ratingAvg).toFixed(1) }}
              </span>
              <span class="stat-sep">·</span>
              <span class="stat-item stat-flex">
                <svg fill="currentColor" viewBox="0 0 24 24" style="width:12px;height:12px;color:#bbb;">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                {{ crew.viewCount ?? 0 }}
              </span>
            </div>
            <p v-if="crew.description" class="card-desc">
              {{ crew.description }}
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from "axios";
import LnbMenuComponent from "@/components/common/LnbMenuComponent.vue";

const API = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
});
API.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

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

export default {
  name: "MyCrewListPage",
  components: { LnbMenuComponent },

  data() {
    return {
      crews: [],
      isLoading: false,
      categoryOptions: CATEGORY_OPTIONS,
      selectedCategoryValues: [],
    };
  },

  async mounted() {
    if (!localStorage.getItem("token")) {
      this.$router.replace({ path: "/login", query: { redirect: "/my/crews" } });
      return;
    }
    await this.fetchMyCrews();
  },

  methods: {
    // ── 유틸 ──
    formatLocation(region, district) {
      const r = (region || "").trim();
      const d = (district || "").trim();
      if (!r && !d) return "지역 미설정";
      return r && d ? `${r} ${d}` : r || d;
    },
    categoryLabel(type) {
      return (
        CATEGORY_OPTIONS.find((c) => c.value === type)?.label ?? (type || "")
      );
    },
    catColor(type) {
      return CATEGORY_OPTIONS.find((c) => c.value === type)?.color ?? "#4FA8D8";
    },

    // ── 네비게이션 ──
    onLnbNavClick(key) {
      if (key === "home") this.$router.push("/");
      else if (key === "my-crews") this.$router.push("/my/crews");
      else if (key === "recommendations")
        this.$router.push("/crew/recommendations");
      else if (key === "rising") this.$router.push("/crew/rising-crews");
      else if (key === "meetings") this.$router.push("/my/meetings");
      else if (key === "recent") this.$router.push("/my/recent");
    },

    goDetail(crew) {
      this.$router.push("/crew/" + crew.crewId);
    },

    onCategoryToggle(value) {
  this.$router.push({ path: "/crew/search", query: { category: value } });
    },

    // ── API: 내가 속한 크루 목록 ──
    async fetchMyCrews() {
      this.isLoading = true;
      try {
        const res = await API.get("/crew/myCrew");
        const data = res.data;
        this.crews = Array.isArray(data) ? data : data?.content || [];
      } catch (e) {
        console.error(e);
        this.crews = [];
      } finally {
        this.isLoading = false;
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
  background: #f4f4f4;
  font-family: "Pretendard", "Apple SD Gothic Neo", -apple-system, sans-serif;
  width: 100%;
}

/* ══════════ 메인 ══════════ */
.main {
  flex: 1;
  min-width: 0;
  padding: 28px 28px 80px;
}

/* 헤더 */
.page-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
}
.page-hd-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.page-title {
  font-size: 22px;
  font-weight: 900;
  color: #111;
  letter-spacing: -0.5px;
}
.page-count {
  font-size: 13px;
  color: #aaa;
  font-weight: 500;
}
.find-crew-btn {
  padding: 9px 18px;
  background: #4fa8d8;
  color: #fff;
  border: none;
  border-radius: 22px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, transform 0.12s;
  letter-spacing: -0.2px;
}
.find-crew-btn:hover {
  background: #3A8FC0;
  transform: translateY(-1px);
}

/* ══ 카드 그리드 (4열) ══ */
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
  cursor: pointer;
  transition: transform 0.16s, box-shadow 0.16s;
  border: 1px solid #e8e8e8;
}
.crew-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
}

/* 이미지 영역 (홈과 동일 aspect-ratio) */
.card-thumb-area {
  position: relative;
  aspect-ratio: 4 / 3;
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
.role-badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.1px;
}
.role-badge--leader {
  background: rgba(255, 200, 0, 0.2);
  color: #f5c400;
  border: 1px solid rgba(255, 200, 0, 0.35);
}
.role-badge--staff {
  background: rgba(100, 180, 255, 0.2);
  color: #64b4ff;
  border: 1px solid rgba(100, 180, 255, 0.35);
}

/* 하단 그라데이션 오버레이 + 크루명 */
.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 44px 14px 14px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.78) 0%, transparent 100%);
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
.card-desc {
  font-size: 12px;
  color: #aaa;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 2px;
}

/* ══ 스켈레톤 ══ */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 400px;
  animation: shimmer 1.4s infinite;
  border: none !important;
}
.sk-line {
  border-radius: 5px;
  display: block;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 400px;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}
.skeleton-card .card-thumb-area {
  aspect-ratio: 4 / 3;
}
.skeleton-card .card-body {
  padding: 14px 16px 18px;
}

/* ══ 빈 상태 ══ */
.empty-wrap {
  text-align: center;
  padding: 100px 0;
}
.empty-title {
  font-size: 16px;
  font-weight: 700;
  color: #aaa;
  margin-bottom: 8px;
}
.empty-desc {
  font-size: 13px;
  color: #ccc;
  line-height: 1.7;
  margin-bottom: 24px;
}
.empty-cta {
  padding: 11px 28px;
  background: #4fa8d8;
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.empty-cta:hover {
  background: #3A8FC0;
}

/* ══ 반응형 ══ */
@media (max-width: 1100px) {
  .crew-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 900px) {
  .main {
    padding: 16px 14px 60px;
  }
  .crew-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .card-thumb-area {
    height: 180px;
  }
  .card-crew-name {
    font-size: 17px;
  }
}
@media (max-width: 600px) {
  .main {
    padding: 12px 12px 60px;
  }
  .crew-grid {
    grid-template-columns: 1fr;
  }
  .card-thumb-area {
    height: 200px;
  }
}
</style>

