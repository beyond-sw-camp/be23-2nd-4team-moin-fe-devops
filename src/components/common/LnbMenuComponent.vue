<template>
  <aside class="lnb">
    <nav class="lnb-nav">
      <!-- 홈 -->
      <a class="lnb-item" :class="{ active: activeNav === 'home' }" href="#" @click.prevent="$emit('nav-click', 'home')">
        <svg class="lnb-icon" style="color:#4A90D9" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
        <span class="lnb-txt">홈</span>
      </a>

      <!-- 내 크루 -->
      <a class="lnb-item" :class="{ active: activeNav === 'my-crews' }" href="#" @click.prevent="$emit('nav-click', 'my-crews')">
        <svg class="lnb-icon" style="color:#7B8FA6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
        <span class="lnb-txt">내 크루</span>
      </a>

      <!-- 추천 크루 -->
      <a class="lnb-item" :class="{ active: activeNav === 'recommendations' }" href="#" @click.prevent="$emit('nav-click', 'recommendations')">
        <svg class="lnb-icon" style="color:#3DAA7D" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/>
        </svg>
        <span class="lnb-txt">추천 크루</span>
      </a>

      <!-- 급상승 루키 크루 -->
      <a class="lnb-item" :class="{ active: activeNav === 'rising' }" href="#" @click.prevent="$emit('nav-click', 'rising')">
        <svg class="lnb-icon" style="color:#E8854A" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
        </svg>
        <span class="lnb-txt">급상승 루키 크루</span>
      </a>

      <!-- 내 모임 일정 -->
      <a class="lnb-item" :class="{ active: activeNav === 'meetings' }" href="#" @click.prevent="$emit('nav-click', 'meetings')">
        <svg class="lnb-icon" style="color:#5B9BD5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
        </svg>
        <span class="lnb-txt">내 모임 일정</span>
      </a>

      <!-- 최근 본 크루 -->
      <a class="lnb-item" :class="{ active: activeNav === 'recent' }" href="#" @click.prevent="$emit('nav-click', 'recent')">
        <svg class="lnb-icon" style="color:#E86A6A" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
        </svg>
        <span class="lnb-txt">최근 본 크루</span>
      </a>

      <div class="lnb-divider"></div>
      <p class="lnb-section-label">카테고리</p>

      <!-- 전체 -->
      <a
        class="lnb-item lnb-cat"
        :class="{ active: activeNav === 'search' && selectedCategoryValues.length === 0 }"
        href="#"
        @click.prevent="goToCategory('')"
      >
        <svg class="lnb-icon" style="color:#4A90D9" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z"/>
        </svg>
        <span class="lnb-txt">전체</span>
      </a>

      <!-- 카테고리 목록 -->
      <a
        v-for="cat in categoryOptions"
        :key="cat.value"
        class="lnb-item lnb-cat"
        :class="{ active: isCategorySelected(cat.value) }"
        href="#"
        @click.prevent="goToCategory(cat.value)"
      >
        <svg class="lnb-icon" :style="{ color: getCategoryIconColor(cat.label) }" viewBox="0 0 24 24" fill="currentColor">
          <path :d="getCategoryIconPath(cat.label)"/>
        </svg>
        <span class="lnb-txt">{{ cat.label }}</span>
      </a>
    </nav>
  </aside>
</template>

<script>
const CATEGORY_ICONS = {
  운동:  { path: 'M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z', color: '#FF6B35' },
  독서:  { path: 'M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z', color: '#4C9BE8' },
  요리:  { path: 'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z', color: '#F5A623' },
  제조:  { path: 'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z', color: '#F5A623' },
  취미:  { path: 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z', color: '#7ED321' },
  diy:   { path: 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z', color: '#7ED321' },
  여행:  { path: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z', color: '#9B59B6' },
  어학:  { path: 'M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z', color: '#1ABC9C' },
  자동차:{ path: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-5h14v5zm-2.5-3.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-9 0c-.83 0-1.5.67-1.5 1.5S6.67 15.5 7.5 15.5 9 14.83 9 14s-.67-1.5-1.5-1.5z', color: '#E74C3C' },
  게임:  { path: 'M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5S14.67 12 15.5 12s1.5.67 1.5 1.5S16.33 15 15.5 15zm3-3c-.83 0-1.5-.67-1.5-1.5S17.67 9 18.5 9s1.5.67 1.5 1.5S19.33 12 18.5 12z', color: '#3498DB' },
  오락:  { path: 'M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5S14.67 12 15.5 12s1.5.67 1.5 1.5S16.33 15 15.5 15zm3-3c-.83 0-1.5-.67-1.5-1.5S17.67 9 18.5 9s1.5.67 1.5 1.5S19.33 12 18.5 12z', color: '#3498DB' },
  문화:  { path: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z', color: '#E91E63' },
  공연:  { path: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z', color: '#E91E63' },
  반려:  { path: 'M4.5 9.5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm8.5-5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM21 9.5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM17.5 5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM6.5 5c0 1.1-.9 2-2 2S2.5 6.1 2.5 5s.9-2 2-2 2 .9 2 2zm5.5 5c-3.5 0-6 2-6 5v3h12v-3c0-3-2.5-5-6-5z', color: '#795548' },
  동물:  { path: 'M4.5 9.5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm8.5-5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM21 9.5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM17.5 5c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM6.5 5c0 1.1-.9 2-2 2S2.5 6.1 2.5 5s.9-2 2-2 2 .9 2 2zm5.5 5c-3.5 0-6 2-6 5v3h12v-3c0-3-2.5-5-6-5z', color: '#795548' },
};
const FALLBACK = { path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z', color: '#bbb' };

export default {
  name: "LnbMenuComponent",
  emits: ["nav-click", "category-click", "category-toggle", "recent-clear", "recent-remove", "recent-click"],
  props: {
    activeNav: { type: String, default: null },
    categoryOptions: { type: Array, default: () => [
      { label: "운동/스포츠", value: "SPORT"    },
      { label: "독서",        value: "BOOK"     },
      { label: "요리/제조",   value: "COOK"     },
      { label: "취미/DIY",    value: "DIY"      },
      { label: "여행",        value: "TRAVEL"   },
      { label: "어학",        value: "LANGUAGE" },
      { label: "자동차",      value: "CAR"      },
      { label: "게임/오락",   value: "GAME"     },
      { label: "문화/공연",   value: "CULTURE"  },
      { label: "반려동물",    value: "PET"      },
    ] },
    selectedCategoryValues: { type: Array, default: () => [] },
    categoryMode: { type: String, default: "multi" },
    recentCrews: { type: Array, default: () => [] },
  },
  methods: {
    // ✅ 카테고리 클릭 시 항상 /crew/search 로 직접 라우팅
    goToCategory(value) {
      const path = '/crew/search'
      const query = value ? { category: value } : {}

      if (this.$route.path !== path) {
        // 다른 페이지에 있을 때 → push로 이동
        this.$router.push({ path, query })
      } else {
        // 이미 /crew/search 에 있을 때 → replace로 쿼리만 교체
        this.$router.replace({ path, query })
      }

      // 부모 컴포넌트의 상태 동기화가 필요한 경우를 위해 emit은 유지
      this.$emit('category-click', value)
      this.$emit('category-toggle', value)
    },

    isCategorySelected(value) {
      return this.selectedCategoryValues.includes(value);
    },
    _getCategoryData(label) {
      if (!label) return FALLBACK;
      const lower = label.toLowerCase();
      for (const [keyword, data] of Object.entries(CATEGORY_ICONS)) {
        if (lower.includes(keyword.toLowerCase())) return data;
      }
      return FALLBACK;
    },
    getCategoryIconPath(label) {
      return this._getCategoryData(label).path;
    },
    getCategoryIconColor(label) {
      return this._getCategoryData(label).color;
    },
  },
};
</script>

<style scoped>
.lnb {
  width: 240px;
  flex-shrink: 0;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 1px solid #e8e8e8;
  background: #fff;
  padding: 16px 0;
  scrollbar-width: none;
}
.lnb::-webkit-scrollbar { display: none; }
.lnb-nav { padding: 0 8px; }

.lnb-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.12s;
  margin-bottom: 2px;
}
.lnb-item:hover { background: #EBF6FC; }
.lnb-item.active { background: #E0F2FA; font-weight: 700; }

.lnb-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  transition: opacity 0.12s;
}
.lnb-txt {
  font-size: 13.5px;
  color: #444;
  transition: color 0.12s;
}

.lnb-item:hover .lnb-icon,
.lnb-item.active .lnb-icon {
  opacity: 0.85;
  filter: brightness(1.1);
}
.lnb-item:hover .lnb-txt,
.lnb-item.active .lnb-txt {
  color: #4FA8D8;
}

.lnb-cat .lnb-icon { width: 18px; height: 18px; }

.lnb-divider { height: 1px; background: #f0f0f0; margin: 12px 8px; }
.lnb-section-label {
  font-size: 11px;
  font-weight: 700;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 4px 12px 6px;
  margin: 0;
}

@media (max-width: 900px) {
  .lnb { width: 56px; }
  .lnb-txt, .lnb-section-label { display: none; }
  .lnb-item { justify-content: center; padding: 10px 0; }
}
@media (max-width: 600px) {
  .lnb { display: none; }
}
</style>