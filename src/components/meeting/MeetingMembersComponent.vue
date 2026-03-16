<template>
  <div class="card">
    <div class="pm-header">
      <span class="pm-title">참여자</span>
      <span class="pm-count">{{ approvedParticipants.length }}명</span>
    </div>

    <div v-if="loading" class="pm-empty">참여자 불러오는 중...</div>

    <template v-else>
      <div v-if="participantsInOrder.length > 0" class="pm-section">
        <div class="pm-member-list">
          <div
            v-for="p in participantsInOrder"
            :key="p.meetingMemberId"
            class="pm-member-row"
            :class="{
              'pm-member-row--owner': isOwnerParticipant(p),
              'pm-member-row--clickable': !isCurrentUser(p),
            }"
            @click="!isCurrentUser(p) && openMemberInfo(p)"
          >
            <img v-if="p.profileImageUrl" :src="p.profileImageUrl" class="pm-member-avatar" alt="프로필" />
            <div v-else class="pm-member-avatar-ph feed-avatar--ph"><svg class="pm-member-avatar-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path
    fill-rule="evenodd"
    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z
       M3.751 20.105a8.25 8.25 0 0116.498 0
       .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5
       c-2.786 0-5.433-.608-7.812-1.7
       a.75.75 0 01-.437-.695z"
    clip-rule="evenodd"
  />
</svg></div>
            <span class="pm-member-name">{{ p.nickname || "익명" }}</span>
            <span v-if="isOwnerParticipant(p)" class="pm-role-badge pm-role-badge--owner">
              <svg class="pm-role-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 10H5L3 8z"></path>
                <path d="M6 18h12"></path>
              </svg>
              모임장
            </span>
            <span v-if="isCurrentUser(p)" class="me-badge">나</span>
          </div>
        </div>
      </div>
      <div v-else class="pm-empty">아직 참여자가 없습니다</div>
    </template>

    <!-- OtherCrewMemberComponent 모달 -->
    <OtherCrewMemberComponent
      ref="memberModal"
      :crew-id="modalCrewId"
    />
  </div>
</template>

<script>
import OtherCrewMemberComponent from '../crew/OtherCrewMemberComponent.vue';


export default {
  name: "MeetingMembersComponent",

  components: { OtherCrewMemberComponent },

  props: {
    participants: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    myUserId: {
      type: [Number, String],
      default: null,
    },
    myEmail: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      modalCrewId: null, // 클릭한 멤버의 crewId를 동적으로 세팅
    };
  },

  computed: {
    approvedParticipants() {
      return (this.participants || []).filter((p) => {
        const s = (p.status || "").toString().toUpperCase();
        return s.includes("APPROVED") || s.includes("승인") || s === "";
      });
    },
    ownerParticipant() {
      return (
        this.approvedParticipants.find(
          (p) => String(p.role).toUpperCase() === "OWNER"
        ) || null
      );
    },
    regularParticipants() {
      return this.approvedParticipants.filter(
        (p) => String(p.role).toUpperCase() !== "OWNER"
      );
    },
    participantsInOrder() {
      if (!this.ownerParticipant) return [...this.regularParticipants];
      return [this.ownerParticipant, ...this.regularParticipants];
    },
  },

  methods: {
    // 멤버 클릭 → crewId 세팅 후 모달 오픈
    openMemberInfo(p) {
      if (!p.crewMemberId || !p.crewId) {
        console.warn('[MeetingMembersComponent] crewMemberId 또는 crewId 없음:', p);
        return;
      }
      this.modalCrewId = p.crewId;
      // crewId가 반영된 후 모달 오픈 (nextTick으로 prop 업데이트 보장)
      this.$nextTick(() => {
        this.$refs.memberModal.open(p);
      });
    },

    isCurrentUser(p) {
      const matchId =
        this.myUserId != null &&
        String(p.userId) === String(this.myUserId);
      const matchEmail =
        this.myEmail != null &&
        String(p.userEmail) === String(this.myEmail);
      return matchId || matchEmail;
    },
    isOwnerParticipant(p) {
      return p && String(p.role).toUpperCase() === "OWNER";
    },
  },
};
</script>

<style scoped>
.card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #ebebeb;
  padding: 20px;
}

.pm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.pm-title {
  font-size: 15px;
  font-weight: 700;
  color: #222;
}
.pm-count {
  font-size: 12px;
  font-weight: 600;
  background: #e0f2fe;
  color: #0369a1;
  padding: 2px 10px;
  border-radius: 20px;
}

.pm-section {
  margin-bottom: 16px;
}
.pm-section:last-child {
  margin-bottom: 0;
}

.pm-member-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pm-member-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #ebebeb;
  border-radius: 12px;
  padding: 10px 14px;
  transition: background 140ms, border-color 140ms;
}
.pm-member-row--owner {
  background: #f8fafc;
  border-color: #bae6fd;
}
/* 클릭 가능한 멤버 hover 효과 */
.pm-member-row--clickable {
  cursor: pointer;
}
.pm-member-row--clickable:hover {
  background: #f0f9ff;
  border-color: #7dd3fc;
}

.pm-member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.pm-member-avatar-ph {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  background: #d1d5db;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pm-member-avatar-icon { width: 20px; height: 20px; }

.pm-member-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.pm-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
}
.pm-role-icon {
  width: 1em;
  height: 1em;
  flex-shrink: 0;
}
.pm-role-badge--owner {
  background: #e0f2fe;
  color: #0369a1;
}
.me-badge {
  display: inline-block;
  padding: 1px 5px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  margin-left: 4px;
}

.pm-empty {
  text-align: center;
  padding: 20px 0;
  font-size: 13px;
  color: #aaa;
}
</style>






