<template>
  <div class="page-root">
    <!-- ======= LNB ======= -->
    <LnbMenuComponent
      active-nav="recent"
      :category-options="categoryOptions"
      :selected-category-values="[]"
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
          <h1 class="page-title">최근 본 크루</h1>
          <span class="page-count">{{ recentCrews.length }}개</span>
        </div>
        <button
          v-if="recentCrews.length > 0"
          class="clear-all-btn"
          @click="clearAll"
        >
          전체 삭제
        </button>
      </div>

      <!-- 빈 상태 -->
      <div v-if="recentCrews.length === 0" class="empty-wrap">
        <p class="empty-title">최근 본 크루가 없습니다</p>
        <p class="empty-desc">크루를 탐색하고 방문한 크루가 여기에 표시됩니다.</p>
        <button class="empty-cta" @click="$router.push('/')">
          크루 둘러보기
        </button>
      </div>

      <!-- 크루 카드 그리드 (홈 카드 형식) -->
      <div v-else class="crew-grid">
        <div
          v-for="crew in recentCrews"
          :key="crew.crewId"
          class="crew-card"
          @click="$router.push('/crew/' + crew.crewId)"
        >
          <div class="card-thumb-area">
            <img
              v-if="crew.crewImage"
              :src="crew.crewImage"
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
              class="del-btn"
              @click.stop="removeRecent(crew.crewId)"
              title="최근 목록에서 삭제"
            >
              <svg fill="currentColor" viewBox="0 0 24 24" style="width:14px;height:14px;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
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
              {{ formatLocation(crew.region, crew.district) }}
            </p>
            <div class="card-stats">
              <span v-if="crew.currentMemberCount != null" class="stat-item stat-flex">
                <svg fill="currentColor" viewBox="0 0 24 24" style="width:12px;height:12px;color:#bbb;">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                {{ crew.currentMemberCount }}/{{ crew.maxMembers ?? "?" }}명
              </span>
              <span v-if="crew.currentMemberCount != null" class="stat-sep">·</span>
              <span v-if="crew.viewCount != null" class="stat-item stat-flex">
                <svg fill="currentColor" viewBox="0 0 24 24" style="width:12px;height:12px;color:#bbb;">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                {{ crew.viewCount }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import LnbMenuComponent from "@/components/common/LnbMenuComponent.vue";

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

export default {
  name: "RecentCrewsPage",
  components: { LnbMenuComponent },

  data() {
    return {
      recentCrews: [],
      categoryOptions: CATEGORY_OPTIONS,
    };
  },

  mounted() {
    this.loadRecentCrews();
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
      return (
        CATEGORY_OPTIONS.find((c) => c.value === type)?.color ?? "#4FA8D8"
      );
    },

    // ── 최근 본 크루 ──
    loadRecentCrews() {
      try {
        this.recentCrews = JSON.parse(
          localStorage.getItem(RECENT_KEY) || "[]",
        );
      } catch {
        this.recentCrews = [];
      }
    },
    removeRecent(crewId) {
      this.recentCrews = this.recentCrews.filter((c) => c.crewId !== crewId);
      localStorage.setItem(RECENT_KEY, JSON.stringify(this.recentCrews));
    },
    clearAll() {
      this.recentCrews = [];
      localStorage.setItem(RECENT_KEY, "[]");
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
    onCategoryToggle(value) {
  this.$router.push({ path: "/crew/search", query: { category: value } });
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
.clear-all-btn {
  padding: 7px 16px;
  background: none;
  border: 1.5px solid #e0e0e0;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  transition: all 0.15s;
}
.clear-all-btn:hover {
  border-color: #4fa8d8;
  color: #4fa8d8;
}

/* ══ 카드 그리드 (3열) ══ */
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

/* 삭제 버튼 (최근 본 크루 전용) */
.del-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, transform 0.15s;
  z-index: 2;
}
.del-btn:hover {
  background: rgba(255, 80, 0, 0.85);
  transform: scale(1.1);
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
.stat-sep {
  font-size: 10px;
  color: #ddd;
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
    gap: 14px;
  }
  .card-crew-name {
    font-size: 15px;
  }
}
@media (max-width: 600px) {
  .main {
    padding: 12px 12px 60px;
  }
  .crew-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}
</style>

