<template>
  <div class="space-y-6">
    <!-- 비로그인/비가입: 멤버 목록 잠금 -->
    <div v-if="!canViewMembers" class="members-locked-wrap">
      <div class="members-locked-icon-wrap">
        <svg fill="currentColor" viewBox="0 0 24 24" style="width:40px;height:40px;color:#4FA8D8;">
  <path d="M16 11a3 3 0 100-6 3 3 0 000 6zM8.5 12a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM8.5 14c-3.04 0-5.5 1.79-5.5 4v1h11v-1c0-2.21-2.46-4-5.5-4zM16 12.5c-1.12 0-2.16.28-3.02.76 1.33.8 2.22 2.04 2.45 3.45.03.18.05.36.05.54v.75h5.52c.55 0 1-.45 1-1 0-2.49-2.69-4.5-6-4.5z"/>
</svg>
      </div>
      <p class="members-locked-title">크루원만 멤버 목록을 조회할 수 있습니다.</p>
      <p class="members-locked-sub" v-if="!isLoggedIn">로그인 후 가입해 보세요!</p>
      <p class="members-locked-sub" v-else-if="isPending">가입 승인 대기 중입니다.</p>
      <p class="members-locked-sub" v-else>지금 가입하고 멤버를 확인해 보세요!</p>
      <button
        v-if="!isLoggedIn"
        type="button"
        class="members-locked-btn"
        @click="$emit('request-login')"
      >
        로그인
      </button>
      <button
        v-else-if="!isPending"
        type="button"
        class="members-locked-btn"
        @click="$emit('request-join')"
      >
        크루 가입하기
      </button>
    </div>

    <!-- 크루장 / 운영진 / 크루원 (가입 멤버만, 모두 박스 형식) -->
    <template v-else>
    <!-- 크루장 -->
    <div>
      <h3 class="font-bold text-lg mb-4 text-gray-900">크루장</h3>
      <div v-if="ownerMembers.length > 0" class="space-y-2">
        <div
          v-for="member in ownerMembers"
          :key="member.crewMemberId"
          class="member-box"
          :class="!(member.isMe || member.userId === myUserId) ? 'cursor-pointer' : ''"
          @click="!(member.isMe || member.userId === myUserId) && openMemberInfo(member)"
        >
          <img v-if="member.profileImageUrl" :src="member.profileImageUrl" :alt="member.nickname" class="member-box__avatar" />
          <div v-else class="member-box__avatar member-box__avatar--ph">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z M3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5 c-2.786 0-5.433-.608-7.812-1.7 a.75.75 0 01-.437-.695z" clip-rule="evenodd"/></svg>
          </div>
          <div class="member-box__body">
            <span class="member-box__name">{{ member.nickname }}</span>
            <span class="member-box__role member-box__role--owner">크루장</span>
            <span v-if="member.isMe || member.userId === myUserId" class="member-box__badge">나</span>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-6 text-gray-400 text-sm">크루장이 없습니다</div>
    </div>

    <!-- 운영진 -->
    <div>
      <h3 class="font-bold text-lg mb-4 text-gray-900">운영진 ({{ managerMembers.length }})</h3>
      <div v-if="managerMembers.length > 0" class="space-y-2">
        <div
          v-for="member in managerMembers"
          :key="member.crewMemberId"
          class="member-box"
          :class="!(member.isMe || member.userId === myUserId) ? 'cursor-pointer' : ''"
          @click="!(member.isMe || member.userId === myUserId) && openMemberInfo(member)"
        >
          <img v-if="member.profileImageUrl" :src="member.profileImageUrl" :alt="member.nickname" class="member-box__avatar" />
          <div v-else class="member-box__avatar member-box__avatar--ph">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z M3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5 c-2.786 0-5.433-.608-7.812-1.7 a.75.75 0 01-.437-.695z" clip-rule="evenodd"/></svg>
          </div>
          <div class="member-box__body">
            <span class="member-box__name">{{ member.nickname }}</span>
            <span class="member-box__role member-box__role--manager">운영진</span>
            <span v-if="member.isMe || member.userId === myUserId" class="member-box__badge">나</span>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-6 text-gray-400 text-sm">운영진이 없습니다</div>
    </div>

    <!-- 크루원 -->
    <div>
      <h3 class="font-bold text-lg mb-4 text-gray-900">크루원 ({{ regularMembers.length }})</h3>
      <div v-if="regularMembers.length > 0" class="space-y-2">
        <div
          v-for="member in regularMembers"
          :key="member.crewMemberId"
          class="member-box"
          :class="!(member.isMe || member.userId === myUserId) ? 'cursor-pointer' : ''"
          @click="!(member.isMe || member.userId === myUserId) && openMemberInfo(member)"
        >
          <img v-if="member.profileImageUrl" :src="member.profileImageUrl" :alt="member.nickname" class="member-box__avatar" />
          <div v-else class="member-box__avatar member-box__avatar--ph">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z M3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5 c-2.786 0-5.433-.608-7.812-1.7 a.75.75 0 01-.437-.695z" clip-rule="evenodd"/></svg>
          </div>
          <div class="member-box__body">
            <span class="member-box__name">{{ member.nickname }}</span>
            <span class="member-box__role member-box__role--member">크루원</span>
            <span v-if="member.isMe || member.userId === myUserId" class="member-box__badge">나</span>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-6 text-gray-400 text-sm">크루원이 없습니다</div>
    </div>

    <!-- 멤버 정보 모달 (OtherCrewMemberComponent) -->
    <OtherCrewMemberComponent
      ref="memberModal"
      :crew-id="crewId"
    />
    </template>
  </div>
</template>

<script>
import OtherCrewMemberComponent from "./OtherCrewMemberComponent.vue";

export default {
  name: "CrewMembersTab",

  components: { OtherCrewMemberComponent },

  props: {
    members: { type: Array, default: () => [] },
    myUserId: { type: [Number, String], default: null },
    crewId: { type: [Number, String], default: null },
    canViewMembers: { type: Boolean, default: false },
    isLoggedIn: { type: Boolean, default: false },
    isPending: { type: Boolean, default: false },
  },


  computed: {
    ownerMembers() {
      const r = (m) => m.crewRole ?? m.role;
      return this.members.filter((m) => r(m) === "OWNER");
    },
    managerMembers() {
      const r = (m) => m.crewRole ?? m.role;
      return this.members.filter((m) => r(m) === "MANAGER");
    },
    regularMembers() {
      const r = (m) => m.crewRole ?? m.role;
      return this.members.filter((m) => r(m) === "MEMBER");
    },
  },

  methods: {
    formatRole(role) {
      const map = { OWNER: "크루장", MANAGER: "운영진", MEMBER: "크루원" };
      return map[role] ?? role;
    },
    openMemberInfo(member) {
      this.$refs.memberModal.open(member);
    },
  },
};
</script>

<style scoped>
.members-locked-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 20px;
  gap: 10px;
}
.members-locked-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #EBF6FC;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}
.members-locked-title {
  font-size: 15px;
  font-weight: 700;
  color: #222;
  margin: 0;
  text-align: center;
}
.members-locked-sub {
  font-size: 13px;
  color: #999;
  margin: 0;
  text-align: center;
}
.members-locked-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 10px;
  padding: 12px 28px;
  background: #4FA8D8;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
}
.members-locked-btn:hover { background: #3A8FC0; }

/* 멤버 박스 (크루장/운영진/크루원 공통) */
.member-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.member-box:hover { border-color: #d1d5db; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.member-box__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.member-box__avatar--ph {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #d1d5db;
  color: #fff;
  overflow: hidden;
}
.member-box__avatar--ph svg {
  width: 20px;
  height: 20px;
}
.member-box__body {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.member-box__name {
  font-weight: 600;
  font-size: 15px;
  color: #111827;
}
.member-box__role {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
}
.member-box__role--owner {
  background: linear-gradient(135deg, #38BDF8, #0EA5E9);
  color: #fff;
}

.member-box__role--manager {
  background: #3b82f6;
  color: #fff;
}

.member-box__role--member {
  background: #ecfdf5;
  color: #15803d;
  border: 1px solid #86efac;
}
.member-box__badge {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
  background: #eff6ff;
  color: #2563eb;
}
</style>
