<template>
  <div class="min-h-screen bg-white flex items-center justify-center p-4">
    <!-- 토스트 -->
    <div
      v-if="toastMessage"
      class="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg"
      :class="toastType === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'"
    >
      {{ toastMessage }}
    </div>

    <div class="text-center">
      <div class="w-10 h-10 border-4 border-gray-200 border-t-[#FEE500] rounded-full animate-spin mx-auto" />
      <p class="mt-4 text-gray-700">카카오 로그인 처리 중...</p>
    </div>
  </div>
</template>
<script>
import axios from 'axios';

export default {
  name: 'KakaoRedirectPageComponent',
  // 1. inject 추가 (App.vue에서 제공하는 로그인 상태 변경 함수를 가져옵니다)
  inject: ['handleLogin'], 
  data() {
    return {
      toastMessage: '',
      toastType: 'info',
    };
  },
  created() {
    const code = new URL(window.location.href).searchParams.get('code');
    if (!code) {
      this.showToast('카카오 로그인 code가 없습니다.', 'error');
      this.$router.replace('/login');
      return;
    }
    this.sendCodeToServer(code);
  },
  methods: {
    async sendCodeToServer(code) {
      try {
        const API = axios.create({ baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080' });
        const res = await API.post('/user/kakao/doLogin', { code });
        const { accessToken, refreshToken, newUser } = res.data;

        if (accessToken && refreshToken) {
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          // 2. handleLogin 호출 (이걸 호출해야 헤더가 로그아웃으로 바뀝니다)
          if (this.handleLogin) {
            this.handleLogin();
          }

          // 3. 페이지 이동 분기
          if (newUser===true) {
            this.$router.replace('/user/info-update');
          } else {
            this.$router.replace('/');
          }
        }
      } catch (e) {
        console.error('카카오 로그인 에러:', e);
        this.showToast('로그인 처리 중 오류가 발생했습니다.', 'error');
        this.$router.replace('/login');
      }
    },
    showToast(message, type = 'info') {
      this.toastMessage = message;
      this.toastType = type;
      setTimeout(() => {
        this.toastMessage = '';
      }, 3000);
    },
  }
};
</script>