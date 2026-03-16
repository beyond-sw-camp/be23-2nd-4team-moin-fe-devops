<template>
  <div class="min-h-screen bg-white flex items-center justify-center p-4">
    <div class="text-center">
      <div class="w-10 h-10 border-4 border-gray-200 border-t-[#4FA8D8] rounded-full animate-spin mx-auto" />
      <p class="mt-4 text-gray-700">구글 로그인 처리 중...</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'GoogleRedirectPageComponent',
  // 1. inject 추가 (App.vue에서 제공하는 로그인 상태 변경 함수를 가져옵니다)
  inject: ['handleLogin'], 
  created() {
    const code = new URL(window.location.href).searchParams.get('code');
    if (!code) {
      alert('구글 로그인 code가 없습니다.');
      this.$router.replace('/login');
      return;
    }
    this.sendCodeToServer(code);
  },
  methods: {
    async sendCodeToServer(code) {
      try {
        const API = axios.create({ baseURL: process.env.VUE_APP_API_BASE_URL });
        const res = await API.post('/user/google/doLogin', { code });
        const { accessToken, refreshToken, newUser } = res.data;
        console.log(res.data);
        console.log("추출된 isNewUser 값:", newUser);
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
        console.error('구글 로그인 에러:', e);
        alert('로그인 처리 중 오류가 발생했습니다.');
        this.$router.replace('/login');
      }
    }
  }
};
</script>