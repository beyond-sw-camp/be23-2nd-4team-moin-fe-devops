<template>
  <div class="page-root">
    <!-- ======= GNB (상단 고정 헤더) ======= -->
    <header class="gnb">
      <div class="gnb-inner">
        <!-- 지역: 버튼 클릭 시 검색 이동, 드롭다운에서 지역 클릭 시 해당 지역으로 검색 이동 -->
        <div
          class="gnb-region-wrap"
          @click="toggleRegionDropdown"
          ref="regionDrop"
        >
          <span class="gnb-region-label">{{
            search.region || "지역 전체"
          }}</span>
          <span class="gnb-region-arrow">▾</span>
          <div v-if="regionDropOpen" class="region-dropdown">
            <div
              class="region-dropdown-item"
              :class="{ active: !search.region }"
              @click.stop="goToSearchWithRegion('')"
            >
              전체
            </div>
            <div
              v-for="r in regions"
              :key="r.value"
              class="region-dropdown-item"
              :class="{ active: search.region === r.value }"
              @click.stop="goToSearchWithRegion(r.value)"
            >
              {{ r.label }}
            </div>
          </div>
        </div>

        <!-- 검색창 + 추천 검색어 드롭다운 -->
        <div class="gnb-search" ref="gnbSearchRef">
          <input
            type="text"
            v-model="searchKeyword"
            placeholder="찾고 싶은 크루를 검색해보세요!"
            @input="onSearchInput"
            @keyup.enter="onSearchSubmit"
            class="gnb-search-input"
          />
          <button @click="onSearchSubmit" class="gnb-search-btn">
            <!-- 검색 아이콘 -->
            <svg fill="currentColor" viewBox="0 0 24 24" style="width:20px;height:20px;color:#888;">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
          <div v-if="showDropdown" class="suggest-dropdown">
            <div v-if="loadingSuggest" class="suggest-dropdown-empty">
              검색 중...
            </div>
            <template v-else-if="suggestions.length > 0">
              <ul class="suggest-dropdown-list">
                <li
                  v-for="crew in suggestions"
                  :key="crew.id"
                  class="suggest-dropdown-item"
                  @mousedown.prevent="selectSuggestion(crew)"
                >
                  <span class="suggest-dropdown-name">{{ crew.name }}</span>
                </li>
              </ul>
            </template>
            <div v-else class="suggest-dropdown-empty">
              검색 결과가 없습니다.
            </div>
          </div>
        </div>

        <button @click="$router.push('/crew/create')" class="gnb-create-btn">
          + 크루 만들기
        </button>
      </div>
    </header>

    <!-- 구 필터 바 (지역 선택 시 GNB 아래 표시) -->
    <div v-if="showDistrictBar" class="district-bar-wrap">
      <div class="district-bar">
        <button
          @click="clearDistrict"
          :class="['d-chip', !search.district && 'd-chip--on']"
        >
          전체
        </button>
        <button
          v-for="d in districtOptions"
          :key="d"
          @click="toggleDistrict(d)"
          :class="['d-chip', search.district === d && 'd-chip--on']"
        >
          {{ d }}
        </button>
      </div>
    </div>

    <div class="body-wrap">
      <!-- ======= LNB (공통 컴포넌트) ======= -->
      <LnbMenuComponent
        :active-nav="activeNavForLnb"
        :category-options="categoryOptions"
        :selected-category-values="search.categoryTypes"
        category-mode="single"
        :recent-crews="recentCrewsWithLabel"
        @nav-click="onLnbNavClick"
        @category-click="onLnbCategoryClick"
        @recent-clear="clearRecent"
        @recent-remove="removeRecent"
        @recent-click="(id) => $router.push('/crew/' + id)"
      />

      <!-- ======= 메인 ======= -->
      <main class="main">

        <!-- ① HOT 크루 -->
        <section class="section">
          <div class="sec-hd">
            <h2 class="sec-title">
              <svg fill="currentColor" viewBox="0 0 24 24" style="width:20px;height:20px;vertical-align:middle;margin-right:6px;color:#4FA8D8;flex-shrink:0;">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
              HOT 크루 추천
            </h2>
          </div>
          <div v-if="loadingPopular" class="h-scroll">
            <div v-for="i in 4" :key="i" class="hot-card skeleton" />
          </div>
          <div v-else class="h-scroll">
            <div
              v-for="crew in popularCrews.slice(0, 4)"
              :key="crew.crewId"
              class="hot-card"
              @click="viewCrew(crew)"
            >
              <div class="card-thumb-area">
                <img
                  v-if="crew.crewImage"
                  :src="crew.crewImage"
                  :alt="crew.crewName"
                  class="card-thumb-img"
                />
                <div v-else class="card-thumb-ph"></div>
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
                  {{ formatLocation(crew.region, crew.district) }}
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
              </div>
            </div>
          </div>
        </section>

        <!-- ② 전체 크루 (8개씩 더보기) -->
        <section class="section">
          <div class="sec-hd">
            <h2 class="sec-title">
              전체 크루
              <span class="sec-count">{{ allSection.total }}개</span>
            </h2>
          </div>

          <div
            v-if="allSection.loading && allSection.list.length === 0"
            class="crew-grid"
          >
            <div
              v-for="i in 8"
              :key="i"
              class="crew-card skeleton"
              style="height: 230px"
            />
          </div>
          <div v-else-if="allSection.list.length === 0" class="empty-state">
            <div style="display:flex;justify-content:center;margin-bottom:12px;">
              <svg fill="currentColor" viewBox="0 0 24 24" style="width:44px;height:44px;color:#ddd;">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>
            <p>검색 결과가 없습니다</p>
          </div>
          <div v-else class="crew-grid">
            <div
              v-for="crew in allSection.list"
              :key="crew.crewId"
              class="crew-card"
              @click="viewCrew(crew)"
            >
              <div class="card-thumb-area">
                <img
                  v-if="crew.crewImage"
                  :src="crew.crewImage"
                  :alt="crew.crewName"
                  class="card-thumb-img"
                />
                <div v-else class="card-thumb-ph"></div>
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
                  @click.stop="toggleFavorite(crew, 'all')"
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

          <div
            v-if="allSection.loading && allSection.list.length > 0"
            class="spinner-wrap"
          >
            <div class="spinner" />
          </div>
          <div
            v-if="!allSection.loading && allSection.hasMore"
            class="more-btn-wrap"
          >
            <button @click="loadMoreSection(allSection)" class="more-btn">
              크루 더보기
              <span class="more-btn-count"
                >({{ remainCount(allSection) }}개 남음)</span
              >
            </button>
          </div>
          <div
            v-if="
              !allSection.hasMore &&
              allSection.list.length > 0 &&
              !allSection.loading
            "
            class="end-msg"
          >
            모든 크루를 불러왔습니다
          </div>
        </section>

        <!-- ③ 카테고리별 크루 섹션 (8개씩 더보기) -->
        <section
          v-for="sec in categorySections"
          :key="sec.categoryValue"
          class="section"
        >
          <div class="sec-hd">
            <h2 class="sec-title">
              {{ sec.label }} 크루
              <span class="sec-count">{{ sec.total }}개</span>
            </h2>
          </div>

          <div v-if="sec.loading && sec.list.length === 0" class="crew-grid">
            <div
              v-for="i in 8"
              :key="i"
              class="crew-card skeleton"
              style="height: 230px"
            />
          </div>
          <div
            v-else-if="sec.list.length === 0 && !sec.loading"
            class="empty-state"
            style="padding: 30px 0"
          >
            <p style="font-size: 13px; color: #ccc">
              해당 카테고리의 크루가 없습니다
            </p>
          </div>
          <div v-else class="crew-grid">
            <div
              v-for="crew in sec.list"
              :key="crew.crewId"
              class="crew-card"
              @click="viewCrew(crew)"
            >
              <div class="card-thumb-area">
                <img
                  v-if="crew.crewImage"
                  :src="crew.crewImage"
                  :alt="crew.crewName"
                  class="card-thumb-img"
                />
                <div v-else class="card-thumb-ph"></div>
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
                  @click.stop="toggleFavorite(crew, sec.categoryValue)"
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

          <div v-if="sec.loading && sec.list.length > 0" class="spinner-wrap">
            <div class="spinner" />
          </div>
          <div v-if="!sec.loading && sec.hasMore" class="more-btn-wrap">
            <button @click="loadMoreSection(sec)" class="more-btn">
              {{ sec.label }} 크루 더보기
              <span class="more-btn-count"
                >({{ remainCount(sec) }}개 남음)</span
              >
            </button>
          </div>
          <div
            v-if="!sec.hasMore && sec.list.length > 0 && !sec.loading"
            class="end-msg"
          >
            {{ sec.label }} 크루를 모두 불러왔습니다
          </div>
        </section>
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

const PAGE_SIZE = 8;

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

const REGIONS = [
  { label: "서울", value: "서울" },
  { label: "부산", value: "부산" },
  { label: "대구", value: "대구" },
  { label: "인천", value: "인천" },
  { label: "광주", value: "광주" },
  { label: "대전", value: "대전" },
  { label: "울산", value: "울산" },
  { label: "세종", value: "세종" },
  { label: "경기", value: "경기" },
  { label: "강원", value: "강원" },
  { label: "충북", value: "충북" },
  { label: "충남", value: "충남" },
  { label: "전북", value: "전북" },
  { label: "전남", value: "전남" },
  { label: "경북", value: "경북" },
  { label: "경남", value: "경남" },
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

function makeSection(extra = {}) {
  return { list: [], page: 0, total: 0, hasMore: false, loading: false, ...extra };
}

export default {
  name: "HomeComponent",
  components: { LnbMenuComponent },
  data() {
    return {
      activeMenu: "home",
      search: { region: "", district: "", categoryTypes: [], name: "" },
      regionDropOpen: false,
      categoryOptions: CATEGORY_OPTIONS,
      regions: REGIONS,
      popularCrews: [],
      loadingPopular: false,
      allSection: makeSection(),
      categorySections: CATEGORY_OPTIONS.map((cat) =>
        makeSection({ categoryValue: cat.value, label: cat.label, color: cat.color })
      ),
      outsideClickHandler: null,
      recentCrews: [],
      // 검색창 자동완성
      searchKeyword: "",
      suggestions: [],
      showDropdown: false,
      loadingSuggest: false,
      suggestDebounceTimer: null,
    };
  },
  computed: {
    activeNavForLnb() { return "home"; },
    recentCrewsWithLabel() {
      return this.recentCrews.map((c) => ({
        ...c,
        crewImage: c.crewImage || c.crewImageUrl,
        categoryLabel: this.categoryLabel(c.categoryType || c.category),
      }));
    },
    showDistrictBar() { return !!this.search.region; },
    districtOptions() { return DISTRICTS_BY_REGION[this.search.region] || []; },
    hasAnyFilter() {
      return !!this.search.region || !!this.search.district ||
        this.search.categoryTypes.length > 0 || !!this.search.name?.trim();
    },
  },
  watch: {
    "search.region"() { this.search.district = ""; },
  },
  mounted() {
    const categoryQuery = this.$route?.query?.category;
    if (categoryQuery) this.search.categoryTypes = [categoryQuery];
    this.loadRecentCrews();
    this.fetchPopular();
    this.initAllSections();
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
    if (this.suggestDebounceTimer) clearTimeout(this.suggestDebounceTimer);
  },
  methods: {
    formatLocation(region, district) {
      const r = (region || "").trim(), d = (district || "").trim();
      if (!r && !d) return "";
      if (r && d) return `${r} ${d}`;
      return r || d;
    },
    categoryLabel(type) {
      return CATEGORY_OPTIONS.find((c) => c.value === type)?.label ?? type;
    },
    catColor(type) {
      return CATEGORY_OPTIONS.find((c) => c.value === type)?.color ?? "#4FA8D8";
    },
    normalizeCrew(c) {
      return { ...c, favorite: c.favorite === true, _favLoading: false };
    },
    setMenu(m) { this.activeMenu = m; },

    onLnbNavClick(key) {
      if (key === "home") this.$router.push("/");
      else if (key === "recent") this.$router.push("/my/recent");
      else if (key === "my-crews") this.$router.push("/my/crews");
      else if (key === "recommendations") this.$router.push("/crew/recommendations");
      else if (key === "rising") this.$router.push("/crew/rising-crews");
      else if (key === "meetings") this.$router.push("/my/meetings");
    },
    onLnbCategoryClick(categoryValue) {
      // LNB 카테고리 → SearchComponent로 이동
      this.$router.push({ path: "/crew/search", query: { category: categoryValue } });
    },

    remainCount(sec) {
      return Math.min(sec.total - sec.list.length, PAGE_SIZE);
    },

    // ── 지역: 버튼 클릭 시 드롭다운, 지역 클릭 시 전체 검색 페이지로 이동 ──────────────────
    toggleRegionDropdown() {
      this.regionDropOpen = !this.regionDropOpen;
    },
    goToSearchWithCurrentRegion() {
      const query = {};
      if (this.search.region) query.region = this.search.region;
      if (this.search.district) query.district = this.search.district;
      this.$router.push({ path: "/crew/search", query });
    },
    goToSearchWithRegion(regionValue) {
      this.regionDropOpen = false;
      const query = regionValue ? { region: regionValue } : {};
      this.$router.push({ path: "/crew/search", query });
    },
    selectRegion(v) {
      this.search.region = v;
      this.search.district = "";
      this.regionDropOpen = false;
      this.resetAllSections();
    },
    toggleDistrict(v) {
      this.search.district = this.search.district === v ? "" : v;
      this.resetAllSections();
    },
    clearDistrict() { this.search.district = ""; this.resetAllSections(); },

    // ── 검색어: 엔터 or 돋보기 버튼 → SearchComponent 이동 ──
    onSearchSubmit() {
      this.showDropdown = false;
      const query = {};
      if (this.search.region) query.region = this.search.region;
      if (this.search.district) query.district = this.search.district;
      const name = (this.searchKeyword || "").trim();
      if (name) query.name = name;
      this.$router.push({ path: "/crew/search", query });
    },

    // ── 자동완성 드롭다운 (선택 시에도 SearchComponent 이동) ─
    onSearchInput() {
      if (this.suggestDebounceTimer) clearTimeout(this.suggestDebounceTimer);
      const q = (this.searchKeyword || "").trim();
      if (!q) { this.suggestions = []; this.showDropdown = false; return; }
      this.suggestDebounceTimer = setTimeout(() => { this.fetchSuggest(); }, 300);
    },
    async fetchSuggest() {
      const q = (this.searchKeyword || "").trim();
      if (!q) { this.suggestions = []; this.showDropdown = false; this.loadingSuggest = false; return; }
      this.loadingSuggest = true;
      this.showDropdown = true;
      try {
        const res = await API.get("/crew/suggest", { params: { keyword: q } });
        const raw = res.data;
        let list = Array.isArray(raw) ? raw : (raw?.content ?? raw?.data ?? []);
        if (!Array.isArray(list)) list = [];
        this.suggestions = list.map((item) => ({
          id: item.id ?? item.crewId,
          name: item.name ?? item.crewName ?? "",
        }));
      } catch (e) {
        console.error("[crew/suggest]", e?.response?.status, e?.message || e);
        this.suggestions = [];
        this.showDropdown = false;
      } finally {
        this.loadingSuggest = false;
      }
    },
    selectSuggestion(crew) {
      // 자동완성 항목 선택 → SearchComponent로 이동
      this.searchKeyword = crew.name || "";
      this.showDropdown = false;
      this.suggestions = [];
      const query = { name: this.searchKeyword };
      if (this.search.region) query.region = this.search.region;
      if (this.search.district) query.district = this.search.district;
      this.$router.push({ path: "/crew/search", query });
    },

    // ── 섹션 데이터 ──────────────────────────────────────────
    baseParams(extra = {}) {
      return {
        size: PAGE_SIZE,
        sort: "id,desc",
        ...(this.search.region?.trim() ? { region: this.search.region.trim() } : {}),
        ...(this.search.district?.trim() ? { district: this.search.district.trim() } : {}),
        ...extra,
      };
    },
    resetAllSections() {
      Object.assign(this.allSection, makeSection());
      this.categorySections.forEach((sec) => {
        sec.list = []; sec.page = 0; sec.total = 0; sec.hasMore = false; sec.loading = false;
      });
      this.initAllSections();
    },
    initAllSections() {
      this.fetchSection(this.allSection, {});
      this.categorySections.forEach((sec) => {
        this.fetchSection(sec, { categoryTypes: sec.categoryValue });
      });
    },
    async fetchSection(sec, extraParams = {}) {
      if (sec.loading) return;
      sec.loading = true;
      try {
        const params = this.baseParams({ page: sec.page, ...extraParams });
        const res = await API.get("/crew/list", { params });
        const data = res.data;
        const content = (data?.content || []).map(this.normalizeCrew);
        sec.list = [...sec.list, ...content];
        sec.total = data?.totalElements ?? sec.list.length;
        sec.hasMore = data?.last !== undefined ? !data.last : false;
      } catch (e) {
        console.error(e);
      } finally {
        sec.loading = false;
      }
    },
    loadMoreSection(sec) {
      if (sec.loading || !sec.hasMore) return;
      sec.page++;
      const extraParams = sec.categoryValue ? { categoryTypes: sec.categoryValue } : {};
      this.fetchSection(sec, extraParams);
    },

    async fetchPopular() {
      this.loadingPopular = true;
      try {
        const res = await API.get("/crew/popular", { params: { size: 4 } });
        this.popularCrews = (Array.isArray(res.data) ? res.data : []).map(this.normalizeCrew);
      } catch (e) {
        console.error(e);
      } finally {
        this.loadingPopular = false;
      }
    },

    loadRecentCrews() {
      try { this.recentCrews = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); }
      catch (e) { this.recentCrews = []; }
    },
    saveRecentCrews() {
      localStorage.setItem(RECENT_KEY, JSON.stringify(this.recentCrews));
    },
    addRecentCrew(crew) {
      const c = { crewId: crew.crewId, crewName: crew.crewName, crewImage: crew.crewImage, categoryType: crew.categoryType, region: crew.region, district: crew.district };
      this.recentCrews = [c, ...this.recentCrews.filter((x) => x.crewId !== crew.crewId)].slice(0, MAX_RECENT);
      this.saveRecentCrews();
    },
    removeRecent(id) {
      this.recentCrews = this.recentCrews.filter((c) => c.crewId !== id);
      this.saveRecentCrews();
    },
    clearRecent() { this.recentCrews = []; this.saveRecentCrews(); },
    viewCrew(crew) { this.addRecentCrew(crew); this.$router.push("/crew/" + crew.crewId); },

    async toggleFavorite(crew) {
      const token = localStorage.getItem("token");
      if (!token) { alert("로그인이 필요합니다."); this.$router.push("/login"); return; }
      if (crew._favLoading) return;
      crew._favLoading = true;
      try {
    if (crew.favorite) {
      // 찜 취소 → DELETE
      await API.delete(`/crew/${crew.crewId}/favorite`);
      crew.favorite = false;
    } else {
      // 찜 추가 → POST
      await API.post(`/crew/${crew.crewId}/favorite`);
      crew.favorite = true;
    }
    this.syncFavorite(crew.crewId, crew.favorite);
  } catch (e) {
    alert(e.response?.data?.message || "찜 처리에 실패했습니다.");
  } finally {
    crew._favLoading = false;
  }
},
    syncFavorite(crewId, favorite) {
      for (const c of this.popularCrews) if (c.crewId === crewId) c.favorite = favorite;
      for (const c of this.allSection.list) if (c.crewId === crewId) c.favorite = favorite;
      for (const sec of this.categorySections)
        for (const c of sec.list) if (c.crewId === crewId) c.favorite = favorite;
    },
  },
};
</script>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
}

.page-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f9f9f9;
  font-family: "Pretendard", "Apple SD Gothic Neo", -apple-system, sans-serif;
}

/* GNB */
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
  gap: 12px;
  height: 100%;
  padding: 0 20px;
}

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
  background: #f5f5f5;
  border-radius: 10px;
  padding: 0 4px 0 14px;
  min-width: 0;
  position: relative;
  border: 1px solid transparent;
  transition: border-color 0.15s, background 0.15s;
}
.gnb-search:focus-within {
  background: #fff;
  border-color: #4FA8D8;
  box-shadow: 0 0 0 2px #4FA8D820;
}
.suggest-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 6px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.12);
  z-index: 1000;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}
.suggest-dropdown-empty {
  padding: 24px 16px;
  font-size: 14px;
  color: #888;
  text-align: center;
}
.suggest-dropdown-list {
  list-style: none;
  margin: 0;
  padding: 6px 0;
  max-height: 280px;
  overflow-y: auto;
}
.suggest-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
}
.suggest-dropdown-item:hover { background: #f5f9fc; }
.suggest-dropdown-name {
  font-size: 14px;
  color: #222;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gnb-search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
  padding: 10px 0;
  color: #222;
  min-width: 0;
}
.gnb-search-input::placeholder { color: #aaa; }
.gnb-search-btn {
  padding: 7px 10px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.1s;
}
.gnb-search-btn:hover { background: #eee; }
.gnb-create-btn {
  flex-shrink: 0;
  padding: 8px 16px;
  background: linear-gradient(135deg, #38BDF8, #0EA5E9);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: filter 0.15s, transform 0.15s;
  box-shadow: 0 4px 14px rgba(14,165,233,0.35);
}
.gnb-create-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }

/* 구 필터 바 */
.district-bar-wrap {
  position: sticky;
  top: 120px;
  z-index: 99;
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 8px 20px;
}
.district-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
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

.body-wrap { display: flex; flex: 1; width: 100%; }
.body-wrap :deep(.lnb) { top: 120px; height: calc(100vh - 120px); }

.main {
  flex: 1;
  min-width: 0;
  max-width: 1400px;
  padding: 24px 28px;
}

.section { margin-bottom: 40px; }
.sec-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.sec-title {
  font-size: 18px;
  font-weight: 800;
  color: #111;
  margin: 0;
  display: flex;
  align-items: center;
}
.sec-count { font-size: 14px; font-weight: 400; color: #aaa; margin-left: 6px; }

.h-scroll { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
.hot-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  transition: transform 0.16s, box-shadow 0.16s;
}
.hot-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(0,0,0,0.12); }
.hot-card.skeleton { height: 260px; }

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
.crew-card.skeleton { height: 300px; }

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
.crew-card:hover .card-thumb-img,
.hot-card:hover .card-thumb-img { transform: scale(1.04); }
.card-thumb-ph {
  width: 100%;
  height: 100%;
  background: #E7F3FF;
}

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
  border: 1.5px solid rgba(255,255,255,0.3);
  background: linear-gradient(135deg, rgba(0,0,0,0.35) 0%, rgba(80,80,80,0.3) 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #fff;
  letter-spacing: 0.1px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 44px 14px 14px;
  background: linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 100%);
}
.card-crew-name {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  line-height: 1.3;
  letter-spacing: -0.3px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.4);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

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
.card-stats { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
.stat-item { font-size: 11.5px; color: #bbb; }
.stat-flex { display: inline-flex; align-items: center; gap: 3px; }
.stat-rating { color: #f59e0b; font-weight: 600; }
.stat-sep { font-size: 10px; color: #ddd; }

.fav-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.92);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transition: transform 0.15s;
  z-index: 2;
}
.fav-btn:hover { transform: scale(1.15); }

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
  width: 30px;
  height: 30px;
  border: 3px solid #4FA8D8;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.end-msg { text-align: center; padding: 24px; font-size: 13px; color: #ccc; }
.empty-state { text-align: center; padding: 80px 0; color: #ccc; font-size: 14px; }

.more-btn-wrap { display: flex; justify-content: center; margin-top: 20px; }
.more-btn {
  padding: 11px 32px;
  background: #fff;
  border: 1.5px solid #e0e0e0;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: all 0.15s;
}
.more-btn:hover { border-color: #4FA8D8; color: #4FA8D8; background: #F0F8FF; }
.more-btn-count { font-size: 12px; font-weight: 400; color: #aaa; margin-left: 4px; }

@media (max-width: 1100px) {
  .h-scroll, .crew-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 900px) {
  .main { padding: 16px 14px; }
  .h-scroll, .crew-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .card-crew-name { font-size: 15px; }
}
@media (max-width: 600px) {
  .gnb-region-wrap, .gnb-create-btn { display: none; }
  .main { padding: 12px; }
  .h-scroll, .crew-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
}
</style>

