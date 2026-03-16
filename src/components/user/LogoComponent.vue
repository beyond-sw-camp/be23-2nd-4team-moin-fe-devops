<template>
  <div>
    <!-- 기본 Logo -->
    <svg
      v-if="type === 'default'"
      :class="className"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- 세 개의 원이 모이는 형태 -->
      <circle cx="50" cy="30" r="18" fill="#38BDF8" opacity="0.9" />
      <circle cx="35" cy="55" r="18" fill="#7DD3FC" opacity="0.85" />
      <circle cx="65" cy="55" r="18" fill="#BAE6FD" opacity="0.85" />
      <!-- 중앙 연결 포인트 -->
      <circle cx="50" cy="50" r="8" fill="#0EA5E9" />
      <!-- 작은 강조점 -->
      <circle cx="50" cy="50" r="3" fill="white" />
    </svg>

    <!-- LogoSimple -->
    <svg
      v-else-if="type === 'simple'"
      :class="className"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- M 형태의 심플한 로고 -->
      <path
        d="M20 70 L20 30 L35 50 L50 30 L65 50 L80 30 L80 70"
        stroke="#0EA5E9"
        stroke-width="8"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
      <circle cx="35" cy="50" r="6" fill="#38BDF8" />
      <circle cx="65" cy="50" r="6" fill="#38BDF8" />
    </svg>

    <!-- LogoIcon -->
    <svg
      v-else-if="type === 'icon'"
      :class="className"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- 그라데이션 정의 -->
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38BDF8" />
          <stop offset="100%" stop-color="#0EA5E9" />
        </linearGradient>
      </defs>
      <!-- 둥근 사각형 베이스 -->
      <rect x="10" y="10" width="80" height="80" rx="20" fill="url(#logoGradient)" />
      <!-- 사람들이 모이는 형태 (흰색) -->
      <circle cx="50" cy="35" r="10" fill="white" opacity="0.95" />
      <circle cx="32" cy="55" r="9" fill="white" opacity="0.9" />
      <circle cx="68" cy="55" r="9" fill="white" opacity="0.9" />
      <circle cx="42" cy="70" r="8" fill="white" opacity="0.85" />
      <circle cx="58" cy="70" r="8" fill="white" opacity="0.85" />
    </svg>
  </div>
</template>

<script>
export default {
  name: 'LogoComponent',
  props: {
    className: {
      type: String,
      default: 'w-10 h-10'
    },
    type: {
      type: String,
      default: 'default'  // 'default' | 'simple' | 'icon'
    }
  }
}
</script>