export const feedRouter = [
  {
    path: "/feed/:id/edit",
    name: "FeedEdit",
    component: () => import("@/components/feed/FeedEditPageComponent.vue"),
  },
]