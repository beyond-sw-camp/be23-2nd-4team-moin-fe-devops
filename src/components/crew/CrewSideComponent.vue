<template>
  <aside class="side-col">

    <!-- 크루원 -->
    <div class="side-card">
      <div class="side-card-hd">
        <span class="side-card-title">크루원</span>
        <button @click="$emit('change-tab', 'members')" class="side-more-btn">전체 보기</button>
      </div>

      <div class="avatar-row">
        <div
          v-for="(m, i) in members.slice(0, 6)"
          :key="m.crewMemberId ?? i"
          class="avatar-wrap"
          :style="{ zIndex: 20 - i }"
          @mouseenter="hoveredMemberKey = (m.crewMemberId ?? i)"
          @mouseleave="hoveredMemberKey = null"
          @click.stop="openMemberInfo(m)"
        >
          <img v-if="m.profileImageUrl" :src="m.profileImageUrl" class="avatar-img" />
          <div v-else class="avatar-ph feed-avatar--ph">
            <svg class="avatar-ph-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
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

          <!-- 크루장 배지 -->
          <span v-if="m.role === 'OWNER'" class="avatar-owner-badge">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
              <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clip-rule="evenodd"/>
            </svg>
          </span>

          <!-- 이름 툴팁 -->
          <div
            v-if="hoveredMemberKey === (m.crewMemberId ?? i)"
            class="avatar-tooltip"
          >
            {{ m.nickname || "익명" }}
          </div>
        </div>

        <button
          v-if="members.length > 6"
          class="avatar-more avatar-more-btn"
          @click="$emit('change-tab', 'members')"
        >
          +{{ members.length - 6 }}
        </button>
      </div>
    </div>

    <!-- 마감임박 모임 -->
    <div class="side-card">
      <div class="side-card-hd">
        <span class="side-card-title">마감임박 모임</span>
        <button @click="$emit('change-tab', 'meetings')" class="side-more-btn">전체 보기</button>
      </div>

      <div v-if="!nextMeeting" class="side-empty">예정된 모임이 없습니다</div>

      <div v-else class="next-meeting-card" @click="handleMeetingClick(nextMeeting)">
        <div class="next-meeting-dday" :class="ddayClass">{{ ddayLabel }}</div>
        <div class="next-meeting-info">
          <p class="next-meeting-title">{{ nextMeeting.title }}</p>
          <p class="next-meeting-meta">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="meta-icon" width="13" height="13">
              <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.003 3.5-4.697 3.5-8.327a8 8 0 10-16 0c0 3.63 1.556 6.326 3.5 8.327a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
            </svg>
            {{ nextMeeting.location }}
          </p>
          <p class="next-meeting-meta">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="meta-icon" width="13" height="13">
              <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clip-rule="evenodd"/>
            </svg>
            {{ formatDatetime(nextMeeting.datetime) }}
          </p>
        </div>
        <span :class="['next-meeting-status', statusClass(nextMeeting.status)]">{{ nextMeeting.status }}</span>
      </div>

      <div
        v-for="(m, i) in visibleUpcomingMeetings.slice(1, 3)"
        :key="i"
        class="upcoming-item"
        @click="handleMeetingClick(m)"
      >
        <span class="upcoming-dot"></span>
        <div class="upcoming-info">
          <p class="upcoming-title">{{ m.title }}</p>
          <p class="upcoming-date">{{ formatDatetime(m.datetime) }}</p>
        </div>
      </div>
    </div>

    <!-- 멤버 정보 모달 컴포넌트 -->
    <OtherCrewMemberComponent
      ref="otherMemberModal"
      :crew-id="resolvedCrewId"
      @dm-request="$emit('dm-request', $event)"
    />
  </aside>
</template>

<script>
import OtherCrewMemberComponent from "@/components/crew/OtherCrewMemberComponent.vue";

export default {
  name: "CrewSideComponent",

  components: {
    OtherCrewMemberComponent,
  },

  props: {
    crewId: { type: [Number, String], default: null },
    membershipStatus: { type: String, default: "NONE" },
    members: { type: Array, default: () => [] },
    currentMemberCount: { type: Number, default: 0 },
    upcomingMeetings: { type: Array, default: () => [] },
  },

  emits: ["show-rating-modal", "show-withdraw-modal", "change-tab", "dm-request"],

  data() {
    return {
      hoveredMemberKey: null,
    };
  },

  computed: {
    resolvedCrewId() {
      const v = this.crewId ?? this.$route?.params?.crewId ?? this.$route?.query?.crewId ?? null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    },
    visibleUpcomingMeetings() {
      const now = Date.now();
      return (this.upcomingMeetings || [])
        .filter((m) => {
          const recruitStatus = (m?.recruitStatus || "").toString().toUpperCase();
          const status = (m?.status || "").toString().trim();
          const t = this.parseMeetingTime(m?.datetime);
          return recruitStatus !== "FINISHED" && status !== "종료" && t !== null && t >= now;
        })
        .sort((a, b) => (this.parseMeetingTime(a.datetime) ?? Number.MAX_SAFE_INTEGER) - (this.parseMeetingTime(b.datetime) ?? Number.MAX_SAFE_INTEGER));
    },
    nextMeeting() {
      return this.visibleUpcomingMeetings[0] || null;
    },
   ddayLabel() {
  const t = this.parseMeetingTime(this.nextMeeting?.datetime);
  if (t == null) return "";

  const diffMs = t - Date.now();
  if (diffMs <= 0) return "마감";

  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  if (diffMs < oneDay) {
    const hours = Math.max(1, Math.ceil(diffMs / oneHour));
    return `${hours}시간`;
  }

  const days = Math.ceil(diffMs / oneDay);
  return `D-${days}`;
},

    ddayClass() {
  const t = this.parseMeetingTime(this.nextMeeting?.datetime);
  if (t == null) return "";

  const diffMs = t - Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  // 이미 지났거나 24시간 이내면 긴급
  if (diffMs <= oneDay) return "dday--urgent";

  return "dday--normal";
},

  },

  methods: {
    openMemberInfo(member) {
      this.$refs.otherMemberModal?.open(member);
    },

  
    parseMeetingTime(dt) {
      if (!dt) return null;
      const d = new Date(typeof dt === "string" && dt.includes(" ") ? dt.replace(" ", "T") : dt);
      return isNaN(d.getTime()) ? null : d.getTime();
    },
    handleMeetingClick(meeting) {
      const meetingId = Number(meeting?.meetingId);
      if (!Number.isFinite(meetingId) || meetingId <= 0) {
        this.$emit("change-tab", "meetings");
        return;
      }

      const crewId = this.resolvedCrewId;
      this.$router.push({
        path: `/meeting/${meetingId}`,
        query: crewId ? { crewId: String(crewId) } : {},
      });
    },
  
    formatDatetime(dt) {
      if (!dt) return "";
      const d = new Date(typeof dt === "string" && dt.includes(" ") ? dt.replace(" ", "T") : dt);
      if (isNaN(d.getTime())) return String(dt);
      return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    },
    statusClass(s) {
      return s === "모집중" ? "status--open" : s === "모집마감" ? "status--closed" : "status--done";
    },
  },
};
</script>

<style scoped>
.side-col {
  width: 310px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 20px;
}
.side-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #ebebeb;
  padding: 16px;
}
.side-card-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.side-card-title { font-size: 13.5px; font-weight: 700; color: #222; }
.side-more-btn { font-size: 11.5px; color: #4fa8d8; background: none; border: none; cursor: pointer; }
.side-more-btn:hover { text-decoration: underline; }
.side-empty { font-size: 12px; color: #ccc; text-align: center; padding: 12px 0; }

/* 아바타 */
.avatar-row { display: flex; align-items: center; margin-bottom: 4px; }
.avatar-wrap {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-left: -8px;
  border: 2.5px solid #fff;
  cursor: pointer;
  transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.18s;
}
.avatar-wrap:first-child { margin-left: 0; }
.avatar-wrap:hover { transform: translateY(-4px) scale(1.14); box-shadow: 0 6px 14px rgba(0,0,0,0.18); z-index: 30 !important; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.avatar-ph {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #d1d5db;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-ph-icon { width: 20px; height: 20px; }

/* 툴팁 */
.avatar-tooltip {
  position: absolute;
  left: 50%;
  top: calc(100% + 8px);
  transform: translateX(-50%);
  background: #111827;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.18);
}
.avatar-tooltip::before {
  content: "";
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: #111827;
}

/* 크루장 배지 */
.avatar-owner-badge {
  position: absolute;
  bottom: -3px;
  right: -3px;
  width: 16px;
  height: 16px;
  background: #f59e0b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border: 1.5px solid #fff;
  box-shadow: 0 1px 4px rgba(245,158,11,0.4);
}

.avatar-more { margin-left: 6px; font-size: 12px; color: #888; font-weight: 600; white-space: nowrap; }
.avatar-more-btn {
  border: none;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 3px 8px;
  cursor: pointer;
}
.avatar-more-btn:hover { background: #e5e7eb; }

/* 모임 메타 아이콘 */
.meta-icon {
  flex-shrink: 0;
  color: #bbb;
  margin-right: 4px;
}

/* 모임 */
.next-meeting-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fff8f5;
  border: 1px solid #ffe0d0;
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  margin-bottom: 10px;
  transition: background 0.12s;
}
.next-meeting-card:hover { background: #fff0e8; }
.next-meeting-dday { flex-shrink: 0; padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: 800; }
.dday--urgent { background: #fee2e2; color: #dc2626; }
.dday--normal { background: #e0f2fe; color: #0284c7; }
.next-meeting-info { flex: 1; min-width: 0; }
.next-meeting-title { font-size: 13px; font-weight: 700; color: #111; margin: 0 0 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.next-meeting-meta {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  color: #888;
  margin: 0 0 2px;
}
.next-meeting-status { flex-shrink: 0; font-size: 10px; font-weight: 700; padding: 3px 7px; border-radius: 20px; align-self: flex-start; }
.status--open   { background: #dcfce7; color: #16a34a; }
.status--closed { background: #fee2e2; color: #dc2626; }
.status--done   { background: #f3f4f6; color: #9ca3af; }

.upcoming-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 7px 0;
  border-top: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.12s;
}
.upcoming-item:hover { background: #f8fbff; }

.upcoming-dot { width: 6px; height: 6px; border-radius: 50%; background: #4fa8d8; flex-shrink: 0; margin-top: 5px; }
.upcoming-info { min-width: 0; }
.upcoming-title { font-size: 12.5px; font-weight: 600; color: #333; margin: 0 0 2px; }
.upcoming-date  { font-size: 11px; color: #aaa; margin: 0; }

@media (max-width: 940px) {
  .side-col { width: 100%; position: static; flex-direction: row; flex-wrap: wrap; }
}
@media (max-width: 680px) {
  .side-col { flex-direction: column; }
}
</style>
