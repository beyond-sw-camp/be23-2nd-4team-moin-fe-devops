<template>
  <div class="page-root">
    <!-- ======= LNB (공통 컴포넌트) ======= -->
    <LnbMenuComponent
      active-nav="meetings"
      :category-options="categoryOptions"
      :selected-category-values="selectedCategoryValues"
      category-mode="single"
      @nav-click="onLnbNavClick"
      @category-toggle="onCategoryToggle"
      @category-clear="$router.push('/')"
    />

    <!-- ======= 메인 ======= -->
    <main class="main">
      <!-- ════════════ 내 모임 일정 ════════════ -->
      <section class="section-block">
        <h2 class="section-title">내 모임 일정</h2>

        <!-- 날짜 가로 스크롤 바 -->
        <div class="date-scroll-wrap">
          <div class="date-scroll">
            <button
              v-for="d in dateRange"
              :key="d.dateStr"
              class="date-pill"
              :class="{ 'date-pill--active': selectedDate === d.dateStr }"
              @click="selectDate(d.dateStr)"
            >
              <span class="date-pill-day">{{ d.day }}</span>
              <span class="date-pill-label">{{ d.label }}</span>
              <span v-if="d.hasEvent" class="date-pill-dot"></span>
            </button>
          </div>
        </div>

        <!-- 로딩 -->
        <div v-if="loadingMyMeetings" class="my-meeting-grid">
          <div v-for="i in 4" :key="i" class="my-meeting-card skeleton-card">
            <div class="skeleton mmi-thumb-new"></div>
            <div class="mmi-body-new">
              <div class="sk-line" style="width: 70%; height: 14px; margin-bottom: 8px"></div>
              <div class="sk-line" style="width: 90%; height: 11px; margin-bottom: 6px"></div>
              <div class="sk-line" style="width: 60%; height: 11px"></div>
            </div>
          </div>
        </div>

        <!-- 빈 상태 -->
        <div v-else-if="displayMyMeetings.length === 0" class="empty-wrap">
          <p class="empty-icon">📅</p>
          <p class="empty-title">예정된 모임이 없습니다</p>
          <p class="empty-desc">참여 중인 크루의 모임에 신청해보세요</p>
        </div>

        <!-- 모임 목록 -->
        <div v-else class="my-meeting-grid">
          <div
            v-for="m in displayMyMeetings"
            :key="m.meetingId"
            class="my-meeting-card"
            @click="goToMeeting(m)"
          >
            <div class="mmi-thumb-new">
              <img
                v-if="m.profileImage && !imageErrorIds[m.meetingId]"
                :src="m.profileImage"
                :alt="safeStr(m.meetingName)"
                @error="setImageError(m.meetingId)"
              />
              <div v-else class="mmi-thumb-ph-new"></div>
              <div class="mmi-overlay">
                <span class="mmi-overlay-day">{{ dayLabel(m.meetingAt) }}</span>
                <span class="mmi-overlay-time">{{ formatTime(m.meetingAt) }}</span>
              </div>
              <span class="mmi-dday-badge" :class="ddayClass(m.meetingAt)">{{ ddayLabel(m.meetingAt) }}</span>
            </div>
            <div class="mmi-body-new">
              <h4 class="mmi-title-new">{{ safeStr(m.meetingName) }}</h4>
              <p class="mmi-meta-new">
                <svg fill="currentColor" viewBox="0 0 24 24" class="mmi-location-icon"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                {{ safeStr(m.place) }}
              </p>
              <p class="mmi-detail-new">{{ safeStr(m.crewName) }}</p>
              <div class="mmi-footer-new">
                <span :class="['mmi-status', statusClass(m.recruitStatus)]">{{ toKrStatus(m.recruitStatus) }}</span>
                <span v-if="feeNum(m.fee) > 0" class="mmi-fee"> {{ feeNum(m.fee).toLocaleString() }}원</span>
                <span v-else class="mmi-fee mmi-fee--free">무료</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="displayMyMeetingsHasMore" class="more-wrap">
          <button type="button" class="more-btn" @click="loadMoreMyMeetings">
            더보기
          </button>
        </div>
      </section>

      <!-- 구분선 -->
      <div class="section-divider"></div>

      <!-- ════════════ 지난 참여 모임 ════════════ -->
      <section class="section-block">
        <h2 class="section-title">지난 참여 모임</h2>

        <!-- 로딩 -->
        <div v-if="loadingPastMeetings" class="my-meeting-grid">
          <div v-for="i in 4" :key="i" class="my-meeting-card skeleton-card">
            <div class="skeleton mmi-thumb-new"></div>
            <div class="mmi-body-new">
              <div class="sk-line" style="width: 70%; height: 14px; margin-bottom: 8px"></div>
              <div class="sk-line" style="width: 90%; height: 11px; margin-bottom: 6px"></div>
              <div class="sk-line" style="width: 60%; height: 11px"></div>
            </div>
          </div>
        </div>

        <!-- 빈 상태 -->
        <div v-else-if="pastMeetingList.length === 0" class="empty-wrap">
          <p class="empty-icon">🕰️</p>
          <p class="empty-title">지난 모임이 없습니다</p>
          <p class="empty-desc">참여했던 모임이 여기에 표시됩니다</p>
        </div>

        <!-- 모임 목록 -->
        <div v-else class="my-meeting-grid">
          <div
            v-for="m in pastMeetingList"
            :key="m.meetingId"
            class="my-meeting-card past-card"
            @click="goToMeeting(m)"
          >
            <div class="mmi-thumb-new">
              <img
                v-if="m.profileImage && !pastImageErrorIds[m.meetingId]"
                :src="m.profileImage"
                :alt="safeStr(m.meetingName)"
                @error="setPastImageError(m.meetingId)"
              />
              <div v-else class="mmi-thumb-ph-new"></div>
              <div class="mmi-overlay mmi-overlay--past">
                <span class="mmi-overlay-past-label">종료</span>
              </div>
            </div>
            <div class="mmi-body-new">
              <h4 class="mmi-title-new">{{ safeStr(m.meetingName) }}</h4>
              <p class="mmi-meta-new">
                <svg fill="currentColor" viewBox="0 0 24 24" class="mmi-location-icon"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                {{ safeStr(m.place) }}
              </p>
              <p class="mmi-detail-new">{{ safeStr(m.crewName) }}</p>
              <div class="mmi-footer-new">
                <span class="mmi-status status--done">종료</span>
                <span v-if="feeNum(m.fee) > 0" class="mmi-fee"> {{ feeNum(m.fee).toLocaleString() }}원</span>
                <span v-else class="mmi-fee mmi-fee--free">무료</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!loadingPastMeetings && pastMeetingsHasMore" class="more-wrap">
          <button
            class="more-btn"
            @click="loadMorePastMeetings"
            :disabled="loadingMorePastMeetings"
          >
            <span v-if="loadingMorePastMeetings" class="spin"></span>
            <span v-else>더보기</span>
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import axios from "axios";
import dayjs from "@/plugins/dayjs";
import LnbMenuComponent from "@/components/common/LnbMenuComponent.vue";

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

const API = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || "http://localhost:8080",
});
API.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export default {
  name: "MySchedulePage",
  components: { LnbMenuComponent },

  data() {
    return {
      categoryOptions: CATEGORY_OPTIONS,
      selectedCategoryValues: [],

      selectedDate: null,

      // 내 모임 일정 (예정)
      myMeetings: [],
      myMeetingsDisplayLimit: 6,
      loadingMyMeetings: false,
      imageErrorIds: {},

      // 지난 참여 모임 (FINISHED)
      pastMeetingList: [],
      loadingPastMeetings: false,
      loadingMorePastMeetings: false,
      pastMeetingsPage: 0,
      pastMeetingsHasMore: false,
      pastImageErrorIds: {},
    };
  },

  computed: {
    dateRange() {
      const result = [];
      const today = new Date();
      const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];
      const eventDays = new Set(
        this.myMeetings.map((m) => {
          const d = new Date(m.meetingAt);
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        }),
      );
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dateStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        result.push({
          dateStr,
          day: d.getDate(),
          label: i === 0 ? "오늘" : i === 1 ? "내일" : dayLabels[d.getDay()],
          hasEvent: eventDays.has(dateStr),
        });
      }
      return result;
    },

    displayMyMeetings() {
      const list = !this.selectedDate
        ? this.myMeetings
        : this.myMeetings.filter((m) => {
            const d = new Date(m.meetingAt);
            return (
              `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` ===
              this.selectedDate
            );
          });
      return list.slice(0, this.myMeetingsDisplayLimit);
    },
    displayMyMeetingsHasMore() {
      const list = !this.selectedDate
        ? this.myMeetings
        : this.myMeetings.filter((m) => {
            const d = new Date(m.meetingAt);
            return (
              `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` ===
              this.selectedDate
            );
          });
      return list.length > this.myMeetingsDisplayLimit;
    },
  },

  async mounted() {
    if (!localStorage.getItem("token")) {
      this.$router.replace({ path: "/login", query: { redirect: "/my/meetings" } });
      return;
    }
    await Promise.all([this.fetchMyMeetings(), this.fetchPastMeetings()]);
  },

  methods: {
    onLnbNavClick(key) {
      if (key === "home") this.$router.push("/");
      else if (key === "my-crews") this.$router.push("/my/crews");
      else if (key === "recommendations") this.$router.push("/crew/recommendations");
      else if (key === "rising") this.$router.push("/crew/rising-crews");
      else if (key === "meetings") this.$router.push("/my/meetings");
      else if (key === "recent") this.$router.push("/my/recent");
    },

    onCategoryToggle(value) {
  this.$router.push({ path: "/crew/search", query: value ? { category: value } : {} });
},

    selectDate(dateStr) {
      this.selectedDate = this.selectedDate === dateStr ? null : dateStr;
    },
    loadMoreMyMeetings() {
      this.myMeetingsDisplayLimit += 6;
    },

    safeStr(val) {
      return val != null && String(val).trim() !== "" ? String(val).trim() : "-";
    },
    feeNum(val) {
      const n = Number(val);
      return Number.isFinite(n) ? n : 0;
    },
    goToMeeting(m) {
      if (!m || m.meetingId == null) return;
      const query = m.crewId != null ? { crewId: m.crewId } : {};
      this.$router.push({
        name: "MeetingDetail",
        params: { id: m.meetingId },
        query,
      });
    },
    setImageError(meetingId) {
      this.$set(this.imageErrorIds, meetingId, true);
    },
    setPastImageError(meetingId) {
      this.$set(this.pastImageErrorIds, meetingId, true);
    },

    formatTime(dt) {
      if (!dt) return "";
      const d = dayjs.utc(dt).tz("Asia/Seoul");
      if (!d.isValid()) return "";
      const min = String(d.minute()).padStart(2, "0");
      const ampm = d.hour() < 12 ? "오전" : "오후";
      const hour = d.hour() % 12 || 12;
      return `${ampm} ${hour}:${min}`;
    },

    // formatTime(dt) {
    //   if (!dt) return "";
    //   const d = new Date(dt);
    //   const min = String(d.getMinutes()).padStart(2, "0");
    //   const ampm = d.getHours() < 12 ? "오전" : "오후";
    //   const hour = d.getHours() % 12 || 12;
    //   return `${ampm} ${hour}:${min}`;
    // },

    dayLabel(dt) {
      if (!dt) return "";
      const d = dayjs.utc(dt).tz("Asia/Seoul").startOf("day");
      const today = dayjs().tz("Asia/Seoul").startOf("day");
      const diff = d.diff(today, "day");
      if (diff === 0) return "오늘";
      if (diff === 1) return "내일";
      const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
      return dayNames[d.day()];
    },
    // dayLabel(dt) {
    //   if (!dt) return "";
    //   const today = new Date();
    //   const d = new Date(dt);
    //   const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    //   const dStr = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    //   if (todayStr === dStr) return "오늘";
    //   const tomorrow = new Date(today);
    //   tomorrow.setDate(today.getDate() + 1);
    //   const tomorrowStr = `${tomorrow.getFullYear()}-${tomorrow.getMonth()}-${tomorrow.getDate()}`;
    //   if (dStr === tomorrowStr) return "내일";
    //   const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    //   return dayNames[d.getDay()];
    // },
    toKrStatus(s) {
      return (
        { OPEN: "모집중", CLOSED: "모집마감", FINISHED: "종료" }[s] ?? (s || "")
      );
    },
    statusClass(s) {
      if (s === "OPEN") return "status--open";
      if (s === "CLOSED") return "status--closed";
      return "status--done";
    },
    ddayLabel(dt) {
      if (!dt) return "";
      const meetingDay = dayjs.utc(dt).tz("Asia/Seoul").startOf("day");
      const today = dayjs().tz("Asia/Seoul").startOf("day");
      const diff = meetingDay.diff(today, "day");
      if (diff === 0) return "D-DAY";
      if (diff < 0) return `D+${Math.abs(diff)}`;
      return `D-${diff}`;
    },
    // ddayLabel(dt) {
    //   if (!dt) return "";
    //   const diff = Math.ceil((new Date(dt) - new Date()) / 86400000);
    //   if (diff === 0) return "D-DAY";
    //   if (diff < 0) return `D+${Math.abs(diff)}`;
    //   return `D-${diff}`;
    // },

    ddayClass(dt) {
      if (!dt) return "dday--normal";
      const meetingDay = dayjs.utc(dt).tz("Asia/Seoul").startOf("day");
      const today = dayjs().tz("Asia/Seoul").startOf("day");
      const diff = meetingDay.diff(today, "day");
      if (diff <= 0) return "dday--today";
      if (diff <= 3) return "dday--soon";
      return "dday--normal";
    },
    // ddayClass(dt) {
    //   const diff = Math.ceil((new Date(dt) - new Date()) / 86400000);
    //   if (diff <= 0) return "dday--today";
    //   if (diff <= 3) return "dday--soon";
    //   return "dday--normal";
    // },

    normalizeMeeting(m) {
      if (!m || m.meetingId == null) return null;
      const profileImage =
        m.profileImage ?? m.profileImageUrl ?? m.imageUrl ?? m.meetingImage ?? m.image ?? null;
      return {
        meetingId: m.meetingId,
        crewId: m.crewId ?? null,
        profileImage: profileImage && String(profileImage).trim() ? profileImage : null,
        meetingName: m.meetingName ?? "",
        crewName: m.crewName ?? "",
        place: m.place ?? "",
        fee: m.fee != null ? Number(m.fee) : 0,
        meetingAt: m.meetingAt ?? null,
        recruitStatus: m.recruitStatus ?? "",
      };
    },

    // ── 내 모임 일정 (예정) ──────────────────────────────────
    async fetchMyMeetings() {
      this.loadingMyMeetings = true;
      try {
        const res = await API.get("/meeting/my-meeting");
        const now = new Date();
        const raw = res.data;
        const all = Array.isArray(raw) ? raw : (raw?.content ?? []);
        this.myMeetings = all
          .map((m) => this.normalizeMeeting(m))
          .filter(Boolean)
          .filter((m) => {
            if (!m.meetingAt) return false;
            return new Date(m.meetingAt).getTime() > now.getTime() && m.recruitStatus !== "FINISHED";
          })
          .sort((a, b) => new Date(a.meetingAt) - new Date(b.meetingAt));
        this.myMeetingsDisplayLimit = 6;
        this.imageErrorIds = {};
      } catch (e) {
        console.error(e);
        this.myMeetings = [];
      } finally {
        this.loadingMyMeetings = false;
      }
    },

    // ── 지난 참여 모임 (FINISHED) ────────────────────────────
    async fetchPastMeetings() {
      this.loadingPastMeetings = true;
      try {
        const res = await API.get("/meeting/my-my-past-meeting", {
          params: { page: 0, size: 6, sort: "meetingAt,desc" },
        });
        const data = res.data;
        const list = Array.isArray(data) ? data : (data?.content ?? []);
        this.pastMeetingList = list.map((m) => this.normalizeMeeting(m)).filter(Boolean);
        this.pastMeetingsPage = 0;
        this.pastMeetingsHasMore = Array.isArray(data) ? false : (data?.last !== undefined ? !data.last : false);
        this.pastImageErrorIds = {};
      } catch (e) {
        console.error(e);
        this.pastMeetingList = [];
      } finally {
        this.loadingPastMeetings = false;
      }
    },

    async loadMorePastMeetings() {
      this.loadingMorePastMeetings = true;
      this.pastMeetingsPage++;
      try {
        const res = await API.get("/meeting/my-my-past-meeting", {
          params: { page: this.pastMeetingsPage, size: 6, sort: "meetingAt,desc" },
        });
        const data = res.data;
        const list = Array.isArray(data) ? data : (data?.content ?? []);
        this.pastMeetingList = [
          ...this.pastMeetingList,
          ...list.map((m) => this.normalizeMeeting(m)).filter(Boolean),
        ];
        this.pastMeetingsHasMore = Array.isArray(data) ? false : (data?.last !== undefined ? !data.last : false);
      } catch (e) {
        console.error(e);
      } finally {
        this.loadingMorePastMeetings = false;
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
  padding: 28px 28px 80px;
  display: flex;
  flex-direction: column;
}

.section-block {
  padding-bottom: 32px;
}
.section-title {
  font-size: 18px;
  font-weight: 800;
  color: #111;
  margin-bottom: 16px;
  letter-spacing: -0.3px;
}
.section-divider {
  height: 8px;
  background: #f2f2f2;
  margin: 0 -28px 32px;
}

/* ══ 날짜 스크롤 ══ */
.date-scroll-wrap {
  overflow-x: auto;
  margin-bottom: 16px;
  scrollbar-width: none;
}
.date-scroll-wrap::-webkit-scrollbar { display: none; }
.date-scroll {
  display: flex;
  gap: 8px;
  padding-bottom: 4px;
  min-width: max-content;
}

.date-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 16px;
  border-radius: 50px;
  border: 1.5px solid #e8e8e8;
  background: #fff;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  min-width: 56px;
}
.date-pill:hover { border-color: #4fa8d8; color: #4fa8d8; }
.date-pill--active { background: #111; border-color: #111; color: #fff; }
.date-pill-day { font-size: 16px; font-weight: 800; line-height: 1; color: inherit; }
.date-pill-label { font-size: 10.5px; color: inherit; opacity: 0.7; }
.date-pill--active .date-pill-label { opacity: 0.8; }
.date-pill-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: #4fa8d8; position: absolute; bottom: 6px;
}
.date-pill--active .date-pill-dot { background: #fff; }

/* ══ 모임 카드 공통 ══ */
.my-meeting-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  min-height: 120px;
}

.my-meeting-card {
  display: flex;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #ebebeb;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.14s, box-shadow 0.14s;
}
.my-meeting-card:hover { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); }

/* 지난 모임 카드 - 약간 흐리게 */
.past-card { opacity: 0.85; }
.past-card:hover { opacity: 1; }

.mmi-thumb-new {
  width: 130px;
  min-width: 130px;
  height: 130px;
  border-radius: 12px 0 0 12px;
  overflow: hidden;
  position: relative;
  background: #e8e8e8;
}
.mmi-thumb-new img { width: 100%; height: 100%; object-fit: cover; display: block; }
/* 이미지 없을 때: 모임 상세(MeetingDetail)와 동일한 플레이스홀더 */
.mmi-thumb-ph-new {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: #E7F3FF;
}

.mmi-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 22px 10px 9px;
  background: linear-gradient(to top, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.3) 60%, transparent 100%);
  display: flex; flex-direction: column; gap: 1px; line-height: 1.2;
}
.mmi-overlay-day { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.75); letter-spacing: 0.03em; }
.mmi-overlay-time { font-size: 12.5px; font-weight: 800; color: #fff; letter-spacing: -0.2px; text-shadow: 0 1px 4px rgba(0,0,0,0.4); }
/* 지난 참여 모임: 사진 전체 검정~회색 그라데이션, 중앙에 종료(흰색) */
.mmi-overlay--past {
  top: 0; left: 0; right: 0; bottom: 0;
  padding: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(60,60,60,0.5) 50%, rgba(100,100,100,0.4) 100%);
  justify-content: center; align-items: center;
}
.mmi-overlay-past-label {
  font-size: 22px; font-weight: 800;
  color: #fff;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 3px rgba(0,0,0,0.4);
}

.mmi-dday-badge {
  position: absolute; top: 8px; right: 8px;
  padding: 4px 8px; border-radius: 8px;
  font-size: 11px; font-weight: 800; letter-spacing: 0.02em; line-height: 1;
  backdrop-filter: blur(4px);
}
.mmi-dday-badge.dday--today { background: rgba(220,38,38,0.9); color: #fff; }
.mmi-dday-badge.dday--soon  { background: rgba(2,132,199,0.85); color: #fff; }
.mmi-dday-badge.dday--normal { background: rgba(0,0,0,0.45); color: #fff; }

.mmi-body-new {
  flex: 1; min-width: 0; padding: 10px 12px;
  display: flex; flex-direction: column; justify-content: space-between;
}
.mmi-title-new {
  font-size: 14px; font-weight: 700; color: #111;
  margin: 0 0 4px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  line-height: 1.3;
}
.mmi-meta-new { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #666; margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mmi-meta-new .mmi-location-icon { width: 12px; height: 12px; flex-shrink: 0; color: #4FA8D8; }
.mmi-detail-new { font-size: 11px; color: #999; margin: 0 0 auto; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mmi-footer-new { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.mmi-footer-new .mmi-status { padding: 2px 8px; border-radius: 6px; font-size: 10.5px; font-weight: 700; }
.mmi-footer-new .mmi-status.status--open   { background: #dcfce7; color: #16a34a; }
.mmi-footer-new .mmi-status.status--closed { background: #fee2e2; color: #dc2626; }
.mmi-footer-new .mmi-status.status--done   { background: #f3f4f6; color: #9ca3af; }
.mmi-footer-new .mmi-fee { font-size: 11.5px; color: #4fa8d8; font-weight: 600; }
.mmi-footer-new .mmi-fee.mmi-fee--free { color: #16a34a; }

/* ══ 스켈레톤 ══ */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 400px;
  animation: shimmer 1.4s infinite;
}
.sk-line {
  border-radius: 5px; display: block;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 400px; animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}
.skeleton-card { pointer-events: none; }
.my-meeting-grid .skeleton-card {
  display: flex; background: #fff; border-radius: 14px; border: 1px solid #ebebeb; overflow: hidden;
}
.my-meeting-grid .skeleton-card .mmi-thumb-new { width: 130px; min-width: 130px; height: 130px; border-radius: 12px 0 0 12px; }
.my-meeting-grid .skeleton-card .mmi-body-new  { flex: 1; padding: 10px 12px; }

/* ══ 빈 상태 ══ */
.empty-wrap { text-align: center; padding: 60px 0; }
.empty-icon  { font-size: 44px; margin-bottom: 12px; }
.empty-title { font-size: 15px; font-weight: 600; color: #aaa; margin-bottom: 8px; }
.empty-desc  { font-size: 12.5px; color: #ccc; line-height: 1.7; margin-bottom: 20px; }

/* ══ 더보기 ══ */
.more-wrap { display: flex; justify-content: center; margin-top: 20px; }
.more-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 32px; background: #fff;
  border: 1.5px solid #e0e0e0; border-radius: 24px;
  font-size: 14px; font-weight: 600; color: #333;
  cursor: pointer; transition: all 0.15s;
}
.more-btn:hover:not(:disabled) { border-color: #4fa8d8; color: #4fa8d8; background: #f0f8ff; }
.more-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.spin {
  width: 15px; height: 15px;
  border: 2px solid #4fa8d8; border-top-color: transparent;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ══ 반응형 ══ */
@media (max-width: 900px) {
  .main { padding: 16px 14px 60px; }
  .section-divider { margin: 0 -14px 28px; }
}
@media (max-width: 600px) {
  .main { padding: 12px 12px 60px; }
  .my-meeting-grid { grid-template-columns: 1fr; gap: 10px; }
  .section-divider { margin: 0 -12px 24px; }
}
</style>

