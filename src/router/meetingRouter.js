export const meetingRouter = [
  
  {
    path: "/meeting/:id",
    name: "MeetingDetail",
    component: () => import("@/components/meeting/MeetingDetailComponent.vue"),
  },
  {
    path: "/meeting/:id/edit",
    name: "MeetingEdit",
    component: () => import("@/components/meeting/MeetingEditPageComponent.vue"),
  },
  {
    path: "/meeting/:id/payment",
    name: "MeetingPayment",
    component: () => import("@/components/meeting/MeetingPaymentPageComponent.vue"),
  },
];