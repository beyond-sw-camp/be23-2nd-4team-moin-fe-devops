<template>
  <div class="page-root crew-edit-root">
    <LnbMenuComponent
      :active-nav="null"
      :category-options="lnbCategoryOptions"
      :selected-category-values="[]"
      @nav-click="onLnbNavClick"
      @category-click="onLnbCategoryClick"
    />

    <main class="crew-edit-main">

      <!-- 성공 토스트 -->
      <div v-if="showSuccessMessage" class="toast toast--success">
        수정 완료
        <svg class="cep-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">
          <path d="M5 12.5l4 4L19 7"></path>
        </svg>
      </div>

      <!-- 에러 토스트 -->
      <div v-if="errorMessage" class="toast toast--error">{{ errorMessage }}</div>

      <!-- 로딩 -->
      <div v-if="isLoading" class="loading-screen">
        <div class="spinner"></div>
      </div>

      <template v-else>
        <div class="edit-wrap">

          <!-- 페이지 헤더 -->
          <div class="page-head">
            <h1 class="page-title">크루 수정 <span class="title-accent">✦</span></h1>
          </div>

          <!-- 01 대표 이미지 -->
          <div class="card">
            <div class="card-label-row">
              <span class="card-num">01</span>
              <span class="card-title">대표 이미지</span>
            </div>
            <div v-if="previewImage" class="image-preview image-preview--fill">
              <img :src="previewImage" alt="크루 이미지" class="preview-img" />
              <div class="image-preview-overlay">
                <label for="crewImage" class="btn-upload btn-upload--overlay">이미지 변경</label>
              </div>
            </div>
            <label v-else for="crewImage" class="image-drop">
              <div class="image-drop-inner">
                <span class="preview-icon">
                  <svg class="cep-icon cep-icon--camera" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M4 8h3l1.6-2h6.8L17 8h3a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2v-8a2 2 0 012-2z"></path>
                    <circle cx="12" cy="14" r="4"></circle>
                  </svg>
                </span>
                <span class="preview-hint">클릭하여 이미지 업로드</span>
                <span class="image-hint">JPG, PNG (최대 5MB)</span>
              </div>
            </label>
            <input id="crewImage" type="file" accept="image/*" @change="handleImageChange" class="sr-only" />
            <p v-if="errors.image" class="field-error">{{ errors.image }}</p>
          </div>

          <!-- 02 크루명 -->
          <div class="card">
            <div class="card-label-row">
              <span class="card-num">02</span>
              <span class="card-title">크루명 <span class="required">*</span></span>
            </div>
            <input
              type="text"
              placeholder="크루명을 입력하세요"
              v-model="formData.crewName"
              :class="['field-input', errors.crewName && 'field-input--error']"
            />
            <p v-if="errors.crewName" class="field-error">{{ errors.crewName }}</p>
          </div>

          <!-- 03 카테고리 -->
          <div class="card">
            <div class="card-label-row">
              <span class="card-num">03</span>
              <span class="card-title">카테고리 <span class="required">*</span></span>
            </div>
            <div class="category-grid">
              <button
                v-for="cat in categoryOptions" :key="cat.value"
                type="button"
                @click="formData.categoryType = cat.value"
                :class="['cat-btn', formData.categoryType === cat.value && 'cat-btn--on']"
              >{{ cat.label }}</button>
            </div>
            <p v-if="errors.categoryType" class="field-error">{{ errors.categoryType }}</p>
          </div>

          <!-- 04 활동 지역 -->
          <div class="card">
            <div class="card-label-row">
              <span class="card-num">04</span>
              <span class="card-title">활동 지역 <span class="required">*</span></span>
            </div>
            <div class="scroll-chips">
              <button
                v-for="r in regions" :key="r.value"
                type="button"
                @click="selectRegion(r.value)"
                :class="['chip', formData.region === r.value && 'chip--on']"
              >{{ r.label }}</button>
            </div>
            <p v-if="errors.region" class="field-error">{{ errors.region }}</p>

            <template v-if="formData.region">
              <div class="sub-label">{{ formData.region }} 구/시/군</div>
              <div class="scroll-chips">
                <button
                  type="button"
                  @click="formData.district = ''"
                  :class="['chip chip--sm', formData.district === '' && 'chip--on']"
                >전체</button>
                <button
                  v-for="d in districtOptions" :key="d"
                  type="button"
                  @click="formData.district = d"
                  :class="['chip chip--sm', formData.district === d && 'chip--on']"
                >{{ d }}</button>
              </div>
            </template>
          </div>

          <!-- 05 크루 소개 -->
          <div class="card">
            <div class="card-label-row">
              <span class="card-num">05</span>
              <span class="card-title">크루 소개 <span class="required">*</span></span>
            </div>
            <div class="ta-wrap">
              <textarea
                rows="5"
                maxlength="255"
                placeholder="크루를 소개해주세요"
                :value="formData.description"
                @input="formData.description = ($event.target.value || '').slice(0, 255)"
                :class="['styled-ta', errors.description && 'input-err']"
              />
              <span class="ta-cnt">{{ formData.description.length }}/255</span>
            </div>
            <p v-if="errors.description" class="field-error">{{ errors.description }}</p>
          </div>

          <!-- 06 최대 정원 -->
          <div class="card">
            <div class="card-label-row">
              <span class="card-num">06</span>
              <span class="card-title">최대 정원 <span class="required">*</span></span>
            </div>
            <div class="member-row">
              <div class="stepper">
                <button type="button" class="step-btn" @click="dec" :disabled="formData.maxMembers <= minMaxMembers">
                  <svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" style="width:13px;height:13px;">
                    <path stroke-linecap="round" d="M5 12h14"/>
                  </svg>
                </button>
                <div class="step-display">
                  <input
                    type="number"
                    :min="minMaxMembers"
                    max="500"
                    v-model.number="formData.maxMembers"
                    :class="['step-input', errors.maxMembers && 'input-err']"
                  />
                  <span class="step-unit">명</span>
                </div>
                <button type="button" class="step-btn" @click="inc" :disabled="formData.maxMembers >= 500">
                  <svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" style="width:13px;height:13px;">
                    <path stroke-linecap="round" d="M12 5v14M5 12h14"/>
                  </svg>
                </button>
              </div>
              <div class="presets">
                <button
                  v-for="n in presetMaxMembers"
                  :key="n"
                  type="button"
                  @click="formData.maxMembers = n"
                  :class="['preset', formData.maxMembers === n && 'preset-on']"
                  :disabled="n < formData.currentMemberCount"
                >
                  {{ n }}명
                </button>
              </div>
            </div>
            <p class="field-hint">현재 인원: {{ formData.currentMemberCount }}명</p>
            <p v-if="errors.maxMembers" class="field-error">{{ errors.maxMembers }}</p>
          </div>

          <!-- 버튼 영역 -->
          <div class="bottom-actions">
            <button type="button" @click="goBack" class="btn-cancel">취소</button>
            <button type="button" @click="handleSubmit" :disabled="isSaving" class="btn-save">
              <span v-if="isSaving" class="btn-spinner"></span>
              <span v-else>수정 완료</span>
            </button>
          </div>

        </div>
      </template>
    </main>
  </div>
</template>

<script>
import axios from 'axios'
import LnbMenuComponent from '@/components/common/LnbMenuComponent.vue'

const API = axios.create({ baseURL: process.env.VUE_APP_API_BASE_URL })
API.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

const LNB_CATEGORY_OPTIONS = [
  { label: '운동/스포츠', value: 'SPORT' }, { label: '독서', value: 'BOOK' },
  { label: '요리/제조', value: 'COOK' }, { label: '취미/DIY', value: 'DIY' },
  { label: '여행', value: 'TRAVEL' }, { label: '어학', value: 'LANGUAGE' },
  { label: '자동차', value: 'CAR' }, { label: '게임/오락', value: 'GAME' },
  { label: '문화/공연', value: 'CULTURE' }, { label: '반려동물', value: 'PET' },
]

const CATEGORY_OPTIONS = [
  { label: '운동', value: 'SPORT' }, { label: '독서', value: 'BOOK' },
  { label: '요리', value: 'COOK' }, { label: '취미', value: 'DIY' },
  { label: '여행', value: 'TRAVEL' }, { label: '어학', value: 'LANGUAGE' },
  { label: '자동차', value: 'CAR' }, { label: '게임', value: 'GAME' },
  { label: '문화', value: 'CULTURE' }, { label: '펫', value: 'PET' },
]

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

const DISTRICTS_BY_REGION = {
  서울: ['강남구','강동구','강북구','강서구','관악구','광진구','구로구','금천구','노원구','도봉구','동대문구','동작구','마포구','서대문구','서초구','성동구','성북구','송파구','양천구','영등포구','용산구','은평구','종로구','중구','중랑구'],
  부산: ['강서구','금정구','기장군','남구','동구','동래구','부산진구','북구','사상구','사하구','서구','수영구','연제구','영도구','중구','해운대구'],
  대구: ['남구','달서구','달성군','동구','북구','서구','수성구','중구','군위군'],
  인천: ['계양구','미추홀구','남동구','동구','부평구','서구','연수구','중구','강화군','옹진군'],
  광주: ['광산구','남구','동구','북구','서구'],
  대전: ['대덕구','동구','서구','유성구','중구'],
  울산: ['남구','동구','북구','중구','울주군'],
  세종: ['조치원읍','연기면','연동면','부강면','금남면','장군면','연서면','전의면','전동면','소정면'],
  경기: ['수원시','성남시','용인시','고양시','화성시','부천시','남양주시','안산시','안양시','평택시','시흥시','김포시','파주시','의정부시','광주시','하남시','광명시','군포시','오산시','이천시','안성시','구리시','양주시','포천시','의왕시','여주시','동두천시','과천시','가평군','양평군','연천군'],
  강원: ['춘천시','원주시','강릉시','동해시','태백시','속초시','삼척시','홍천군','횡성군','영월군','평창군','정선군','철원군','화천군','양구군','인제군','고성군','양양군'],
  충북: ['청주시','충주시','제천시','보은군','옥천군','영동군','증평군','진천군','괴산군','음성군','단양군'],
  충남: ['천안시','공주시','보령시','아산시','서산시','논산시','계룡시','당진시','금산군','부여군','서천군','청양군','홍성군','예산군','태안군'],
  전북: ['전주시','군산시','익산시','정읍시','남원시','김제시','완주군','진안군','무주군','장수군','임실군','순창군','고창군','부안군'],
  전남: ['목포시','여수시','순천시','나주시','광양시','담양군','곡성군','구례군','고흥군','보성군','화순군','장흥군','강진군','해남군','영암군','무안군','함평군','영광군','장성군','완도군','진도군','신안군'],
  경북: ['포항시','경주시','김천시','안동시','구미시','영주시','영천시','상주시','문경시','경산시','의성군','청송군','영양군','영덕군','청도군','고령군','성주군','칠곡군','예천군','봉화군','울진군','울릉군'],
  경남: ['창원시','진주시','통영시','사천시','김해시','밀양시','거제시','양산시','의령군','함안군','창녕군','고성군','남해군','하동군','산청군','함양군','거창군','합천군'],
  제주: ['제주시','서귀포시'],
}

export default {
  name: 'CrewEditPageComponent',
  components: { LnbMenuComponent },
  props: {
    onNavigate: { type: Function, default: null },
  },
  data() {
    return {
      isLoading: true,
      isSaving: false,
      isInitialLoad: true,
      errorMessage: '',
      showSuccessMessage: false,
      crewId: null,
      lnbCategoryOptions: LNB_CATEGORY_OPTIONS,
      categoryOptions: CATEGORY_OPTIONS,
      regions: REGIONS,
      formData: {
        crewName: '',
        categoryType: '',
        region: '',
        district: '',
        description: '',
        maxMembers: 0,
        currentMemberCount: 0,
        newImage: null,
      },
      previewImage: null,
      errors: {},
    }
  },
  computed: {
    districtOptions() {
      return DISTRICTS_BY_REGION[this.formData.region] || []
    },
    minMaxMembers() {
      return Math.max(2, this.formData.currentMemberCount || 0)
    },
    presetMaxMembers() {
      return [10, 20, 30, 50, 100, 200]
    },
  },
  watch: {
    'formData.region'() {
      if (this.isInitialLoad) {
        this.isInitialLoad = false
        return
      }
      this.formData.district = ''
    },
  },
  async created() {
    const paramId = this.$route?.params?.id
    this.crewId = paramId ? Number(paramId) : null
    if (this.crewId) await this.fetchCrewInfo()
    this.isLoading = false
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
    goBack() {
      if (this.onNavigate) {
        this.onNavigate('crew-detail')
      } else {
        const id = this.$route?.params?.id
        if (id) this.$router.push(`/crew/${id}`)
        else this.$router.back()
      }
    },
    selectRegion(value) {
      this.formData.region = value
    },
    inc() {
      if (this.formData.maxMembers < 500) this.formData.maxMembers++
    },
    dec() {
      if (this.formData.maxMembers > this.minMaxMembers) this.formData.maxMembers--
    },
    async fetchCrewInfo() {
      try {
        const res = await API.get(`/crew/${this.crewId}`)
        const d = res.data
        this.formData = {
          crewName:           d.crewName ?? '',
          categoryType:       d.categoryType ?? '',
          region:             d.region ?? '',
          district:           d.district ?? '',
          description:        d.description ?? '',
          maxMembers:         d.maxMembers ?? 0,
          currentMemberCount: d.currentMemberCount ?? 0,
          newImage:           null,
        }
        this.previewImage = d.crewImage ?? null
      } catch (e) {
        console.error('크루 정보 조회 실패:', e)
        this.errorMessage = '크루 정보를 불러오는 데 실패했습니다.'
      }
    },
    handleImageChange(e) {
      const file = e.target.files?.[0]
      if (!file) return
      if (file.size > 5 * 1024 * 1024) {
        this.errors = { ...this.errors, image: '이미지 크기는 5MB 이하여야 합니다' }
        return
      }
      this.formData.newImage = file
      const reader = new FileReader()
      reader.onloadend = () => { this.previewImage = reader.result }
      reader.readAsDataURL(file)
      const ne = { ...this.errors }
      delete ne.image
      this.errors = ne
    },
    validateForm() {
      const newErrors = {}
      if (!this.formData.crewName) newErrors.crewName = '크루명을 입력해주세요'
      else if (this.formData.crewName.length < 2) newErrors.crewName = '크루명은 2자 이상이어야 합니다'
      if (!this.formData.categoryType) newErrors.categoryType = '카테고리를 선택해주세요'
      if (!this.formData.region) newErrors.region = '활동지역을 선택해주세요'
      if (!this.formData.description) newErrors.description = '크루 설명을 입력해주세요'
      if (!this.formData.maxMembers || this.formData.maxMembers < this.formData.currentMemberCount) {
        newErrors.maxMembers = `최대 정원은 현재 인원(${this.formData.currentMemberCount}명) 이상이어야 합니다`
      } else if (this.formData.maxMembers > 500) {
        newErrors.maxMembers = '최대 500명까지 입력 가능합니다'
      }
      this.errors = newErrors
      return Object.keys(newErrors).length === 0
    },
    async handleSubmit() {
      if (!this.validateForm()) return
      this.isSaving = true
      try {
        let crewImageUrl = null
        if (this.formData.newImage) {
          const file = this.formData.newImage
          const presignedRes = await API.get('/crew/presigned-url', { params: { fileName: file.name } })
          const presignedUrl = presignedRes.data
          await fetch(presignedUrl, { method: 'PUT', body: file })
          crewImageUrl = presignedUrl.split('?')[0]
        }

        await API.patch('/crew/update', {
          crewId:       this.crewId,
          crewName:     (this.formData.crewName || '').slice(0, 50),
          categoryType: this.formData.categoryType,
          region:       this.formData.region,
          district:     (this.formData.district || '').slice(0, 50) || null,
          description:  (this.formData.description || '').slice(0, 255),
          maxMembers:   this.formData.maxMembers,
          crewImage:    crewImageUrl
        })

        this.showSuccessMessage = true
        setTimeout(() => {
          this.showSuccessMessage = false
          this.goBack()
        }, 2000)
      } catch (e) {
        console.error('크루 수정 실패:', e)
        this.errorMessage = e.response?.data?.error_message || '크루 수정에 실패했습니다.'
        setTimeout(() => { this.errorMessage = '' }, 3000)
      } finally {
        this.isSaving = false
      }
    },
  },
}
</script>

<style scoped>
.page-root.crew-edit-root {
  display: flex; min-height: 100vh; width: 100%;
  background: #f5f7fa;
  font-family: "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
}
.crew-edit-main { flex: 1; min-width: 0; overflow-y: auto; padding: 32px 36px 80px; }
.edit-wrap { max-width: 720px; margin: 0 auto; }

.page-head { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.4px; margin: 0; }
.title-accent { color: #0EA5E9; }

.loading-screen { display: flex; justify-content: center; align-items: center; min-height: 60vh; }
.spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #4FA8D8; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.toast { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 999; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; white-space: nowrap; box-shadow: 0 4px 20px rgba(0,0,0,0.15); display: inline-flex; align-items: center; gap: 6px; }
.toast--success { background: #22c55e; color: #fff; }
.toast--error   { background: #ef4444; color: #fff; }

/* 카드 */
.card { background: #fff; border-radius: 16px; border: 1px solid #e8e8e8; padding: 22px 26px; margin-bottom: 10px; }
.card-label-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.card-num { font-size: 11px; font-weight: 900; color: #4FA8D8; background: #EBF6FC; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.3px; flex-shrink: 0; }
.card-title { font-size: 14.5px; font-weight: 800; color: #0f172a; }
.required { color: #ef4444; font-size: 13px; }

/* 이미지 (카드 전체 너비) */
.image-preview { position: relative; width: 100%; border-radius: 12px; overflow: hidden; border: 2px solid #e8e8e8; margin-bottom: 4px; }
.image-preview--fill { aspect-ratio: 16/9; }
.preview-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.image-preview-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0); display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
.image-preview:hover .image-preview-overlay { background: rgba(0,0,0,0.4); }
.btn-upload { display: inline-block; padding: 9px 18px; background: linear-gradient(135deg, #4FA8D8, #0EA5E9); color: #fff; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: filter 0.15s; }
.btn-upload:hover { filter: brightness(1.05); }
.btn-upload--overlay { opacity: 0; transition: opacity 0.2s; }
.image-preview:hover .btn-upload--overlay { opacity: 1; }
.image-drop { cursor: pointer; display: block; width: 100%; }
.image-drop-inner { width: 100%; border: 2px dashed #BAE6FD; border-radius: 12px; background: #E7F3FF; padding: 44px 24px; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: all 0.18s; min-height: 140px; box-sizing: border-box; }
.image-drop:hover .image-drop-inner { border-color: #4FA8D8; background: #E7F3FF; }
.preview-icon { display: inline-flex; align-items: center; justify-content: center; opacity: 0.6; }
.cep-icon { width: 1em; height: 1em; flex-shrink: 0; }
.cep-icon--camera { width: 32px; height: 32px; color: #0369a1; }
.preview-hint { font-size: 14px; font-weight: 700; color: #0369a1; }
.image-hint { font-size: 12px; color: #7ab8d8; }

/* 폼 */
.field-input { width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; color: #0f172a; font-family: inherit; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
.field-input:focus { border-color: #4FA8D8; }
.field-input--error { border-color: #ef4444 !important; }
.field-textarea { width: 100%; padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; color: #0f172a; font-family: inherit; outline: none; resize: none; transition: border-color 0.15s; box-sizing: border-box; }
.field-textarea:focus { border-color: #4FA8D8; }
.field-hint  { font-size: 12px; color: #94a3b8; margin-top: 6px; }
.field-error { font-size: 12px; color: #ef4444; margin-top: 4px; }

/* 05 크루 소개 (텍스트에리어 + 글자수) */
.ta-wrap { position: relative; display: block; }
.styled-ta { width: 100%; padding: 12px 13px 32px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: 14px; color: #0f172a; background: #fafbfc; resize: none; outline: none; line-height: 1.7; transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; font-family: inherit; }
.styled-ta:focus { border-color: #4FA8D8; box-shadow: 0 0 0 3px rgba(79,168,216,0.1); background: #fff; }
.styled-ta.input-err { border-color: #F87171; }
.ta-cnt { position: absolute; right: 12px; bottom: 10px; font-size: 11.5px; color: #cbd5e1; pointer-events: none; font-weight: 600; }

/* 06 최대 정원 (스테퍼 + 프리셋) */
.member-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.stepper { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.step-btn { width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid #e2e8f0; background: #fff; display: inline-flex; align-items: center; justify-content: center; color: #475569; cursor: pointer; transition: all 0.12s; flex-shrink: 0; }
.step-btn:hover:not(:disabled) { border-color: #4FA8D8; color: #4FA8D8; background: #f0f9ff; }
.step-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.step-display { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.step-input { width: 64px; text-align: center; padding: 6px 4px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: 19px; font-weight: 900; color: #0f172a; background: #fafbfc; outline: none; box-sizing: border-box; }
.step-input:focus { border-color: #4FA8D8; background: #fff; }
.step-input::-webkit-inner-spin-button, .step-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.step-input.input-err { border-color: #F87171; }
.step-unit { font-size: 13.5px; font-weight: 700; color: #64748b; white-space: nowrap; }
.presets { display: flex; gap: 5px; flex-wrap: wrap; align-items: center; }
.preset { padding: 5px 12px; border-radius: 18px; border: 1.5px solid #e2e8f0; background: #fafbfc; font-size: 12px; font-weight: 700; color: #475569; cursor: pointer; transition: all 0.12s; font-family: inherit; }
.preset:hover:not(:disabled) { border-color: #4FA8D8; color: #4FA8D8; }
.preset:disabled { opacity: 0.5; cursor: not-allowed; }
.preset-on { background: #4FA8D8; color: #fff; border-color: #4FA8D8; }

/* 카테고리 */
.category-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.cat-btn { padding: 10px 4px; border-radius: 10px; font-size: 13px; font-weight: 600; border: 1.5px solid #e2e8f0; background: #fafbfc; color: #64748b; cursor: pointer; transition: all 0.15s; }
.cat-btn:hover { border-color: #4FA8D8; color: #4FA8D8; }
.cat-btn--on { border-color: #4FA8D8; background: #EBF6FC; color: #4FA8D8; }

/* 지역 칩 */
.scroll-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 4px; }
.chip { padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; border: 1.5px solid #e2e8f0; background: #fafbfc; color: #64748b; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
.chip:hover { border-color: #4FA8D8; color: #4FA8D8; }
.chip--on { background: #0f172a; border-color: #0f172a; color: #fff; }
.chip--sm { padding: 6px 12px; font-size: 12px; }
.chip--sm.chip--on { background: #4FA8D8; border-color: #4FA8D8; }
.sub-label { font-size: 13px; font-weight: 700; color: #64748b; margin: 14px 0 8px; }

/* 버튼 */
.bottom-actions { display: flex; gap: 12px; margin-top: 10px; background: #fff; border-radius: 16px; border: 1px solid #e8e8e8; padding: 18px 26px; }
.btn-cancel { flex: 1; padding: 11px; border: 1.5px solid #e2e8f0; background: #fff; border-radius: 10px; font-size: 14px; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.15s; }
.btn-cancel:hover { background: #f8fafc; }
.btn-save { flex: 2; padding: 11px; background: linear-gradient(135deg, #4FA8D8, #0EA5E9); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: filter 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; }
.btn-save:hover:not(:disabled) { filter: brightness(1.05); }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }

.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
</style>

