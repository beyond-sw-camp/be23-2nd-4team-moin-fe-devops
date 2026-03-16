<template>
  <div class="page-root crew-manage-root">
    <LnbMenuComponent
      :active-nav="null"
      :category-options="lnbCategoryOptions"
      :selected-category-values="[]"
      @nav-click="onLnbNavClick"
      @category-click="onLnbCategoryClick"
    />
    <main class="main crew-manage-main">

      <!-- 성공 메시지 -->
      <div v-if="showSuccessMessage" class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
        {{ successMessage }}
      </div>

      <!-- 에러 메시지 -->
      <div v-if="errorMessage" class="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
        {{ errorMessage }}
      </div>

      <!-- 로딩 스피너 -->
      <div v-if="isLoading" class="crew-manage-loading">
        <div class="spinner-lg"></div>
      </div>

      <template v-else>
        <div class="crew-manage-wrap">
          <div class="page-head">
            <h1 class="page-title">크루 관리 <span class="title-sparkle">✦</span></h1>
          </div>

          <!-- 01 탭 메뉴 -->
          <div class="section">
            <div class="sec-label-row">
              <span class="sec-num">01</span>
              <span class="sec-title">메뉴</span>
            </div>
            <div class="tab-row">
              <button
                v-for="tab in tabs" :key="tab.value"
                @click="activeTab = tab.value"
                :class="['tab-btn', activeTab === tab.value && 'tab-btn-on']"
              >
                {{ tab.label }}
                <span v-if="tab.value === 'requests' && pendingRequests.length > 0" class="tab-badge">
                  {{ pendingRequests.length }}
                </span>
              </button>
            </div>
          </div>

          <!-- 02 가입 요청 탭 -->
          <div v-if="activeTab === 'requests'" class="section">
            <div class="sec-label-row">
              <span class="sec-num">02</span>
              <span class="sec-title">가입 요청</span>
            </div>
            <div v-if="pendingRequests.length === 0" class="empty-state">
              <div class="empty-icon">
                <svg class="cmp-icon cmp-icon--empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="9" cy="8" r="3"></circle>
                  <circle cx="17" cy="9" r="2.5"></circle>
                  <path d="M3 19a6 6 0 0112 0"></path>
                  <path d="M13.5 19a4.5 4.5 0 018.5 0"></path>
                </svg>
              </div>
              <p class="empty-text">대기 중인 가입 요청이 없습니다</p>
            </div>
            <div v-for="request in pendingRequests" :key="request.joinId" class="card-item">
              <div class="member-row">
                <div class="member-avatar">
                  <img v-if="request.profileImageUrl" :src="request.profileImageUrl" :alt="request.nickname" class="member-avatar__img" />
                  <div v-else class="member-avatar__initial feed-avatar--ph">
                    <svg class="member-avatar__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
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
                <div class="member-info">
                  <div class="member-info__top">
                    <div>
                      <h3 class="member-name">{{ request.nickname }}</h3>
                      <p class="member-sub">{{ formatDateTime(request.createdTime) }} 신청</p>
                    </div>
                    <span class="manner-badge">매너점수 {{ request.mannerScore }}</span>
                  </div>
                  <p v-if="request.joinMessage" class="join-message">"{{ request.joinMessage }}"</p>
                  <div class="action-row">
                    <button @click="handleApprove(request.joinId)" :disabled="isActionLoading" class="btn-approve">승인</button>
                    <button @click="handleReject(request.joinId)" :disabled="isActionLoading" class="btn-reject">거절</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 크루원 탭 -->
          <div v-if="activeTab === 'members'" class="section">
            <div class="sec-label-row">
              <span class="sec-num">02</span>
              <span class="sec-title">크루원 ({{ crewMembers.length }}명)</span>
            </div>
            <div v-if="crewMembers.length === 0" class="empty-state">
              <div class="empty-icon"><svg class="cmp-icon cmp-icon--empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="9" cy="8" r="3"></circle><circle cx="17" cy="9" r="2.5"></circle><path d="M3 19a6 6 0 0112 0"></path><path d="M13.5 19a4.5 4.5 0 018.5 0"></path></svg></div>
              <p class="empty-text">크루원이 없습니다</p>
            </div>
            <div v-for="member in crewMembers" :key="member.crewMemberId" class="card-item">
              <div class="member-row">
                <div class="member-avatar">
                  <img v-if="member.profileImageUrl" :src="member.profileImageUrl" :alt="member.nickname" class="member-avatar__img" />
                  <div v-else class="member-avatar__initial feed-avatar--ph">
                    <svg class="member-avatar__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
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
                <div class="member-info">
                  <div class="member-info__top">
                    <div>
                      <div class="member-name-row">
                        <h3 class="member-name">{{ member.nickname }}</h3>
                        <span v-if="member.role === 'OWNER'" class="role-badge role-badge--owner"><svg class="cmp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 10H5L3 8z"></path><path d="M6 18h12"></path></svg> 크루장</span>
                        <span v-else-if="member.role === 'MANAGER'" class="role-badge role-badge--manager"><svg class="cmp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3z"></path><path d="M9 12l2 2 4-4"></path></svg> 운영진</span>
                        <span v-else class="role-badge role-badge--member">크루원</span>
                      </div>
                      <p class="member-sub">가입일 {{ formatDateTime(member.joinedAt || member.createdTime || member.joinDate) || '-' }}</p>
                    </div>
                  </div>
                  <button
                    v-if="currentUserRole === 'OWNER' && member.role !== 'OWNER'"
                    @click="openRoleModal(member)"
                    class="btn-role"
                  ><svg class="cmp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3z"></path><path d="M9 12l2 2 4-4"></path></svg> 권한 변경</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 운영진 탭 -->
          <div v-if="activeTab === 'staff'" class="section">
            <div class="sec-label-row">
              <span class="sec-num">02</span>
              <span class="sec-title">운영진 ({{ staffMembers.length }}명)</span>
            </div>
            <div v-if="staffMembers.length === 0" class="empty-state">
              <div class="empty-icon"><svg class="cmp-icon cmp-icon--empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3z"></path><path d="M9 12l2 2 4-4"></path></svg></div>
              <p class="empty-text">운영진이 없습니다</p>
            </div>
            <div v-for="member in staffMembers" :key="member.crewMemberId" class="card-item">
              <div class="member-row">
                <div class="member-avatar">
                  <img v-if="member.profileImageUrl" :src="member.profileImageUrl" :alt="member.nickname" class="member-avatar__img" />
                  <div v-else class="member-avatar__initial feed-avatar--ph">
                    <svg class="member-avatar__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
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
                <div class="member-info">
                  <div class="member-info__top">
                    <div>
                      <div class="member-name-row">
                        <h3 class="member-name">{{ member.nickname }}</h3>
                        <span v-if="member.role === 'OWNER'" class="role-badge role-badge--owner"><svg class="cmp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 10H5L3 8z"></path><path d="M6 18h12"></path></svg> 크루장</span>
                        <span v-else-if="member.role === 'MANAGER'" class="role-badge role-badge--manager"><svg class="cmp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3z"></path><path d="M9 12l2 2 4-4"></path></svg> 운영진</span>
                      </div>
                      <p class="member-sub">가입일 {{ formatDateTime(member.joinedAt || member.createdTime || member.joinDate) || '-' }}</p>
                    </div>
                  </div>
                  <button
                    v-if="currentUserRole === 'OWNER' && member.role !== 'OWNER'"
                    @click="openRoleModal(member)"
                    class="btn-role"
                  ><svg class="cmp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3z"></path><path d="M9 12l2 2 4-4"></path></svg> 권한 변경</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 설정 탭 -->
          <div v-if="activeTab === 'settings'">
            <template v-if="currentUserRole === 'OWNER'">

              <!-- 크루 정보 수정 -->
              <div class="section">
                <div class="sec-label-row">
                  <span class="sec-num">02</span>
                  <span class="sec-title">크루 정보 수정</span>
                </div>
                <p class="sec-hint">크루명, 카테고리, 활동지역, 설명 등을 수정할 수 있습니다.</p>
                <button @click="$router.push(`/crew/${crewId}/edit`)" class="btn-primary">크루 정보 수정하기</button>
              </div>

              <!-- 크루 삭제 -->
              <div class="section section-danger">
                <div class="sec-label-row">
                  <span class="sec-num sec-num--danger">03</span>
                  <span class="sec-title sec-title--danger">크루 삭제</span>
                </div>
                <div class="danger-zone-list">
                  <p>• 모든 크루원이 자동으로 탈퇴됩니다</p>
                  <p>• 예정된 모든 모임이 취소됩니다</p>
                  <p>• 모임 참여자 및 채팅 내역이 삭제됩니다</p>
                  <p>• 크루 찜 데이터가 삭제됩니다</p>
                  <p>• 삭제된 데이터는 복구할 수 없습니다</p>
                </div>
                <button @click="showDeleteModal = true" class="btn-danger"><svg class="cmp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M7 6l1 14h8l1-14"></path><path d="M10 10v6M14 10v6"></path></svg> 크루 삭제하기</button>
              </div>
            </template>

            <div v-else class="section">
              <div class="empty-state">
                <div class="empty-icon"><svg class="cmp-icon cmp-icon--empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3z"></path><path d="M9 12l2 2 4-4"></path></svg></div>
                <p class="empty-text">크루장만 설정을 변경할 수 있습니다</p>
              </div>
            </div>
          </div>

        </div>
      </template>

      <!-- 권한 변경 모달 -->
      <div v-if="showRoleModal && selectedMember" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full">
          <h3 class="text-xl font-bold text-gray-900 mb-4">크루원 권한 변경</h3>
          <div class="mb-6">
            <p class="text-gray-700 mb-4"><strong>{{ selectedMember.nickname }}</strong>님의 권한을 변경합니다</p>
            <div class="space-y-2">
              <label v-for="roleOption in roleOptions" :key="roleOption.value" class="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="radio" name="role" :value="roleOption.value" v-model="newRole" class="w-4 h-4" />
                <div>
                  <div class="font-medium flex items-center gap-1">
                    <svg v-if="roleOption.iconType === 'MANAGER'" class="cmp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3z"></path><path d="M9 12l2 2 4-4"></path></svg><svg v-else-if="roleOption.iconType === 'OWNER'" class="cmp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 10H5L3 8z"></path><path d="M6 18h12"></path></svg>
                    {{ roleOption.label }}
                  </div>
                  <div class="text-sm text-gray-500">{{ roleOption.desc }}</div>
                </div>
              </label>
            </div>
          </div>
          <div class="flex gap-3">
            <button @click="closeRoleModal" class="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">취소</button>
            <button
              @click="handleRoleChange"
              :disabled="!newRole || isActionLoading"
              :class="['flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                newRole && !isActionLoading ? 'bg-[#4FA8D8] hover:bg-[#3A8FC0] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed']"
            >{{ isActionLoading ? '변경 중...' : '변경하기' }}</button>
          </div>
        </div>
      </div>

      <!-- 크루 삭제 확인 모달 -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center"><svg class="cmp-icon cmp-icon--warn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"></path><path d="M12 9v4"></path><circle cx="12" cy="16.5" r="1"></circle></svg></div>
            <h3 class="text-xl font-bold text-gray-900">크루 삭제</h3>
          </div>
          <div class="mb-6">
            <p class="text-gray-700 mb-4">정말로 크루를 삭제하시겠습니까?</p>
            <p class="text-sm text-gray-600 mb-4">삭제를 진행하려면 <strong class="text-red-600">'크루삭제'</strong>를 입력해주세요</p>
            <input
              type="text"
              placeholder="크루삭제"
              :value="deleteConfirmText"
              @input="onDeleteInput"
              @compositionend="onDeleteCompositionEnd"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div class="flex gap-3">
            <button @click="showDeleteModal = false; deleteConfirmText = ''" class="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">취소</button>
            <button
              @click="handleDeleteCrew"
              :disabled="deleteConfirmText.trim() !== '크루삭제' || isActionLoading"
              :class="['flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                deleteConfirmText.trim() === '크루삭제' && !isActionLoading ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed']"
            >{{ isActionLoading ? '삭제 중...' : '삭제하기' }}</button>
          </div>
        </div>
      </div>

      <!-- 모든 피드 삭제 확인 모달 -->
      <div v-if="showDeleteAllFeedsModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center"><svg class="cmp-icon cmp-icon--warn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"></path><path d="M12 9v4"></path><circle cx="12" cy="16.5" r="1"></circle></svg></div>
            <h3 class="text-xl font-bold text-gray-900">모든 피드 삭제</h3>
          </div>
          <div class="mb-6">
            <p class="text-gray-700 mb-4">정말로 모든 피드를 삭제하시겠습니까?</p>
            <p class="text-sm text-gray-600 mb-4">삭제를 진행하려면 <strong class="text-red-600">'피드삭제'</strong>를 입력해주세요</p>
            <input type="text" placeholder="피드삭제" v-model="feedDeleteConfirmText" class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400" />
          </div>
          <div class="flex gap-3">
            <button @click="showDeleteAllFeedsModal = false; feedDeleteConfirmText = ''" class="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">취소</button>
            <button
              @click="handleDeleteAllFeeds"
              :disabled="feedDeleteConfirmText !== '피드삭제'"
              :class="['flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                feedDeleteConfirmText === '피드삭제' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed']"
            >삭제하기</button>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script>
import axios from 'axios'
import dayjs from '@/plugins/dayjs'
import LnbMenuComponent from '@/components/common/LnbMenuComponent.vue'

const LNB_CATEGORY_OPTIONS = [
  { label: '운동/스포츠', value: 'SPORT' }, { label: '독서', value: 'BOOK' },
  { label: '요리/제조', value: 'COOK' }, { label: '취미/DIY', value: 'DIY' },
  { label: '여행', value: 'TRAVEL' }, { label: '어학', value: 'LANGUAGE' },
  { label: '자동차', value: 'CAR' }, { label: '게임/오락', value: 'GAME' },
  { label: '문화/공연', value: 'CULTURE' }, { label: '반려동물', value: 'PET' },
]

const API = axios.create({ baseURL: process.env.VUE_APP_API_BASE_URL })
API.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

export default {
  name: 'CrewManagePageComponent',
  components: { LnbMenuComponent },
  props: {
    onNavigate: { type: Function, default: null },
  },
  data() {
    return {
      lnbCategoryOptions: LNB_CATEGORY_OPTIONS,
      isLoading: true,
      isActionLoading: false,
      errorMessage: '',
      successMessage: '',
      showSuccessMessage: false,
      token: '',
      myUserId: null,
      crewId: null,
      currentUserRole: null,
      activeTab: 'requests',
      tabs: [
        { value: 'requests', label: '가입 요청' },
        { value: 'members',  label: '크루원' },
        { value: 'staff',    label: '운영진' },
        { value: 'settings', label: '설정' },
      ],
      roleOptions: [
        { value: 'MEMBER',  label: '크루원', iconType: '', desc: '일반 크루원' },
        { value: 'MANAGER', label: '운영진', iconType: 'MANAGER', desc: '크루 관리 권한 부여' },
        { value: 'OWNER',   label: '크루장', iconType: 'OWNER', desc: '크루장 위임 (본인은 일반 크루원으로 변경)' },
      ],
      pendingRequests: [],
      crewMembers: [],
      crewFeeds: [],
      showDeleteModal: false,
      showRoleModal: false,
      showDeleteAllFeedsModal: false,
      selectedMember: null,
      newRole: '',
      deleteConfirmText: '',
      feedDeleteConfirmText: '',
    }
  },
  computed: {
    staffMembers() {
      return this.crewMembers.filter(m => m.role === 'OWNER' || m.role === 'MANAGER')
    },
  },
  async created() {
    this.token = localStorage.getItem('token')
    if (this.token) {
      try {
        const payload = JSON.parse(atob(this.token.split('.')[1]))
        this.myUserId = payload.userId ?? payload.id ?? payload.user_id ?? null
      } catch {
        this.myUserId = null
      }
    }
    const paramId = this.$route?.params?.id
    this.crewId = paramId ? Number(paramId) : null
    if (!this.crewId || isNaN(this.crewId)) {
      this.showError('크루 ID를 확인할 수 없습니다.')
      this.isLoading = false
      return
    }
    await this.initPage()
  },
  methods: {
    onLnbNavClick(key) {
      const routes = {
        home: '/', 'my-crews': '/my/crews', recommendations: '/crew/recommendations',
        rising: '/crew/rising-crews', meetings: '/my/meetings', recent: '/my/recent',
      }
      if (routes[key]) this.$router.push(routes[key])
    },
    onLnbCategoryClick(value) {
      this.$router.push({ path: '/crew/search', query: value ? { category: value } : {} })
    },
    async initPage() {
      this.isLoading = true
      await Promise.allSettled([this.fetchMembers(), this.fetchPendingRequests()])
      this.resolveMyRole()
      this.isLoading = false
    },
    async fetchMembers() {
      try {
        const res = await API.get(`/crewMember/${this.crewId}/memberList`)
        this.crewMembers = res.data ?? []
      } catch (e) {
        console.error('크루원 목록 조회 실패:', e)
        this.showError('크루원 목록을 불러오는 데 실패했습니다.')
      }
    },
    async fetchPendingRequests() {
      try {
        const res = await API.get(`/crewMember/${this.crewId}/joinRequestList`)
        this.pendingRequests = res.data ?? []
      } catch (e) {
        console.error('가입 요청 목록 조회 실패:', e)
        this.showError('가입 요청 목록을 불러오는 데 실패했습니다.')
      }
    },
    resolveMyRole() {
      const me = this.crewMembers.find(m => m.me === true)
      if (me) this.currentUserRole = me.role
    },
    navigateTo(target) {
      if (this.onNavigate) { this.onNavigate(target); return }
      const id = this.$route?.params?.id
      if (target === 'crew-detail' && id) this.$router.push(`/crew/${id}`)
      else if (target === 'crew-edit' && id) this.$router.push(`/crew/${id}/edit`)
      else if (target === 'home') this.$router.push('/')
      else this.$router.back()
    },
    showSuccess(message) {
      this.successMessage = message
      this.showSuccessMessage = true
      setTimeout(() => { this.showSuccessMessage = false }, 3000)
    },
    showError(message) {
      this.errorMessage = message
      setTimeout(() => { this.errorMessage = '' }, 3000)
    },
    async handleApprove(joinId) {
      this.isActionLoading = true
      try {
        await API.patch('/crewMember/approved', { crewId: this.crewId, joinId })
        this.pendingRequests = this.pendingRequests.filter(r => r.joinId !== joinId)
        await this.fetchMembers()
        this.showSuccess('가입이 승인되었습니다.')
      } catch (e) {
        console.error('가입 승인 실패:', e)
        this.showError('가입 승인에 실패했습니다.')
      } finally {
        this.isActionLoading = false
      }
    },
    async handleReject(joinId) {
      this.isActionLoading = true
      try {
        await API.patch('/crewMember/rejected', { crewId: this.crewId, joinId })
        this.pendingRequests = this.pendingRequests.filter(r => r.joinId !== joinId)
        this.showSuccess('가입이 거절되었습니다.')
      } catch (e) {
        console.error('가입 거절 실패:', e)
        this.showError('가입 거절에 실패했습니다.')
      } finally {
        this.isActionLoading = false
      }
    },
    openRoleModal(member) {
      this.selectedMember = member
      this.newRole = member.role
      this.showRoleModal = true
    },
    closeRoleModal() {
      this.showRoleModal = false
      this.selectedMember = null
      this.newRole = ''
    },
    async handleRoleChange() {
      if (!this.selectedMember || !this.newRole) return
      this.isActionLoading = true
      try {
        await API.patch('/crewMember/role', {
          crewId: this.crewId,
          crewMemberId: this.selectedMember.crewMemberId,
          role: this.newRole,
        })
        await this.fetchMembers()
        this.resolveMyRole()
        this.closeRoleModal()
        this.showSuccess('크루 권한이 변경되었습니다.')
      } catch (e) {
        console.error('권한 변경 실패:', e)
        this.showError('권한 변경에 실패했습니다.')
      } finally {
        this.isActionLoading = false
      }
    },
    onDeleteInput(e) {
      this.deleteConfirmText = e.target.value.trim()
    },
    onDeleteCompositionEnd(e) {
      this.deleteConfirmText = e.target.value.trim()
    },
    async handleDeleteCrew() {
      if (this.deleteConfirmText.trim() !== '크루삭제') return
      this.isActionLoading = true
      try {
        await API.delete(`/crew/${this.crewId}`)
        this.showDeleteModal = false
        this.showSuccess('크루가 삭제되었습니다.')
        setTimeout(() => { this.$router.push('/') }, 2000)
      } catch (e) {
        console.error('크루 삭제 실패:', e)
        this.showError('크루 삭제에 실패했습니다.')
      } finally {
        this.isActionLoading = false
      }
    },
    handleDeleteAllFeeds() {
      if (this.feedDeleteConfirmText !== '피드삭제') return
      this.showDeleteAllFeedsModal = false
      this.crewFeeds = []
      this.feedDeleteConfirmText = ''
      this.showSuccess('모든 피드가 삭제되었습니다.')
    },
    formatDate(dateStr) {
      if (!dateStr) return ''
      return dayjs.utc(dateStr).tz('Asia/Seoul').format('YYYY-MM-DD')
    },
    /** 년월일 일시분 (YYYY-MM-DD HH:mm) */
    formatDateTime(dateStr) {
      if (!dateStr) return ''
      return dayjs.utc(dateStr).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm')
      // const s = String(dateStr).trim().replace('T', ' ')
      // return s.length > 16 ? s.slice(0, 16) : s.slice(0, 10)
    },
  },
}
</script>

<style scoped>
.page-root.crew-manage-root { display: flex; min-height: 100vh; width: 100%; background: #f5f7fa; font-family: "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif; }
.crew-manage-main { flex: 1; min-width: 0; overflow-y: auto; padding: 32px 36px 72px; }
.crew-manage-loading { display: flex; justify-content: center; align-items: center; min-height: 60vh; }
.spinner-lg { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #4FA8D8; border-radius: 50%; animation: crew-spin 0.8s linear infinite; }
@keyframes crew-spin { to { transform: rotate(360deg); } }
.crew-manage-wrap { max-width: 720px; margin: 0 auto; }
.page-head { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.4px; margin: 0 0 6px; }
.title-sparkle { color: #0EA5E9; }

.section { background: #fff; border-radius: 16px; border: 1px solid #e8e8e8; padding: 22px 26px; margin-bottom: 10px; }
.sec-label-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.sec-num { font-size: 11px; font-weight: 900; color: #4FA8D8; background: #EBF6FC; padding: 3px 8px; border-radius: 6px; flex-shrink: 0; }
.sec-title { font-size: 14.5px; font-weight: 800; color: #0f172a; flex: 1; }
.sec-hint { font-size: 12px; color: #64748b; margin: -8px 0 12px; }
.sec-num--danger { color: #dc2626; background: #fef2f2; }
.sec-title--danger { color: #dc2626; }
.section-danger { border-color: #fecaca; background: #fffbeb; }

.tab-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.tab-btn { padding: 12px 8px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #fafbfc; font-size: 13px; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; gap: 6px; }
.tab-btn:hover { border-color: #4FA8D8; color: #4FA8D8; }
.tab-btn-on { background: #EBF6FC; border-color: #4FA8D8; color: #4FA8D8; }
.tab-badge { background: #ef4444; color: #fff; font-size: 11px; padding: 2px 6px; border-radius: 999px; }

.card-item { background: #fafbfc; border: 1px solid #e8e8e8; border-radius: 12px; padding: 18px 20px; margin-bottom: 10px; }
.card-item:last-child { margin-bottom: 0; }
.card-item--sm { padding: 14px 16px; }

/* ── 멤버 행 ── */
.member-row { display: flex; align-items: flex-start; gap: 16px; }

/* ── 아바타: 사진 있으면 사진 / 없으면 닉네임 첫 글자 ── */
.member-avatar {
  width: 56px; height: 56px; border-radius: 50%; flex-shrink: 0;
  background: #d1d5db;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.member-avatar__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.member-avatar__initial { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #fff; line-height: 1; }
.member-avatar__icon { width: 24px; height: 24px; }

.member-info { flex: 1; min-width: 0; }
.member-info__top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 6px; }
.member-name-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 2px; }
.member-name { font-size: 15px; font-weight: 700; color: #0f172a; }
.member-sub { font-size: 12px; color: #94a3b8; }
.manner-badge { flex-shrink: 0; padding: 3px 10px; background: #fefce8; color: #a16207; border: 1px solid #fde68a; border-radius: 999px; font-size: 11px; font-weight: 600; white-space: nowrap; }

.role-badge { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
.cmp-icon { width: 1em; height: 1em; flex-shrink: 0; }
.cmp-icon--empty { width: 48px; height: 48px; color: #94a3b8; }
.cmp-icon--warn { width: 24px; height: 24px; color: #dc2626; }
.role-badge--owner   { background: linear-gradient(135deg, #38BDF8, #0EA5E9); color: #fff; }
.role-badge--manager { background: #3b82f6; color: #fff; }
.role-badge--member  { background: #ecfdf5; color: #15803d; border: 1px solid #86efac; }

.join-message { font-size: 13px; color: #475569; background: #f8fafc; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; }

.action-row { display: flex; gap: 8px; margin-top: 10px; }
.btn-approve { flex: 1; padding: 8px; background: #4FA8D8; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; display: flex; align-items: center; justify-content: center; }
.btn-approve:hover:not(:disabled) { background: #3A8FC0; }
.btn-approve:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-reject { flex: 1; padding: 8px; background: #fff; color: #dc2626; border: 1.5px solid #fca5a5; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; display: flex; align-items: center; justify-content: center; }
.btn-reject:hover:not(:disabled) { background: #fef2f2; }
.btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-role { margin-top: 10px; padding: 6px 14px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 8px; font-size: 12px; font-weight: 600; color: #475569; cursor: pointer; transition: background 0.15s; display: inline-flex; align-items: center; gap: 4px; }
.btn-role:hover { background: #f8fafc; }

/* 피드 */
.feed-list { max-height: 360px; overflow-y: auto; margin-bottom: 16px; }
.feed-row { display: flex; align-items: flex-start; gap: 12px; }
.feed-author-img { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.feed-info { flex: 1; min-width: 0; }
.feed-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.feed-author { font-size: 13px; font-weight: 600; color: #0f172a; }
.feed-date { font-size: 11px; color: #94a3b8; }
.feed-content { font-size: 13px; color: #475569; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 6px; }
.feed-stats { display: flex; gap: 12px; font-size: 11px; color: #94a3b8; }

.empty-state { text-align: center; padding: 48px 24px; }
.empty-state--sm { padding: 24px 16px; }
.empty-icon { display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px; line-height: 1; }
.empty-text { font-size: 14px; color: #64748b; margin: 0; }

.danger-zone { padding-top: 16px; border-top: 1px dashed #e2e8f0; }
.danger-zone-list { background: #fef2f2; padding: 14px 18px; border-radius: 10px; margin-bottom: 14px; font-size: 13px; color: #b91c1c; }
.danger-zone-list p { margin: 4px 0; }

.btn-primary { padding: 10px 18px; background: linear-gradient(135deg, #4FA8D8, #0EA5E9); color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover { filter: brightness(1.05); }
.btn-outline { padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s; width: 100%; }
.btn-outline--danger { border: 2px solid #dc2626; color: #dc2626; background: #fff; }
.btn-outline--danger:hover { background: #fef2f2; }
.btn-danger { padding: 10px 18px; border: 2px solid #dc2626; background: #fff; color: #dc2626; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.btn-danger:hover { background: #fef2f2; }
</style>
