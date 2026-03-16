<template>
  <div class="page-root meeting-edit-root">
    <LnbMenuComponent
      :active-nav="null"
      :category-options="lnbCategoryOptions"
      :selected-category-values="[]"
      @nav-click="onLnbNavClick"
      @category-click="onLnbCategoryClick"
    />

    <main class="meeting-edit-main">
      <div v-if="showSuccessMessage" class="toast toast--success">
        모임이 성공적으로 수정되었습니다!
      </div>
      <div v-if="errorMessage" class="toast toast--error">{{ errorMessage }}</div>

      <div v-if="initLoading" class="loading-screen">
        <div class="spinner"></div>
      </div>

      <template v-else>
        <div class="edit-wrap">
          <div class="page-head">
            <h1 class="page-title">모임 수정 <span class="title-accent">✦</span></h1>
          </div>

          <form @submit.prevent="handleSubmit">
            <!-- 01 모임 이미지 -->
            <div class="card">
              <div class="card-label-row">
                <span class="card-num">01</span>
                <span class="card-title">모임 이미지</span>
              </div>
              <div v-if="imagePreview" class="image-preview image-preview--fill">
                <img :src="imagePreview" alt="미리보기" class="preview-img" />
                <div class="image-preview-overlay">
                  <button type="button" @click.stop="removeImage" class="btn-img-replace">
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="width:14px;height:14px;">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    이미지 교체
                  </button>
                </div>
              </div>
              <label v-else for="meetingImage" class="image-drop">
                <div class="image-drop-inner">
                  <div class="img-drop-icon">
                    <svg fill="currentColor" viewBox="0 0 24 24" style="width:28px;height:28px;color:#4FA8D8;">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </svg>
                  </div>
                  <span class="preview-hint">클릭하여 이미지 업로드</span>
                  <span class="image-hint">JPG · PNG (선택)</span>
                </div>
              </label>
              <input id="meetingImage" ref="imageInput" type="file" accept="image/*" @change="onImageChange" class="sr-only" />
            </div>

            <!-- 02 모임명 -->
            <div class="card">
              <div class="card-label-row">
                <span class="card-num">02</span>
                <span class="card-title">모임명 <span class="required">*</span></span>
              </div>
              <input id="title" v-model="formData.title" required type="text" maxlength="50" placeholder="모임명을 입력하세요" :class="['field-input']" />
              <p class="field-hint text-right">{{ (formData.title || '').length }}/50</p>
            </div>

            <!-- 03 날짜 및 시간 -->
            <div class="card">
              <div class="card-label-row">
                <span class="card-num">03</span>
                <span class="card-title">날짜 및 시간 <span class="required">*</span></span>
              </div>
              <input id="datetime" type="datetime-local" v-model="formData.datetime" required :min="minDatetime" :class="['field-input']" />
            </div>

            <!-- 04 장소 -->
            <div class="card card--relative" ref="placeDropdownWrapper">
              <div class="card-label-row">
                <span class="card-num">04</span>
                <span class="card-title">장소 <span class="required">*</span></span>
              </div>
              <input
                id="location"
                :value="formData.location"
                required
                @compositionstart="isComposing = true"
                @compositionend="onLocationCompositionEnd"
                @input="onLocationInput"
                @focus="onLocationFocus"
                :class="['field-input', placeError ? 'field-input--error' : '']"
                placeholder="장소를 입력하세요"
                autocomplete="off"
              />
              <p v-if="placeError" class="field-error">{{ placeError }}</p>
              <div v-if="placeDropdownOpen && placeCandidates.length" class="dropdown-list">
                <ul>
                  <li v-for="(c, idx) in placeCandidates" :key="idx" @mousedown.prevent="selectPlaceCandidate(c)" class="dropdown-item">
                    <div class="dropdown-item-title">{{ c.name || c.address }}</div>
                    <div class="dropdown-item-sub">{{ c.address }}</div>
                  </li>
                </ul>
              </div>
              <p v-if="placeLoading" class="field-hint">장소 검색 중...</p>
              <p v-else-if="placeDropdownOpen && !placeCandidates.length && (formData.location || '').trim().length >= 2" class="field-hint">검색 결과가 없습니다.</p>
            </div>

            <!-- 05 모집 인원 -->
            <div class="card">
              <div class="card-label-row">
                <span class="card-num">05</span>
                <span class="card-title">모집 인원 <span class="required">*</span></span>
              </div>
              <input id="maxParticipants" type="number" v-model="formData.maxParticipants" placeholder="예) 12" required min="1" max="500" :class="['field-input']" />
            </div>

            <!-- 06 모임 유형 -->
            <div class="card">
              <div class="card-label-row">
                <span class="card-num">06</span>
                <span class="card-title">모임 유형</span>
              </div>
              <div class="type-row">
                <div :class="['type-cell', formData.isPaid === 'free' && 'type-cell--on']">무료</div>
                <div :class="['type-cell', formData.isPaid === 'paid' && 'type-cell--on']">유료</div>
              </div>
              <p class="field-hint">모임 유형은 생성 후 변경할 수 없습니다.</p>
            </div>

            <!-- 07 계좌 정보 (유료일 때) -->
            <div v-if="formData.isPaid === 'paid'" class="card card--accent">
              <div class="card-label-row">
                <span class="card-num">07</span>
                <span class="card-title">계좌 정보</span>
              </div>
              <div class="field-row">
                <label class="field-label">모임비 <span class="required">*</span></label>
                <div class="field-with-suffix">
                  <input id="fee" type="number" v-model="formData.fee" placeholder="0" min="0" :class="['field-input']" />
                  <span class="field-suffix">원</span>
                </div>
              </div>
              <div class="field-row" ref="bankDropdownWrapper">
                <label class="field-label">은행명 <span class="required">*</span></label>
                <button type="button" @click="bankDropdownOpen = !bankDropdownOpen" :class="['field-select', !formData.bankName && 'field-select--placeholder']">
                  <span>{{ formData.bankName || '은행을 선택하세요' }}</span>
                  <svg class="dropdown-chevron" :class="{ 'dropdown-chevron--open': bankDropdownOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
                <div v-if="bankDropdownOpen" class="dropdown-list">
                  <ul>
                    <li v-for="bank in bankList" :key="bank" @click="selectBank(bank)" :class="['dropdown-item', formData.bankName === bank && 'dropdown-item--on']">{{ bank }}</li>
                  </ul>
                </div>
              </div>
              <div class="field-row">
                <label class="field-label" for="accountNumber">계좌번호 <span class="required">*</span></label>
                <input id="accountNumber" v-model="formData.accountNumber" placeholder="예) 123456-78-901234" :class="['field-input']" />
              </div>
              <div class="field-row">
                <label class="field-label" for="accountHolder">예금주명 <span class="required">*</span></label>
                <input id="accountHolder" v-model="formData.accountHolder" placeholder="예) 홍길동" :class="['field-input']" />
              </div>
            </div>

            <!-- 08 모임 설명 -->
            <div class="card">
              <div class="card-label-row">
                <span class="card-num">08</span>
                <span class="card-title">모임 설명 <span class="required">*</span></span>
              </div>
              <textarea id="description" v-model="formData.description" placeholder="모임에 대한 설명을 입력하세요" required rows="5" :class="['field-textarea']" />
            </div>

            <div class="bottom-actions">
              <button type="button" @click="goBack" class="btn-cancel">취소</button>
              <button type="submit" :disabled="isLoading" class="btn-save">
                <span v-if="isLoading" class="btn-spinner"></span>
                <span v-else>수정 완료</span>
              </button>
            </div>
          </form>
        </div>
      </template>
    </main>
  </div>
</template>

<script>
import axios from 'axios'
import dayjs from '@/plugins/dayjs'
import LnbMenuComponent from '../common/LnbMenuComponent.vue'

const API = axios.create({ baseURL: process.env.VUE_APP_API_BASE_URL })
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const LNB_CATEGORY_OPTIONS = [
  { label: '운동/스포츠', value: 'SPORT' }, { label: '독서', value: 'BOOK' },
  { label: '요리/제조', value: 'COOK' }, { label: '취미/DIY', value: 'DIY' },
  { label: '여행', value: 'TRAVEL' }, { label: '어학', value: 'LANGUAGE' },
  { label: '자동차', value: 'CAR' }, { label: '게임/오락', value: 'GAME' },
  { label: '문화/공연', value: 'CULTURE' }, { label: '반려동물', value: 'PET' },
]

export default {
  name: 'MeetingEditPageComponent',
  components: { LnbMenuComponent },

  data() {
    return {
      lnbCategoryOptions: LNB_CATEGORY_OPTIONS,
      initLoading: true,
      isLoading: false,
      showSuccessMessage: false,
      errorMessage: '',
      placeError: '',
      meetingId: null,
      crewId: null,
      originalLocation: '',

      bankDropdownOpen: false,
      bankList: [
        '카카오뱅크', '토스뱅크', 'KB국민은행', '신한은행', '우리은행',
        '하나은행', 'NH농협은행', 'IBK기업은행', '케이뱅크', '새마을금고',
        '우체국', '신협', '부산은행', '대구은행', '경남은행',
        '광주은행', '전북은행', '제주은행', '수협은행', '산업은행',
        'SC제일은행', '한국씨티은행',
      ],

      placeCandidates: [],
      placeDropdownOpen: false,
      placeLoading: false,
      placeDebounceTimer: null,
      isComposing: false,

      formData: {
        title: '',
        datetime: '',
        location: '',
        maxParticipants: '',
        description: '',
        isPaid: 'free',
        fee: '',
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        profileImage: null,
        latitude: null,
        longitude: null,
      },

      imagePreview: null,
      imageFile: null,
    }
  },

  computed: {
    minDatetime() {
      return new Date().toISOString().slice(0, 16)
    }
  },

  async mounted() {
    this.meetingId = Number(this.$route.params.id)
    await this.fetchMeetingDetail()
    document.addEventListener('click', this.handleOutsideClick)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick)
    clearTimeout(this.placeDebounceTimer)
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

    goBack() {
      this.$router.back()
    },

    selectBank(bank) {
      this.formData.bankName = bank
      this.bankDropdownOpen = false
    },

    handleOutsideClick(e) {
      const bankWrapper = this.$refs.bankDropdownWrapper
      if (bankWrapper && !bankWrapper.contains(e.target)) {
        this.bankDropdownOpen = false
      }
      const placeWrapper = this.$refs.placeDropdownWrapper
      if (placeWrapper && !placeWrapper.contains(e.target)) {
        this.placeDropdownOpen = false
      }
    },

    onImageChange(e) {
      const file = e.target.files?.[0]
      if (!file) return
      this.imageFile = file
      this.imagePreview = URL.createObjectURL(file)
    },

    removeImage() {
      this.imageFile = null
      this.formData.profileImage = null
      this.imagePreview = null
      if (this.$refs.imageInput) this.$refs.imageInput.value = ''
    },

    async fetchPlaceCandidates(query) {
      const q = (query || '').trim()
      if (q.length < 2) {
        this.placeCandidates = []
        this.placeDropdownOpen = false
        return
      }
      this.placeLoading = true
      try {
        const res = await API.get('/meeting/place/candidates', { params: { query: q } })
        this.placeCandidates = Array.isArray(res.data) ? res.data : []
        this.placeDropdownOpen = true
      } catch (e) {
        this.placeCandidates = []
        this.placeDropdownOpen = false
      } finally {
        this.placeLoading = false
      }
    },

    scheduleLocationSearch() {
      clearTimeout(this.placeDebounceTimer)
      const looksLikeAddr = /(\d+(-\d+)?)/.test(this.formData.location) && /(시|도|구|군|동|로|길|대로)/.test(this.formData.location)
      if (looksLikeAddr) {
        this.placeCandidates = []
        this.placeDropdownOpen = false
        return
      }
      this.placeDebounceTimer = setTimeout(() => {
        this.fetchPlaceCandidates(this.formData.location)
      }, 800)
    },

    onLocationInput(e) {
      this.formData.location = e.target.value
      this.formData.latitude = null
      this.formData.longitude = null
      this.placeError = ''
      if (this.isComposing) return
      this.scheduleLocationSearch()
    },

    onLocationCompositionEnd(e) {
      this.isComposing = false
      this.formData.location = e.target.value
      this.formData.latitude = null
      this.formData.longitude = null
      this.placeError = ''
      this.scheduleLocationSearch()
    },

    onLocationFocus() {
      if (this.placeCandidates.length) this.placeDropdownOpen = true
    },

    selectPlaceCandidate(c) {
      this.formData.location = c?.address || c?.name || this.formData.location
      this.formData.latitude = c?.latitude ?? null
      this.formData.longitude = c?.longitude ?? null
      this.placeDropdownOpen = false
      this.placeCandidates = []
      this.placeError = ''
    },

    parseErrorMessage(err, fallback) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        return data.error_message || data.message || fallback
      }
      if (typeof data === 'string' && data.trim()) return data
      return fallback
    },

    async fetchMeetingDetail() {
      this.initLoading = true
      try {
        const res = await API.get(`/meeting/${this.meetingId}`)
        const d = res.data || {}
        this.crewId = d.crewId
        this.formData = {
          title: d.meetingName ?? '',
          datetime: d.meetingAt
            ? dayjs.utc(d.meetingAt).tz('Asia/Seoul').format('YYYY-MM-DDTHH:mm')
            : '',
          location: d.place ?? '',
          maxParticipants: d.maxMembers ?? '',
          description: d.description ?? '',
          isPaid: (d.fee && d.fee > 0) ? 'paid' : 'free',
          fee: d.fee ?? '',
          bankName: (d.bankName ?? d.bank_name ?? '').toString(),
          accountNumber: (d.accountNumber ?? d.account_number ?? '').toString(),
          accountHolder: (d.accountHolder ?? d.account_holder ?? '').toString(),
          profileImage: d.profileImage ?? d.profile_image ?? null,
          latitude: d.latitude ?? null,
          longitude: d.longitude ?? null,
        }
        this.originalLocation = this.formData.location
        this.imagePreview = this.formData.profileImage
        this.imageFile = null
      } catch (e) {
        this.errorMessage = this.parseErrorMessage(e, '모임 정보를 불러오지 못했습니다.')
        setTimeout(() => { this.errorMessage = '' }, 3000)
      } finally {
        this.initLoading = false
      }
    },

    async handleSubmit() {
      this.isLoading = true
      this.errorMessage = ''
      this.placeError = ''

      const maxVal = this.formData.maxParticipants ? Number(this.formData.maxParticipants) : 0
      if (maxVal > 500) {
        this.errorMessage = '최대 500명까지 입력 가능합니다.'
        this.isLoading = false
        return
      }
      if ((this.formData.title || '').length > 50) {
        this.errorMessage = '모임명은 50자까지 입력 가능합니다.'
        this.isLoading = false
        return
      }

      try {
        const currentLocation = (this.formData.location || '').trim()
        const prevLocation = (this.originalLocation || '').trim()
        const locationChanged = currentLocation !== prevLocation

        if (locationChanged) {
          const looksLikeAddr = /(\d+(-\d+)?)/.test(currentLocation) && /(시|도|구|군|동|로|길|대로)/.test(currentLocation)
          if (!looksLikeAddr && (this.formData.latitude == null || this.formData.longitude == null)) {
            this.placeError = '키워드 장소는 후보에서 선택해주세요.'
            this.fetchPlaceCandidates(this.formData.location)
            this.placeDropdownOpen = true
            this.isLoading = false
            return
          }
        }

        let profileImageUrl = this.formData.profileImage ?? null
        if (this.imageFile instanceof File) {
          const presignedRes = await API.get('/meeting/presigned-url', {
            params: { fileName: this.imageFile.name || 'meeting-image.jpg' },
          })
          const presignedUrl = presignedRes.data
          await fetch(presignedUrl, { method: 'PUT', body: this.imageFile })
          profileImageUrl = presignedUrl.split('?')[0]
        }

        const isPaid = this.formData.isPaid === 'paid'
        const requestBody = {
          crewId: this.crewId,
          meetingId: this.meetingId,
          meetingName: this.formData.title,
          place: this.formData.location,
          latitude: this.formData.latitude,
          longitude: this.formData.longitude,
          description: this.formData.description,
          meetingAt: this.formData.datetime ? this.formData.datetime + ':00' : null,
          maxMembers: this.formData.maxParticipants ? Number(this.formData.maxParticipants) : null,
          fee: isPaid && this.formData.fee !== '' ? Number(this.formData.fee) : 0,
          bankName: isPaid ? (this.formData.bankName || null) : null,
          accountNumber: isPaid ? (this.formData.accountNumber || null) : null,
          accountHolder: isPaid ? (this.formData.accountHolder || null) : null,
          profileImage: profileImageUrl,
        }

        await API.patch('/meeting/update', requestBody, {
          headers: { 'Content-Type': 'application/json' },
        })

        this.showSuccessMessage = true
        setTimeout(() => {
          this.showSuccessMessage = false
          this.$router.back()
        }, 2000)

      } catch (e) {
        const status = e.response?.status
        const msg = this.parseErrorMessage(e, '모임 수정에 실패했습니다.')

        if (msg.includes('주소를 찾을 수 없습니다') || msg.includes('후보 선택')) {
          this.placeError = '정확한 주소를 입력해주세요.'
          this.fetchPlaceCandidates(this.formData.location)
          this.placeDropdownOpen = true
        } else if (status === 403 || msg.includes('권한')) {
          this.errorMessage = '모임 수정 권한이 없습니다.'
          setTimeout(() => { this.errorMessage = '' }, 3000)
        } else if (msg.includes('시작된')) {
          this.errorMessage = '이미 시작된 모임은 수정할 수 없습니다.'
          setTimeout(() => { this.errorMessage = '' }, 3000)
        } else if (msg.includes('없는')) {
          this.errorMessage = '모임 정보를 찾을 수 없습니다.'
          setTimeout(() => { this.errorMessage = '' }, 3000)
        } else {
          this.errorMessage = msg
          setTimeout(() => { this.errorMessage = '' }, 3000)
        }
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.page-root.meeting-edit-root {
  display: flex; min-height: 100vh; width: 100%;
  background: #f5f7fa;
  font-family: "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
}
.meeting-edit-main { flex: 1; min-width: 0; overflow-y: auto; padding: 32px 36px 80px; }
.edit-wrap { max-width: 720px; margin: 0 auto; }

.page-head { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.4px; margin: 0; }
.title-accent { color: #0EA5E9; }

.loading-screen { display: flex; justify-content: center; align-items: center; min-height: 60vh; }
.spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #4FA8D8; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.toast { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 999; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; white-space: nowrap; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
.toast--success { background: #22c55e; color: #fff; }
.toast--error { background: #ef4444; color: #fff; }

.card { background: #fff; border-radius: 16px; border: 1px solid #e8e8e8; padding: 22px 26px; margin-bottom: 10px; }
.card--relative { position: relative; }
.card--accent { border-color: #bae6fd; background: #f0f9ff; }
.card-label-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.card-num { font-size: 11px; font-weight: 900; color: #4FA8D8; background: #EBF6FC; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.3px; flex-shrink: 0; }
.card-title { font-size: 14.5px; font-weight: 800; color: #0f172a; }
.required { color: #ef4444; font-size: 13px; }

.image-preview { position: relative; width: 100%; border-radius: 12px; overflow: hidden; border: 2px solid #e8e8e8; margin-bottom: 4px; }
.image-preview--fill { aspect-ratio: 16/9; }
.preview-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.image-preview-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0); display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
.image-preview:hover .image-preview-overlay { background: rgba(0,0,0,0.4); }
.btn-img-replace { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #fff; border: none; border-radius: 8px; font-size: 12.5px; font-weight: 700; color: #1a1a1a; cursor: pointer; opacity: 0; transform: translateY(4px); transition: all 0.2s; }
.image-preview:hover .btn-img-replace { opacity: 1; transform: translateY(0); }
.image-drop { cursor: pointer; display: block; width: 100%; }
.image-drop-inner { width: 100%; border: 2px dashed #bae6fd; border-radius: 10px; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 44px 24px; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: all 0.18s; box-sizing: border-box; }
.image-drop:hover .image-drop-inner { border-color: #4fa8d8; background: #e0f2fe; transform: translateY(-2px); }
.img-drop-icon { width: 56px; height: 56px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(14,165,233,0.15); margin-bottom: 2px; }
.preview-hint { font-size: 14px; font-weight: 700; color: #0369a1; }
.image-hint { font-size: 12px; color: #7ab8d8; }

.field-input { width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; color: #0f172a; font-family: inherit; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
.field-input:focus { border-color: #4FA8D8; }
.field-input--error { border-color: #ef4444 !important; }
.field-error { font-size: 12px; color: #ef4444; margin-top: 6px; }
.field-textarea { width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; color: #0f172a; font-family: inherit; outline: none; resize: vertical; transition: border-color 0.15s; box-sizing: border-box; }
.field-textarea:focus { border-color: #4FA8D8; }
.field-hint { font-size: 12px; color: #94a3b8; margin-top: 6px; }
.field-label { display: block; font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 6px; }
.field-row { margin-bottom: 14px; position: relative; }
.field-row:last-child { margin-bottom: 0; }
.field-with-suffix { position: relative; }
.field-suffix { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 13px; color: #64748b; }
.field-select { width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; color: #0f172a; background: #fff; text-align: left; cursor: pointer; display: flex; align-items: center; justify-content: space-between; }
.field-select--placeholder { color: #94a3b8; }
.field-select:focus { outline: none; border-color: #4FA8D8; }
.dropdown-chevron { width: 18px; height: 18px; transition: transform 0.2s; }
.dropdown-chevron--open { transform: rotate(180deg); }

.dropdown-list { position: absolute; left: 0; right: 0; top: 100%; margin-top: 6px; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); max-height: 220px; overflow-y: auto; z-index: 50; }
.dropdown-item { padding: 10px 14px; font-size: 13px; color: #334155; cursor: pointer; transition: background 0.1s; }
.dropdown-item:hover { background: #f0f9ff; color: #4FA8D8; }
.dropdown-item--on { background: #EBF6FC; color: #4FA8D8; font-weight: 700; }
.dropdown-item-title { font-weight: 600; color: #0f172a; }
.dropdown-item-sub { font-size: 12px; color: #64748b; margin-top: 2px; }

.type-row { display: flex; gap: 10px; margin-bottom: 8px; }
.type-cell { flex: 1; padding: 12px; border-radius: 10px; font-size: 14px; font-weight: 700; text-align: center; border: 1.5px solid #e2e8f0; background: #f8fafc; color: #94a3b8; }
.type-cell--on { border-color: #4FA8D8; background: #EBF6FC; color: #4FA8D8; }

.bottom-actions { display: flex; gap: 12px; margin-top: 10px; background: #fff; border-radius: 16px; border: 1px solid #e8e8e8; padding: 18px 26px; }
.btn-cancel { flex: 1; padding: 11px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 10px; font-size: 14px; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.15s; }
.btn-cancel:hover { background: #f8fafc; }
.btn-save { flex: 2; padding: 11px; background: linear-gradient(135deg, #4FA8D8, #0EA5E9); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: filter 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; }
.btn-save:hover:not(:disabled) { filter: brightness(1.05); }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }

.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
</style>