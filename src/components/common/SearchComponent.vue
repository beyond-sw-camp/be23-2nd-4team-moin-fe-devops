<template>
  <div class="page-root">
    <!-- ======= GNB ======= -->
    <header class="gnb">
      <div class="gnb-inner">
        <!-- 뒤로가기 -->
        <button class="gnb-back-btn" @click="$router.back()">
          <svg fill="currentColor" viewBox="0 0 24 24" style="width:20px;height:20px;">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>

        <!-- 지역 드롭다운 -->
        <div class="gnb-region-wrap" @click="regionDropOpen = !regionDropOpen" ref="regionDrop">
          <span class="gnb-region-label">{{ search.region || "지역 전체" }}</span>
          <span class="gnb-region-arrow">▾</span>
          <div v-if="regionDropOpen" class="region-dropdown">
            <div class="region-dropdown-item" :class="{ active: !search.region }" @click.stop="selectRegion('')">전체</div>
            <div
              v-for="r in regions"
              :key="r.value"
              class="region-dropdown-item"
              :class="{ active: search.region === r.value }"
              @click.stop="selectRegion(r.value)"
            >{{ r.label }}</div>
          </div>
        </div>

        <!-- 검색창 -->
        <div class="gnb-search" ref="gnbSearchRef">
          <svg fill="currentColor" viewBox="0 0 24 24" style="width:18px;height:18px;color:#aaa;flex-shrink:0;">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            ref="searchInput"
            type="text"
            v-model="searchKeyword"
            placeholder="크루 이름으로 검색해보세요!"
            @input="onSearchInput"
            @compositionstart="onSearchCompositionStart"
            @compositionend="onSearchCompositionEnd"
            @keyup.enter="onSearchSubmit"
            class="gnb-search-input"
          />
          <button v-if="searchKeyword" @click="clearKeyword" class="gnb-clear-btn">
            <svg fill="currentColor" viewBox="0 0 24 24" style="width:16px;height:16px;color:#aaa;">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
          <button @click="onSearchSubmit" class="gnb-search-btn">검색</button>

          <!-- 자동완성 드롭다운 -->
          <div v-if="showDropdown" class="suggest-dropdown">
            <div v-if="loadingSuggest" class="suggest-dropdown-empty">검색 중...</div>
            <template v-else-if="suggestions.length > 0">
              <ul class="suggest-dropdown-list">
                <li
                  v-for="crew in suggestions"
                  :key="crew.id"
                  class="suggest-dropdown-item"
                  @mousedown.prevent="selectSuggestion(crew)"
                >
                  <svg fill="currentColor" viewBox="0 0 24 24" style="width:14px;height:14px;color:#bbb;flex-shrink:0;">
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                  <span class="suggest-dropdown-name">{{ crew.name }}</span>
                </li>
              </ul>
            </template>
            <div v-else class="suggest-dropdown-empty">검색 결과가 없습니다.</div>
          </div>
        </div>
      </div>
    </header>

    <div class="body-wrap">
      <!-- ======= LNB ======= -->
      <LnbMenuComponent
        active-nav="search"
        :category-options="categoryOptions"
        :selected-category-values="search.categoryTypes"
        category-mode="single"
        :recent-crews="[]"
        @nav-click="onLnbNavClick"
        @category-click="onLnbCategoryClick"
      />

      <!-- ======= 메인 ======= -->
      <main class="main">

        <!-- 활성 필터 요약 바 -->
        <div class="filter-bar" v-if="hasAnyFilter">
          <div class="filter-tags">
            <span v-if="search.region" class="filter-tag">
              <svg fill="currentColor" viewBox="0 0 24 24" style="width:11px;height:11px;">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              {{ search.region }}{{ search.district ? ' ' + search.district : '' }}
              <button @click="clearRegion" class="filter-tag-remove">×</button>
            </span>
            <span v-for="cat in activeCategoryLabels" :key="cat.value" class="filter-tag filter-tag--cat" :style="{ '--cat-c': cat.color }">
              {{ cat.label }}
              <button @click="removeCategory(cat.value)" class="filter-tag-remove">×</button>
            </span>
            <span v-if="search.name" class="filter-tag">
              <svg fill="currentColor" viewBox="0 0 24 24" style="width:11px;height:11px;">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              "{{ search.name }}"
              <button @click="clearName" class="filter-tag-remove">×</button>
            </span>
          </div>
          <button @click="clearAllFilters" class="filter-reset-btn">전체 초기화</button>
        </div>

        <!-- 구 필터 -->
        <div v-if="showDistrictBar" class="district-bar">
          <button @click="clearDistrict" :class="['d-chip', !search.district && 'd-chip--on']">전체</button>
          <button
            v-for="d in districtOptions"
            :key="d"
            @click="toggleDistrict(d)"
            :class="['d-chip', search.district === d && 'd-chip--on']"
          >{{ d }}</button>
        </div>

        <!-- 카테고리 칩 필터 -->
        <div class="cat-chip-bar">
          <button @click="clearCategories" :class="['cat-chip', search.categoryTypes.length === 0 && 'cat-chip--on']">전체</button>
          <button
            v-for="cat in categoryOptions"
            :key="cat.value"
            @click="toggleCategory(cat.value)"
            :class="['cat-chip', search.categoryTypes.includes(cat.value) && 'cat-chip--on']"
            :style="search.categoryTypes.includes(cat.value) ? { background: cat.color, borderColor: cat.color } : {}"
          >{{ cat.label }}</button>
        </div>

        <!-- 결과 헤더 -->
        <div class="result-header">
          <div class="result-count">
            검색 결과
            <strong>{{ section.total }}</strong>개
          </div>
          <div class="sort-options">
            <button
              v-for="s in sortOptions"
              :key="s.value"
              :class="['sort-btn', currentSort === s.value && 'sort-btn--on']"
              @click="setSort(s.value)"
            >{{ s.label }}</button>
          </div>
        </div>

        <!-- 결과 그리드 -->
        <div v-if="section.loading && section.list.length === 0" class="crew-grid">
          <div v-for="i in 8" :key="i" class="crew-card skeleton" style="height: 260px" />
        </div>

        <div v-else-if="section.list.length === 0 && !section.loading" class="empty-state">
          <div class="empty-icon">
            <svg fill="currentColor" viewBox="0 0 24 24" style="width:52px;height:52px;color:#ddd;">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
          <p class="empty-title">검색 결과가 없습니다</p>
          <p class="empty-sub">다른 검색어나 필터를 사용해보세요</p>
          <button @click="clearAllFilters" class="empty-reset-btn">필터 초기화</button>
        </div>

        <div v-else class="crew-grid">
          <div v-for="crew in section.list" :key="crew.crewId" class="crew-card" @click="viewCrew(crew)">
            <div class="card-thumb-area">
              <img v-if="crew.crewImage" :src="crew.crewImage" :alt="crew.crewName" class="card-thumb-img" />
              <div v-else class="card-thumb-ph">
                <svg fill="currentColor" viewBox="0 0 24 24" style="width:56px;height:56px;color:#fff;opacity:0.7;">
                  <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
                </svg>
              </div>
              <div class="card-top-badges">
                <span class="cat-badge" :style="{ '--cat-bg': catColor(crew.categoryType) }">{{ categoryLabel(crew.categoryType) }}</span>
              </div>
              <button type="button" class="fav-btn" :class="crew.favorite && 'fav-on'" @click.stop="toggleFavorite(crew)" :disabled="crew._favLoading">
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
                {{ formatLocation(crew.region, crew.district) }}
              </p>
              <div class="card-stats">
                <span class="stat-item stat-flex">
                  <svg fill="currentColor" viewBox="0 0 24 24" style="width:12px;height:12px;color:#bbb;">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                  </svg>
                  {{ crew.currentMemberCount ?? 0 }}명
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
            </div>
          </div>
        </div>

        <!-- 더보기 / 스피너 -->
        <div v-if="section.loading && section.list.length > 0" class="spinner-wrap">
          <div class="spinner" />
        </div>
        <div v-if="!section.loading && section.hasMore" class="more-btn-wrap">
          <button @click="loadMore" class="more-btn">
            더 보기
            <span class="more-btn-count">({{ remainCount }}개 남음)</span>
          </button>
        </div>
        <div v-if="!section.hasMore && section.list.length > 0 && !section.loading" class="end-msg">
          모든 크루를 불러왔습니다
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import LnbMenuComponent from "@/components/common/LnbMenuComponent.vue";

const API = axios.create({ baseURL: process.env.VUE_APP_API_BASE_URL });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const PAGE_SIZE = 12;

const CATEGORY_OPTIONS = [
  { label: "운동/스포츠", value: "SPORT", color: "#FF6B35" },
  { label: "독서",        value: "BOOK",   color: "#4C9BE8" },
  { label: "요리/제조",   value: "COOK",   color: "#F5A623" },
  { label: "취미/DIY",    value: "DIY",    color: "#7ED321" },
  { label: "여행",        value: "TRAVEL", color: "#9B59B6" },
  { label: "어학",        value: "LANGUAGE",color: "#1ABC9C" },
  { label: "자동차",      value: "CAR",    color: "#E74C3C" },
  { label: "게임/오락",   value: "GAME",   color: "#3498DB" },
  { label: "문화/공연",   value: "CULTURE",color: "#E91E63" },
  { label: "반려동물",    value: "PET",    color: "#795548" },
];

const REGIONS = [
  { label: "서울", value: "서울" }, { label: "부산", value: "부산" },
  { label: "대구", value: "대구" }, { label: "인천", value: "인천" },
  { label: "광주", value: "광주" }, { label: "대전", value: "대전" },
  { label: "울산", value: "울산" }, { label: "세종", value: "세종" },
  { label: "경기", value: "경기" }, { label: "강원", value: "강원" },
  { label: "충북", value: "충북" }, { label: "충남", value: "충남" },
  { label: "전북", value: "전북" }, { label: "전남", value: "전남" },
  { label: "경북", value: "경북" }, { label: "경남", value: "경남" },
  { label: "제주", value: "제주" },
];

const DISTRICTS_BY_REGION = {
  서울: ["강남구","강동구","강북구","강서구","관악구","광진구","구로구","금천구","노원구","도봉구","동대문구","동작구","마포구","서대문구","서초구","성동구","성북구","송파구","양천구","영등포구","용산구","은평구","종로구","중구","중랑구"],
  부산: ["강서구","금정구","기장군","남구","동구","동래구","부산진구","북구","사상구","사하구","서구","수영구","연제구","영도구","중구","해운대구"],
  대구: ["남구","달서구","달성군","동구","북구","서구","수성구","중구","군위군"],
  인천: ["계양구","미추홀구","남동구","동구","부평구","서구","연수구","중구","강화군","옹진군"],
  광주: ["광산구","남구","동구","북구","서구"],
  대전: ["대덕구","동구","서구","유성구","중구"],
  울산: ["남구","동구","북구","중구","울주군"],
  세종: ["조치원읍","연기면","연동면","부강면","금남면","장군면","연서면","전의면","전동면","소정면"],
  경기: ["수원시","성남시","용인시","고양시","화성시","부천시","남양주시","안산시","안양시","평택시","시흥시","김포시","파주시","의정부시","광주시","하남시","광명시","군포시","오산시","이천시","안성시","구리시","양주시","포천시","의왕시","여주시","동두천시","과천시","가평군","양평군","연천군"],
  강원: ["춘천시","원주시","강릉시","동해시","태백시","속초시","삼척시","홍천군","횡성군","영월군","평창군","정선군","철원군","화천군","양구군","인제군","고성군","양양군"],
  충북: ["청주시","충주시","제천시","보은군","옥천군","영동군","증평군","진천군","괴산군","음성군","단양군"],
  충남: ["천안시","공주시","보령시","아산시","서산시","논산시","계룡시","당진시","금산군","부여군","서천군","청양군","홍성군","예산군","태안군"],
  전북: ["전주시","군산시","익산시","정읍시","남원시","김제시","완주군","진안군","무주군","장수군","임실군","순창군","고창군","부안군"],
  전남: ["목포시","여수시","순천시","나주시","광양시","담양군","곡성군","구례군","고흥군","보성군","화순군","장흥군","강진군","해남군","영암군","무안군","함평군","영광군","장성군","완도군","진도군","신안군"],
  경북: ["포항시","경주시","김천시","안동시","구미시","영주시","영천시","상주시","문경시","경산시","의성군","청송군","영양군","영덕군","청도군","고령군","성주군","칠곡군","예천군","봉화군","울진군","울릉군"],
  경남: ["창원시","진주시","통영시","사천시","김해시","밀양시","거제시","양산시","의령군","함안군","창녕군","고성군","남해군","하동군","산청군","함양군","거창군","합천군"],
  제주: ["제주시","서귀포시"],
};

const RECENT_KEY = "recentCrews";
const MAX_RECENT = 10;

const SORT_OPTIONS = [
  { label: "최신순", value: "id,desc" },
  { label: "인기순", value: "viewCount,desc" },
  { label: "평점순", value: "ratingAvg,desc" },
  { label: "인원순", value: "currentMemberCount,desc" },
];

function makeSection() {
  return { list: [], page: 0, total: 0, hasMore: false, loading: false };
}

export default {
  name: "SearchComponent",
  components: { LnbMenuComponent },
  data() {
    return {
      categoryOptions: CATEGORY_OPTIONS,
      regions: REGIONS,
      sortOptions: SORT_OPTIONS,
      currentSort: "id,desc",
      search: {
        region: "",
        district: "",
        categoryTypes: [],
        name: "",
      },
      regionDropOpen: false,
      section: makeSection(),
      searchKeyword: "",
      suggestions: [],
      showDropdown: false,
      loadingSuggest: false,
      suggestDebounceTimer: null,
      outsideClickHandler: null,
      isComposingSearch: false,
    };
  },
  computed: {
    showDistrictBar() { return !!this.search.region; },
    districtOptions() { return DISTRICTS_BY_REGION[this.search.region] || []; },
    hasAnyFilter() {
      return !!this.search.region || !!this.search.district ||
        this.search.categoryTypes.length > 0 || !!this.search.name?.trim();
    },
    activeCategoryLabels() {
      return this.search.categoryTypes.map(v =>
        CATEGORY_OPTIONS.find(c => c.value === v)
      ).filter(Boolean);
    },
    remainCount() {
      return Math.min(this.section.total - this.section.list.length, PAGE_SIZE);
    },
  },
  watch: {
    "search.region"() { this.search.district = ""; },
  },
  mounted() {
    const q = this.$route?.query || {};
    if (q.category) this.search.categoryTypes = [q.category];
    if (q.region) this.search.region = q.region;
    if (q.name) { this.search.name = q.name; this.searchKeyword = q.name; }

    this.fetchSection();

    this.$nextTick(() => { this.$refs.searchInput?.focus(); });

    this.outsideClickHandler = (e) => {
      if (this.$refs.regionDrop && !this.$refs.regionDrop.contains(e.target))
        this.regionDropOpen = false;
      if (this.$refs.gnbSearchRef && !this.$refs.gnbSearchRef.contains(e.target))
        this.showDropdown = false;
    };
    document.addEventListener("click", this.outsideClickHandler);
  },
  beforeUnmount() {
    if (this.outsideClickHandler)
      document.removeEventListener("click", this.outsideClickHandler);
    if (this.suggestDebounceTimer)
      clearTimeout(this.suggestDebounceTimer);
  },
  methods: {
    formatLocation(region, district) {
      const r = (region || "").trim(), d = (district || "").trim();
      if (!r && !d) return "";
      if (r && d) return `${r} ${d}`;
      return r || d;
    },
    categoryLabel(type) {
      return CATEGORY_OPTIONS.find(c => c.value === type)?.label ?? type;
    },
    catColor(type) {
      return CATEGORY_OPTIONS.find(c => c.value === type)?.color ?? "#4FA8D8";
    },
    normalizeCrew(c) {
      return { ...c, favorite: c.favorite === true, _favLoading: false };
    },

    // ── 검색 / 자동완성 ──────────────────────────────────────
    onSearchCompositionStart() {
      this.isComposingSearch = true;
    },
    onSearchCompositionEnd() {
      this.isComposingSearch = false;
      this.onSearchInput();
    },
    onSearchSubmit() {
      if (this.isComposingSearch) return;
      this.search.name = (this.searchKeyword || "").trim();
      this.showDropdown = false;
      this.reset();
    },
    onSearchInput() {
      if (this.isComposingSearch) return;

      if (this.suggestDebounceTimer) clearTimeout(this.suggestDebounceTimer);
      const q = (this.searchKeyword || "").trim();
      if (!q) {
        this.suggestions = [];
        this.showDropdown = false;
        return;
      }
      this.suggestDebounceTimer = setTimeout(() => { this.fetchSuggest(); }, 300);
    },
    async fetchSuggest() {
      const q = (this.searchKeyword || "").trim();
      if (!q) { this.suggestions = []; this.showDropdown = false; return; }
      this.loadingSuggest = true;
      this.showDropdown = true;
      try {
        const res = await API.get("/crew/suggest", { params: { keyword: q } });
        const raw = res.data;
        let list = Array.isArray(raw) ? raw : (raw?.content ?? raw?.data ?? []);
        if (!Array.isArray(list)) list = [];
        this.suggestions = list.map(item => ({
          id: item.id ?? item.crewId,
          name: item.name ?? item.crewName ?? "",
        }));
      } catch (e) {
        this.suggestions = [];
        this.showDropdown = false;
      } finally {
        this.loadingSuggest = false;
      }
    },
    selectSuggestion(crew) {
      this.searchKeyword = crew.name || "";
      this.search.name = this.searchKeyword;
      this.showDropdown = false;
      this.suggestions = [];
      this.reset();
    },
    clearKeyword() {
      this.searchKeyword = "";
      this.search.name = "";
      this.showDropdown = false;
      this.suggestions = [];
      this.reset();
      this.$nextTick(() => this.$refs.searchInput?.focus());
    },

    // ── 필터 ─────────────────────────────────────────────────
    selectRegion(v) {
      this.search.region = v;
      this.search.district = "";
      this.regionDropOpen = false;
      this.reset();
    },
    toggleDistrict(v) {
      this.search.district = this.search.district === v ? "" : v;
      this.reset();
    },
    clearDistrict() { this.search.district = ""; this.reset(); },
    clearRegion() { this.search.region = ""; this.search.district = ""; this.reset(); },
    toggleCategory(v) {
      const idx = this.search.categoryTypes.indexOf(v);
      if (idx >= 0) this.search.categoryTypes.splice(idx, 1);
      else this.search.categoryTypes = [v];
      this.reset();
    },
    clearCategories() { this.search.categoryTypes = []; this.reset(); },
    removeCategory(v) {
      this.search.categoryTypes = this.search.categoryTypes.filter(c => c !== v);
      this.reset();
    },
    clearName() {
      this.search.name = "";
      this.searchKeyword = "";
      this.reset();
    },
    clearAllFilters() {
      this.search = { region: "", district: "", categoryTypes: [], name: "" };
      this.searchKeyword = "";
      this.suggestions = [];
      this.showDropdown = false;
      this.reset();
    },
    setSort(val) {
      this.currentSort = val;
      this.reset();
    },

    // ── 데이터 ───────────────────────────────────────────────
    reset() {
      Object.assign(this.section, makeSection());
      this.fetchSection();
    },
    async fetchSection() {
      if (this.section.loading) return;
      this.section.loading = true;
      try {
        const params = {
          size: PAGE_SIZE,
          sort: this.currentSort,
          page: this.section.page,
          ...(this.search.region?.trim()  ? { region: this.search.region.trim() }   : {}),
          ...(this.search.district?.trim()? { district: this.search.district.trim() }: {}),
          ...(this.search.name?.trim()    ? { crewName: this.search.name.trim() }    : {}),
          ...(this.search.categoryTypes.length ? { categoryTypes: this.search.categoryTypes[0] } : {}),
        };
        const res = await API.get("/crew/list", { params });
        const data = res.data;
        const content = (data?.content || []).map(this.normalizeCrew);
        this.section.list = [...this.section.list, ...content];
        this.section.total = data?.totalElements ?? this.section.list.length;
        this.section.hasMore = data?.last !== undefined ? !data.last : false;
      } catch (e) {
        console.error(e);
      } finally {
        this.section.loading = false;
      }
    },
    loadMore() {
      if (this.section.loading || !this.section.hasMore) return;
      this.section.page++;
      this.fetchSection();
    },

    // ── 네비 ─────────────────────────────────────────────────
    onLnbNavClick(key) {
      if (key === "home") this.$router.push("/");
      else if (key === "recent") this.$router.push("/my/recent");
      else if (key === "my-crews") this.$router.push("/my/crews");
      else if (key === "recommendations") this.$router.push("/crew/recommendations");
      else if (key === "rising") this.$router.push("/crew/rising-crews");
      else if (key === "meetings") this.$router.push("/my/meetings");
    },
    onLnbCategoryClick(categoryValue) {
      if (!categoryValue) { this.clearCategories(); return; }
      this.search.categoryTypes = [categoryValue];
      this.reset();
    },

    // ── 크루 뷰 / 찜 ─────────────────────────────────────────
    viewCrew(crew) {
      try {
        const recents = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
        const c = { crewId: crew.crewId, crewName: crew.crewName, crewImage: crew.crewImage, categoryType: crew.categoryType, region: crew.region, district: crew.district };
        const updated = [c, ...recents.filter(x => x.crewId !== crew.crewId)].slice(0, MAX_RECENT);
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      } catch (e) { /* ignore */ }
      this.$router.push("/crew/" + crew.crewId);
    },
    async toggleFavorite(crew) {
      const token = localStorage.getItem("token");
      if (!token) { alert("로그인이 필요합니다."); this.$router.push("/login"); return; }
      if (crew._favLoading) return;
      crew._favLoading = true;
      try {
        const res = await API.post(`/crew/${crew.crewId}/favorite`);
        crew.favorite = res.data === true;
        for (const c of this.section.list) if (c.crewId === crew.crewId) c.favorite = crew.favorite;
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
*, *::before, *::after { box-sizing: border-box; }

.page-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f9f9f9;
  font-family: "Pretendard", "Apple SD Gothic Neo", -apple-system, sans-serif;
}

/* ── GNB ────────────────────────────────────── */
.gnb {
  position: sticky;
  top: 64px;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  height: 56px;
  width: 100%;
}
.gnb-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 100%;
  padding: 0 16px;
}

.gnb-back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  color: #555;
  flex-shrink: 0;
  transition: background 0.12s;
}
.gnb-back-btn:hover { background: #f0f0f0; }

.gnb-region-wrap {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
  user-select: none;
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  transition: border-color 0.15s;
}
.gnb-region-wrap:hover { border-color: #4FA8D8; }
.gnb-region-arrow { font-size: 11px; color: #888; }
.region-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  min-width: 120px;
  max-height: 320px;
  overflow-y: auto;
  z-index: 300;
  padding: 6px 0;
}
.region-dropdown-item {
  padding: 9px 16px;
  font-size: 13.5px;
  color: #333;
  cursor: pointer;
  transition: background 0.1s;
}
.region-dropdown-item:hover { background: #EBF6FC; color: #4FA8D8; }
.region-dropdown-item.active { font-weight: 700; color: #4FA8D8; }

.gnb-search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 0 8px 0 14px;
  height: 38px;
  min-width: 0;
  position: relative;
  transition: box-shadow 0.15s;
}
.gnb-search:focus-within {
  box-shadow: 0 0 0 2px #4FA8D840;
  background: #fff;
  border: 1px solid #4FA8D8;
}
.gnb-search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
  padding: 0;
  color: #222;
  min-width: 0;
}
.gnb-search-input::placeholder { color: #aaa; }

.gnb-clear-btn {
  display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px;
  border: none; background: none; cursor: pointer; border-radius: 50%;
  transition: background 0.1s; flex-shrink: 0;
}
.gnb-clear-btn:hover { background: #e8e8e8; }

.gnb-search-btn {
  flex-shrink: 0;
  padding: 6px 14px;
  background: #4FA8D8;
  color: #fff;
  border: none;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}
.gnb-search-btn:hover { background: #3a92c0; }

.suggest-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0; right: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.12);
  z-index: 1000;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}
.suggest-dropdown-empty {
  padding: 20px 16px;
  font-size: 13.5px;
  color: #aaa;
  text-align: center;
}
.suggest-dropdown-list {
  list-style: none; margin: 0; padding: 6px 0;
  max-height: 280px; overflow-y: auto;
}
.suggest-dropdown-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px;
  cursor: pointer; transition: background 0.12s;
}
.suggest-dropdown-item:hover { background: #f5f9fc; }
.suggest-dropdown-name {
  font-size: 14px; color: #222; font-weight: 500;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ── Body ───────────────────────────────────── */
.body-wrap { display: flex; flex: 1; width: 100%; }
.body-wrap :deep(.lnb) { top: 120px; height: calc(100vh - 120px); }

.main {
  flex: 1;
  min-width: 0;
  padding: 20px 28px;
}

/* ── 필터 바 ────────────────────────────────── */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  padding: 10px 14px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e8e8e8;
}
.filter-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.filter-tag {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px 4px 8px;
  background: #EBF6FC;
  color: #2a7db8;
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 500;
}
.filter-tag--cat {
  background: color-mix(in srgb, var(--cat-c) 15%, white);
  color: var(--cat-c);
}
.filter-tag-remove {
  border: none; background: none; cursor: pointer;
  font-size: 14px; color: inherit; line-height: 1;
  padding: 0; margin-left: 2px; opacity: 0.7;
}
.filter-tag-remove:hover { opacity: 1; }
.filter-reset-btn {
  font-size: 12px; color: #999; background: none;
  border: none; cursor: pointer; white-space: nowrap;
  padding: 4px 8px; border-radius: 6px;
  transition: background 0.1s;
}
.filter-reset-btn:hover { background: #f0f0f0; color: #333; }

/* ── 구 필터 ────────────────────────────────── */
.district-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
  padding: 10px 14px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #eee;
}
.d-chip {
  padding: 5px 13px;
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 500;
  border: 1.5px solid #e0e0e0;
  background: #fff;
  color: #555;
  cursor: pointer;
  transition: all 0.12s;
  white-space: nowrap;
}
.d-chip:hover { border-color: #4FA8D8; color: #4FA8D8; }
.d-chip--on { background: #4FA8D8; color: #fff; border-color: #4FA8D8; }
.d-chip--on:hover { color: #fff; }

/* ── 카테고리 칩 ─────────────────────────────── */
.cat-chip-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}
.cat-chip {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  border: 1.5px solid #e0e0e0;
  background: #fff;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.cat-chip:hover { border-color: #4FA8D8; color: #4FA8D8; }
.cat-chip--on { color: #fff !important; border-color: transparent; }

/* ── 결과 헤더 ──────────────────────────────── */
.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}
.result-count {
  font-size: 14px;
  color: #666;
}
.result-count strong { color: #111; font-weight: 800; }
.sort-options { display: flex; gap: 4px; }
.sort-btn {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 500;
  border: 1.5px solid #e0e0e0;
  background: #fff;
  color: #888;
  cursor: pointer;
  transition: all 0.12s;
}
.sort-btn:hover { border-color: #4FA8D8; color: #4FA8D8; }
.sort-btn--on { background: #4FA8D8; border-color: #4FA8D8; color: #fff; }

/* ── 크루 그리드 ─────────────────────────────── */
.crew-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
.crew-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  transition: transform 0.16s, box-shadow 0.16s;
}
.crew-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(0,0,0,0.12); }
.crew-card.skeleton { height: 260px; }

.card-thumb-area {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #1a1a2e;
}
.card-thumb-img {
  width: 100%; height: 100%;
  object-fit: cover; display: block;
  transition: transform 0.3s ease;
}
.crew-card:hover .card-thumb-img { transform: scale(1.04); }
.card-thumb-ph {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: #E7F3FF;
}

.card-top-badges {
  position: absolute; top: 12px; left: 12px;
  display: flex; gap: 6px; align-items: center;
}
.cat-badge {
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  border: 1.5px solid rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.card-overlay {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 44px 14px 14px;
  background: linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 100%);
}
.card-crew-name {
  font-size: 17px; font-weight: 800; color: #fff;
  line-height: 1.3; letter-spacing: -0.3px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.4);
  display: -webkit-box;
  -webkit-line-clamp: 2; line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}

.card-body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 5px; }
.card-region {
  font-size: 12px; color: #888;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  display: flex; align-items: center; gap: 3px;
}
.card-stats { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
.stat-item { font-size: 11.5px; color: #bbb; }
.stat-flex { display: inline-flex; align-items: center; gap: 3px; }
.stat-rating { color: #f59e0b; font-weight: 600; }
.stat-sep { font-size: 10px; color: #ddd; }

.fav-btn {
  position: absolute; top: 10px; right: 10px;
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.92);
  border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transition: transform 0.15s; z-index: 2;
}
.fav-btn:hover { transform: scale(1.15); }

/* ── 빈 상태 ─────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 80px 0;
  color: #ccc;
}
.empty-icon { display: flex; justify-content: center; margin-bottom: 16px; }
.empty-title { font-size: 16px; font-weight: 600; color: #aaa; margin: 0 0 6px; }
.empty-sub { font-size: 13px; color: #ccc; margin: 0 0 20px; }
.empty-reset-btn {
  padding: 9px 24px;
  background: #fff;
  border: 1.5px solid #e0e0e0;
  border-radius: 20px;
  font-size: 13.5px;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
}
.empty-reset-btn:hover { border-color: #4FA8D8; color: #4FA8D8; }

/* ── skeleton / spinner / more ───────────────── */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 400px;
  animation: shimmer 1.4s infinite;
  border: none !important;
}
@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

.spinner-wrap { display: flex; justify-content: center; padding: 28px; }
.spinner {
  width: 30px; height: 30px;
  border: 3px solid #4FA8D8;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.end-msg { text-align: center; padding: 24px; font-size: 13px; color: #ccc; }

.more-btn-wrap { display: flex; justify-content: center; margin-top: 20px; }
.more-btn {
  padding: 11px 32px;
  background: #fff;
  border: 1.5px solid #e0e0e0;
  border-radius: 24px;
  font-size: 14px; font-weight: 600; color: #333;
  cursor: pointer; transition: all 0.15s;
}
.more-btn:hover { border-color: #4FA8D8; color: #4FA8D8; background: #F0F8FF; }
.more-btn-count { font-size: 12px; font-weight: 400; color: #aaa; margin-left: 4px; }

/* ── 반응형 ─────────────────────────────────── */
@media (max-width: 1100px) {
  .crew-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 900px) {
  .main { padding: 16px 14px; }
  .crew-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
}
@media (max-width: 600px) {
  .gnb-region-wrap { display: none; }
  .main { padding: 12px; }
  .crew-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
}
</style>