<template>
  <div class="min-h-screen bg-white">
    <!-- 헤더 (로그인/회원가입 페이지에서는 숨김) -->
    <HeaderComponent
      v-if="!isAuthPage"
      :is-logged-in="isLoggedIn"
      :on-navigate="navigate"
      :on-logout="handleLogout"
    />

    <!-- 페이지 콘텐츠 -->
    <RouterView />
  </div>
</template>

<script>
import axios from "axios";
import HeaderComponent from "@/components/HeaderComponent.vue";

const API_BASE = "http://localhost:8080";

// JWT 페이로드에서 role 추출
function getRoleFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || payload.roles || payload.auth || null;
  } catch {
    return null;
  }
}

export default {
  name: "App",
  components: {
    HeaderComponent,
  },
  data() {
    return {
      isLoggedIn: false,
      isAdmin: false,
    };
  },
  created() {
    this.checkAuth();
  },
  computed: {
    isAuthPage() {
      const authPaths = [
        "/login",
        "/signup",
        "/password-reset",
        "/social-signup",
        "/oauth/google/redirect",
        "/oauth/kakao/redirect",
        "/user/info-update",
      ];
      return authPaths.includes(this.$route.path);
    },
  },
  methods: {
    checkAuth() {
      const token = localStorage.getItem("token");
      if (token) {
        this.isLoggedIn = true;
        // JWT role 기반 어드민 체크
        const role = getRoleFromToken();
        if (role) {
          this.isAdmin = Array.isArray(role)
            ? role.some((r) => r.includes("ADMIN"))
            : role === "ROLE_ADMIN" || role === "ADMIN";
        }
      }
    },
    navigate(path) {
      // 상대 경로('login', 'admin' 등)는 절대 경로로 변환 (현재 경로가 /crew/:id일 때 /crew/login 방지)
      const target = path.startsWith("/") ? path : `/${path}`;
      // 로고/태그라인 클릭 시 홈으로 이동 + 리로드
      if (target === "/") {
        window.location.href = "/";
        return;
      }
      this.$router.push(target);
    },
    async handleLogout() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await axios.delete(`${API_BASE}/notifications/disconnect`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch {
          // 무시 (이미 연결 해제된 경우 등)
        }
      }
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      this.isLoggedIn = false;
      this.isAdmin = false;
      this.$router.push("/login");
    },
    handleLogin() {
      this.checkAuth(); // 로그인 후 토큰 기반으로 상태 재계산
      this.$router.push("/");
    },
  },
  provide() {
    return {
      handleLogin: this.handleLogin,
      handleLogout: this.handleLogout,
    };
  },
};
</script>
