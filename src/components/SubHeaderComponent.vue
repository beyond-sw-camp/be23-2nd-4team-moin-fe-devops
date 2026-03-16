<template>
  <div class="bg-white border-b border-gray-200 sticky top-16 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">

        <div class="flex items-center gap-4">
          <!-- 뒤로가기 버튼 -->
          <button
            @click="onBack"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <!-- Heroicons ArrowLeft Solid (20px) -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path fill-rule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
            </svg>
          </button>
          <!-- 타이틀 -->
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
            <p v-if="subtitle" class="text-sm text-gray-500">{{ subtitle }}</p>
          </div>
        </div>

        <!-- 우측 버튼 슬롯 -->
        <div v-if="hasRightButtons" class="flex items-center gap-2">
          <slot name="rightButtons" />
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SubHeaderComponent',
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    onBack: {
      type: Function,
      required: true
    }
  },
  computed: {
    hasRightButtons() {
      return !!this.$slots.rightButtons
    }
  }
}
</script>