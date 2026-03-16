<template>
  <div class="min-h-screen bg-white flex items-center justify-center p-4">
    <div class="w-full max-w-md">

      <!-- 로고 -->
      <div class="text-center mb-12">
        <div class="flex items-center justify-center gap-2 mb-2 cursor-pointer"
            @click="$router.push('/')">
          <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2">
            <LogoComponent class-name="w-full h-full" type="default" />
          </div>
          <h1 class="text-3xl font-bold text-gray-900">모인</h1>
        </div>
        <p class="text-gray-500">우리 동네 취미 모임 플랫폼</p>
      </div>

      <!-- 회원가입 폼 -->
      <div class="bg-white rounded-2xl border border-gray-200 p-8">

        <!-- 헤더 -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <button
              @click="step === 1 ? $router.push('/login') : step = 1"
              class="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path fill-rule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/>
              </svg>
            </button>
            <h2 class="text-2xl font-bold text-gray-900">회원가입</h2>
          </div>
          <div class="text-sm text-gray-500">{{ step }}/2</div>
        </div>

        <!-- 단계 표시 -->
        <div class="flex gap-2 mb-8">
          <div :class="['flex-1 h-2 rounded-full', step >= 1 ? 'bg-[#4FA8D8]' : 'bg-gray-200']" />
          <div :class="['flex-1 h-2 rounded-full', step >= 2 ? 'bg-[#4FA8D8]' : 'bg-gray-200']" />
        </div>

        <!-- Step 1: 기본 정보 -->
        <form v-if="step === 1" @submit.prevent="handleNext" class="space-y-5">

          <!-- 이메일 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">이메일 <span class="text-red-500">*</span></label>
            <div class="flex gap-2">
              <input
                type="email"
                placeholder="example@email.com"
                v-model="formData.email"
                :disabled="emailVerified"
                :class="['flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FA8D8]',
                  errors.email ? 'border-red-500' : emailVerified ? 'border-green-500' : 'border-gray-300']"
              />
              <button
                v-if="!emailVerified"
                type="button"
                @click="sendVerificationEmail"
                :disabled="emailSending"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium whitespace-nowrap disabled:opacity-50"
              >
                {{ emailSending ? '발송중...' : '인증' }}
              </button>
            </div>
            <p v-if="errors.email" class="text-sm text-red-500 mt-1">{{ errors.email }}</p>
            <p v-if="emailVerified" class="text-sm text-green-600 mt-1">✓ 인증 완료</p>
          </div>

          <!-- 인증번호 -->
          <div v-if="showVerification && !emailVerified">
            <label class="block text-sm font-medium text-gray-700 mb-2">인증번호</label>
            <div class="flex gap-2">
              <input
                type="text"
                placeholder="6자리 인증번호"
                v-model="verificationCode"
                maxlength="6"
                :class="['flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FA8D8]',
                  errors.code ? 'border-red-500' : 'border-gray-300']"
              />
              <button
                type="button"
                @click="verifyEmail"
                :disabled="verifying"
                class="px-4 py-2 bg-[#4FA8D8] text-white rounded-lg hover:bg-[#3A8FC0] text-sm font-medium disabled:opacity-50"
              >
                {{ verifying ? '확인중...' : '확인' }}
              </button>
            </div>
            <p v-if="errors.code" class="text-sm text-red-500 mt-1">{{ errors.code }}</p>
          </div>

          <!-- 비밀번호 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 <span class="text-red-500">*</span></label>
            <input
              type="password"
              placeholder="영문, 숫자, 특수문자 포함 8~16자"
              v-model="formData.password"
              :class="['w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FA8D8]',
                errors.password ? 'border-red-500' : 'border-gray-300']"
            />
            <p v-if="errors.password" class="text-sm text-red-500 mt-1">{{ errors.password }}</p>
          </div>

          <!-- 비밀번호 확인 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인 <span class="text-red-500">*</span></label>
            <input
              type="password"
              placeholder="비밀번호를 다시 입력해주세요"
              v-model="formData.passwordConfirm"
              :class="['w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FA8D8]',
                errors.passwordConfirm ? 'border-red-500' : 'border-gray-300']"
            />
            <p v-if="errors.passwordConfirm" class="text-sm text-red-500 mt-1">{{ errors.passwordConfirm }}</p>
          </div>

          <!-- 닉네임 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">닉네임 <span class="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="닉네임을 입력하세요"
              v-model="formData.nickname"
              :class="['w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FA8D8]',
                errors.nickname ? 'border-red-500' : 'border-gray-300']"
            />
            <p v-if="errors.nickname" class="text-sm text-red-500 mt-1">{{ errors.nickname }}</p>
          </div>

          <button
            type="submit"
            class="w-full py-3 bg-[#4FA8D8] hover:bg-[#3A8FC0] text-white font-medium rounded-lg transition-colors"
          >다음</button>
        </form>

        <!-- Step 2: 추가 정보 -->
        <form v-if="step === 2" @submit.prevent="handleSubmit" class="space-y-5">

          <!-- 프로필 이미지 (맨 위) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">프로필 이미지 (선택)</label>
            <div class="flex items-center gap-4">
              <div class="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                <img v-if="previewImage" :src="previewImage" alt="프로필" class="w-full h-full object-cover" />
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="36" height="36" style="color:#9ca3af;">
                  <path fill-rule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-2.388 2.388-1.06-1.061a1.5 1.5 0 0 0-2.122 0L3 16.061zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div>
                <label for="profileImage" class="cursor-pointer">
                  <div class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors inline-block text-sm font-medium">
                    이미지 선택
                  </div>
                  <input id="profileImage" type="file" accept="image/*" @change="handleImageChange" class="hidden" />
                </label>
                <p class="text-xs text-gray-500 mt-1">JPG, PNG (최대 5MB)</p>
              </div>
            </div>
          </div>

          <!-- 성별 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">성별 <span class="text-red-500">*</span></label>
            <div class="flex gap-3">
              <button
                v-for="option in genderOptions"
                :key="option.value"
                type="button"
                @click="formData.gender = option.value"
                :class="['flex-1 py-3 rounded-lg border-2 transition-all',
                  formData.gender === option.value
                    ? 'border-[#4FA8D8] bg-sky-50 text-[#4FA8D8] font-medium'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400']"
              >{{ option.label }}</button>
            </div>
            <p v-if="errors.gender" class="text-sm text-red-500 mt-1">{{ errors.gender }}</p>
          </div>

          <!-- 생년월일 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">생년월일 <span class="text-red-500">*</span></label>
            <input
              type="date"
              v-model="formData.birthDate"
              :max="maxBirthDate"
              :class="['w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FA8D8]',
                errors.birthDate ? 'border-red-500' : 'border-gray-300']"
            />
            <p v-if="errors.birthDate" class="text-sm text-red-500 mt-1">{{ errors.birthDate }}</p>
          </div>

          <!-- MBTI -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">MBTI <span class="text-red-500">*</span></label>
            <div class="region-wrap" @click="mbtiDropOpen = !mbtiDropOpen" ref="mbtiDrop">
              <span :class="formData.mbti ? 'text-gray-800' : 'text-gray-400'">
                {{ formData.mbti || 'MBTI 선택' }}
              </span>
              <span class="region-arrow" :class="{ 'rotate-180': mbtiDropOpen }">▾</span>
              <div v-if="mbtiDropOpen" class="region-dropdown">
                <div
                  v-for="m in mbtiTypes" :key="m"
                  class="region-dropdown-item"
                  :class="{ active: formData.mbti === m }"
                  @click.stop="selectMbti(m)"
                >{{ m }}</div>
              </div>
            </div>
            <p v-if="errors.mbti" class="text-sm text-red-500 mt-1">{{ errors.mbti }}</p>
          </div>

          <!-- 활동 지역 -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">도시</label>
              <div class="region-wrap" @click="regionDropOpen = !regionDropOpen" ref="regionDrop">
                <span :class="formData.city ? 'text-gray-800' : 'text-gray-400'">
                  {{ formData.city || '도시 선택' }}
                </span>
                <span class="region-arrow" :class="{ 'rotate-180': regionDropOpen }">▾</span>
                <div v-if="regionDropOpen" class="region-dropdown">
                  <div class="region-dropdown-item" :class="{ active: !formData.city }" @click.stop="selectRegion('')">선택 안 함</div>
                  <div
                    v-for="r in regions" :key="r.value"
                    class="region-dropdown-item"
                    :class="{ active: formData.city === r.value }"
                    @click.stop="selectRegion(r.value)"
                  >{{ r.label }}</div>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">구</label>
              <div
                class="region-wrap"
                :class="{ 'region-wrap--disabled': !formData.city }"
                @click="formData.city && (districtDropOpen = !districtDropOpen)"
                ref="districtDrop"
              >
                <span :class="formData.street ? 'text-gray-800' : 'text-gray-400'">
                  {{ formData.street || (formData.city ? '구 선택' : '도시 먼저 선택') }}
                </span>
                <span class="region-arrow" :class="{ 'rotate-180': districtDropOpen }">▾</span>
                <div v-if="districtDropOpen" class="region-dropdown">
                  <div class="region-dropdown-item" :class="{ active: !formData.street }" @click.stop="selectDistrict('')">선택 안 함</div>
                  <div
                    v-for="d in districtOptions" :key="d"
                    class="region-dropdown-item"
                    :class="{ active: formData.street === d }"
                    @click.stop="selectDistrict(d)"
                  >{{ d }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 동·읍·면 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">동·읍·면</label>
            <DongSearchInput
              v-model="formData.dong"
              :city-filter="formData.city"
              :district-filter="formData.street"
              placeholder="예: 역삼동, 서초동"
              @select="onDongSelect"
            />
          </div>

          <!-- 관심 카테고리 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">관심 카테고리 (중복 선택 가능)</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="cat in categoryOptions"
                :key="cat.value"
                type="button"
                @click="toggleCategory(cat.value)"
                :class="['py-2 px-3 rounded-lg text-sm border-2 transition-all',
                  formData.categories.includes(cat.value)
                    ? 'border-[#4FA8D8] bg-sky-50 text-[#4FA8D8] font-medium'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400']"
              >{{ cat.label }}</button>
            </div>
          </div>

          <!-- 서버 에러 -->
          <p v-if="serverError" class="text-sm text-red-500 text-center">{{ serverError }}</p>

          <!-- 이전/완료 버튼 -->
          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="step = 1"
              class="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >이전</button>
            <button
              type="submit"
              :disabled="submitting"
              class="flex-1 py-3 bg-[#4FA8D8] hover:bg-[#3A8FC0] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >{{ submitting ? '처리중...' : '회원가입 완료' }}</button>
          </div>
        </form>

        <!-- 로그인 링크 -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            이미 계정이 있으신가요?
            <button @click="$router.push('/login')" class="text-[#4FA8D8] font-medium hover:underline ml-1">
              로그인
            </button>
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import DongSearchInput from './DongSearchInput.vue'
import LogoComponent from './LogoComponent.vue'

const API = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL
})

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

export default {
  name: 'SignupPageComponent',
  components: { DongSearchInput, LogoComponent },
  inject: ['handleLogin'],
  data() {
    return {
      step: 1,
      formData: {
        email: '',
        password: '',
        passwordConfirm: '',
        nickname: '',
        city: '',
        street: '',
        dong: '',
        mbti: '',
        birthDate: '',
        gender: '',
        categories: [],
        profileImageFile: null
      },
      errors: {},
      serverError: '',

      emailVerified: false,
      verificationCode: '',
      showVerification: false,
      emailSending: false,
      verifying: false,

      submitting: false,
      previewImage: null,

      regionDropOpen: false,
      districtDropOpen: false,
      mbtiDropOpen: false,
      outsideClickHandler: null,

      regions: REGIONS,

      genderOptions: [
        { label: '남성', value: 'MALE' },
        { label: '여성', value: 'FEMALE' }
      ],
      categoryOptions: [
        { label: '운동', value: 'SPORT' },
        { label: '독서', value: 'BOOK' },
        { label: '요리', value: 'COOK' },
        { label: '취미', value: 'DIY' },
        { label: '여행', value: 'TRAVEL' },
        { label: '어학', value: 'LANGUAGE' },
        { label: '자동차', value: 'CAR' },
        { label: '게임', value: 'GAME' },
        { label: '문화', value: 'CULTURE' },
        { label: '펫', value: 'PET' }
      ],
      mbtiTypes: ['ISTJ','ISFJ','INFJ','INTJ','ISTP','ISFP','INFP','INTP','ESTP','ESFP','ENFP','ENTP','ESTJ','ESFJ','ENFJ','ENTJ'],
    }
  },
  computed: {
    districtOptions() {
      return DISTRICTS_BY_REGION[this.formData.city] || []
    },
    // 생년월일: 오늘 이전만 선택 가능 (date input max)
    maxBirthDate() {
      return new Date().toISOString().slice(0, 10)
    }
  },
  watch: {
    'formData.city'() {
      this.formData.street = ''
      this.districtDropOpen = false
    }
  },
  mounted() {
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
    selectRegion(value) {
      this.formData.city = value
      this.formData.street = ''
      this.regionDropOpen = false
    },
    selectDistrict(value) {
      this.formData.street = value
      this.districtDropOpen = false
    },
    selectMbti(value) {
      this.formData.mbti = value
      this.mbtiDropOpen = false
    },
    onDongSelect(item) {
      if (!this.formData.city)   this.formData.city   = item.city
      if (!this.formData.street) this.formData.street = item.district
      this.formData.dong = item.dong
    },

    // 이미지 선택 시 미리보기만 저장 — S3 업로드 안 함
    handleImageChange(e) {
      const file = e.target.files?.[0]
      if (file) {
        this.formData.profileImageFile = file
        const reader = new FileReader()
        reader.onloadend = () => { this.previewImage = reader.result }
        reader.readAsDataURL(file)
      }
    },

    toggleCategory(value) {
      if (this.formData.categories.includes(value)) {
        this.formData.categories = this.formData.categories.filter(c => c !== value)
      } else {
        this.formData.categories = [...this.formData.categories, value]
      }
    },

    async sendVerificationEmail() {
      if (!this.formData.email) { this.errors = { email: '이메일을 입력해주세요' }; return }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
        this.errors = { email: '올바른 이메일 형식이 아닙니다' }; return
      }
      this.emailSending = true
      this.errors = {}
      try {
        await API.post('/user/send-code-signup', { email: this.formData.email })
        this.showVerification = true
      } catch (e) {
        const data = e.response?.data
        const msg = typeof data === 'string' ? data : (data?.message ?? '이미 존재하는 이메일입니다.')
        this.errors = { email: msg }
      } finally {
        this.emailSending = false
      }
    },

    async verifyEmail() {
      if (!this.verificationCode) { this.errors = { code: '인증번호를 입력해주세요' }; return }
      this.verifying = true
      this.errors = {}
      try {
        await API.post('/user/verify-code', {
          email: this.formData.email,
          code: this.verificationCode
        })
        this.emailVerified = true
        this.showVerification = false
      } catch (e) {
        this.errors = { code: e.response?.data || '인증번호가 일치하지 않거나 만료되었습니다.' }
      } finally {
        this.verifying = false
      }
    },

    validateStep1() {
      const newErrors = {}
      if (!this.formData.email) newErrors.email = '이메일을 입력해주세요'
      else if (!this.emailVerified) newErrors.email = '이메일 인증을 완료해주세요'
      if (!this.formData.password) newErrors.password = '비밀번호를 입력해주세요'
      else if (!/(?=.*[0-9])(?=.*[a-zA-Z])(?=.*\W)(?=\S+$).{8,16}/.test(this.formData.password))
        newErrors.password = '비밀번호는 8~16자 영문, 숫자, 특수문자를 포함해야 합니다'
      if (!this.formData.passwordConfirm) newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요'
      else if (this.formData.password !== this.formData.passwordConfirm) newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다'
      if (!this.formData.nickname) newErrors.nickname = '닉네임을 입력해주세요'
      else if (this.formData.nickname.length < 2) newErrors.nickname = '닉네임은 2자 이상이어야 합니다'
      this.errors = newErrors
      return Object.keys(newErrors).length === 0
    },

    // gender / mbti / birthDate 필수 검증
    validateStep2() {
      const newErrors = {}
      if (!this.formData.gender)    newErrors.gender    = '성별을 선택해주세요'
      if (!this.formData.mbti)      newErrors.mbti      = 'MBTI를 선택해주세요'
      if (!this.formData.birthDate) newErrors.birthDate = '생년월일을 입력해주세요'
      else if (this.formData.birthDate > this.maxBirthDate) newErrors.birthDate = '생년월일은 오늘 이전으로 선택해주세요.'
      this.errors = newErrors
      return Object.keys(newErrors).length === 0
    },

    handleNext() {
      if (this.validateStep1()) this.step = 2
    },

    // 회원가입 버튼 클릭 시 모든 처리 (이미지 S3 업로드 + DTO 전송) 한 번에
    async handleSubmit() {
      if (!this.validateStep2()) return

      this.submitting = true
      this.serverError = ''

      try {
        // 1. 이미지 업로드 (선택한 경우에만)
        let profileImageUrl = null
        if (this.formData.profileImageFile) {
          const file = this.formData.profileImageFile

          // presigned URL 발급
          const presignedRes = await API.get('/user/presigned-url', {
            params: { fileName: file.name }
          })
          const presignedUrl = presignedRes.data

          // S3에 직접 PUT 업로드
          await axios.put(presignedUrl, file, {
            headers: { 'Content-Type': file.type }
          })

          // 쿼리스트링 제거한 순수 파일 URL
          profileImageUrl = presignedUrl.split('?')[0]
        }

        // 2. 회원가입 DTO 전송
        const dto = {
          email:        this.formData.email,
          password:     this.formData.password,
          nickname:     this.formData.nickname,
          city:         this.formData.city     || null,
          district:     this.formData.street   || null,
          street:       this.formData.dong     || null,
          mbti:         this.formData.mbti,
          birthDate:    this.formData.birthDate,
          gender:       this.formData.gender,
          categories:   this.formData.categories,
          profileImage: profileImageUrl
        }

        await API.post('/user/create', dto, {
          headers: { 'Content-Type': 'application/json' }
        })

        this.$router.push('/login')
      } catch (e) {
        const errorMsg = e.response?.data?.error_message
          || e.response?.data
          || '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.'

        if (typeof errorMsg === 'string' && errorMsg.includes('이미 존재하는 이메일')) {
          this.step = 1
          this.errors = { email: errorMsg }
          this.emailVerified = false
        } else {
          this.serverError = typeof errorMsg === 'string' ? errorMsg : '회원가입 중 오류가 발생했습니다.'
        }
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.region-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.region-wrap:hover { border-color: #4FA8D8; }
.region-wrap:focus-within {
  border-color: #4FA8D8;
  box-shadow: 0 0 0 2px rgba(79, 168, 216, 0.25);
}
.region-arrow {
  font-size: 11px;
  color: #9ca3af;
  transition: transform 0.2s;
  flex-shrink: 0;
}
.region-arrow.rotate-180 { transform: rotate(180deg); }
.region-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  max-height: 220px;
  overflow-y: auto;
  z-index: 200;
  padding: 6px 0;
}
.region-dropdown-item {
  padding: 9px 16px;
  font-size: 13.5px;
  color: #374151;
  cursor: pointer;
  transition: background 0.1s;
}
.region-dropdown-item:hover { background: #EBF6FC; color: #4FA8D8; }
.region-dropdown-item.active { font-weight: 700; color: #4FA8D8; background: #f0f9ff; }
.region-wrap--disabled { background: #f9fafb; cursor: not-allowed; opacity: 0.6; }
.region-wrap--disabled:hover { border-color: #e5e7eb; }
</style>