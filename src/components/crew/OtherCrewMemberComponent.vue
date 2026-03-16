<template>
  <div>
    <!-- (1) 정보보기 모달 -->
    <div v-if="infoModal.open" class="cm-backdrop" @click.self="closeInfoModal">
      <div class="cm-modal">
        <div v-if="infoModal.loading" class="cm-modal-body cm-loading">
          <span class="cm-spinner"></span>
          <p>크루원 정보를 불러오는 중...</p>
        </div>
        <template v-else-if="infoModal.member">
          <div class="cm-modal-hd">
            <img
              v-if="infoModal.member.profileImageUrl"
              :src="infoModal.member.profileImageUrl"
              class="cm-avatar"
            />
            <div v-else class="cm-avatar cm-avatar--ph">
              <svg class="cm-avatar-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>

            <div class="cm-namebox">
              <div class="cm-name-row">
                <span class="cm-name">{{ infoModal.member.nickname }}</span>
                <span class="cm-badge">{{ formatRole(infoModal.member.crewRole || infoModal.member.role) }}</span>
              </div>
              <div class="cm-sub">크루원 정보 · 가입일 {{ formatJoinedAt(infoModal.member.joinedAt) }}</div>
            </div>

            <!-- ✅ crewId 함께 전달 -->
            <button class="cm-dm-btn" @click="onDmClick(infoModal.member)">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 2L11 13"/>
                <path d="M22 2L15 22 11 13 2 9l20-7z"/>
              </svg>
              DM
            </button>
            <button class="cm-x" @click="closeInfoModal">✕</button>
          </div>

          <div class="cm-meta-area">
            <span v-if="memberGender(infoModal.member)" class="cm-meta-item">{{ memberGender(infoModal.member) }}</span>
            <span v-if="memberAge(infoModal.member) != null" class="cm-meta-item">{{ memberAge(infoModal.member) }}</span>
            <span v-if="memberMbti(infoModal.member)" class="cm-meta-item">{{ memberMbti(infoModal.member) }}</span>
            <span v-if="memberMannerScore(infoModal.member) != null" class="cm-meta-item">매너 {{ memberMannerScore(infoModal.member) }}</span>
            <span v-for="cat in categoryTypesList(infoModal.member)" :key="cat" class="cm-meta-tag">
              {{ categoryLabel(cat) }}
            </span>
          </div>

          <div class="cm-modal-body">
            <div class="cm-info-grid">
              <div class="cm-info-item">
                <div class="cm-k">크루 권한</div>
                <div class="cm-v">{{ formatRole(infoModal.member.crewRole || infoModal.member.role) }}</div>
              </div>
              <div class="cm-info-item">
                <div class="cm-k">가입일</div>
                <div class="cm-v">{{ formatJoinedAt(infoModal.member.joinedAt) }}</div>
              </div>
            </div>
            <button class="cm-secondary-btn" @click="openJoinedCrews">
              <svg class="cm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="5" y="3" width="14" height="18" rx="2"></rect>
                <path d="M9 8h6M9 12h6M9 16h4"></path>
              </svg>
              가입한 크루 목록 보기
            </button>
          </div>
        </template>
        <!-- ✅ 닫는 태그 -->
      </div>
    </div>

    <!-- (2) 가입 크루 목록 모달 -->
    <div v-if="crewsModal.open" class="cm-backdrop" @click.self="closeCrewsModal">
      <div class="cm-modal cm-modal--tall">
        <div class="cm-modal-hd cm-modal-hd--between">
          <div class="cm-title">가입한 크루 목록</div>
          <button class="cm-x" @click="closeCrewsModal">✕</button>
        </div>

        <div class="cm-modal-body cm-scroll">
          <div v-if="crewsModal.loading" class="cm-muted">불러오는 중...</div>
          <div v-else-if="crewsModal.items.length === 0" class="cm-muted">가입한 크루가 없습니다.</div>
          <div v-else class="cm-crew-list">
            <div v-for="c in crewsModal.items" :key="c.crewId" class="cm-crew-card">
              <img v-if="c.crewImage" :src="c.crewImage" :alt="c.crewName" class="cm-crew-img" />
              <div v-else class="cm-crew-img cm-crew-img--ph">
                <svg class="cm-icon cm-icon--crew" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="15" cy="5" r="2"></circle>
                  <path d="M13 8l-2 4 3 2 2-3 3 1"></path>
                  <path d="M10 12l-4 3"></path>
                  <path d="M13 14l-2 5"></path>
                </svg>
              </div>
              <div class="cm-crew-info">
                <div class="cm-crew-name">{{ c.crewName }}</div>
                <div class="cm-crew-sub">
                  <span v-if="c.categoryType" class="cm-crew-cat">{{ categoryLabel(c.categoryType) }}</span>
                  <span v-if="c.region || c.district" class="cm-crew-loc">
                    <span> · </span>
                    <svg class="cm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 21s-6-5.6-6-10a6 6 0 1112 0c0 4.4-6 10-6 10z"></path>
                      <circle cx="12" cy="11" r="2.2"></circle>
                    </svg>
                    {{ [c.region, c.district].filter(Boolean).join(" ") }}
                  </span>
                </div>
                <div v-if="c.currentMemberCount != null" class="cm-crew-count">
                  <svg class="cm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="8" r="3"></circle>
                    <circle cx="17" cy="9" r="2.5"></circle>
                    <path d="M3 19a6 6 0 0112 0"></path>
                    <path d="M13.5 19a4.5 4.5 0 018.5 0"></path>
                  </svg>
                  {{ c.currentMemberCount }}명
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="cm-modal-ft">
          <button class="cm-primary-btn" @click="closeCrewsModal">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import dayjs from "@/plugins/dayjs";
import { requestOpenDmChat } from "@/store/chatStore.js";

const API_BASE = process.env.VUE_APP_API_BASE_URL;

export default {
  name: "OtherCrewMemberComponent",

  props: {
    crewId: { type: [Number, String], default: null },
  },

  emits: ["dm-request"],

  data() {
    return {
      token: localStorage.getItem("token") || "",
      infoModal: { open: false, member: null, loading: false },
      crewsModal: { open: false, loading: false, items: [] },
    };
  },

  methods: {
    // ✅ crewId 함께 전달
    onDmClick(member) {
      const userId = member?.userId;
      if (!userId) return;
      if (!this.crewId) {
        alert("크루 정보가 없습니다.");
        return;
      }
      this.$emit("dm-request", userId);
      requestOpenDmChat(userId, this.crewId);
      this.closeInfoModal();
    },

    async open(member) {
      const crewMemberId = member?.crewMemberId ?? member?.id;
      if (!this.crewId || crewMemberId == null) return;
      this.infoModal.open = true;
      this.infoModal.member = null;
      this.infoModal.loading = true;
      try {
        const res = await axios.get(
          `${API_BASE}/crewMember/${this.crewId}/member/${crewMemberId}`,
          { headers: this.authHeader() }
        );
        this.infoModal.member = res.data ?? null;
      } catch (e) {
        console.error("[OtherCrewMemberComponent] 크루원 상세 조회 실패:", e);
        this.infoModal.open = false;
        this.infoModal.member = null;
      } finally {
        this.infoModal.loading = false;
      }
    },

    closeInfoModal() {
      this.infoModal = { open: false, member: null, loading: false };
    },

    async openJoinedCrews() {
      const member = this.infoModal.member;
      if (!this.crewId || !member?.crewMemberId) return;
      this.crewsModal.open = true;
      this.crewsModal.loading = true;
      this.crewsModal.items = [];
      try {
        const res = await axios.get(
          `${API_BASE}/crewMember/${this.crewId}/member/${member.crewMemberId}/crews`,
          { headers: this.authHeader() }
        );
        const raw = Array.isArray(res.data) ? res.data : (res.data?.content ?? res.data?.data ?? []);
        this.crewsModal.items = raw.map((c) => ({
          crewId: c.crewId ?? c.id,
          crewName: c.crewName ?? c.name ?? "",
          crewImage: c.crewImage ?? null,
          categoryType: c.categoryType ?? null,
          region: c.region ?? "",
          district: c.district ?? "",
          currentMemberCount: c.currentMemberCount ?? 0,
        }));
      } catch (e) {
        console.error("[OtherCrewMemberComponent] 가입 크루 목록 조회 실패:", e);
        this.crewsModal.items = [];
      } finally {
        this.crewsModal.loading = false;
      }
    },

    closeCrewsModal() {
      this.crewsModal = { open: false, loading: false, items: [] };
    },

    authHeader() {
      return this.token ? { Authorization: `Bearer ${this.token}` } : {};
    },
    formatRole(role) {
      return { OWNER: "크루장", MANAGER: "운영진", MEMBER: "크루원" }[role] ?? role;
    },
    formatGender(gender) {
      return { MALE: "남성", FEMALE: "여성", OTHER: "기타" }[gender] ?? gender ?? "—";
    },
    formatJoinedAt(joinedAt) {
      if (!joinedAt) return "—";
      const d = dayjs.utc(joinedAt).tz("Asia/Seoul");
      return d.isValid() ? d.format("YYYY년 M월 D일") : joinedAt;
    },
    // formatJoinedAt(joinedAt) {
    //   if (!joinedAt) return "—";
    //   try {
    //     return new Date(joinedAt).toLocaleDateString("ko-KR", {
    //       year: "numeric", month: "long", day: "numeric",
    //     });
    //   } catch { return joinedAt; }
    // },
    categoryTypesList(member) {
      const list = member?.categoryTypes ?? member?.categories ?? [];
      return Array.isArray(list) ? list : [];
    },
    memberGender(member) {
      return member?.gender ? this.formatGender(member.gender) : "";
    },
    memberAge(member) {
      const n = Number(member?.age);
      return member?.age != null && !Number.isNaN(n) ? `${n}세` : null;
    },
    memberMbti(member) {
      return member?.mbti ? String(member.mbti).toUpperCase() : "";
    },
    memberMannerScore(member) {
      const s = member?.mannerScore ?? member?.manner_score;
      const n = Number(s);
      return s != null && !Number.isNaN(n) ? n.toFixed(1) : null;
    },
    categoryLabel(value) {
      return {
        SPORT: "운동/스포츠", BOOK: "독서", COOK: "요리/제조", DIY: "취미/DIY",
        TRAVEL: "여행", LANGUAGE: "어학", CAR: "자동차", GAME: "게임/오락",
        CULTURE: "문화/공연", PET: "반려동물",
      }[value] ?? value ?? "";
    },
  },
};
</script>

<style scoped>
.cm-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 16px;
}
.cm-modal {
  width: 100%;
  max-width: 520px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}
.cm-modal--tall { max-width: 560px; }
.cm-modal-hd {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 18px;
  border-bottom: 1px solid #f1f1f1;
}
.cm-modal-hd--between { justify-content: space-between; }
.cm-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid #e8f4fb;
}
.cm-avatar--ph {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #d1d5db;
  color: #fff;
  overflow: hidden;
}
.cm-avatar-icon { width: 22px; height: 22px; }
.cm-namebox { flex: 1; min-width: 0; }
.cm-name-row { display: flex; align-items: center; gap: 6px; min-width: 0; }
.cm-name {
  font-size: 15px;
  font-weight: 800;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cm-badge {
  padding: 2px 9px;
  border-radius: 999px;
  background: #eaf6fd;
  color: #4fa8d8;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}
.cm-sub {
  font-size: 11px;
  color: #aaa;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cm-dm-btn {
  padding: 6px 16px;
  border-radius: 999px;
  border: none;
  background: #4fa8d8;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.15s;
}
.cm-dm-btn:hover { background: #3a8fc0; }
.cm-x {
  border: none;
  background: none;
  font-size: 15px;
  cursor: pointer;
  color: #aaa;
  flex-shrink: 0;
  padding: 4px;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;
}
.cm-x:hover { color: #111; background: #f1f5f9; }
.cm-meta-area {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 10px 18px 12px;
  border-bottom: 1px solid #f1f1f1;
}
.cm-meta-item {
  font-size: 11px;
  color: #555;
  padding: 3px 9px;
  background: #f1f5f9;
  border-radius: 6px;
  font-weight: 600;
}
.cm-meta-tag {
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 6px;
  background: #d1d5db;
  color: #0369a1;
  font-weight: 600;
}
.cm-title { font-weight: 800; color: #111; font-size: 15px; }
.cm-modal-body { padding: 16px 18px; }
.cm-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: #64748b;
  font-size: 14px;
}
.cm-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #4fa8d8;
  border-radius: 50%;
  animation: cm-spin 0.7s linear infinite;
}
@keyframes cm-spin { to { transform: rotate(360deg); } }
.cm-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}
.cm-info-item {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 12px;
  background: #fafafa;
}
.cm-k { font-size: 11px; color: #888; margin-bottom: 4px; }
.cm-v { font-size: 13px; font-weight: 800; color: #111; }
.cm-secondary-btn {
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-weight: 800;
  color: #333;
  cursor: pointer;
  transition: border-color 0.15s;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.cm-secondary-btn:hover { border-color: #cfd8e3; }
.cm-scroll { max-height: 60vh; overflow: auto; padding-right: 4px; }
.cm-crew-list { display: flex; flex-direction: column; gap: 8px; }
.cm-crew-card {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 14px;
  padding: 12px 14px;
  background: #fff;
}
.cm-crew-img {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}
.cm-crew-img--ph {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
}
.cm-crew-info { flex: 1; min-width: 0; }
.cm-crew-name { font-weight: 900; color: #111; margin-bottom: 3px; font-size: 14px; }
.cm-crew-sub { font-size: 12px; color: #888; margin-bottom: 2px; }
.cm-crew-cat { color: #4fa8d8; font-weight: 600; }
.cm-crew-count { font-size: 11px; color: #94a3b8; display: inline-flex; align-items: center; gap: 4px; }
.cm-crew-loc { display: inline-flex; align-items: center; gap: 4px; }
.cm-icon { width: 1em; height: 1em; flex-shrink: 0; }
.cm-icon--crew { width: 22px; height: 22px; color: #64748b; }
.cm-muted { color: #999; text-align: center; padding: 24px 0; font-weight: 700; }
.cm-modal-ft { padding: 14px 18px; border-top: 1px solid #f1f1f1; }
.cm-primary-btn {
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: none;
  background: #4fa8d8;
  color: #fff;
  font-weight: 900;
  cursor: pointer;
  transition: background 0.15s;
}
.cm-primary-btn:hover { background: #3a8fc0; }
</style>