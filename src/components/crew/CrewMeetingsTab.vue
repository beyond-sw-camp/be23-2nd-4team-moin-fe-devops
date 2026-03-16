<template>
  <div class="space-y-4">
    <!-- 모임 만들기 버튼 -->
    <div v-if="currentUserRole !== null" class="mb-4">
      <button
        @click="toggleForm"
        class="w-full py-2 bg-[#4FA8D8] hover:bg-[#3A8FC0] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        {{ showForm ? "✕ 취소" : "+ 모임 만들기" }}
      </button>
    </div>

    <!-- 모임 생성 폼 컴포넌트 -->
    <meeting-create-page-component
      :visible="showForm"
      :crewId="crewId"
      @created="onMeetingCreated"
      @close="showForm = false"
    />

    <!-- 모임 일정 헤더 + 셀렉트 필터 -->
    <div class="meetings-header-row">
      <h3 class="font-bold text-lg">모임 일정</h3>
      <div class="meetings-select-wrap">
        <select v-model="progressFilter" class="meetings-select">
          <option v-for="opt in progressOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <select v-model="recruitFilter" class="meetings-select">
          <option v-for="opt in recruitOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <select v-model="feeFilter" class="meetings-select">
          <option v-for="opt in feeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
    </div>

    <!-- 모임 카드 -->
    <div
      v-for="meeting in visibleMeetings"
      :key="meeting.meetingId"
      @click="$router.push(`/meeting/${meeting.meetingId}`)"
      :class="[
        'bg-white rounded-xl border border-gray-200 mb-3 cursor-pointer hover:border-[#4FA8D8] transition-colors overflow-hidden flex',
        { 'meeting-card--ended': isMeetingEnded(meeting) }
      ]"
      style="min-height: 158px;"
    >
      <div class="flex-shrink-0 meeting-card-img-wrap meeting-card-img-wrap--relative">
        <img
          v-if="meeting.profileImage"
          :src="meeting.profileImage"
          :alt="meeting.title"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center bg-[#E7F3FF]"
        ></div>
        <div v-if="isMeetingEnded(meeting)" class="meeting-card-ended-overlay">종료 모임</div>
      </div>

      <div class="flex-1 min-w-0 p-4">
        <div class="flex items-start justify-between mb-2">
          <h4 class="font-bold text-gray-900 truncate pr-2 meeting-card__title">{{ meeting.title }}</h4>
          <div class="flex items-center gap-2 flex-shrink-0">
            <span v-if="getDday(meeting) !== null" class="meeting-card__dday">{{ getDday(meeting) }}</span>
            <span
              :class="[
                'px-2.5 py-1 rounded-full text-xs font-semibold border',
                getStatusColor(meeting.status),
              ]"
            >
              {{ meeting.status }}
            </span>
          </div>
        </div>

        <div class="space-y-1">
          <div class="flex items-center gap-1.5 text-sm text-gray-600 meeting-card__meta">
            <span class="icon-wrap text-[#4FA8D8]"><svg class="cmt-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"></rect><path d="M3 10h18"></path><path d="M8 3v4M16 3v4"></path></svg></span>
            <span class="truncate">
              {{ meeting.datetimeDisplay || formatDatetime(meeting.datetime) }}
            </span>
          </div>
          <div class="flex items-center gap-1.5 text-sm text-gray-600 meeting-card__meta">
            <span class="icon-wrap text-[#4FA8D8]"><svg class="cmt-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-6-5.6-6-10a6 6 0 1112 0c0 4.4-6 10-6 10z"></path><circle cx="12" cy="11" r="2.2"></circle></svg></span>
            <span class="truncate">{{ meeting.location }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-sm text-gray-600 meeting-card__meta">
            <span class="icon-wrap text-[#4FA8D8]"><svg class="cmt-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></span>
            <span>{{ meeting.currentMemberCount ?? 0 }}/{{ meeting.maxMembers ?? '?' }}명</span>
          </div>
          <div class="text-sm font-semibold text-[#4FA8D8] meeting-card__fee">
            {{
              meeting.fee === 0
                ? "무료"
                : "유료(" + Number(meeting.fee).toLocaleString() + "원)"
            }}
          </div>
        </div>
      </div>
    </div>

    <!-- 모임 없음 -->
    <div
      v-if="visibleMeetings.length === 0"
      class="text-center py-12 bg-white rounded-xl border border-gray-200"
    >
      <div class="empty-icon-wrap">
        <div class="empty-icon-circle">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="empty-icon-svg">
            <rect x="3" y="5" width="18" height="16" rx="3"></rect>
            <path d="M3 10h18"></path>
            <path d="M8 3v4M16 3v4"></path>
            <path d="M8 14h3M8 17h3M13 14h3M13 17h3"></path>
          </svg>
        </div>
      </div>
      <p class="text-gray-500">표시할 모임이 없습니다</p>
    </div>
  </div>
</template>

<script>
import dayjs from '@/plugins/dayjs';
import MeetingCreatePageComponent from '../meeting/MeetingCreatePageComponent.vue';

export default {
  name: "CrewMeetingsTab",

  components: { MeetingCreatePageComponent },

  props: {
    meetings: { type: Array, default: () => [] },
    currentUserRole: { type: String, default: null },
    crewId: { type: [Number, String], required: true },
  },

  data() {
    return {
      localMeetings: [...this.meetings],
      showForm: false,
      progressFilter: "all",
      recruitFilter: "all",
      feeFilter: "all",
      progressOptions: [
        { value: "all", label: "전체" },
        { value: "ongoing", label: "진행중" },
        { value: "ended", label: "종료" },
      ],
      recruitOptions: [
        { value: "all", label: "전체" },
        { value: "open", label: "모집중" },
        { value: "closed", label: "마감" },
      ],
      feeOptions: [
        { value: "all", label: "전체" },
        { value: "free", label: "무료" },
        { value: "paid", label: "유료" },
      ],
    };
  },

  computed: {
    visibleMeetings() {
      const parseDate = (raw) => {
        if (!raw) return null;
        const d = dayjs.utc(raw);
        return d.isValid() ? d.toDate() : null;
      };
      // const parseDate = (raw) => {
      //   if (!raw) return null;
      //   const normalized =
      //     typeof raw === "string" && raw.includes(" ") ? raw.replace(" ", "T") : raw;
      //   const d = new Date(normalized);
      //   return isNaN(d.getTime()) ? null : d;
      // };
      const isEnded = (m) => {
        const r = (m.recruitStatus || "").toString().toUpperCase();
        const kr = (m.status || "").toString().trim();
        return r === "FINISHED" || kr === "종료";
      };
      let list = (this.localMeetings || []).slice();

      if (this.progressFilter === "ended") {
        list = list.filter(isEnded);
      } else if (this.progressFilter === "ongoing") {
        list = list.filter((m) => !isEnded(m));
      }

      if (this.recruitFilter === "open") {
        list = list.filter((m) => (m.recruitStatus || "").toUpperCase() === "OPEN");
      } else if (this.recruitFilter === "closed") {
        list = list.filter((m) => {
          const r = (m.recruitStatus || "").toUpperCase();
          return r === "CLOSED" || r === "FINISHED";
        });
      }

      if (this.feeFilter === "free") {
        list = list.filter((m) => (Number(m.fee) || 0) === 0);
      } else if (this.feeFilter === "paid") {
        list = list.filter((m) => (Number(m.fee) || 0) > 0);
      }

      return list.sort((a, b) => {
        const da = parseDate(a.datetime ?? a.meetingAt);
        const db = parseDate(b.datetime ?? b.meetingAt);
        return (db?.getTime() ?? 0) - (da?.getTime() ?? 0);
      });
    },
  },

  watch: {
    meetings(val) {
      this.localMeetings = [...val];
    },
  },

  methods: {
    toggleForm() {
      this.showForm = !this.showForm;
    },

    onMeetingCreated() {
      window.location.reload();
    },

    formatDatetime(dt) {
      if (!dt) return "";
      const d = dayjs.utc(dt).tz('Asia/Seoul');
      if (!d.isValid()) return String(dt);
      return `${d.month() + 1}/${d.date()} ${String(d.hour()).padStart(2, "0")}:${String(d.minute()).padStart(2, "0")}`;
    },

    // formatDatetime(dt) {
    //   if (!dt) return "";
    //   const normalized =
    //     typeof dt === "string" && dt.includes(" ") ? dt.replace(" ", "T") : dt;
    //   const d = new Date(normalized);
    //   if (isNaN(d.getTime())) return String(dt);
    //   return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    // },

    getStatusColor(status) {
      const map = {
        모집중: "bg-green-100 text-green-700 border-green-200",
        모집마감: "bg-sky-100 text-sky-700 border-sky-200",
        종료: "bg-gray-100 text-gray-600 border-gray-200",
      };
      return map[status] ?? "bg-gray-100 text-gray-600 border-gray-200";
    },

    isMeetingEnded(meeting) {
      const r = (meeting.recruitStatus || "").toString().toUpperCase();
      const kr = (meeting.status || "").toString().trim();
      return r === "FINISHED" || kr === "종료";
    },

    getDday(meeting) {
      if (this.isMeetingEnded(meeting)) return null;
      const raw = meeting.datetime ?? meeting.meetingAt;
      if (!raw) return null;
      // UTC로 파싱 후 KST로 변환하여 날짜 기준 D-day 계산
      const meetingDay = dayjs.utc(raw).tz('Asia/Seoul').startOf('day');
      if (!meetingDay.isValid()) return null;
      const today = dayjs().tz('Asia/Seoul').startOf('day');
      const diffDays = meetingDay.diff(today, 'day');
      if (diffDays < 0) return null;
      return "D-" + diffDays;
    },

    // getDday(meeting) {
    //   if (this.isMeetingEnded(meeting)) return null;
    //   const raw = meeting.datetime ?? meeting.meetingAt;
    //   if (!raw) return null;
    //   const normalized =
    //     typeof raw === "string" && raw.includes(" ") ? raw.replace(" ", "T") : raw;
    //   const d = new Date(normalized);
    //   if (isNaN(d.getTime())) return null;
    //   const meetingDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    //   const today = new Date();
    //   today.setHours(0, 0, 0, 0);
    //   const todayTime = today.getTime();
    //   const meetingTime = meetingDate.getTime();
    //   const diffDays = Math.round((meetingTime - todayTime) / (24 * 60 * 60 * 1000));
    //   if (diffDays < 0) return null;
    //   return "D-" + diffDays;
    // },
  },
};
</script>

<style scoped>
.meetings-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.meetings-header-row h3 {
  margin: 0;
}
.meetings-select-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.meetings-select {
  padding: 8px 32px 8px 12px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
}
.meetings-select:hover {
  border-color: #4FA8D8;
}
.meetings-select:focus {
  outline: none;
  border-color: #4FA8D8;
}

.meeting-card-img-wrap {
  width: 180px;
  min-width: 180px;
  max-width: 180px;
  height: 158px;        /* ✅ 고정 높이 */
  align-self: stretch;
  flex-shrink: 0;
  overflow: hidden;
}
.meeting-card-img-wrap img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.meeting-card-img-wrap--relative {
  position: relative;
}
.meeting-card-img-wrap > div:not(.meeting-card-ended-overlay) {
  width: 100%;
  height: 100%;
}

/* 종료된 모임: 사진·텍스트 회색, 사진 위 "종료 모임" 연하게 */
.meeting-card--ended .meeting-card-img-wrap img,
.meeting-card--ended .meeting-card-img-wrap > div {
  filter: grayscale(100%);
  opacity: 0.85;
}
.meeting-card-ended-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.12);
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.02em;
}
.meeting-card--ended .meeting-card__title,
.meeting-card--ended .meeting-card__meta,
.meeting-card--ended .meeting-card__meta .icon-wrap,
.meeting-card--ended .meeting-card__fee {
  color: #9ca3af !important;
}

.meeting-card__dday {
  font-size: 12px;
  font-weight: 700;
  color: #4FA8D8;
  background: #EBF6FC;
  padding: 4px 10px;
  border-radius: 9999px;
  white-space: nowrap;
}

.icon-wrap { display: inline-flex; align-items: center; justify-content: center; line-height: 1; }
.icon-wrap--lg { width: 32px; height: 32px; color: #4FA8D8; }
.icon-wrap--xl { width: 48px; height: 48px; color: #9ca3af; }
.cmt-icon { width: 1em; height: 1em; flex-shrink: 0; }

/* 모임 없음 - 피드 탭 empty와 동일 스타일 */
.empty-icon-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
.empty-icon-circle {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #EBF6FC;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-icon-circle .empty-icon-svg { width: 36px; height: 36px; color: #4FA8D8; }
</style>