export const crewRouter = [
  {
    path: "/crew/recommendations",
    name: "crewRecommendations",
    component: () =>
      import("@/components/home/CrewRecommendationsPageComponent.vue"),
  },
  {
    path: "/crew/rising-crews",
    name: "risingCrews",
    component: () => import("@/components/home/RisingCrewsPageComponent.vue"),
  },
  {
    path: "/crew/create",
    name: "CrewCreate",
    component: () => import("@/components/crew/CrewCreatePageComponent.vue"),
  },
    {
    path: "/crew/:crewId/members",
    name: "CrewMembersTab",
    component: () => import("@/components/crew/CrewMembersTab.vue"),
  },
  {
    path: "/crew/:crewId/feed",
    name: "CrewFeedTab",
    component: () => import("@/components/crew/CrewFeedTab.vue"),
  },
  {
    path: "/crew/:crewId/meetings",
    name: "CrewMeetingsTab",
    component: () => import("@/components/crew/CrewMeetingsTab.vue"),
  },
    {
    path: "/crew/:crewId",
    name: "CrewDetail",
    component: () => import("@/components/crew/CrewDetailComponent.vue"),
  },
  {
    path: "/crew/:id/edit",
    name: "CrewEdit",
    component: () => import("@/components/crew/CrewEditPageComponent.vue"),
  },
  {
    path: "/crew/:id/manage",
    name: "CrewManage",
    component: () => import("@/components/crew/CrewManagePageComponent.vue"),
  },
  {
    path: "/notification",
    name: "Notification",
    component: () => import("@/components/crew/NotificationPageComponent.vue"),
  },

];