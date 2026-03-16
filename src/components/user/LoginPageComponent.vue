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

      <!-- 로그인 폼 -->
      <div class="bg-white rounded-2xl border border-gray-200 p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">로그인</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">

          <!-- 이메일 -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              id="email"
              type="email"
              placeholder="example@email.com"
              v-model="formData.email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FA8D8] focus:border-transparent"
            />
          </div>

          <!-- 비밀번호 -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              placeholder="8자 이상 입력해주세요"
              v-model="formData.password"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FA8D8] focus:border-transparent"
            />
          </div>

          <!-- 비밀번호 찾기 -->
          <div class="flex justify-end">
            <button
              type="button"
              @click="$router.push('/password-reset')"
              class="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>

          <!-- 로그인 버튼 -->
          <button
            type="submit"
            class="w-full py-3 bg-[#4FA8D8] hover:bg-[#3A8FC0] text-white font-medium rounded-lg transition-colors"
          >
            로그인
          </button>

          <!-- 소셜 로그인 -->
          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300" />
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <div class="mt-6 grid grid-cols-2 gap-3">
              <!-- 구글 로그인 -->
              <button
                type="button"
                @click="handleSocialLogin('google')"
                class="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span class="text-sm font-medium text-gray-700">Google</span>
              </button>

              <!-- 카카오 로그인 -->
              <button
                type="button"
                @click="handleSocialLogin('kakao')"
                class="flex items-center justify-center gap-2 px-4 py-3 bg-[#FEE500] rounded-lg hover:bg-[#FDD835] transition-colors"
              >
                <svg class="w-5 h-5" viewBox="0 0 208 191" fill="none">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M104 0C46.562 0 0 35.817 0 80c0 28.688 19.095 53.934 47.736 67.992l-12.08 44.118a4.216 4.216 0 0 0 5.943 4.898l51.947-33.735c3.482.313 6.997.477 10.454.477 57.438 0 104-35.817 104-80S161.438 0 104 0z"
                    fill="#000"
                  />
                </svg>
                <span class="text-sm font-medium text-gray-900">Kakao</span>
              </button>
            </div>
          </div>

          <!-- 회원가입 링크 -->
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              아직 계정이 없으신가요?
              <button
                type="button"
                @click="$router.push('/signup')"
                class="text-blue-600 hover:text-blue-700 font-medium hover:underline ml-1"
              >
                회원가입
              </button>
            </p>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import LogoComponent from './LogoComponent.vue'

const API = axios.create({ baseURL: process.env.VUE_APP_API_BASE_URL})

export default {
  name: 'LoginPageComponent',
  components: {
    LogoComponent
  },
  inject: ['handleLogin'],
  data() {
    return {
      formData: {
        email: '',
        password: ''
      },
      googleClientId: "612017441229-12s2i8r8up629n5oahkgh7c040a71gec.apps.googleusercontent.com",
      googleRedirectUrl: `${process.env.VUE_APP_BASE_URL }/oauth/google/redirect`,
      googleScope: "openid email profile",
      kakaoClientId: "48518f1bb3f5df24e6a1a4fb8d8110c4",
      kakaoRedirectUrl: `${process.env.VUE_APP_BASE_URL }/oauth/kakao/redirect`,
    }
  },
  methods: {
    async handleSubmit() {
      try {
        const res = await API.post('/user/doLogin', {
          email: this.formData.email,
          password: this.formData.password,
        })

        const { accessToken, refreshToken } = res.data || {}

        if (!accessToken || !refreshToken) {
          throw new Error('TokenDto 응답이 비어있습니다.')
        }

        gtorage.setItem('token', accessToken)
        localStorage.setItem('refreshToken', refreshToken)

        this.handleLogin?.()
        this.$router.push('/')
      } catch (e) {
        console.error('로그인 실패:', e)
        alert('로그인 실패')
      }
    },
    handleSocialLogin(provider) {
      if (provider === 'google') return this.startGoogleLogin()
      if (provider === 'kakao') return this.startKakaoLogin()
    },
    startGoogleLogin() {
      if (!this.googleClientId) {
        alert('googleClientId가 비어있습니다. LoginPageComponent.vue에서 값을 설정해주세요.')
        return
      }

      const googleUrl = 'https://accounts.google.com/o/oauth2/auth'
      const googleScope = 'openid email profile'

      window.location.href =
        `${googleUrl}?client_id=${encodeURIComponent(this.googleClientId)}` +
        `&redirect_uri=${encodeURIComponent(this.googleRedirectUrl)}` +
        `&response_type=code&scope=${encodeURIComponent(googleScope)}` +
        `&prompt=select_account`
    },
    startKakaoLogin() {
      if (!this.kakaoClientId) {
        alert('kakaoClientId가 비어있습니다. LoginPageComponent.vue에서 값을 설정해주세요.')
        return
      }

      const kakaoUrl = 'https://kauth.kakao.com/oauth/authorize'
      window.location.href =
        `${kakaoUrl}?client_id=${encodeURIComponent(this.kakaoClientId)}` +
        `&redirect_uri=${encodeURIComponent(this.kakaoRedirectUrl)}` +
        `&response_type=code`
    }
  }
}
</script>