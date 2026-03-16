<template>
  <div class="min-h-screen bg-white flex items-center justify-center p-4">
    <div class="w-full max-w-md">

      <!-- 로고 -->
      <div class="text-center mb-12">
        <div class="flex items-center justify-center gap-2 mb-2">
          <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2">
            <LogoComponent class-name="w-full h-full" type="default" />
          </div>
          <h1 class="text-3xl font-bold text-gray-900">모인</h1>
        </div>
        <p class="text-gray-500">우리 동네 취미 모임 플랫폼</p>
      </div>

      <!-- 추가 정보 입력 폼 -->
      <div class="bg-white rounded-2xl border border-gray-200 p-8">

        <!-- 헤더 -->
        <div class="mb-6">
          <div class="flex items-center gap-3">
            <button @click="onNavigate('login')" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path fill-rule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/>
              </svg>
            </button>
            <h2 class="text-2xl font-bold text-gray-900">추가 정보 입력</h2>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">

          <!-- 프로필 이미지 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">프로필 이미지 (선택)</label>
            <div class="flex items-center gap-4 mt-2">
              <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                <img v-if="previewImage" :src="previewImage" alt="프로필" class="w-full h-full object-cover" />
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32" style="color:#9ca3af;">
                  <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9z"/>
                  <path fill-rule="evenodd" d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39zM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div>
                <label for="profileImage" class="cursor-pointer">
                  <div class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors inline-block text-sm font-medium">
                    이미지 선택
                  </div>
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    @change="handleImageChange"
                    class="hidden"
                  />
                </label>
                <p class="text-xs text-gray-500 mt-1">JPG, PNG (최대 5MB)</p>
              </div>
            </div>
          </div>

          <!-- 닉네임 -->
          <div>
            <label for="nickname" class="block text-sm font-medium text-gray-700 mb-2">닉네임 *</label>
            <input
              id="nickname"
              type="text"
              placeholder="닉네임을 입력하세요"
              v-model="formData.nickname"
              :class="['w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FA8D8]', errors.nickname ? 'border-red-500' : 'border-gray-300']"
            />
            <p v-if="errors.nickname" class="text-sm text-red-500 mt-1">{{ errors.nickname }}</p>
          </div>

          <!-- 활동 지역 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">활동 지역 *</label>
            <div class="grid grid-cols-2 gap-3 mt-2">
              <div>
                <select
                  v-model="formData.city"
                  :class="['w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FA8D8]', errors.city ? 'border-red-500' : 'border-gray-300']"
                >
                  <option value="">도시 선택</option>
                  <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
                </select>
                <p v-if="errors.city" class="text-sm text-red-500 mt-1">{{ errors.city }}</p>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="예: 역삼동"
                  v-model="formData.district"
                  :class="['w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FA8D8]', errors.district ? 'border-red-500' : 'border-gray-300']"
                />
                <p v-if="errors.district" class="text-sm text-red-500 mt-1">{{ errors.district }}</p>
              </div>
            </div>
          </div>

          <!-- MBTI -->
          <div>
            <label for="mbti" class="block text-sm font-medium text-gray-700 mb-2">MBTI *</label>
            <select
              id="mbti"
              v-model="formData.mbti"
              :class="['w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FA8D8]', errors.mbti ? 'border-red-500' : 'border-gray-300']"
            >
              <option value="">선택</option>
              <option v-for="mbti in mbtiTypes" :key="mbti" :value="mbti">{{ mbti }}</option>
            </select>
            <p v-if="errors.mbti" class="text-sm text-red-500 mt-1">{{ errors.mbti }}</p>
          </div>

          <!-- 생년월일 -->
          <div>
            <label for="birthdate" class="block text-sm font-medium text-gray-700 mb-2">생년월일 *</label>
            <input
              id="birthdate"
              type="date"
              v-model="formData.birthdate"
              :max="maxBirthDate"
              :class="['w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FA8D8]', errors.birthdate ? 'border-red-500' : 'border-gray-300']"
            />
            <p v-if="errors.birthdate" class="text-sm text-red-500 mt-1">{{ errors.birthdate }}</p>
          </div>

          <!-- 성별 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">성별 *</label>
            <div class="flex gap-3 mt-2">
              <button
                type="button"
                @click="formData.gender = '남성'"
                :class="['flex-1 py-3 rounded-lg border-2 transition-all', formData.gender === '남성' ? 'border-[#4FA8D8] bg-sky-50 text-[#4FA8D8] font-medium' : 'border-gray-300 text-gray-700 hover:border-gray-400']"
              >
                남성
              </button>
              <button
                type="button"
                @click="formData.gender = '여성'"
                :class="['flex-1 py-3 rounded-lg border-2 transition-all', formData.gender === '여성' ? 'border-[#4FA8D8] bg-sky-50 text-[#4FA8D8] font-medium' : 'border-gray-300 text-gray-700 hover:border-gray-400']"
              >
                여성
              </button>
            </div>
            <p v-if="errors.gender" class="text-sm text-red-500 mt-1">{{ errors.gender }}</p>
          </div>

          <!-- 관심 카테고리 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">관심 카테고리 * (중복 선택 가능)</label>
            <div class="grid grid-cols-4 gap-2 mt-2">
              <button
                v-for="category in categories"
                :key="category"
                type="button"
                @click="toggleInterest(category)"
                :class="['py-2 px-3 rounded-lg text-sm border-2 transition-all', formData.interests.includes(category) ? 'border-[#4FA8D8] bg-sky-50 text-[#4FA8D8] font-medium' : 'border-gray-300 text-gray-700 hover:border-gray-400']"
              >
                {{ category }}
              </button>
            </div>
            <p v-if="errors.interests" class="text-sm text-red-500 mt-1">{{ errors.interests }}</p>
          </div>

          <!-- 가입 완료 버튼 -->
          <button
            type="submit"
            class="w-full py-3 mt-6 bg-[#4FA8D8] hover:bg-[#3A8FC0] text-white font-medium rounded-lg transition-colors"
          >
            가입 완료
          </button>

        </form>
      </div>

      <!-- 안내 -->
      <p class="text-center text-sm text-gray-600 mt-4">
        추가 정보는 나중에 마이페이지에서 수정할 수 있습니다
      </p>

    </div>
  </div>
</template>

<script>
import LogoComponent from './LogoComponent.vue'

export default {
  name: 'SocialSignupPageComponent',
  components: {
    LogoComponent
  },
  props: {
    onNavigate: Function,
    onComplete: Function,
    provider: String
  },
  data() {
    return {
      formData: {
        nickname: '',
        city: '',
        district: '',
        mbti: '',
        birthdate: '',
        gender: '',
        interests: [],
        profileImage: null
      },
      previewImage: null,
      errors: {},
      categories: ['운동', '문화', '취미', '스터디', '게임', '여행', '음식', '음악'],
      mbtiTypes: ['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'],
      cities: ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종']
    }
  },
  computed: {
    // 생년월일: 오늘 이전만 선택 가능 (date input max)
    maxBirthDate() {
      return new Date().toISOString().slice(0, 10)
    }
  },
  methods: {
    handleImageChange(e) {
      const file = e.target.files?.[0]
      if (file) {
        this.formData.profileImage = file
        const reader = new FileReader()
        reader.onloadend = () => {
          this.previewImage = reader.result
        }
        reader.readAsDataURL(file)
      }
    },
    toggleInterest(category) {
      if (this.formData.interests.includes(category)) {
        this.formData.interests = this.formData.interests.filter(c => c !== category)
      } else {
        this.formData.interests = [...this.formData.interests, category]
      }
    },
    validateForm() {
      const newErrors = {}
      if (!this.formData.nickname) {
        newErrors.nickname = '닉네임을 입력해주세요'
      } else if (this.formData.nickname.length < 2) {
        newErrors.nickname = '닉네임은 2자 이상이어야 합니다'
      }
      if (!this.formData.city) newErrors.city = '도시를 선택해주세요'
      if (!this.formData.district) newErrors.district = '동을 입력해주세요'
      if (!this.formData.mbti) newErrors.mbti = 'MBTI를 선택해주세요'
      if (!this.formData.birthdate) newErrors.birthdate = '생년월일을 입력해주세요'
      else if (this.formData.birthdate > this.maxBirthDate) newErrors.birthdate = '생년월일은 오늘 이전으로 선택해주세요.'
      if (!this.formData.gender) newErrors.gender = '성별을 선택해주세요'
      if (this.formData.interests.length === 0) newErrors.interests = '관심 카테고리를 1개 이상 선택해주세요'

      this.errors = newErrors
      return Object.keys(newErrors).length === 0
    },
    handleSubmit() {
      if (this.validateForm()) {
        console.log('소셜 회원가입 추가정보:', this.formData)
        this.onComplete()
      }
    }
  }
}
</script>