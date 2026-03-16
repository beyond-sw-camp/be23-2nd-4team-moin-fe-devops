export const userRouter = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/components/user/LoginPageComponent.vue"),
  },
  {
    path: "/oauth/google/redirect",
    name: "GoogleRedirect",
    component: () => import("@/components/user/GoogleRedirectPageComponent.vue"),
  },
  {
    path: "/oauth/kakao/redirect",
    name: "KakaoRedirect",
    component: () => import("@/components/user/KakaoRedirectPageComponent.vue"),
  },
  {
    path: "/user/info-update",
    name: "InfoUpdate",
    component: () => import("@/components/user/InfoUpdatePageComponent.vue"),
  },
  {
    path: "/signup",
    name: "Signup",
    component: () => import("@/components/user/SignupPageComponent.vue"),
  },
  {
    path: "/password-reset",
    name: "PasswordReset",
    component: () => import("@/components/user/PasswordResetPageComponent.vue"),
  },
  {
    path: "/social-signup",
    name: "SocialSignup",
    component: () => import("@/components/user/SocialSignupPageComponent.vue"),
  },
  {
    path: "/mypage",
    name: "MyPage",
    component: () => import("@/components/user/MyPageComponent.vue"),
  },
  {
    path: "/profile/edit",
    name: "ProfileEdit",
    component: () => import("@/components/user/ProfileEditPageComponent.vue"),
  },
   {
    path: "/logo",
    name: "Logo",
    component: () => import("@/components/user/LogoComponent.vue"),
  },
  {
    path: "/dongSearch",
    name: "DongSearchInput",
    component: () => import("@/components/user/DongSearchInput.vue"),
  },
];