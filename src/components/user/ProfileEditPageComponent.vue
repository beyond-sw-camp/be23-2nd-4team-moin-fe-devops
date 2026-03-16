<template>
  <div class="page-root profile-edit-root">
    <LnbMenuComponent
      :active-nav="null"
      :category-options="lnbCategoryOptions"
      :selected-category-values="[]"
      @nav-click="onLnbNavClick"
      @category-click="onLnbCategoryClick"
    />
    <main class="main profile-edit-main">
      <!-- 성공 메시지 토스트 -->
      <div
        v-if="toast.show"
        class="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all"
        :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
      >{{ toast.message }}</div>

      <!-- 로딩 -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="w-10 h-10 border-4 border-[#4FA8D8] border-t-transparent rounded-full animate-spin" />
      </div>

      <div v-else class="profile-edit-form-wrap">
        <div class="page-head">
          <h1 class="page-title">프로필 수정 <span class="title-sparkle">✦</span></h1>
        </div>

        <form @submit.prevent="handleSubmit">

          <!-- 01 프로필 이미지 -->
          <div class="section">
            <div class="sec-label-row">
              <span class="sec-num">01</span>
              <span class="sec-title">프로필 이미지</span>
            </div>
            <div class="img-section-center">
              <div v-if="previewImage" class="img-preview-box img-preview-box--round">
                <img :src="previewImage" class="img-preview" alt="프로필" />
                <div class="img-overlay">
                  <button type="button" @click="handleRemoveImage" class="img-replace" :disabled="imageUploading">
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="width:14px;height:14px;"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                    이미지 삭제
                  </button>
                </div>
              </div>
              <label v-else for="profileImage" class="img-drop">
                <div class="img-drop-content">
                  <div class="img-drop-icon">
                    <svg fill="currentColor" viewBox="0 0 24 24" style="width:28px;height:28px;color:#4FA8D8;"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                  </div>
                  <p class="img-drop-title">{{ imageUploading ? '업로드 중...' : '클릭하여 이미지 업로드' }}</p>
                  <p class="img-drop-hint">JPG · PNG · 최대 5MB</p>
                </div>
                <input id="profileImage" type="file" accept="image/*" @change="handleImageChange" class="sr-only" :disabled="imageUploading" />
              </label>
            </div>
            <p v-if="errors.profileImage" class="err">{{ errors.profileImage }}</p>
          </div>

          <!-- 02 기본 정보 -->
          <div class="section">
            <div class="sec-label-row">
              <span class="sec-num">02</span>
              <span class="sec-title">기본 정보</span>
            </div>
            <div class="input-wrap">
              <input
                type="text"
                placeholder="닉네임을 입력하세요"
                v-model="formData.nickname"
                :class="['styled-input', errors.nickname && 'input-err']"
              />
            </div>
            <p v-if="errors.nickname" class="err">{{ errors.nickname }}</p>

            <div class="profile-select-row">
              <span class="profile-select-label">MBTI</span>
              <div class="region-wrap profile-select" @click="mbtiDropOpen = !mbtiDropOpen" ref="mbtiDrop">
                <span :class="formData.mbti ? 'text-gray-800' : 'text-gray-400'">{{ formData.mbti || 'MBTI 선택' }}</span>
                <span class="region-arrow" :class="{ 'rotate-180': mbtiDropOpen }">▾</span>
                <div v-if="mbtiDropOpen" class="region-dropdown">
                  <div class="region-dropdown-item" :class="{ active: !formData.mbti }" @click.stop="selectMbti('')">선택 안 함</div>
                  <div v-for="m in mbtiTypes" :key="m" class="region-dropdown-item" :class="{ active: formData.mbti === m }" @click.stop="selectMbti(m)">{{ m }}</div>
                </div>
              </div>
            </div>

            <div class="input-wrap">
              <input type="date" v-model="formData.birthDate" class="styled-input" />
            </div>

            <div class="profile-select-row">
              <span class="profile-select-label">성별</span>
              <div class="gender-btns">
                <button type="button" @click="formData.gender = 'MALE'" :class="['gender-btn', formData.gender === 'MALE' && 'gender-btn-on']">남성</button>
                <button type="button" @click="formData.gender = 'FEMALE'" :class="['gender-btn', formData.gender === 'FEMALE' && 'gender-btn-on']">여성</button>
              </div>
            </div>
          </div>

          <!-- 03 활동 지역 -->
          <div class="section">
            <div class="sec-label-row">
              <span class="sec-num">03</span>
              <span class="sec-title">활동 지역</span>
            </div>
            <div class="profile-grid-2">
              <div>
                <span class="profile-select-label">도시</span>
                <div class="region-wrap profile-select" @click="regionDropOpen = !regionDropOpen" ref="regionDrop">
                  <span :class="formData.city ? 'text-gray-800' : 'text-gray-400'">{{ formData.city || '도시 선택' }}</span>
                  <span class="region-arrow" :class="{ 'rotate-180': regionDropOpen }">▾</span>
                  <div v-if="regionDropOpen" class="region-dropdown">
                    <div class="region-dropdown-item" :class="{ active: !formData.city }" @click.stop="selectRegion('')">선택 안 함</div>
                    <div v-for="r in regions" :key="r.value" class="region-dropdown-item" :class="{ active: formData.city === r.value }" @click.stop="selectRegion(r.value)">{{ r.label }}</div>
                  </div>
                </div>
              </div>
              <div>
                <span class="profile-select-label">구</span>
                <div class="region-wrap profile-select" :class="{ 'region-wrap--disabled': !formData.city }" @click="formData.city && (districtDropOpen = !districtDropOpen)" ref="districtDrop">
                  <span :class="formData.street ? 'text-gray-800' : 'text-gray-400'">{{ formData.street || (formData.city ? '구 선택' : '도시 먼저 선택') }}</span>
                  <span class="region-arrow" :class="{ 'rotate-180': districtDropOpen }">▾</span>
                  <div v-if="districtDropOpen" class="region-dropdown">
                    <div class="region-dropdown-item" :class="{ active: !formData.street }" @click.stop="selectDistrict('')">선택 안 함</div>
                    <div v-for="d in districtOptions" :key="d" class="region-dropdown-item" :class="{ active: formData.street === d }" @click.stop="selectDistrict(d)">{{ d }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="dong-search-wrap">
              <span class="profile-select-label">동·읍·면</span>
              <DongSearchInput
                v-model="formData.dong"
                :city-filter="formData.city"
                :district-filter="formData.street"
                placeholder="예: 역삼동, 서초동"
                @select="onDongSelect"
              />
            </div>
          </div>

          <!-- 04 관심 카테고리 -->
          <div class="section">
            <div class="sec-label-row">
              <span class="sec-num">04</span>
              <span class="sec-title">관심 카테고리</span>
            </div>
            <p class="sec-hint">중복 선택 가능</p>
            <div class="cat-grid cat-grid--profile">
              <button
                v-for="cat in categoryOptions"
                :key="cat.value"
                type="button"
                @click="toggleCategory(cat.value)"
                :class="['cat-btn', formData.categoryNames.includes(cat.value) && 'cat-on']"
              >
                <span class="cat-lbl">{{ cat.label }}</span>
              </button>
            </div>
          </div>

          <!-- 저장 버튼 -->
          <div class="section section-actions">
            <button type="submit" :disabled="saving" class="btn-submit">
              <span v-if="saving" class="spinner"></span>
              {{ saving ? '저장 중...' : '변경사항 저장' }}
            </button>
          </div>

          <!-- 05 회원 탈퇴 -->
          <div class="section section-danger">
            <div class="sec-label-row">
              <span class="sec-num sec-num--danger">05</span>
              <span class="sec-title sec-title--danger">회원 탈퇴</span>
            </div>
            <p class="sec-hint">탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.</p>
            <button type="button" @click="showDeleteModal = true" class="btn-danger">회원 탈퇴하기</button>
          </div>

        </form>
      </div>

      <!-- 회원 탈퇴 확인 모달 -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24" style="color:#dc2626;">
                <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900">회원 탈퇴</h3>
          </div>
          <div class="mb-6">
            <p class="text-gray-700 mb-4">정말로 탈퇴하시겠습니까?</p>
            <div class="bg-red-50 p-4 rounded-lg mb-4">
              <ul class="text-sm text-red-800 space-y-1">
                <li>• 가입한 모든 크루에서 자동 탈퇴됩니다</li>
                <li>• 참여 중인 모임이 취소됩니다</li>
                <li>• 모든 채팅 내역이 삭제됩니다</li>
                <li>• 매너 점수 및 활동 기록이 삭제됩니다</li>
                <li>• 삭제된 데이터는 복구할 수 없습니다</li>
              </ul>
            </div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              탈퇴를 진행하려면 <strong class="text-red-600">'회원탈퇴'</strong>를 입력해주세요
            </label>
            <input
              type="text"
              placeholder="회원탈퇴"
              :value="deleteConfirmText"
              @input="onDeleteInput"
              @compositionend="onDeleteCompositionEnd"
              class="w-full px-3 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div class="flex gap-3">
            <button
              @click="showDeleteModal = false; deleteConfirmText = ''"
              class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >취소</button>
            <button
              @click="handleDeleteAccount"
              :disabled="deleteConfirmText.trim() !== '회원탈퇴' || deleting"
              :class="['flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors',
                deleteConfirmText.trim() === '회원탈퇴' && !deleting
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed']"
            >{{ deleting ? '처리 중...' : '탈퇴하기' }}</button>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script>
import axios from 'axios'
import DongSearchInput from './DongSearchInput.vue'
import LnbMenuComponent from '@/components/common/LnbMenuComponent.vue'

const LNB_CATEGORY_OPTIONS = [
  { label: '운동/스포츠', value: 'SPORT' }, { label: '독서', value: 'BOOK' },
  { label: '요리/제조', value: 'COOK' }, { label: '취미/DIY', value: 'DIY' },
  { label: '여행', value: 'TRAVEL' }, { label: '어학', value: 'LANGUAGE' },
  { label: '자동차', value: 'CAR' }, { label: '게임/오락', value: 'GAME' },
  { label: '문화/공연', value: 'CULTURE' }, { label: '반려동물', value: 'PET' },
]

const DISTRICTS_BY_REGION = {
  '서울': ['강남구','강동구','강북구','강서구','관악구','광진구','구로구','금천구','노원구','도봉구','동대문구','동작구','마포구','서대문구','서초구','성동구','성북구','송파구','양천구','영등포구','용산구','은평구','종로구','중구','중랑구'],
  '부산': ['강서구','금정구','기장군','남구','동구','동래구','부산진구','북구','사상구','사하구','서구','수영구','연제구','영도구','중구','해운대구'],
  '대구': ['남구','달서구','달성군','동구','북구','서구','수성구','중구','군위군'],
  '인천': ['계양구','미추홀구','남동구','동구','부평구','서구','연수구','중구','강화군','옹진군'],
  '광주': ['광산구','남구','동구','북구','서구'],
  '대전': ['대덕구','동구','서구','유성구','중구'],
  '울산': ['남구','동구','북구','중구','울주군'],
  '세종': ['조치원읍','연기면','연동면','부강면','금남면','장군면','연서면','전의면','전동면','소정면'],
  '경기': ['수원시','성남시','용인시','고양시','화성시','부천시','남양주시','안산시','안양시','평택시','시흥시','김포시','파주시','의정부시','광주시','하남시','광명시','군포시','오산시','이천시','안성시','구리시','양주시','포천시','의왕시','여주시','동두천시','과천시','가평군','양평군','연천군'],
  '강원': ['춘천시','원주시','강릉시','동해시','태백시','속초시','삼척시','홍천군','횡성군','영월군','평창군','정선군','철원군','화천군','양구군','인제군','고성군','양양군'],
  '충북': ['청주시','충주시','제천시','보은군','옥천군','영동군','증평군','진천군','괴산군','음성군','단양군'],
  '충남': ['천안시','공주시','보령시','아산시','서산시','논산시','계룡시','당진시','금산군','부여군','서천군','청양군','홍성군','예산군','태안군'],
  '전북': ['전주시','군산시','익산시','정읍시','남원시','김제시','완주군','진안군','무주군','장수군','임실군','순창군','고창군','부안군'],
  '전남': ['목포시','여수시','순천시','나주시','광양시','담양군','곡성군','구례군','고흥군','보성군','화순군','장흥군','강진군','해남군','영암군','무안군','함평군','영광군','장성군','완도군','진도군','신안군'],
  '경북': ['포항시','경주시','김천시','안동시','구미시','영주시','영천시','상주시','문경시','경산시','의성군','청송군','영양군','영덕군','청도군','고령군','성주군','칠곡군','예천군','봉화군','울진군','울릉군'],
  '경남': ['창원시','진주시','통영시','사천시','김해시','밀양시','거제시','양산시','의령군','함안군','창녕군','고성군','남해군','하동군','산청군','함양군','거창군','합천군'],
  '제주': ['제주시','서귀포시'],
}

const REGIONS = [
  { label: '서울', value: '서울' }, { label: '부산', value: '부산' },
  { label: '대구', value: '대구' }, { label: '인천', value: '인천' },
  { label: '광주', value: '광주' }, { label: '대전', value: '대전' },
  { label: '울산', value: '울산' }, { label: '세종', value: '세종' },
  { label: '경기', value: '경기' }, { label: '강원', value: '강원' },
  { label: '충북', value: '충북' }, { label: '충남', value: '충남' },
  { label: '전북', value: '전북' }, { label: '전남', value: '전남' },
  { label: '경북', value: '경북' }, { label: '경남', value: '경남' },
  { label: '제주', value: '제주' },
]

const API = axios.create({ baseURL: process.env.VUE_APP_API_BASE_URL })
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default {
  name: 'ProfileEditPageComponent',
  components: { DongSearchInput, LnbMenuComponent },
  inject: ['handleLogout'],
  data() {
    return {
      lnbCategoryOptions: LNB_CATEGORY_OPTIONS,
      loading: true,
      saving: false,
      imageUploading: false,
      deleting: false,

      regionDropOpen: false,
      districtDropOpen: false,
      mbtiDropOpen: false,
      outsideClickHandler: null,

      regions: REGIONS,

      formData: {
        nickname: '',
        mbti: '',
        birthDate: '',
        gender: '',
        city: '',
        street: '',
        dong: '',
        categoryNames: []
      },

      previewImage: null,
      errors: {},

      showDeleteModal: false,
      deleteConfirmText: '',

      toast: { show: false, message: '', type: 'success' },

      mbtiTypes: ['ISTJ','ISFJ','INFJ','INTJ','ISTP','ISFP','INFP','INTP',
                  'ESTP','ESFP','ENFP','ENTP','ESTJ','ESFJ','ENFJ','ENTJ'],
      categoryOptions: [
        { label: '운동', value: 'SPORT' }, { label: '독서', value: 'BOOK' },
        { label: '요리', value: 'COOK' }, { label: '취미', value: 'DIY' },
        { label: '여행', value: 'TRAVEL' }, { label: '어학', value: 'LANGUAGE' },
        { label: '자동차', value: 'CAR' }, { label: '게임', value: 'GAME' },
        { label: '문화', value: 'CULTURE' }, { label: '펫', value: 'PET' }
      ]
    }
  },
  computed: {
    districtOptions() {
      return DISTRICTS_BY_REGION[this.formData.city] || []
    }
  },
  watch: {
    'formData.city'() {
      this.formData.street = ''
      this.formData.dong = ''
      this.districtDropOpen = false
    },
    'formData.street'() {
      this.formData.dong = ''
    }
  },
  mounted() {
    this.fetchUserInfo()
    this.outsideClickHandler = (e) => {
      if (this.$refs.regionDrop && !this.$refs.regionDrop.contains(e.target))
        this.regionDropOpen = false
      if (this.$refs.districtDrop && !this.$refs.districtDrop.contains(e.target))
        this.districtDropOpen = false
      if (this.$refs.mbtiDrop && !this.$refs.mbtiDrop.contains(e.target))
        this.mbtiDropOpen = false
    }
    document.addEventListener('click', this.outsideClickHandler)
  },
  beforeUnmount() {
    if (this.outsideClickHandler)
      document.removeEventListener('click', this.outsideClickHandler)
  },
  methods: {
    onLnbNavClick(key) {
      const routes = {
        home: '/',
        'my-crews': '/my/crews',
        recommendations: '/crew/recommendations',
        rising: '/crew/rising-crews',
        meetings: '/my/meetings',
        recent: '/my/recent',
      }
      if (routes[key]) this.$router.push(routes[key])
    },
    onLnbCategoryClick(value) {
      this.$router.push({ path: '/crew/search', query: value ? { category: value } : {} })
    },
    onDongSelect(item) {
      if (!this.formData.city) this.formData.city = item.city
      if (!this.formData.street) this.formData.street = item.district
      this.formData.dong = item.dong
    },
    selectRegion(value) {
      this.formData.city = value
      this.formData.street = ''
      this.formData.dong = ''
      this.regionDropOpen = false
    },
    selectDistrict(value) {
      this.formData.street = value
      this.formData.dong = ''
      this.districtDropOpen = false
    },
    selectMbti(value) {
      this.formData.mbti = value
      this.mbtiDropOpen = false
    },

    async fetchUserInfo() {
      this.loading = true
      try {
        const res = await API.get('/user/info-from')
        const dto = res.data
        this.formData.nickname = dto.nickname || ''
        this.formData.mbti = dto.mbti || ''
        this.formData.birthDate = dto.birthDate || ''
        this.formData.gender = dto.gender || ''
        this.formData.city = dto.city || ''
        this.formData.street = dto.street || ''
        this.formData.dong = dto.dong || ''
        this.formData.categoryNames = dto.categoryNames || []
        this.previewImage = dto.profileImageUrl || null
      } catch (e) {
        this.showToast('정보를 불러오지 못했습니다.', 'error')
      } finally {
        this.loading = false
      }
    },

    // ✅ 이미지 변경 — presigned URL → S3 PUT → /user/image-update
    async handleImageChange(e) {
      const file = e.target.files?.[0]
      if (!file) return
      if (file.size > 5 * 1024 * 1024) {
        this.errors = { ...this.errors, profileImage: '이미지 크기는 5MB 이하여야 합니다' }
        return
      }
      this.errors = { ...this.errors, profileImage: null }

      const reader = new FileReader()
      reader.onloadend = () => { this.previewImage = reader.result }
      reader.readAsDataURL(file)

      this.imageUploading = true
      try {
        const presignedRes = await API.get('/user/presigned-url', {
          params: { fileName: file.name }
        })
        const presignedUrl = presignedRes.data

        await fetch(presignedUrl, {
          method: 'PUT',
          body: file
        })

        const profileImageUrl = presignedUrl.split('?')[0]

        await API.put('/user/image-update', null, {
          params: { profileImage: profileImageUrl }
        })

        this.previewImage = profileImageUrl
        this.showToast('이미지가 변경되었습니다.', 'success')
      } catch (e) {
        this.showToast(e.response?.data?.error_message || '이미지 업로드에 실패했습니다.', 'error')
      } finally {
        this.imageUploading = false
      }
    },

    // ✅ 이미지 삭제 — null 전달
    async handleRemoveImage() {
      this.imageUploading = true
      try {
        await API.put('/user/image-update', null, {
          params: { profileImage: null }
        })
        this.previewImage = null
        this.showToast('이미지가 삭제되었습니다.', 'success')
      } catch (e) {
        this.showToast(e.response?.data?.error_message || '이미지 삭제에 실패했습니다.', 'error')
      } finally {
        this.imageUploading = false
      }
    },

    onDeleteInput(e) {
      this.deleteConfirmText = e.target.value.trim()
    },
    onDeleteCompositionEnd(e) {
      this.deleteConfirmText = e.target.value.trim()
    },

    toggleCategory(value) {
      if (this.formData.categoryNames.includes(value)) {
        this.formData.categoryNames = this.formData.categoryNames.filter(c => c !== value)
      } else {
        this.formData.categoryNames = [...this.formData.categoryNames, value]
      }
    },

    validateForm() {
      const newErrors = {}
      if (!this.formData.nickname) {
        newErrors.nickname = '닉네임을 입력해주세요'
      } else if (this.formData.nickname.length < 2) {
        newErrors.nickname = '닉네임은 2자 이상이어야 합니다'
      }
      this.errors = newErrors
      return Object.keys(newErrors).length === 0
    },

    async handleSubmit() {
      if (!this.validateForm()) return
      this.saving = true
      try {
        await API.put('/user/data-update', {
          nickname: this.formData.nickname,
          mbti: this.formData.mbti || null,
          birthDate: this.formData.birthDate || null,
          gender: this.formData.gender || null,
          city: this.formData.city || null,
          street: this.formData.street || null,
          dong: this.formData.dong || null,
          categoryNames: this.formData.categoryNames
        })
        this.showToast('회원 정보가 성공적으로 수정되었습니다.', 'success')
        setTimeout(() => this.$router.push('/mypage'), 1500)
      } catch (e) {
        this.showToast(e.response?.data?.error_message || '저장에 실패했습니다.', 'error')
      } finally {
        this.saving = false
      }
    },

    async handleDeleteAccount() {
      if (this.deleteConfirmText.trim() !== '회원탈퇴') return
      this.deleting = true
      try {
        await API.delete('/user/delete')
        this.showDeleteModal = false
        this.showToast('회원 탈퇴가 완료되었습니다.', 'success')
        setTimeout(() => { this.handleLogout() }, 1500)
      } catch (e) {
        this.showToast(e.response?.data?.error_message || '탈퇴 처리 중 오류가 발생했습니다.', 'error')
      } finally {
        this.deleting = false
      }
    },

    showToast(message, type = 'success') {
      this.toast = { show: true, message, type }
      setTimeout(() => { this.toast.show = false }, 3000)
    }
  }
}
</script>

<style scoped>
.page-root.profile-edit-root {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: #f5f7fa;
  font-family: "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
}
.profile-edit-main {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 32px 36px 72px;
}
.profile-edit-form-wrap { max-width: 640px; margin: 0 auto; }
.page-head { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -.4px; margin: 0 0 6px; }
.title-sparkle { color: #0EA5E9; }

.section { background: #fff; border-radius: 16px; border: 1px solid #e8e8e8; padding: 22px 26px; margin-bottom: 10px; transition: border-color .2s, box-shadow .2s; }
.section:focus-within { border-color: #BAE6FD; box-shadow: 0 0 0 3px rgba(56,189,248,.1), 0 4px 16px rgba(0,0,0,.05); }
.sec-label-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.sec-num { font-size: 11px; font-weight: 900; color: #4FA8D8; background: #EBF6FC; padding: 3px 8px; border-radius: 6px; letter-spacing: .3px; flex-shrink: 0; }
.sec-title { font-size: 14.5px; font-weight: 800; color: #0f172a; flex: 1; }
.sec-hint { font-size: 12px; color: #64748b; margin: -8px 0 12px; }
.sec-num--danger { color: #dc2626; background: #fef2f2; }
.sec-title--danger { color: #dc2626; }
.section-danger { border-color: #fecaca; background: #fffbeb; }
.section-actions { padding: 16px 26px; }

.img-section-center { display: flex; justify-content: center; align-items: center; margin-bottom: 4px; }
.img-preview-box { position: relative; aspect-ratio: 1; max-width: 200px; border-radius: 12px; overflow: hidden; border: 2px solid #e8e8e8; }
.img-preview-box--round { border-radius: 50%; }
.img-preview { width: 100%; height: 100%; object-fit: cover; display: block; }
.img-overlay { position: absolute; inset: 0; background: transparent; display: flex; align-items: center; justify-content: center; transition: background .2s; }
.img-preview-box:hover .img-overlay { background: rgba(0,0,0,.4); }
.img-replace { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #fff; border: none; border-radius: 8px; font-size: 12.5px; font-weight: 700; color: #1a1a1a; cursor: pointer; opacity: 0; transform: translateY(4px); transition: all .2s; }
.img-preview-box:hover .img-replace { opacity: 1; transform: translateY(0); }
.img-replace:disabled { opacity: 0.6; cursor: not-allowed; }
.img-drop { cursor: pointer; display: block; }
.img-drop-content { border: 2px dashed #BAE6FD; border-radius: 12px; background: linear-gradient(135deg,#f0f9ff,#e0f2fe); padding: 36px 24px; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: all .18s; max-width: 280px; }
.img-drop:hover .img-drop-content { border-color: #4FA8D8; background: #e0f2fe; transform: translateY(-2px); }
.img-drop-icon { width: 56px; height: 56px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(14,165,233,.15); }
.img-drop-title { font-size: 14px; font-weight: 700; color: #0369a1; margin: 0; }
.img-drop-hint { font-size: 12px; color: #7ab8d8; margin: 0; }

.input-wrap { position: relative; margin-bottom: 14px; }
.styled-input { width: 100%; padding: 11px 13px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: 14px; color: #0f172a; background: #fafbfc; outline: none; transition: border-color .15s, box-shadow .15s; }
.styled-input:focus { border-color: #4FA8D8; box-shadow: 0 0 0 3px rgba(79,168,216,.1); background: #fff; }
.styled-input.input-err { border-color: #F87171; }

.profile-select-row { margin-bottom: 14px; }
.profile-select-label { display: block; font-size: 12.5px; font-weight: 700; color: #475569; margin-bottom: 6px; }
.profile-select { position: relative; display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 9px; background: #fafbfc; cursor: pointer; font-size: 14px; transition: border-color .15s, box-shadow .15s; }
.profile-select:hover { border-color: #4FA8D8; }
.profile-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
.dong-search-wrap { margin-top: 14px; }
.dong-search-wrap .profile-select-label { margin-bottom: 6px; }
.gender-btns { display: flex; gap: 12px; flex-wrap: wrap; }
.gender-btn { flex: 1; min-width: 140px; padding: 14px 20px; border-radius: 12px; border: 2px solid #BAE6FD; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); font-size: 15px; font-weight: 700; color: #0369a1; cursor: pointer; transition: all .2s; }
.gender-btn:hover { border-color: #4FA8D8; background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); color: #0c4a6e; }
.gender-btn-on { background: linear-gradient(135deg, #4FA8D8 0%, #0EA5E9 100%); color: #fff; border-color: #4FA8D8; box-shadow: 0 4px 14px rgba(79, 168, 216, 0.35); }
.gender-btn-on:hover { background: linear-gradient(135deg, #3d96c4 0%, #0c8fd9 100%); color: #fff; border-color: #3d96c4; }
.region-btn { padding: 6px 14px; border-radius: 20px; border: 1.5px solid #e2e8f0; background: #fafbfc; font-size: 12.5px; font-weight: 700; color: #475569; cursor: pointer; transition: all .12s; }
.region-btn:hover { border-color: #4FA8D8; color: #4FA8D8; }
.region-on { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }

.cat-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 7px; }
.cat-grid--profile { grid-template-columns: repeat(4, 1fr); }
.cat-btn { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 11px 8px; border: 1.5px solid #e2e8f0; border-radius: 12px; background: #fafbfc; cursor: pointer; transition: all .15s; }
.cat-btn:hover { border-color: #4FA8D8; background: #f0f9ff; transform: translateY(-2px); }
.cat-on { border-color: #4FA8D8; background: color-mix(in srgb, #4FA8D8 8%, white); }
.cat-lbl { font-size: 11.5px; font-weight: 700; color: #64748b; }
.cat-on .cat-lbl { color: #4FA8D8; }

.region-wrap { position: relative; }
.region-arrow { font-size: 11px; color: #9ca3af; transition: transform 0.2s; flex-shrink: 0; }
.region-arrow.rotate-180 { transform: rotate(180deg); }
.region-dropdown { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: #fff; border: 1px solid #e8e8e8; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.12); max-height: 220px; overflow-y: auto; z-index: 200; padding: 6px 0; }
.region-dropdown-item { padding: 9px 16px; font-size: 13.5px; color: #374151; cursor: pointer; transition: background 0.1s; }
.region-dropdown-item:hover { background: #EBF6FC; color: #4FA8D8; }
.region-dropdown-item.active { font-weight: 700; color: #4FA8D8; background: #f0f9ff; }
.region-wrap--disabled { background: #f1f5f9; cursor: not-allowed; opacity: 0.6; }

.btn-submit { width: 100%; padding: 13px 20px; background: linear-gradient(135deg,#38BDF8,#0EA5E9); color: #fff; border: none; border-radius: 11px; font-size: 14.5px; font-weight: 800; letter-spacing: -.2px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 6px 18px rgba(14,165,233,.32); transition: all .2s; }
.btn-submit:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-2px); }
.btn-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }
.spinner { width: 17px; height: 17px; border: 2.5px solid rgba(255,255,255,.35); border-top-color: #fff; border-radius: 50%; animation: profile-spin .7s linear infinite; }
@keyframes profile-spin { to { transform: rotate(360deg); } }
.btn-danger { padding: 8px 18px; border: 2px solid #dc2626; background: #fff; color: #dc2626; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s; }
.btn-danger:hover { background: #fef2f2; }
.err { margin-top: 7px; font-size: 12.5px; color: #F87171; font-weight: 600; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
</style>