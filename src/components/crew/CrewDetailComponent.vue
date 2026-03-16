<template>
  <div class="detail-root">
    <div v-if="isLoading" class="loading-screen">
      <div class="loading-spinner"></div>
    </div>

    <div v-else class="page-body">
      <LnbMenuComponent
        activeMenu="home"
        :categoryOptions="categoryOptions"
        @nav-click="onLnbNavClick"
        @category-toggle="onLnbCategoryToggle"
      />
      <div class="content-area">

        <!-- ===== 크루 헤더 카드 ===== -->
        <div class="crew-header-wrap">
          <div class="crew-header-card">

            <!-- 좌측: 크루 이미지 (280×280) -->
            <div class="crew-img-wrap">
              <img v-if="crewData.crewImageUrl" :src="crewData.crewImageUrl" alt="크루 이미지" class="crew-img" />
              <div v-else class="crew-img-placeholder"></div>
            </div>

            <!-- 우측: 정보 영역 전체 -->
            <div class="crew-header-info">

              <!-- 위치 텍스트 + 액션 버튼 (전체 너비) -->
              <div class="info-top-row">
                <p class="crew-region-text">
                  <svg class="loc-pin" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  {{ crewData.region }}<span v-if="crewData.district"> · {{ crewData.district }}</span><span v-if="crewData.activityDetail"> · {{ crewData.activityDetail }}</span>
                </p>
                <div class="action-btn-row">
                  <!-- 가입 버튼 -->
                  <button v-if="!token" @click="$router.push('/login')" class="hbtn hbtn--join">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0114 0"/></svg>
                    로그인 후 가입
                  </button>
                  <button v-else-if="membershipStatus === 'PENDING'" disabled class="hbtn hbtn--pending">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>
                    가입 대기 중
                  </button>
                  <button v-else-if="membershipStatus !== 'APPROVED'" @click="showJoinModal = true" class="hbtn hbtn--join">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0114 0"/></svg>
                    크루 가입 신청
                  </button>

                  <!-- 찜 버튼 -->
                  <button @click="handleLikeToggle" class="like-pill-btn" :class="{ 'like-pill-btn--liked': isLiked }" title="찜하기">
                    <svg viewBox="0 0 24 24" :fill="isLiked ? '#FF6B6B' : 'none'" :stroke="isLiked ? '#FF6B6B' : '#bbb'" stroke-width="1.8" width="17" height="17">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span class="like-pill-count">{{ crewData.likeCount || 0 }}</span>
                  </button>

                  <!-- 더보기 버튼 -->
                  <div class="more-menu-wrap" ref="moreMenuWrap">
                    <button @click.stop="showMoreMenu = !showMoreMenu" class="icon-btn" title="더보기">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path fill-rule="evenodd" d="M4.5 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clip-rule="evenodd"/>
                      </svg>
                    </button>
                    <transition name="more-drop">
                      <div v-if="showMoreMenu" class="more-dropdown">
                        <button @click="shareCopyLink(); showMoreMenu = false" class="more-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                          <span>링크 복사</span>
                        </button>
                        <button v-if="membershipStatus === 'APPROVED'" @click="showRatingModal = true; showMoreMenu = false" class="more-item">
                          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style="color:#f59e0b;"><path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clip-rule="evenodd"/></svg>
                          <span>평점 등록</span>
                        </button>
                        <button v-if="currentUserRole === 'OWNER' || currentUserRole === 'MANAGER'" @click="$router.push(`/crew/${crewId}/manage`); showMoreMenu = false" class="more-item">
                          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style="color:#6b7280;"><path fill-rule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clip-rule="evenodd"/></svg>
                          <span>크루 관리</span>
                        </button>
                        <div v-if="membershipStatus === 'APPROVED'" class="more-divider"></div>
                        <button v-if="membershipStatus === 'APPROVED'" @click="showWithdrawModal = true; showMoreMenu = false" class="more-item more-item--danger">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                          <span>크루 탈퇴</span>
                        </button>
                      </div>
                    </transition>
                    <span v-if="copySuccess" class="copy-toast">링크 복사 완료!</span>
                  </div>
                </div>
              </div>

              <!-- 크루명 -->
              <div class="info-name-row">
                <h1 class="crew-name">{{ crewData.crewName }}</h1>
              </div>

              <!-- 하단: 좌(통계) + 우(소개글) 2열 -->
              <div class="info-body-cols">
                <!-- 왼쪽: 통계 정보 -->
                <div class="info-stats-col">
                  <div class="info-name-sub-row">
                    <span class="crew-category-tag">{{ categoryLabel(crewData.categoryType) }}</span>
                  </div>
                  <div class="info-stars-row">
                    <svg v-for="i in 5" :key="i" class="star-svg" viewBox="0 0 24 24" :fill="i <= Math.round(crewData.averageRating || 0) ? '#FFCC00' : '#E0E0E0'" stroke="none">
                      <path d="M12 17.3l-5.5 3 1-6.1L3 9.8l6.1-.9L12 3.3l2.9 5.6 6.1.9-4.5 4.4 1 6.1z"/>
                    </svg>
                    <span class="star-score">{{ crewData.averageRating ? crewData.averageRating.toFixed(1) : '0.0' }}점</span>
                  </div>
                  <div class="info-stat-row member-stat-row">
                    <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="#4FA8D8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <div class="member-count-block">
                      <span class="member-label-above">크루원 참여 중</span>
                      <div class="member-count-nums">
                        <span class="member-current">{{ crewData.currentMemberCount }}</span>
                        <span class="member-divider-slash">/</span>
                        <span class="member-max">{{ crewData.maxMemberCount }}</span>
                        <span class="member-unit">명</span>
                      </div>
                      <div class="member-bar-wrap">
                        <div class="member-bar-fill" :style="{ width: crewData.maxMemberCount > 0 ? Math.min(100, (crewData.currentMemberCount / crewData.maxMemberCount) * 100) + '%' : '0%' }"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 중간 분리선 -->
                <div class="info-col-divider" aria-hidden="true"></div>

                <!-- 우측: 크루 소개 -->
                <div class="info-desc-col">
                  <div class="info-desc-panel">
                    <div class="info-desc-panel-head">
                      <h3 class="info-desc-title">크루 소개</h3>
                    </div>
                    <div class="info-desc-body">
                      <p ref="descTextEl" class="info-desc-text">{{ fullDesc }}</p>
                    </div>
                    <div class="info-desc-footer">
                      <button v-if="showDescMore" type="button" class="info-desc-more-btn" @click="showDescModal = true">더보기</button>
                      <span v-else class="info-desc-footer-space"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== 본문 ===== -->
        <div class="body-layout">
          <main class="main-col">
            <div class="card tab-card">
              <div class="tab-bar">
                <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value" :class="['tab-btn', activeTab === tab.value && 'tab-btn--active']">
                  {{ tab.label }}
                </button>
              </div>
              <div class="tab-content">
                <template v-if="activeTab === 'feed'">
                  <div class="feed-content-wrap">
                    <div v-if="membershipStatus === 'APPROVED'" class="feed-content-hd">
                      <button type="button" class="feed-create-btn" @click="showFeedEditor = true">+ 피드 작성</button>
                    </div>
                    <CrewFeedTab
                      :membership-status="membershipStatus"
                      :my-nickname="myNickname"
                      :my-profile-image="myProfileImage"
                      :crew-id="crewId"
                      :feed-refresh-key="feedRefreshKey"
                      @report="openReport"
                    />
                  </div>
                </template>

                <CrewMeetingsTab
                  v-if="activeTab === 'meetings'"
                  :meetings="upcomingMeetings"
                  :current-user-role="currentUserRole"
                  :crew-id="crewId"
                  :crew-region="crewData.region || ''"
                  :crew-district="crewData.district || ''"
                  @report="openReport"
                />

                <CrewMembersTab
                  v-if="activeTab === 'members'"
                  :members="members"
                  :my-user-id="myUserId"
                  :crew-id="crewId"
                  :can-view-members="!!token && membershipStatus === 'APPROVED'"
                  :is-logged-in="!!token"
                  :is-pending="membershipStatus === 'PENDING'"
                  @dm-request="handleDmRequest"
                  @report="openReport"
                  @request-login="$router.push('/login')"
                  @request-join="showJoinModal = true"
                />

                <template v-if="activeTab === 'chat'">
                  <div v-if="membershipStatus !== 'APPROVED'" class="chat-locked-wrap">
                    <div class="chat-locked-icon-wrap">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width:36px;height:36px;color:#4FA8D8;">
                        <path fill-rule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                    <p class="chat-locked-title">크루원만 이용할 수 있는 채팅방입니다.</p>
                    <p class="chat-locked-sub">지금 가입하고 함께 대화해 보세요!</p>
                    <button class="chat-locked-btn"
                      @click="!token ? $router.push('/login') : membershipStatus === 'PENDING' ? null : showJoinModal = true"
                      :disabled="membershipStatus === 'PENDING'">
                      {{ membershipStatus === 'PENDING' ? '가입 대기 중' : '크루 가입하기' }}
                    </button>
                  </div>
                  <CrewChatInlineComponent v-else-if="chatRoomId" :room-id="chatRoomId" :key="chatRoomId" />
                  <p v-else class="chat-loading-text">채팅방 정보를 불러오는 중...</p>
                </template>
              </div>
            </div>
          </main>

          <CrewSideComponent
            :membership-status="membershipStatus"
            :members="members"
            :current-member-count="crewData.currentMemberCount"
            :upcoming-meetings="upcomingMeetings"
            @show-rating-modal="showRatingModal = true"
            @show-withdraw-modal="showWithdrawModal = true"
            @change-tab="activeTab = $event"
          />
        </div>

        <!-- 피드 작성 모달 -->
        <FeedCreatePageComponent
          v-model="showFeedEditor"
          :crew-id="crewId"
          :my-nickname="myNickname"
          :my-profile-image="myProfileImage"
          :token="token"
          @submitted="feedRefreshKey++"
          @error="showError"
        />

        <!-- 가입 신청 모달 -->
        <div v-if="showJoinModal" class="modal-backdrop" @click.self="showJoinModal = false; joinMessage = ''">
          <div class="modal-box">
            <h3 class="modal-title">크루 가입 신청</h3>
            <p class="modal-sub">가입 인사를 남겨보세요</p>
            <textarea v-model="joinMessage" placeholder="안녕하세요! 열심히 활동하겠습니다" class="modal-textarea" rows="4" />
            <div class="modal-footer">
              <button @click="showJoinModal = false; joinMessage = ''" class="btn btn--outline">취소</button>
              <button @click="handleJoinRequest" :disabled="isActionLoading" class="btn btn--primary">{{ isActionLoading ? "신청 중..." : "신청하기" }}</button>
            </div>
          </div>
        </div>

        <!-- 크루 소개 전체 보기 모달 -->
        <div v-if="showDescModal" class="modal-backdrop" @click.self="showDescModal = false">
          <div class="modal-box modal-box--desc">
            <h3 class="modal-title">크루 소개</h3>
            <div class="modal-desc-body">{{ crewData.description || '등록된 크루 소개가 없어요.' }}</div>
            <div class="modal-footer">
              <button type="button" class="btn btn--primary" @click="showDescModal = false">닫기</button>
            </div>
          </div>
        </div>

        <!-- 신고 모달 -->
        <div v-if="reportModal.open" class="modal-backdrop" @click.self="closeReport">
          <div class="modal-box">
            <h3 class="modal-title">신고하기</h3>
            <p class="modal-sub">{{ reportTypeLabel }} 신고 사유를 선택해주세요.</p>
            <div class="report-reasons">
              <label v-for="r in reportReasons" :key="r.value" class="reason-chip" :class="reportModal.reason === r.value && 'reason-chip--active'">
                <input type="radio" v-model="reportModal.reason" :value="r.value" class="sr-only" />{{ r.label }}
              </label>
            </div>
            <textarea v-model="reportModal.detail" placeholder="추가 내용을 입력하세요 (선택)" class="modal-textarea" rows="3" />
            <div class="modal-footer">
              <button @click="closeReport" class="btn btn--outline">취소</button>
              <button @click="submitReport" :disabled="!reportModal.reason || reportModal.loading" class="btn btn--primary">{{ reportModal.loading ? "신고 중..." : "신고 제출" }}</button>
            </div>
          </div>
        </div>

        <!-- 탈퇴 모달 -->
        <div v-if="showWithdrawModal" class="modal-backdrop" @click.self="showWithdrawModal = false">
          <div class="modal-box">
            <h3 class="modal-title">크루 탈퇴</h3>
            <p class="modal-sub">정말로 크루를 탈퇴하시겠습니까?</p>
            <template v-if="currentUserRole === 'OWNER'">
              <p v-if="otherMembers.length === 0" class="modal-warn">크루원이 본인 혼자입니다. 탈퇴 시 크루가 자동으로 삭제됩니다.</p>
              <div v-else>
                <label class="modal-field-label">차기 크루장 선택 <span class="req">*</span></label>
                <select v-model="nextOwnerCrewMemberId" class="modal-textarea">
                  <option value="" disabled>차기 크루장을 선택하세요</option>
                  <option v-for="m in otherMembers" :key="m.crewMemberId" :value="m.crewMemberId">{{ m.nickname }} ({{ roleLabel(m.role) }})</option>
                </select>
              </div>
            </template>
            <textarea v-model="withdrawReason" placeholder="탈퇴 이유를 입력하세요 (선택)" class="modal-textarea" rows="3" style="margin-top:10px;" />
            <div class="modal-footer">
              <button @click="showWithdrawModal = false; nextOwnerCrewMemberId = ''" class="btn btn--outline">취소</button>
              <button @click="handleWithdraw" :disabled="isActionLoading || (currentUserRole === 'OWNER' && otherMembers.length > 0 && !nextOwnerCrewMemberId)" class="btn btn--danger">{{ isActionLoading ? "처리 중..." : "탈퇴" }}</button>
            </div>
          </div>
        </div>

        <!-- 평점 모달 -->
        <div v-if="showRatingModal" class="modal-backdrop" @click.self="showRatingModal = false">
          <div class="modal-box">
            <h3 class="modal-title">평점 등록</h3>
            <p class="modal-sub">크루에 대한 평점을 등록하세요</p>
            <div class="star-row">
              <button v-for="star in 5" :key="star" @click="rating = star" class="star-btn">
                <svg class="star-icon" viewBox="0 0 24 24" :fill="star <= rating ? '#f59e0b' : 'none'" :stroke="star <= rating ? '#f59e0b' : '#d1d5db'" stroke-width="2">
                  <path d="M12 17.3l-5.5 3 1-6.1L3 9.8l6.1-.9L12 3.3l2.9 5.6 6.1.9-4.5 4.4 1 6.1z"/>
                </svg>
              </button>
            </div>
            <div class="modal-footer">
              <button @click="showRatingModal = false; rating = 0" class="btn btn--outline">취소</button>
              <button @click="handleRatingSubmit" :disabled="rating === 0 || isActionLoading" class="btn btn--primary">{{ isActionLoading ? "등록 중..." : "등록" }}</button>
            </div>
          </div>
        </div>

        <div v-if="showJoinSuccessMessage" class="toast toast--green">가입 요청 완료</div>
        <div v-if="errorMessage" class="toast toast--red">{{ errorMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import CrewFeedTab from "@/components/crew/CrewFeedTab.vue";
import CrewMeetingsTab from "@/components/crew/CrewMeetingsTab.vue";
import CrewMembersTab from "@/components/crew/CrewMembersTab.vue";
import LnbMenuComponent from "@/components/common/LnbMenuComponent.vue";
import FeedCreatePageComponent from "../feed/FeedCreatePageComponent.vue";
import CrewChatInlineComponent from "../chat/CrewChatInlineComponent.vue";
import CrewSideComponent from "./CrewSideComponent.vue";
import dayjs from "@/plugins/dayjs";

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
const API_BASE = process.env.VUE_APP_API_BASE_URL;
const REPORT_REASONS = [
  { value: "INAPPROPRIATE_CONTENT", label: "불건전한 내용" },
  { value: "SPAM_OR_AD", label: "스팸 및 부적절한 홍보" },
  { value: "DEFAMATION", label: "명예훼손 및 비방" },
  { value: "COPYRIGHT_INFRINGEMENT", label: "초상권 및 저작권 침해" },
  { value: "PRIVACY_VIOLATION", label: "개인정보 도용" },
  { value: "ETC", label: "기타" },
];

export default {
  name: "CrewDetailComponent",
  components: { CrewFeedTab, CrewMeetingsTab, CrewMembersTab, LnbMenuComponent, FeedCreatePageComponent, CrewChatInlineComponent, CrewSideComponent },
  data() {
    return {
      isLoading: true, isActionLoading: false, errorMessage: "",
      categoryOptions: CATEGORY_OPTIONS, token: "", myEmail: null,
      myUserId: null, myNickname: "", myProfileImage: null, crewId: null,
      crewData: {
        crewName: "", activityCategory: "", activityRegion: "", description: "",
        crewImageUrl: "", currentMemberCount: 0, maxMemberCount: 0,
        averageRating: 0, likeCount: 0, viewCount: 0, chatRoomId: null,
      },
      membershipStatus: "NONE", currentUserRole: null, isLiked: false,
      activeTab: "feed",
      tabs: [{ value: "feed", label: "피드" }, { value: "meetings", label: "모임" }, { value: "members", label: "멤버" }, { value: "chat", label: "채팅" }],
      upcomingMeetings: [], members: [], myCrewMemberId: null,
      showRatingModal: false, showWithdrawModal: false, showJoinSuccessMessage: false, showJoinModal: false,
      rating: 0, withdrawReason: "", nextOwnerCrewMemberId: "", joinMessage: "", isDmLoading: false,
      reportModal: { open: false, targetType: "", targetId: null, reason: "", detail: "", loading: false },
      reportReasons: REPORT_REASONS, copySuccess: false,
      showFeedEditor: false, feedRefreshKey: 0, chatRoomId: null, showMoreMenu: false,
      showDescModal: false, showDescMore: false,
    };
  },
  computed: {
    reportTypeLabel() { return ({ CREW: "크루", USER: "유저", MEETING: "모임", COMMENT: "댓글" }[this.reportModal.targetType] || ""); },
    otherMembers() { return this.members.filter((m) => m.userId !== this.myUserId); },
    fullDesc() { return (this.crewData.description || "").trim() || "등록된 크루 소개가 없어요."; },
  },
  async created() {
    this.token = localStorage.getItem("token") || "";
    if (this.token) {
      try { const p = JSON.parse(atob(this.token.split(".")[1])); this.myUserId = p.userId ?? p.id ?? p.user_id ?? null; }
      catch (e) { this.token = ""; }
    }
    const paramId = this.$route?.params?.crewId;
    this.crewId = paramId ? Number(paramId) : null;
    if (!this.crewId || isNaN(this.crewId)) { this.showError("크루 ID를 확인할 수 없습니다."); this.isLoading = false; return; }
    await this.initPage();
  },
  mounted() { document.addEventListener("click", this.handleOutsideClick); window.addEventListener("resize", this.checkDescOverflow); this.checkDescOverflow(); },
  beforeUnmount() { document.removeEventListener("click", this.handleOutsideClick); window.removeEventListener("resize", this.checkDescOverflow); },
  watch: {
    fullDesc() { this.checkDescOverflow(); },
    activeTab() { this.checkDescOverflow(); },
  },
  methods: {
    categoryLabel(type) { return CATEGORY_OPTIONS.find((c) => c.value === type)?.label ?? type; },
    handleOutsideClick(e) {
      if (this.$refs.moreMenuWrap && !this.$refs.moreMenuWrap.contains(e.target)) this.showMoreMenu = false;
    },
    onLnbNavClick(key) {
      const map = { home: "/", "my-crews": "/my/crews", meetings: "/my/meetings", recent: "/my/recent", recommendations: "/crew/recommendations", rising: "/crew/rising-crews" };
      if (map[key]) this.$router.push(map[key]);
    },
    onLnbCategoryToggle(val) { this.$router.push({ path: "/", query: { category: val } }); },
    async initPage() {
      this.isLoading = true;
      const ok = await this.fetchCrewDetail();
      if (!ok) { this.isLoading = false; return; }
      if (this.token) {
        await Promise.allSettled([this.fetchMyUserId(), this.fetchMembers(), this.fetchMeetings(), this.fetchChatRoomId()]);
        this.resolveMyStatusFromMembers();
      } else {
        await Promise.allSettled([this.fetchMembers(), this.fetchMeetings()]);
        this.membershipStatus = "NONE"; this.currentUserRole = null;
      }
      this.isLoading = false;
      this.checkDescOverflow();
    },
    async fetchCrewDetail() {
      try {
        const res = await axios.get(`${API_BASE}/crew/${this.crewId}`, { headers: this.authHeader() });
        const d = res.data;
        const delYn = d.delYn === true || d.delYn === "Y" || d.delYn === "y" || d.deleted === true;
        if (delYn) { this.$router.replace("/"); return false; }
        this.crewData = {
          ...d,
          crewImageUrl: d.crewImageUrl ?? d.crewImage ?? "",
          maxMemberCount: d.maxMemberCount ?? d.maxMembers ?? 0,
          averageRating: d.averageRating ?? d.ratingAvg ?? 0,
          likeCount: d.likeCount ?? d.favoriteCount ?? 0,
        };
        this.isLiked = d.isLiked ?? d.favorite ?? false;
        this.checkDescOverflow();
        return true;
      } catch (e) {
        const status = e.response?.status;
        if (status === 404 || status === 410) { this.$router.replace("/"); return false; }
        this.showError("크루 정보를 불러오는 데 실패했습니다.");
        return true;
      }
    },
    async fetchMyUserId() {
      try { const res = await axios.get(`${API_BASE}/user/my/id`, { headers: this.authHeader() }); this.myUserId = res.data; }
      catch (e) { this.myUserId = null; }
    },
    resolveMyStatusFromMembers() {
      if (!this.myUserId) { this.membershipStatus = "NONE"; this.currentUserRole = null; return; }
      const me = this.members.find((m) => m.userId === this.myUserId);
      if (me) { this.membershipStatus = "APPROVED"; this.currentUserRole = me.role; this.myNickname = me.nickname; this.myCrewMemberId = me.crewMemberId; this.myProfileImage = me.profileImageUrl ?? null; }
      else { if (this.membershipStatus !== "PENDING") this.membershipStatus = "NONE"; this.currentUserRole = null; }
    },
    parseDate(dt) {
      if (!dt) return null;
      const d = dayjs.utc(dt);
      return d.isValid() ? d.toDate() : null;
    },
    effectiveRecruitStatus(m) {
      let r = (m.recruitStatus || m.status || "").toString().toUpperCase();
      if (r === "종료" || (m.status && String(m.status).trim() === "종료")) return "FINISHED";
      if (r !== "OPEN") return r;
      const dt = m.meetingAt ?? m.datetime;
      const t = this.parseDate(dt)?.getTime();
      const timePassed = t != null && t <= Date.now();
      const max = Number(m.maxMembers ?? m.maxMemberCount ?? 0);
      const cur = Number(m.currentMemberCount ?? m.currentParticipants ?? m.participantCount ?? 0);
      const isFull = max > 0 && cur >= max;
      return timePassed || isFull ? "CLOSED" : r;
    },
    async fetchMeetings() {
      try {
        const res = await axios.get(`${API_BASE}/meeting/crew/${this.crewId}/list`, {
          headers: this.authHeader(),
          params: { page: 0, size: 50, sort: "id,desc", includeFinished: true },
        });
        const rawList = res.data?.content ?? res.data ?? [];
        const list = Array.isArray(rawList) ? rawList : [];
        const mapped = list.map((m) => {
          const r = this.effectiveRecruitStatus(m);
          return {
            meetingId: m.meetingId, title: m.meetingName, datetime: m.meetingAt,
            location: m.place, fee: m.fee ?? 0, recruitStatus: r,
            status: this.toKrStatus(r),
            profileImage: m.profileImage ?? m.profileImageUrl ?? null,
            currentMemberCount: m.currentMemberCount ?? m.currentParticipants ?? m.participantCount ?? 0,
            maxMembers: m.maxMembers ?? m.maxMemberCount ?? m.maxParticipants ?? null,
          };
        });
        this.upcomingMeetings = mapped.sort(
  (a, b) =>
    (this.parseDate(a.datetime)?.getTime() ?? Number.MAX_SAFE_INTEGER) -
    (this.parseDate(b.datetime)?.getTime() ?? Number.MAX_SAFE_INTEGER)
);
      } catch (e) { this.upcomingMeetings = []; }
    },
    async fetchMembers() {
      try { const res = await axios.get(`${API_BASE}/crewMember/${this.crewId}/memberList`, { headers: this.authHeader() }); this.members = res.data ?? []; }
      catch (e) { this.members = []; }
    },
    toKrStatus(s) { return ({ OPEN: "모집중", CLOSED: "모집마감", FINISHED: "종료" }[s] ?? (s || "")); },
    authHeader() { return this.token ? { Authorization: `Bearer ${this.token}` } : {}; },
    checkDescOverflow() {
      this.$nextTick(() => {
        const el = this.$refs.descTextEl;
        if (!el) { this.showDescMore = false; return; }
        this.showDescMore = el.scrollHeight > el.clientHeight + 1;
      });
    },
    async handleLikeToggle() {
      if (!this.token) { this.$router.push("/login"); return; }
      const prev = this.isLiked; const prevCount = this.crewData.likeCount || 0;
      this.isLiked = !prev; this.crewData.likeCount = prev ? Math.max(0, prevCount - 1) : prevCount + 1;
      try {
        if (prev) await axios.delete(`${API_BASE}/crew/${this.crewId}/favorite`, { headers: this.authHeader() });
        else await axios.post(`${API_BASE}/crew/${this.crewId}/favorite`, null, { headers: this.authHeader() });
      } catch (e) { this.isLiked = prev; this.crewData.likeCount = prevCount; this.showError("찜 처리에 실패했습니다."); }
    },
    async handleJoinRequest() {
      if (this.membershipStatus === "PENDING" || this.membershipStatus === "APPROVED") return;
      this.isActionLoading = true;
      try {
        await axios.post(`${API_BASE}/crewMember/request`, { crewId: this.crewId, joinMessage: (this.joinMessage || "").trim() || "참여 신청합니다!" }, { headers: this.authHeader() });
        this.membershipStatus = "PENDING"; this.showJoinModal = false; this.joinMessage = "";
        this.showJoinSuccessMessage = true; setTimeout(() => { this.showJoinSuccessMessage = false; }, 3000);
      } catch (e) { this.showError("가입 신청에 실패했습니다."); } finally { this.isActionLoading = false; }
    },
    async handleWithdraw() {
      if (this.currentUserRole === "OWNER" && this.otherMembers.length > 0 && !this.nextOwnerCrewMemberId) return;
      this.isActionLoading = true;
      const isOwnerAlone = this.currentUserRole === "OWNER" && this.otherMembers.length === 0;
      try {
        const body = { crewId: this.crewId, leftReason: this.withdrawReason || null };
        if (this.currentUserRole === "OWNER" && this.nextOwnerCrewMemberId) body.nextOwnerCrewMemberId = this.nextOwnerCrewMemberId;
        await axios.post(`${API_BASE}/crewMember/left`, body, { headers: this.authHeader() });
        this.showWithdrawModal = false; this.membershipStatus = "NONE"; this.currentUserRole = null;
        this.withdrawReason = ""; this.nextOwnerCrewMemberId = "";
        if (isOwnerAlone) this.$router.push("/"); else await this.fetchMembers();
      } catch (e) {
        const s = e.response?.status;
        this.showError(s === 400 ? (e.response?.data || "탈퇴 조건을 확인해주세요.") : s === 500 ? "모임장인 모임이 있으면 탈퇴할 수 없습니다." : "크루 탈퇴에 실패했습니다.");
      } finally { this.isActionLoading = false; }
    },
    async handleRatingSubmit() {
      if (this.rating === 0) return; this.isActionLoading = true;
      try {
        await axios.post(`${API_BASE}/crew/rating`, { crewId: this.crewId, score: this.rating }, { headers: this.authHeader() });
        this.showRatingModal = false; this.rating = 0; await this.fetchCrewDetail();
      } catch (e) { this.showError("평점 등록에 실패했습니다."); } finally { this.isActionLoading = false; }
    },
    async handleDmRequest(otherUserId) {
      if (this.isDmLoading || !otherUserId) { this.showError("상대방 정보를 불러올 수 없습니다."); return; }
      this.isDmLoading = true;
      try {
        const res = await axios.post(`${API_BASE}/chat/room/private/create?otherMemberId=${otherUserId}`, null, { headers: this.authHeader() });
        this.$router.push(`/chatpage/${res.data}`);
      } catch (e) { this.showError(e.response?.status === 400 ? "같은 크루 멤버에게만 DM을 보낼 수 있습니다." : "DM 채팅방을 열 수 없습니다."); }
      finally { this.isDmLoading = false; }
    },
    openReport(targetType, targetId) { this.reportModal = { open: true, targetType, targetId, reason: "", detail: "", loading: false }; },
    closeReport() { this.reportModal.open = false; },
    async submitReport() {
      if (!this.reportModal.reason) return;
      this.reportModal.loading = true;
      try {
        await axios.post(`${API_BASE}/report/create`, { targetType: this.reportModal.targetType, targetId: this.reportModal.targetId, reasonType: this.reportModal.reason, reasonText: this.reportModal.detail || null }, { headers: this.authHeader() });
        this.closeReport(); this.showError("신고가 접수되었습니다.");
      } catch (e) {
        const status = e.response?.status;
        const data = e.response?.data;
        const raw = (data && (data.message ?? data.msg ?? data.error ?? data.error_message)) || (typeof data === "string" ? data : null);
        const rawStr = (raw && String(raw)).toLowerCase();
        const isAlreadyReported = status === 409 || (rawStr && (rawStr.includes("이미") || rawStr.includes("중복") || rawStr.includes("already") || rawStr.includes("duplicate")));
        let msg;
        if (isAlreadyReported) {
          msg = this.reportModal.targetType === "MEETING" ? "이미 신고한 모임입니다." : "이미 신고한 회원입니다.";
        } else {
          msg = (raw && String(raw).trim()) || "신고에 실패했습니다.";
        }
        this.showError(msg);
      } finally { this.reportModal.loading = false; }
    },
    async shareCopyLink() {
      try { await navigator.clipboard.writeText(window.location.href); this.copySuccess = true; setTimeout(() => { this.copySuccess = false; }, 2500); }
      catch { this.showError("링크 복사에 실패했습니다."); }
    },
    async fetchChatRoomId() {
      try {
        const res = await axios.get(`${API_BASE}/chat/crew/chatRoom/${this.crewId}`, { headers: this.authHeader() });
        const rooms = res.data ?? []; this.chatRoomId = rooms[0]?.roomId ?? null;
      } catch (e) { this.chatRoomId = null; }
    },
    roleLabel(role) { return role === "OWNER" ? "크루장" : role === "MANAGER" ? "운영진" : "크루원"; },
    showError(msg) { this.errorMessage = msg; setTimeout(() => { this.errorMessage = ""; }, 3000); },
  },
};
</script>

<style scoped>
*, *::before, *::after { box-sizing: border-box; }
.detail-root { min-height: 100vh; background: #f5f5f3; font-family: "Pretendard", "Apple SD Gothic Neo", -apple-system, sans-serif; }
.page-body { display: flex; align-items: flex-start; }
.content-area { flex: 1; min-width: 0; display: flex; flex-direction: column; }

/* 로딩 */
.loading-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
.loading-spinner { width: 42px; height: 42px; border-radius: 50%; border: 4px solid #d9edf7; border-top-color: #4fa8d8; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* 헤더 카드 */
.crew-header-wrap { margin: 20px auto 0; padding: 0 20px; max-width: 1200px; width: 100%; }
.crew-header-card { display: flex; gap: 26px; align-items: stretch; background: #fff; border: 1px solid #ebebeb; border-radius: 18px; padding: 24px; box-shadow: 0 2px 14px rgba(0,0,0,0.05); min-height: 320px; }

/* 이미지 */
.crew-img-wrap { position: relative; flex-shrink: 0; width: 280px; height: 280px; border-radius: 14px; overflow: hidden; }
.crew-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.crew-img-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, #EBF5FC 0%, #F6FBFE 100%); }

/* 우측 정보 */
.crew-header-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }

/* 위치 + 버튼 행 */
.info-top-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.crew-region-text { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #888; margin: 0; flex-shrink: 0; }
.loc-pin { width: 13px; height: 13px; color: #4FA8D8; flex-shrink: 0; }
.action-btn-row { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }
.hbtn { display: inline-flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: 22px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s; border: 1px solid transparent; white-space: nowrap; }
.hbtn--join { background: #4fa8d8; color: #fff; border-color: #4fa8d8; box-shadow: 0 3px 10px rgba(79,168,216,0.28); }
.hbtn--join:hover { background: #3A8FC0; }
.hbtn--pending { background: #f2f2f2; color: #aaa; cursor: not-allowed; }

/* 찜 pill 버튼 */
.like-pill-btn { display: inline-flex; align-items: center; gap: 5px; height: 36px; padding: 0 12px; border-radius: 22px; background: #f7f7f7; border: 1px solid #e8e8e8; cursor: pointer; transition: background 0.15s, border-color 0.15s, transform 0.12s; }
.like-pill-btn:hover { background: #eee; transform: scale(1.04); }
.like-pill-btn--liked { background: #fff0f0; border-color: #ffd0d0; }
.like-pill-count { font-size: 13px; font-weight: 700; color: #bbb; line-height: 1; }
.like-pill-btn--liked .like-pill-count { color: #FF6B6B; }
.icon-btn { width: 36px; height: 36px; border-radius: 50%; background: #f7f7f7; border: 1px solid #e8e8e8; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s, transform 0.12s; }
.icon-btn:hover { background: #eee; transform: scale(1.06); }

/* 크루명 */
.info-name-row { margin-bottom: 12px; }
.crew-name { font-size: 26px; font-weight: 800; color: #111; margin: 0; line-height: 1.2; letter-spacing: -0.3px; width: 100%; }

/* 하단 2열 */
.info-body-cols { display: flex; gap: 0; flex: 1; min-height: 0; align-items: stretch; }
.info-stats-col { display: flex; flex-direction: column; justify-content: center; gap: 0; flex-shrink: 0; width: 260px; padding-right: 20px; }
.info-col-divider { width: 1px; flex-shrink: 0; background: linear-gradient(to bottom, rgba(229,229,229,0.1), rgba(229,229,229,1), rgba(229,229,229,0.1)); align-self: stretch; margin: 0 20px; }

/* 크루 소개 */
.info-desc-col { flex: 1; min-width: 0; display: flex; }
.info-desc-panel { width: 100%; min-height: 172px; border: 1px solid #eef3f6; background: linear-gradient(180deg, #fbfdff 0%, #f7fafc 100%); border-radius: 16px; padding: 16px 18px 14px; display: flex; flex-direction: column; box-shadow: inset 0 1px 0 rgba(255,255,255,0.8); }
.info-desc-panel-head { margin-bottom: 8px; }
.info-desc-title { font-size: 14px; font-weight: 700; color: #333; margin: 0; }
.info-desc-body { flex: 1; min-height: 0; display: flex; }
.info-desc-text { font-size: 14px; line-height: 1.65; color: #555; margin: 0; white-space: pre-wrap; word-break: break-word; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; line-clamp: 4; overflow: hidden; width: 100%; }
.info-desc-footer { display: flex; align-items: center; justify-content: flex-start; min-height: 28px; margin-top: 10px; }
.info-desc-more-btn { padding: 0; font-size: 13px; font-weight: 700; color: #4FA8D8; background: none; border: none; cursor: pointer; text-align: left; align-self: flex-start; }
.info-desc-more-btn:hover { text-decoration: underline; }
.info-desc-footer-space { display: inline-block; width: 1px; height: 1px; opacity: 0; }

/* 카테고리 태그 */
.info-name-sub-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.crew-category-tag { font-size: 14px; font-weight: 700; color: #4FA8D8; white-space: nowrap; border: 1.5px solid #4FA8D8; border-radius: 20px; padding: 4px 12px; background: #f8fcfe; }

/* 별점 */
.info-stars-row { display: flex; align-items: center; gap: 2px; margin-bottom: 10px; }
.star-svg { width: 22px; height: 22px; }
.star-score { font-size: 14px; font-weight: 700; color: #555; margin-left: 7px; }

/* 멤버 수 */
.info-stat-row { display: flex; align-items: center; gap: 7px; margin-bottom: 7px; }
.member-stat-row { align-items: flex-start; gap: 10px; margin-top: 4px; }
.stat-icon { width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px; align-self: flex-start; }
.member-count-block { display: flex; flex-direction: column; align-items: flex-start; gap: 1px; }
.member-label-above { font-size: 11px; color: #aaa; letter-spacing: 0.3px; line-height: 1.2; }
.member-count-nums { display: flex; align-items: baseline; gap: 4px; line-height: 1; }
.member-current { font-size: 40px; font-weight: 500; color: #4FA8D8; letter-spacing: -2px; }
.member-divider-slash { font-size: 13px; color: #ccc; margin: 0 1px; }
.member-max { font-size: 22px; font-weight: 500; color: #bbb; }
.member-unit { font-size: 13px; color: #ccc; }
.member-bar-wrap { width: 180px; height: 4px; background: #f0f0f0; border-radius: 999px; overflow: hidden; margin-top: 3px; }
.member-bar-fill { height: 100%; background: #4FA8D8; border-radius: 999px; transition: width 0.3s ease; }

/* 더보기 드롭다운 */
.more-menu-wrap { position: relative; }
.more-dropdown { position: absolute; top: calc(100% + 8px); right: 0; background: #fff; border: 1px solid #e8e8e8; border-radius: 14px; box-shadow: 0 8px 28px rgba(0,0,0,0.11); min-width: 160px; z-index: 300; overflow: hidden; padding: 6px; }
.more-item { display: flex; align-items: center; gap: 9px; width: 100%; padding: 10px 12px; font-size: 13px; font-weight: 600; color: #333; background: none; border: none; border-radius: 9px; cursor: pointer; transition: background 0.1s; text-align: left; }
.more-item:hover { background: #f5f5f5; }
.more-item--danger { color: #e53935; }
.more-item--danger:hover { background: #fff5f5; }
.more-divider { height: 1px; background: #f0f0f0; margin: 4px 0; }
.copy-toast { position: absolute; top: calc(100% + 6px); right: 0; background: #111; color: #fff; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 8px; white-space: nowrap; pointer-events: none; z-index: 400; }
.more-drop-enter-active { animation: dropIn 0.17s cubic-bezier(.34,1.4,.64,1); }
.more-drop-leave-active { animation: dropOut 0.13s ease-in forwards; }
@keyframes dropIn { from { opacity:0; transform:scale(.93) translateY(-5px); } to { opacity:1; transform:scale(1) translateY(0); } }
@keyframes dropOut { from { opacity:1; } to { opacity:0; transform:scale(.93) translateY(-5px); } }

/* 본문 */
.body-layout { display: flex; gap: 20px; padding: 20px 20px 40px; align-items: flex-start; max-width: 1200px; margin: 0 auto; width: 100%; }
.main-col { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px; }
.card { background: #fff; border-radius: 16px; border: 1px solid #ebebeb; padding: 20px; }
.tab-card { padding: 0; overflow: hidden; }
.tab-bar { display: flex; border-bottom: 1px solid #f0f0f0; padding: 0 4px; }
.tab-btn { flex: 1; display: flex; align-items: center; justify-content: center; padding: 14px 8px; font-size: 13.5px; color: #aaa; background: none; border: none; border-bottom: 2.5px solid transparent; cursor: pointer; transition: all 0.15s; }
.tab-btn:hover { color: #555; }
.tab-btn--active { color: #4fa8d8; border-bottom-color: #4fa8d8; font-weight: 700; }
.tab-content { padding: 20px; }
.feed-content-wrap { display: flex; flex-direction: column; gap: 12px; }
.feed-content-hd { display: flex; justify-content: flex-end; }
.feed-create-btn { padding: 8px 18px; font-size: 13px; font-weight: 700; color: #fff; background: #4fa8d8; border: none; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
.feed-create-btn:hover { background: #3a95c4; }
.chat-loading-text { text-align: center; padding: 40px 0; color: #aaa; font-size: 13px; }
.chat-locked-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 56px 20px; gap: 10px; }
.chat-locked-icon-wrap { width: 72px; height: 72px; border-radius: 50%; background: #EBF6FC; display: flex; align-items: center; justify-content: center; margin-bottom: 6px; }
.chat-locked-title { font-size: 15px; font-weight: 700; color: #222; margin: 0; text-align: center; }
.chat-locked-sub { font-size: 13px; color: #999; margin: 0; text-align: center; }
.chat-locked-btn { display: inline-flex; align-items: center; gap: 7px; margin-top: 10px; padding: 12px 28px; background: #4FA8D8; color: #fff; font-size: 14px; font-weight: 700; border: none; border-radius: 10px; cursor: pointer; transition: background 0.15s; box-shadow: 0 4px 14px rgba(79,168,216,0.35); }
.chat-locked-btn:hover { background: #3A8FC0; }
.chat-locked-btn:disabled { background: #e0e0e0; color: #aaa; cursor: not-allowed; box-shadow: none; }

/* 버튼 */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 18px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; }
.btn--primary { background: #4fa8d8; color: #fff; }
.btn--primary:hover { background: #3A8FC0; }
.btn--outline { background: #fff; color: #444; border: 1.5px solid #e0e0e0; }
.btn--outline:hover { border-color: #999; }
.btn--danger { background: #fff; color: #e53935; border: 1.5px solid #fca5a5; }
.btn--danger:hover { background: #fff5f5; }

/* 모달 */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 300; padding: 20px; }
.modal-box { background: #fff; border-radius: 18px; padding: 24px; width: 100%; max-width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
.modal-box--desc { max-width: 480px; max-height: 80vh; display: flex; flex-direction: column; }
.modal-desc-body { flex: 1; overflow-y: auto; font-size: 14px; line-height: 1.6; color: #444; white-space: pre-wrap; word-break: break-word; padding: 12px 0; margin: 0 0 16px; border-top: 1px solid #f0f0f0; }
.modal-title { font-size: 17px; font-weight: 800; color: #111; margin: 0 0 6px; }
.modal-sub { font-size: 13px; color: #888; margin: 0 0 18px; }
.modal-field-label { display: block; font-size: 13px; font-weight: 600; color: #444; margin-bottom: 6px; }
.modal-warn { font-size: 13px; color: #e53935; margin-bottom: 12px; background: #fff5f5; padding: 10px 12px; border-radius: 8px; }
.req { color: #e53935; }
.modal-footer { display: flex; gap: 10px; margin-top: 18px; }
.report-reasons { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.reason-chip { padding: 7px 13px; border-radius: 20px; border: 1.5px solid #e0e0e0; font-size: 12.5px; color: #555; cursor: pointer; transition: all 0.12s; }
.reason-chip:hover { border-color: #4fa8d8; color: #4fa8d8; }
.reason-chip--active { background: #4fa8d8; color: #fff; border-color: #4fa8d8; }
.modal-textarea { width: 100%; border: 1.5px solid #e0e0e0; border-radius: 10px; padding: 10px 12px; font-size: 13.5px; outline: none; resize: vertical; font-family: inherit; color: #222; }
.modal-textarea:focus { border-color: #4fa8d8; }

/* 별점 모달 */
.star-row { display: flex; gap: 6px; justify-content: center; margin-bottom: 4px; }
.star-btn { display: inline-flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; padding: 0; transition: transform 0.1s; }
.star-btn:hover { transform: scale(1.15); }
.star-icon { width: 30px; height: 30px; }

/* 토스트 */
.toast { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; z-index: 600; box-shadow: 0 4px 16px rgba(0,0,0,0.12); animation: fadeInDown 0.2s ease; }
.toast--green { background: #16a34a; color: #fff; }
.toast--red { background: #dc2626; color: #fff; }
@keyframes fadeInDown { from { opacity: 0; transform: translateX(-50%) translateY(-8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }

/* 반응형 */
@media (max-width: 940px) { .body-layout { flex-direction: column; } }
@media (max-width: 860px) { .info-stats-col { width: 220px; } }
@media (max-width: 760px) {
  .crew-header-card { flex-direction: column; gap: 18px; min-height: auto; }
  .crew-img-wrap { width: 100%; height: 240px; }
  .info-body-cols { flex-direction: column; gap: 14px; }
  .info-stats-col { width: 100%; padding-right: 0; justify-content: flex-start; }
  .info-col-divider { width: 100%; height: 1px; margin: 0 0 14px; background: #eaeaea; }
  .info-desc-col { padding-top: 0; }
  .info-desc-panel { min-height: 0; }
}
@media (max-width: 540px) {
  .crew-name { font-size: 20px; }
  .info-top-row { flex-wrap: wrap; }
  .action-btn-row { flex-wrap: wrap; }
}
</style>