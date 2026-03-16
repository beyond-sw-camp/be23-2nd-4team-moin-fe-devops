import { createRouter, createWebHistory } from "vue-router";
import { crewRouter } from "./crewRouter";
import { feedRouter } from "./feedRouter";
import { meetingRouter } from "./meetingRouter";
import { userRouter } from "./userRouter";

const routes = [
  // /crew/search 반드시 /crew/:crewId 보다 먼저 매칭되도록 최상단에 정의
  {
    path: "/crew/search",
    name: "Search",
    component: () => import("@/components/common/SearchComponent.vue"),
  },
  ...crewRouter,
  ...feedRouter,
  ...meetingRouter,
  ...userRouter,
  {
    path: "/",
    name: "Home",
    component: () => import("@/components/HomeComponent.vue"),
  },
  {
    path: "/admin",
    name: "Admin",
    component: () => import("@/components/AdminPageComponent.vue"),
  },
  {
    path: "/my/crews",
    name: "myCrews",
    component: () => import("@/components/home/MyCrewsPageComponent.vue"),
  },
  {
    path: "/my/meetings",
    name: "myMeetings",
    component: () => import("@/components/home/MyMeetingsPageComponent.vue"),
  },
  {
    path: "/my/recent",
    name: "recentCrews",
    component: () => import("@/components/home/RecentCrewsPageComponent.vue"),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// 홈(/)에 category 쿼리가 있으면 검색 페이지로 리다이렉트 (화면이 안 바뀌는 문제 방지)
router.beforeEach((to, _from, next) => {
  if (to.path === "/" && to.query && "category" in to.query) {
    const cat = to.query.category;
    next({ path: "/crew/search", query: cat ? { category: cat } : {} });
    return;
  }
  next();
});
