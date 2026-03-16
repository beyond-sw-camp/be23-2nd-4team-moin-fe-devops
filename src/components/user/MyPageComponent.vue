<template>
  <div class="page-root">
    <LnbMenuComponent
      :active-nav="null"
      :selected-category-values="[]"
      @nav-click="onLnbNavClick"
      @category-toggle="onLnbCategoryToggle"
      @category-clear="onLnbCategoryClear"
    />
    <main class="main mypage-main">
      <!-- 로딩 -->
      <div v-if="loading" class="state-screen">
        <div class="loader-ring"></div>
        <p class="state-text">불러오는 중...</p>
      </div>

      <!-- 에러 -->
      <div v-else-if="error" class="state-screen">
        <p class="error-text">{{ error }}</p>
        <button @click="fetchMyPage" class="retry-btn">다시 시도</button>
      </div>

      <template v-else>
        <!-- ── 프로필 카드 ── -->
        <div class="hero-wrap">
          <div class="hero-card">
            <!-- 우측 상단 버튼 그룹 -->
            <div class="top-btn-group">
              <button @click="openSection('settlement')" class="action-btn action-btn--settlement">
                정산 내역
            </button>
              <button @click="$router.push('/profile/edit')" class="action-btn action-btn--edit">
                프로필 수정
              </button>
            </div>

            <!-- 아바타 + 이름 + 매너점수 -->
            <div class="hero-top">
              <div class="avatar-wrap">
                <div class="avatar-ring"></div>
                <img
                  v-if="profile.profileImage"
                  :src="profile.profileImage"
                  :alt="profile.nickname"
                  class="avatar-img"
                />
                                <div v-else class="avatar-placeholder feed-avatar--ph">
                  <svg
                    class="avatar-placeholder-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="42"
                    height="42"
                  >
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
              </div>

              <div class="hero-info">
                <h1 class="hero-name">{{ profile.nickname }}</h1>
                <div class="hero-tags">
                  <span v-for="cat in profile.categories" :key="cat" class="hero-tag">
                    {{ categoryLabel(cat) }}
                  </span>
                </div>
                <div class="manner-inline">
                  <div class="manner-inline__top">
                    <span class="manner-inline__label">매너 점수</span>
                    <span class="manner-inline__num">{{ Number(profile.mannerScore).toFixed(1) }}</span>
                    <span class="manner-inline__msg">{{ mannerMessage }}</span>
                  </div>
                  <div class="manner-bar-wrap">
                    <div class="manner-bar" :style="{ width: profile.mannerScore + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 통계 4칸 -->
            <div class="stats-row">
              <div
                class="stat-card stat-card--favorite"
                :class="{ 'stat-card--active': activeSection === 'favorites' }"
                @click="openSection('favorites')"
              >
                <div class="stat-card__header-row">
                  <span class="stat-card__label">찜한 크루</span>
                </div>
                <div class="stat-card__num">{{ activity.favoriteCount }}</div>
                </div>
              <div
                class="stat-card stat-card--pending"
                :class="{ 'stat-card--active': activeSection === 'pending' }"
                @click="openSection('pending')"
              >
                <div class="stat-card__header-row">
                  <span class="stat-card__label">참여 대기 크루</span>
                </div>
                <div class="stat-card__num">{{ activity.pendingCount }}</div>
              </div>
              <div
                class="stat-card stat-card--approved"
                :class="{ 'stat-card--active': activeSection === 'participating' }"
                @click="openSection('participating')"
              >
                <div class="stat-card__header-row">
                  <span class="stat-card__label">참여 크루</span>
                </div>
                <div class="stat-card__num">{{ activity.approvedCount }}</div>
              </div>
              <div
                class="stat-card stat-card--leading"
                :class="{ 'stat-card--active': activeSection === 'leading' }"
                @click="openSection('leading')"
              >
                <div class="stat-card__header-row">
                  <span class="stat-card__label">운영 크루</span>
                </div>
                <div class="stat-card__num">{{ activity.leadingCount }}</div>
              </div>
            </div>
          </div>
        </div>


        <!-- ── 초기 안내 배너 ── -->
        <div v-if="!activeSection" class="welcome-banner">
          <div class="welcome-banner__inner">
            <p class="welcome-banner__text">상단 통계 박스를 눌러 내역을 확인하세요</p>
          </div>
        </div>

          <!-- ── 하단 섹션 카드 ── -->
        <div v-if="activeSection" class="tabs-area" ref="sectionCard">
          <div class="tab-card">
            <div class="section-header">
              <h2 class="section-header__title">{{ sectionTitle }}</h2>
              <button class="section-close-btn" @click="activeSection = null">✕</button>
            </div>

            <!-- 찜한 크루 -->
            <div v-if="activeSection === 'favorites'" class="tab-content">
              <div v-if="sectionLoading" class="inner-loading">
                <div class="loader-ring loader-ring--sm"></div>
              </div>
              <template v-else>
                <div v-if="sectionItems.length > 0" class="my-crew-list">
                  <div
                    v-for="(crew, idx) in sectionItems"
                    :key="crew.crewId"
                    class="my-crew-item"
                    :style="{ '--delay': idx * 50 + 'ms' }"
                  >
                    <div class="my-crew-item__cover">
                      <img v-if="crew.crewImage" :src="crew.crewImage" :alt="crew.crewName" class="my-crew-item__img" />
                      <div v-else class="my-crew-item__placeholder"></div>
                    </div>
                    <div class="my-crew-item__info">
                      <p v-if="crew.categoryType" class="my-crew-item__category">{{ categoryLabel(crew.categoryType) }}</p>
                      <h3 class="my-crew-item__name">{{ crew.crewName }}</h3>
                      <p v-if="crew.location" class="my-crew-item__location">{{ crew.location }}</p>
                    </div>
                    <div class="my-crew-item__actions">
                      <button class="crew-action-btn crew-action-btn--go" @click.stop="$router.push('/crew/' + crew.crewId)">
                        크루 보러 가기
                      </button>
                      <button class="crew-action-btn crew-action-btn--meeting" @click.stop="openMeetingModal(crew.crewId, crew.crewName)">
                        모임 보기
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <p class="empty-state__title">찜한 크루가 없어요</p>
                <p class="empty-state__sub">관심 있는 크루에 하트를 눌러보세요</p>
              </div>
                <div v-if="sectionPage.totalPages > 1" class="pagination">
                  <button
                    v-for="p in sectionPage.totalPages"
                    :key="p"
                    @click="fetchSection(activeSection, p - 1)"
                    :class="['page-btn', sectionPage.currentPage === p - 1 && 'page-btn--active']"
                  >{{ p }}</button>
                </div>
              </template>
            </div>

            <!-- 참여 대기 / 참여 / 운영 크루 공통 -->
            <div v-else-if="['pending','participating','leading'].includes(activeSection)" class="tab-content">
              <div v-if="sectionLoading" class="inner-loading">
                <div class="loader-ring loader-ring--sm"></div>
              </div>
              <template v-else>
                <div v-if="sectionItems.length > 0" class="my-crew-list">
                  <div
                    v-for="(crew, idx) in sectionItems"
                    :key="crew.crewId"
                    class="my-crew-item"
                    :style="{ '--delay': idx * 50 + 'ms' }"
                  >
                    <div class="my-crew-item__cover">
                      <img v-if="crew.crewImage" :src="crew.crewImage" :alt="crew.crewName" class="my-crew-item__img" />
                      <div v-else class="my-crew-item__placeholder"></div>
                    </div>
                    <div class="my-crew-item__info">
                      <p v-if="crew.categoryType" class="my-crew-item__category">{{ categoryLabel(crew.categoryType) }}</p>
                      <h3 class="my-crew-item__name">{{ crew.crewName }}</h3>
                      <p v-if="crew.location" class="my-crew-item__location">{{ crew.location }}</p>
                    </div>
                    <div class="my-crew-item__actions">
                      <button class="crew-action-btn crew-action-btn--go" @click.stop="$router.push('/crew/' + crew.crewId)">
                        크루 보러 가기
                      </button>
                      <button class="crew-action-btn crew-action-btn--meeting" @click.stop="openMeetingModal(crew.crewId, crew.crewName)">
                        모임 보기
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-state">
                                    <p class="empty-state__title">{{ emptyTitle }}</p>
                </div>
                <div v-if="sectionPage.totalPages > 1" class="pagination">
                  <button
                    v-for="p in sectionPage.totalPages"
                    :key="p"
                    @click="fetchSection(activeSection, p - 1)"
                    :class="['page-btn', sectionPage.currentPage === p - 1 && 'page-btn--active']"
                  >{{ p }}</button>
                </div>
              </template>
            </div>

            <!-- 정산 내역 -->
            <div v-else-if="activeSection === 'settlement'" class="tab-content">
              <div
                v-if="settlement.hostingSettlements && settlement.hostingSettlements.length > 0"
                class="section"
              >
                <h2 class="section-title">
                  <span class="section-title__dot"></span>운영 크루 정산
                </h2>
                <div class="settle-list">
                  <div v-for="s in settlement.hostingSettlements" :key="s.meetingId" class="settle-card">
                    <div class="settle-card__header">
                        <h3 class="settle-card__name">{{ s.meetingName }}</h3>
                      <span :class="['settle-badge', s.status === 'COMPLETED' ? 'settle-badge--done' : 'settle-badge--pending']">
                        {{ s.status === "COMPLETED" ? "정산완료" : "정산대기" }}
                      </span>
                    </div>
                    <div class="settle-amounts">
                      <div class="amount-box amount-box--total">
                        <p class="amount-box__label">총 모임비</p>
                        <p class="amount-box__val">{{ s.totalFeePool?.toLocaleString() }}<span class="amount-box__unit">원</span></p>
                      </div>
                      <div class="amount-box amount-box--expected">
                        <p class="amount-box__label">정산 예정</p>
                        <p class="amount-box__val">{{ s.expectedAmount?.toLocaleString() }}<span class="amount-box__unit">원</span></p>
                      </div>
                      <div class="amount-box amount-box--settled">
                        <p class="amount-box__label">정산 완료</p>
                        <p class="amount-box__val">{{ s.alreadySettled?.toLocaleString() }}<span class="amount-box__unit">원</span></p>
                        <p v-if="s.totalRefundedAmount > 0" class="amount-box__refund">환불 {{ s.totalRefundedAmount?.toLocaleString() }}원 차감</p>
                      </div>
                    </div>
                    <div v-if="s.refundedMembers && s.refundedMembers.length > 0" class="refund-list">
                      <p class="refund-list__title">✅ 환불 완료 · {{ s.refundedMembers.length }}건</p>
                      <div v-for="req in s.refundedMembers" :key="req.meetingMemberId" class="refund-item">
                        <div class="refund-item__info">
                          <p class="refund-item__name">{{ req.memberName }}</p>
                          <p class="refund-item__msg">{{ req.requestMessage || "사유 없음" }}</p>
                          <p class="refund-item__date">{{ formatDate(req.requestedAt) }}</p>
                        </div>
                        <div class="refund-item__amount">{{ req.refundAmount?.toLocaleString() }}원</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="settlement.refundHistories && settlement.refundHistories.length > 0" class="section">
                <h2 class="section-title">
                  <span class="section-title__dot section-title__dot--alt"></span>환불 내역
                </h2>
                <div class="refund-table-wrap">
                  <table class="refund-table">
                    <thead>
                      <tr><th>모임명</th><th>결제금액</th><th>상태</th><th>신청일</th></tr>
                    </thead>
                    <tbody>
                      <tr v-for="refund in settlement.refundHistories" :key="refund.meetingName + refund.date">
                        <td class="refund-table__name">{{ refund.meetingName }}</td>
                        <td class="refund-table__amount">{{ refund.amount?.toLocaleString() }}원</td>
                        <td>
                          <span :class="['rt-badge', refund.status === 'REFUNDED' ? 'rt-badge--done' : refund.status === 'REJECTED' ? 'rt-badge--rejected' : 'rt-badge--wait']">
                            {{ refundStatusLabel(refund.status) }}
                          </span>
                        </td>
                        <td class="refund-table__date">{{ formatDate(refund.date) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div
                v-if="(!settlement.hostingSettlements || !settlement.hostingSettlements.length) && (!settlement.refundHistories || !settlement.refundHistories.length)"
                class="empty-state"
              >
                <p class="empty-state__title">정산·환불 내역이 없어요</p>
                <p class="empty-state__sub">크루 모임에 참여하면 내역이 표시됩니다</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ── 모임 팝업 모달 ── -->
      <transition name="modal-fade">
        <div v-if="meetingModal.visible" class="modal-backdrop" @click.self="closeMeetingModal">
          <div class="modal-box">
            <div class="modal-header">
              <div class="modal-header__info">
                <h3 class="modal-header__title">{{ meetingModal.crewName }}</h3>
                <span class="modal-header__sub">모임 목록</span>
              </div>
              <button class="modal-close-btn" @click="closeMeetingModal">✕</button>
            </div>

            <div class="modal-body">
              <div v-if="meetingModal.loading" class="inner-loading">
                <div class="loader-ring loader-ring--sm"></div>
              </div>
              <template v-else>
                <div v-if="meetingModal.items.length > 0" class="meeting-list">
                  <div
                    v-for="(m, idx) in meetingModal.items"
                    :key="m.meetingId"
                    class="meeting-card"
                    :style="{ '--delay': idx * 50 + 'ms' }"
                  >
                    <div class="meeting-card__left">
                      <img v-if="m.profileImage" :src="m.profileImage" class="meeting-card__img" :alt="m.meetingName" />
                      <div v-else class="meeting-card__img-placeholder"></div>
                    </div>
                    <div class="meeting-card__info">
                      <h4 class="meeting-card__name">{{ m.meetingName }}</h4>
                      <p v-if="m.place" class="meeting-card__place">{{ m.place }}</p>
                      <p v-if="m.meetingAt" class="meeting-card__date">{{ formatDateTime(m.meetingAt) }}</p>
                      <div class="meeting-card__bottom">
                        <span class="meeting-card__fee">{{ m.fee ? m.fee.toLocaleString() + '원' : '무료' }}</span>
                        <span :class="['meeting-status-badge', 'meeting-status-badge--' + (m.recruitStatus || '').toLowerCase()]">
                          {{ recruitStatusLabel(m.recruitStatus) }}
                        </span>
                      </div>
                    </div>
                    <div class="meeting-card__right">
                      <button
                        class="meeting-go-btn"
                        @click="$router.push('/meeting/' + m.meetingId); closeMeetingModal()"
                      >
                        모임<br>보러가기
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-state" style="padding: 40px 20px;">
                                    <p class="empty-state__title">진행 중인 모임이 없어요</p>
                </div>

                <!-- 페이지네이션 -->
                <div v-if="meetingModal.totalPages > 1" class="pagination" style="margin-top:16px;">
                  <button
                    v-for="p in meetingModal.totalPages"
                    :key="p"
                    @click="fetchMeetings(meetingModal.crewId, p - 1)"
                    :class="['page-btn', meetingModal.currentPage === p - 1 && 'page-btn--active']"
                  >{{ p }}</button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<script>
import axios from "axios";
import LnbMenuComponent from "@/components/common/LnbMenuComponent.vue";

const API = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
});
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const CATEGORY_MAP = {
  SPORT: "운동", BOOK: "독서", COOK: "요리", DIY: "취미",
  TRAVEL: "여행", LANGUAGE: "어학", CAR: "자동차",
  GAME: "게임", CULTURE: "문화", PET: "펫",
};

const SECTION_API_MAP = {
  favorites:     "/crew/my-favorites",
  pending:       "/crew/my-pending",
  participating: "/crew/my-participating",
  leading:       "/crew/my-leading",
};

// CrewListDto / MyCrewListDto 필드명 정규화
// 백엔드 실제 필드: crewId, crewName, categoryType, region, district, crewImage
function normalizeCrewItem(item) {
  return {
    ...item,
    location: [item.region, item.district].filter(Boolean).join(' ') || null,
  };
}

export default {
  name: "MyPageComponent",
  components: { LnbMenuComponent },

  data() {
    return {
      loading: false,
      error: null,
      profile: { nickname: "", profileImage: null, mannerScore: 0, categories: [] },
      activity: { pendingCount: 0, approvedCount: 0, leadingCount: 0, favoriteCount: 0 },
      settlement: { hostingSettlements: [], refundHistories: [] },

      activeSection: null,
      sectionLoading: false,
      sectionItems: [],
      sectionPage: { currentPage: 0, totalPages: 0 },

      // 모임 팝업
      meetingModal: {
        visible: false,
        crewId: null,
        crewName: '',
        loading: false,
        items: [],
        currentPage: 0,
        totalPages: 0,
      },
    };
  },

  computed: {
    mannerMessage() {
      const s = Number(this.profile.mannerScore);
      if (s >= 90) return "최고의 매너 🎉";
      if (s >= 70) return "매너가 좋아요 😊";
      if (s >= 50) return "평균적인 매너";
      return "매너를 높여보세요!";
    },
    sectionTitle() {
      return { favorites: "찜한 크루", pending: "참여 대기 크루", participating: "참여 크루", leading: "운영 크루", settlement: "정산 내역" }[this.activeSection] || "";
    },
    emptyIcon() {
      return { pending: "⏳", participating: "👥", leading: "🏆" }[this.activeSection] || "📭";
    },
    emptyTitle() {
      return { pending: "참여 대기 중인 크루가 없어요", participating: "참여 중인 크루가 없어요", leading: "운영 중인 크루가 없어요" }[this.activeSection] || "";
    },
  },

  async mounted() {
    await this.fetchMyPage();
    if (this.$route.query.section === "settlement") this.$nextTick(() => this.openSection("settlement"));
  },
  watch: {
    "$route.query.section"(section) {
      if (section === "settlement") this.openSection("settlement");
    },
  },

  methods: {
    async fetchMyPage() {
      this.loading = true;
      this.error = null;
      try {
        const res = await API.get("/user/my-page");
        const data = res.data;
        this.profile = data.profile || {};
        this.activity = data.activity || {};
        this.settlement = data.settlement || {};
      } catch (e) {
        this.error = e.response?.data?.error_message || "마이페이지를 불러오지 못했습니다.";
      } finally {
        this.loading = false;
      }
    },

    async openSection(key) {
      if (this.activeSection === key) {
        this.activeSection = null;
        return;
      }
      this.activeSection = key;
      if (key === "settlement") {
        this.$nextTick(() => this.scrollToSection());
        return;
      }
      await this.fetchSection(key, 0);
      this.$nextTick(() => this.scrollToSection());
    },

    async fetchSection(key, page = 0) {
      const url = SECTION_API_MAP[key];
      if (!url) return;
      this.sectionLoading = true;
      this.sectionItems = [];
      try {
        const res = await API.get(url, { params: { page, size: 8 } });
        const data = res.data;
        this.sectionItems = (data.content || []).map(normalizeCrewItem);
        this.sectionPage = { currentPage: data.number ?? 0, totalPages: data.totalPages ?? 1 };
      } catch (e) {
        this.sectionItems = [];
      } finally {
        this.sectionLoading = false;
      }
    },

    scrollToSection() {
      const el = this.$refs.sectionCard;
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    },

    categoryLabel(cat) { return CATEGORY_MAP[cat] || cat; },

    refundStatusLabel(status) {
      return { REFUND_REQUESTED: "환불대기", REFUNDED: "환불완료", REJECTED: "거절됨" }[status] || status;
    },

    formatDate(dateStr) {
      if (!dateStr) return "";
      return new Date(dateStr).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
    },

    onLnbNavClick(key) {
      const routes = { home: "/", "my-crews": "/my/crews", recommendations: "/crew/recommendations", rising: "/crew/rising-crews", meetings: "/my/meetings", recent: "/my/recent" };
      if (routes[key]) this.$router.push(routes[key]);
    },
    onLnbCategoryToggle(value) { this.$router.push({ path: "/crew/search", query: value ? { category: value } : {} }); },
    onLnbCategoryClear() { this.$router.push("/"); },

    async openMeetingModal(crewId, crewName) {
      this.meetingModal.visible = true;
      this.meetingModal.crewId = crewId;
      this.meetingModal.crewName = crewName;
      await this.fetchMeetings(crewId, 0);
    },

    closeMeetingModal() {
      this.meetingModal.visible = false;
      this.meetingModal.items = [];
      this.meetingModal.crewId = null;
      this.meetingModal.crewName = '';
    },

    async fetchMeetings(crewId, page = 0) {
      this.meetingModal.loading = true;
      try {
        const res = await API.get(`/meeting/crew/${crewId}/list`, { params: { page, size: 5 } });
        const data = res.data;
        this.meetingModal.items = data.content || [];
        this.meetingModal.currentPage = data.number ?? 0;
        this.meetingModal.totalPages = data.totalPages ?? 1;
      } catch (e) {
        this.meetingModal.items = [];
      } finally {
        this.meetingModal.loading = false;
      }
    },

    recruitStatusLabel(status) {
      const map = {
        RECRUITING: '모집중',
        CLOSED: '모집마감',
        IN_PROGRESS: '진행중',
      };
      return map[status] || status;
    },

    formatDateTime(dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      });
    },
  },
};
</script>

<style scoped>
.page-root {
  display: flex; min-height: 100vh; background: #f0f4f8; width: 100%;
  font-family: "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
}
.mypage-main { flex: 1; min-width: 0; overflow-y: auto; }

/* 로딩/에러 */
.state-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; gap: 16px; }
.loader-ring { width: 44px; height: 44px; border: 4px solid #e2e8f0; border-top-color: #38a3d4; border-radius: 50%; animation: spin 0.8s linear infinite; }
.loader-ring--sm { width: 28px; height: 28px; border-width: 3px; }
.inner-loading { display: flex; justify-content: center; padding: 40px 0; }
@keyframes spin { to { transform: rotate(360deg); } }
.state-text { color: #94a3b8; font-size: 14px; }
.error-text { color: #ef4444; font-size: 14px; }
.retry-btn { padding: 8px 20px; background: #38a3d4; color: #fff; border: none; border-radius: 8px; font-size: 13px; cursor: pointer; }

/* 프로필 카드 */
.hero-wrap { margin: 24px 0 0; padding: 0 24px; }
.hero-card { position: relative; background: #fff; border: 1px solid #ebebeb; border-radius: 18px; padding: 28px; }

.top-btn-group { position: absolute; top: 16px; right: 16px; display: flex; gap: 8px; }
.action-btn {
  display: flex; align-items: center; gap: 5px; padding: 7px 14px;
  border-radius: 10px; font-size: 12px; font-weight: 600; cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s; white-space: nowrap; border: 1.5px solid;
}
.action-btn--settlement { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }
.action-btn--settlement:hover { background: #dbeafe; border-color: #93c5fd; }
.action-btn--edit { background: #f8fafc; border-color: #e2e8f0; color: #64748b; }
.action-btn--edit:hover { background: #f0f8fd; border-color: #b3d9f0; color: #0369a1; }

.hero-top { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px; }
.avatar-wrap { position: relative; flex-shrink: 0; }
.avatar-ring { position: absolute; inset: -4px; border-radius: 50%; border: 2px dashed #b3d9f0; animation: rotate 20s linear infinite; }
@keyframes rotate { to { transform: rotate(360deg); } }

.avatar-img, .avatar-placeholder {
  width: 96px; height: 96px; border-radius: 50%; object-fit: cover;
  display: flex; align-items: center; justify-content: center;
  color: #fff; background: #d1d5db; border: 3px solid #e5e7eb;
}
.avatar-placeholder-icon {
  width: 42px;
  height: 42px;
  color: #fff;
}
.hero-info { flex: 1; min-width: 0; }
.hero-name { font-size: 20px; font-weight: 800; color: #1e293b; line-height: 1.2; margin-bottom: 6px; }
.hero-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px; }
.hero-tag { padding: 2px 8px; background: #f0f8fd; border: 1px solid #b3d9f0; border-radius: 20px; font-size: 11px; color: #0369a1; font-weight: 500; }
.manner-inline { background: transparent; border-radius: 0; padding: 0; max-width: 600px; }
.manner-inline__top { display: flex; align-items: center; gap: 5px; margin-bottom: 7px; }
.manner-inline__label { font-size: 11px; font-weight: 600; color: #0369a1; opacity: 0.8; }
.manner-inline__num { font-size: 17px; font-weight: 800; color: #0369a1; line-height: 1; margin-left: 2px; }
.manner-inline__msg { font-size: 10px; color: #0369a1; opacity: 0.65; margin-left: 2px; }
.manner-bar-wrap { height: 5px; background: rgba(3,105,161,0.15); border-radius: 99px; overflow: hidden; }
.manner-bar { height: 100%; background: #0369a1; border-radius: 99px; transition: width 0.8s ease; max-width: 100%; }

/* 통계 4칸 */
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 20px; }
.stat-card {
  border-radius: 16px; padding: 16px 16px 18px; cursor: pointer;
  transition: filter 0.15s, transform 0.15s, box-shadow 0.15s; overflow: hidden;
}
.stat-card:hover { filter: brightness(0.96); transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
.stat-card--active { outline: 2.5px solid currentColor; outline-offset: -2px; filter: brightness(0.94); transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.1); }
.stat-card__header-row { display: flex; align-items: center; gap: 5px; margin-bottom: 10px; }
.stat-card__label { font-size: 11px; font-weight: 600; opacity: 0.75; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stat-card__num { font-size: 28px; font-weight: 800; line-height: 1; }
.stat-card--favorite  { background: #fce7f3; color: #9d174d; }
.stat-card--pending   { background: #fef9ec; color: #92400e; }
.stat-card--approved  { background: #dcfce7; color: #166534; }
.stat-card--leading   { background: #ede9fe; color: #5b21b6; }

/* 하단 섹션 */
.tabs-area { padding: 16px 24px 100px; }
.tab-card { background: #fff; border-radius: 16px; border: 1px solid #ebebeb; overflow: hidden; animation: fadeDown 0.25s ease; }
@keyframes fadeDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
.section-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px 14px; border-bottom: 1px solid #f0f0f0; }
.section-header__title { font-size: 15px; font-weight: 800; color: #1e293b; }
.section-close-btn { background: none; border: none; font-size: 16px; color: #94a3b8; cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: background 0.15s, color 0.15s; }
.section-close-btn:hover { background: #f1f5f9; color: #475569; }
.tab-content { padding: 20px 24px 24px; }

/* 찜한 크루 그리드 */
.crew-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.crew-card { background: #fff; border-radius: 16px; border: 1px solid #ebebeb; overflow: hidden; cursor: pointer; transition: box-shadow 0.2s, transform 0.15s, border-color 0.2s; animation: fadeUp 0.3s ease both; animation-delay: var(--delay, 0ms); }
@keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.crew-card:hover { box-shadow: 0 6px 20px rgba(79,168,216,0.15); border-color: #b3d9f0; transform: translateY(-2px); }
.crew-card__cover { position: relative; width: 100%; aspect-ratio: 16/9; overflow: hidden; background: #E7F3FF; }
.crew-card__img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s; }
.crew-card:hover .crew-card__img { transform: scale(1.04); }
.crew-card__cover-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.crew-card__cover-emoji { font-size: 40px; opacity: 0.7; }
.crew-card__body { padding: 12px 14px 14px; }
.crew-card__category { font-size: 11px; font-weight: 600; color: #4fa8d8; margin-bottom: 4px; }
.crew-card__name { font-size: 14px; font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* 참여/대기/운영 크루 리스트 */
.my-crew-list { display: flex; flex-direction: column; gap: 10px; }
.my-crew-item {
  display: flex; align-items: center; gap: 14px; padding: 14px 16px;
  background: #f8fafc; border: 1px solid #e8edf3; border-radius: 14px; cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.15s;
  animation: fadeUp 0.28s ease both; animation-delay: var(--delay, 0ms);
}
.my-crew-item:hover { background: #f0f8fd; border-color: #b3d9f0; transform: translateX(3px); }
.my-crew-item__cover {
  width: 80px; height: 80px; border-radius: 14px; overflow: hidden; flex-shrink: 0;
  background: #E7F3FF; display: flex; align-items: center; justify-content: center; font-size: 30px;
}
.my-crew-item__img { width: 100%; height: 100%; object-fit: cover; }
.my-crew-item__info { flex: 1; min-width: 0; }
.my-crew-item__category { font-size: 12px; font-weight: 600; color: #4fa8d8; margin-bottom: 3px; }
.my-crew-item__name { font-size: 16px; font-weight: 800; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.my-crew-item__location { font-size: 12px; color: #94a3b8; margin-top: 3px; }
.my-crew-item__arrow { font-size: 20px; color: #cbd5e1; flex-shrink: 0; }

/* 크루 아이템 액션 버튼 */
.my-crew-item__actions { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
.crew-action-btn {
  padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
  cursor: pointer; white-space: nowrap; border: 1.5px solid; transition: all 0.15s;
}
.crew-action-btn--go {
  background: #f0f8fd; border-color: #b3d9f0; color: #0369a1;
}
\.crew-action-btn--go:hover { background: #e0f2fe; border-color: #7ec8ed; }
.crew-action-btn--meeting {
  background: #f0fdf4; border-color: #86efac; color: #16a34a;
}
.crew-action-btn--meeting:hover { background: #dcfce7; border-color: #4ade80; }

/* 모달 */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.modal-backdrop {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45);
  z-index: 1000; display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.modal-box {
  background: #fff; border-radius: 20px; width: 100%; max-width: 560px;
  max-height: 80vh; display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: modalUp 0.22s ease;
}
@keyframes modalUp {
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0;
}
.modal-header__info { display: flex; align-items: center; gap: 8px; }
.modal-header__title { font-size: 16px; font-weight: 800; color: #1e293b; }
.modal-header__sub { font-size: 12px; color: #94a3b8; font-weight: 500; }
.modal-close-btn {
  background: none; border: none; font-size: 16px; color: #94a3b8;
  cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: background 0.15s;
}
.modal-close-btn:hover { background: #f1f5f9; color: #475569; }

.modal-body { overflow-y: auto; padding: 20px 24px 24px; flex: 1; }

/* 모임 카드 */
.meeting-list { display: flex; flex-direction: column; gap: 10px; }
.meeting-card {
  display: flex; align-items: center; gap: 16px; padding: 16px 18px;
  background: #f8fafc; border: 1px solid #e8edf3; border-radius: 14px;
  animation: fadeUp 0.25s ease both; animation-delay: var(--delay, 0ms);
  transition: background 0.15s, border-color 0.15s;
}
.meeting-card:hover { background: #f0f8fd; border-color: #b3d9f0; }
.meeting-card__left { flex-shrink: 0; display: flex; align-items: center; justify-content: center; align-self: center; }
.meeting-card__img {
  width: 100px; height: 100px; border-radius: 14px; object-fit: cover; display: block;
}
.meeting-card__img-placeholder {
  width: 100px; height: 100px; border-radius: 14px;
  background: #E7F3FF;
  display: flex; align-items: center; justify-content: center; font-size: 38px;
}
.meeting-card__info { flex: 1; min-width: 0; }
.meeting-card__name { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.meeting-card__place { font-size: 11px; color: #64748b; margin-bottom: 2px; }
.meeting-card__date  { font-size: 11px; color: #64748b; margin-bottom: 6px; }
.meeting-card__bottom { display: flex; align-items: center; gap: 8px; }
.meeting-card__fee { font-size: 12px; font-weight: 700; color: #0369a1; }
.meeting-card__right { flex-shrink: 0; display: flex; align-items: center; margin-left: 8px; }
.meeting-go-btn {
  padding: 10px 14px; border-radius: 10px; border: 1.5px solid #bfdbfe;
  background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700;
  cursor: pointer; line-height: 1.4; text-align: center; white-space: nowrap;
  transition: background 0.15s, border-color 0.15s;
}
.meeting-go-btn:hover { background: #dbeafe; border-color: #93c5fd; }
.meeting-status-badge {
  padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; border: 1.5px solid;
}
.meeting-status-badge--recruiting  { background: #f0fdf4; color: #16a34a; border-color: #86efac; }
.meeting-status-badge--closed      { background: #fef2f2; color: #dc2626; border-color: #fca5a5; }
.meeting-status-badge--in_progress { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }

/* 페이지네이션 */
.pagination { display: flex; justify-content: center; gap: 6px; margin-top: 20px; }
.page-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 13px; color: #64748b; cursor: pointer; transition: all 0.15s; }
\.page-btn:hover { background: #e0f2fe; border-color: #b3d9f0; color: #0369a1; }
.page-btn--active { background: #38a3d4; border-color: #38a3d4; color: #fff; font-weight: 700; }

/* 섹션 타이틀 */
.section { margin-bottom: 28px; }
.section-title { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 800; color: #1e293b; margin-bottom: 14px; }
.section-title__dot { width: 8px; height: 8px; border-radius: 50%; background: #38a3d4; flex-shrink: 0; }
.section-title__dot--alt { background: #a78bfa; }

/* 정산 카드 */
.settle-list { display: flex; flex-direction: column; gap: 14px; }
.settle-card { background: #fff; border-radius: 18px; overflow: hidden; border: 1px solid #e8edf3; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
.settle-card__header { display: flex; align-items: center; justify-content: space-between; padding: 24px 26px 16px; }
.settle-card__name { font-size: 15px; font-weight: 700; color: #1e293b; }
.settle-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; border: 1.5px solid; }
.settle-badge--done   { background: #f0fdf4; color: #16a34a; border-color: #86efac; }
.settle-badge--pending{ background: #fffbeb; color: #d97706; border-color: #fcd34d; }
.settle-amounts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 0 26px 22px; }
.amount-box { border-radius: 12px; padding: 16px 14px; }
.amount-box--total    { background: #f8fafc; border: 1px solid #e8edf3; }
.amount-box--expected { background: #fffbeb; border: 1px solid #fde68a; }
.amount-box--settled  { background: #eff6ff; border: 1px solid #bfdbfe; }
.amount-box__label { font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
.amount-box__val { font-size: 16px; font-weight: 800; color: #1e293b; line-height: 1; }
.amount-box__unit { font-size: 11px; font-weight: 600; margin-left: 1px; }
.amount-box--expected .amount-box__val { color: #d97706; }
.amount-box--settled  .amount-box__val { color: #2563eb; }
.amount-box__refund { font-size: 10px; color: #f87171; margin-top: 3px; }
.refund-list { border-top: 1px solid #f1f5f9; padding: 18px 26px 22px; }
.refund-list__title { font-size: 12px; font-weight: 700; color: #16a34a; margin-bottom: 10px; }
.refund-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; margin-bottom: 6px; }
.refund-item:last-child { margin-bottom: 0; }
.refund-item__name { font-size: 13px; font-weight: 700; color: #1e293b; }
.refund-item__msg { font-size: 11px; color: #64748b; margin-top: 1px; }
.refund-item__date { font-size: 10px; color: #94a3b8; margin-top: 2px; }
.refund-item__amount { font-size: 14px; font-weight: 700; color: #16a34a; }

/* 환불 테이블 */
.refund-table-wrap { background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e8edf3; box-shadow: 0 2px 12px rgba(0,0,0,0.05); overflow-x: auto; }
.refund-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.refund-table thead { background: #f8fafc; }
.refund-table th { padding: 14px 20px; text-align: left; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #f1f5f9; }
.refund-table td { padding: 16px 20px; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
.refund-table tbody tr:last-child td { border-bottom: none; }
.refund-table tbody tr:hover { background: #fafcff; }
.refund-table__name   { font-weight: 700; color: #1e293b; white-space: nowrap; }
.refund-table__amount { color: #1e293b; font-weight: 600; white-space: nowrap; }
.refund-table__date   { color: #94a3b8; white-space: nowrap; font-size: 12px; }
.rt-badge { padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; border: 1.5px solid; white-space: nowrap; }
.rt-badge--done     { background: #f0fdf4; color: #16a34a; border-color: #86efac; }
.rt-badge--wait     { background: #fffbeb; color: #d97706; border-color: #fcd34d; }
.rt-badge--rejected { background: #fef2f2; color: #dc2626; border-color: #fca5a5; }

/* 빈 상태 */
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; }
.empty-state__icon  { font-size: 48px; margin-bottom: 12px; opacity: 0.7; }
.empty-state__title { font-size: 15px; font-weight: 700; color: #64748b; margin-bottom: 4px; }
.empty-state__sub   { font-size: 12px; color: #94a3b8; }

/* 반응형 */
@media (max-width: 768px) {
  .crew-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .hero-wrap { padding: 0 14px; margin-top: 16px; }
  .hero-card { padding: 20px; }
  .hero-name { font-size: 18px; }
.manner-inline { max-width: 100%; }
  .top-btn-group { gap: 5px; }
  .action-btn { padding: 6px 10px; font-size: 11px; }
  .stats-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .tabs-area { padding: 12px 14px 80px; }
  .crew-grid { grid-template-columns: repeat(2, 1fr); }
  .settle-amounts { grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .amount-box__val { font-size: 13px; }
}

/* ══════════════════════════════════════
   초기 안내 배너
══════════════════════════════════════ */
.welcome-banner {
  padding: 20px 24px 100px;
}
.welcome-banner__inner {
  background: #fff;
  border: 1px solid #ebebeb;
  border-radius: 18px;
  padding: 48px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.welcome-banner__emoji {
  font-size: 32px;
  opacity: 0.5;
}
.welcome-banner__text {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
}

@media (max-width: 480px) {
  .welcome-banner { padding: 12px 14px 80px; }
}
</style>









