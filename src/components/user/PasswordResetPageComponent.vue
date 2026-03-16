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

      <!-- 비밀번호 재설정 폼 -->
      <div class="bg-white rounded-2xl border border-gray-200 p-8">

        <!-- 헤더 -->
        <div class="flex items-center gap-3 mb-6">
          <button
            @click="$router.push('/login')"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >←</button>
          <h2 class="text-2xl font-bold text-gray-900">비밀번호 찾기</h2>
        </div>

        <!-- Step 1: 이메일 입력 + 인증번호 발송 -->
        <form v-if="step === 'email'" @submit.prevent="handleSendEmail" class="space-y-4">
          <p class="text-gray-600 mb-6">
            가입하신 이메일 주소를 입력해주세요.<br />
            인증번호를 전송해드립니다.
          </p>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <div class="flex gap-2">
              <input
                type="email"
                placeholder="example@email.com"
                v-model="email"
                :disabled="showVerification"
                :class="['flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FA8D8]',
                  errors.email ? 'border-red-500' : 'border-gray-300']"
              />
              <button
                type="submit"
                :disabled="sending"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium whitespace-nowrap disabled:opacity-50"
              >{{ sending ? '발송중...' : '인증번호 전송' }}</button>
            </div>
            <p v-if="errors.email" class="text-sm text-red-500 mt-1">{{ errors.email }}</p>
          </div>

          <!-- 인증번호 입력 (발송 후 표시) -->
          <div v-if="showVerification">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <p class="text-sm text-blue-900"><strong>{{ email }}</strong>로 인증번호를 전송했습니다.</p>
            </div>
            <label class="block text-sm font-medium text-gray-700 mb-2">인증번호</label>
            <div class="flex gap-2">
              <input
                type="text"
                placeholder="6자리 인증번호 입력"
                v-model="verificationCode"
                maxlength="6"
                :class="['flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FA8D8] text-center text-xl tracking-widest',
                  errors.code ? 'border-red-500' : 'border-gray-300']"
              />
              <button
                type="button"
                @click="handleVerifyCode"
                :disabled="verifying"
                class="px-4 py-2 bg-[#4FA8D8] text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >{{ verifying ? '확인중...' : '확인' }}</button>
            </div>
            <p v-if="errors.code" class="text-sm text-red-500 mt-1">{{ errors.code }}</p>
            <button
              type="button"
              @click="resetEmail"
              class="text-sm text-gray-500 hover:underline mt-2"
            >이메일 다시 입력하기</button>
          </div>
        </form>

        <!-- Step 2: 새 비밀번호 설정 -->
        <form v-else-if="step === 'reset'" @submit.prevent="handleResetPassword" class="space-y-4">
          <p class="text-gray-600 mb-6">새로운 비밀번호를 설정해주세요.</p>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">새 비밀번호</label>
            <input
              type="password"
              placeholder="영문, 숫자, 특수문자 포함 8~16자"
              v-model="newPassword"
              :class="['w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FA8D8]',
                errors.password ? 'border-red-500' : 'border-gray-300']"
            />
            <p v-if="errors.password" class="text-sm text-red-500 mt-1">{{ errors.password }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">새 비밀번호 확인</label>
            <input
              type="password"
              placeholder="비밀번호를 다시 입력해주세요"
              v-model="confirmPassword"
              :class="['w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FA8D8]',
                errors.confirm ? 'border-red-500' : 'border-gray-300']"
            />
            <p v-if="errors.confirm" class="text-sm text-red-500 mt-1">{{ errors.confirm }}</p>
          </div>
          <p v-if="errors.server" class="text-sm text-red-500 text-center">{{ errors.server }}</p>
          <button
            type="submit"
            :disabled="resetting"
            class="w-full py-3 bg-[#4FA8D8] hover:bg-[#3A8FC0] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >{{ resetting ? '처리중...' : '비밀번호 재설정' }}</button>
        </form>

        <!-- Step 3: 완료 -->
        <div v-else-if="step === 'complete'" class="text-center py-8">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">비밀번호가 재설정되었습니다</h3>
          <p class="text-gray-600 mb-6">새로운 비밀번호로 로그인해주세요.</p>
          <button
            @click="$router.push('/login')"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path fill-rule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import LogoComponent from './LogoComponent.vue'

const API = axios.create({ baseURL: process.env.VUE_APP_API_BASE_URL })

export default {
  name: 'PasswordResetPageComponent',
  components: { LogoComponent },

  data() {
    return {
      step: 'email',  // 'email' | 'reset' | 'complete'

      email: '',
      verificationCode: '',
      newPassword: '',
      confirmPassword: '',
      errors: {},

      // 로딩 상태
      sending: false,
      verifying: false,
      resetting: false,

      showVerification: false  // 인증번호 입력창 표시 여부
    }
  },
  methods: {
    // ─── Step 1: 인증번호 발송 POST /user/send-code ───────────
    async handleSendEmail() {
      if (!this.email) { this.errors = { email: '이메일을 입력해주세요' }; return }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
        this.errors = { email: '올바른 이메일 형식이 아닙니다' }; return
      }
      this.sending = true
      this.errors = {}
      try {
        await API.post('/user/send-code', { email: this.email })
        this.showVerification = true
        this.verificationCode = ''
      } catch (e) {
        this.errors = { email: e.response?.data || '인증번호 발송에 실패했습니다.' }
      } finally {
        this.sending = false
      }
    },

    // ─── Step 1: 인증번호 확인 POST /user/verify-code ─────────
    async handleVerifyCode() {
      if (!this.verificationCode) { this.errors = { code: '인증번호를 입력해주세요' }; return }
      if (this.verificationCode.length !== 6) { this.errors = { code: '6자리 인증번호를 입력해주세요' }; return }
      this.verifying = true
      this.errors = {}
      try {
        // 회원가입과 동일한 /user/verify-code 사용
        await API.post('/user/verify-code', {
          email: this.email,
          code: this.verificationCode
        })
        // 인증 성공 → 비밀번호 변경 단계로
        this.step = 'reset'
      } catch (e) {
        this.errors = { code: e.response?.data || '인증번호가 일치하지 않거나 만료되었습니다.' }
      } finally {
        this.verifying = false
      }
    },

    // ─── Step 2: 비밀번호 재설정 PATCH /user/password-update ──
    async handleResetPassword() {
      const newErrors = {}
      if (!this.newPassword) {
        newErrors.password = '새 비밀번호를 입력해주세요'
      } else if (!/(?=.*[0-9])(?=.*[a-zA-Z])(?=.*\W)(?=\S+$).{8,16}/.test(this.newPassword)) {
        newErrors.password = '비밀번호는 8~16자 영문, 숫자, 특수문자를 포함해야 합니다'
      }
      if (!this.confirmPassword) {
        newErrors.confirm = '비밀번호 확인을 입력해주세요'
      } else if (this.newPassword !== this.confirmPassword) {
        newErrors.confirm = '비밀번호가 일치하지 않습니다'
      }
      if (Object.keys(newErrors).length > 0) { this.errors = newErrors; return }

      this.resetting = true
      this.errors = {}
      try {
        // PasswordUpdateDto: { email, newPassword }
        await API.patch('/user/password-update', {
          email: this.email,
          newPassword: this.newPassword
        })
        this.step = 'complete'
      } catch (e) {
        this.errors = { server: e.response?.data?.error_message || '비밀번호 변경에 실패했습니다.' }
      } finally {
        this.resetting = false
      }
    },

    // 이메일 다시 입력
    resetEmail() {
      this.showVerification = false
      this.verificationCode = ''
      this.errors = {}
    }
  }
}
</script>