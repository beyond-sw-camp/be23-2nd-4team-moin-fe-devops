<template>
  <div class="min-h-screen bg-[#fafaf9] pb-24">

    <!-- 토스트 -->
    <div
      v-if="toastMessage"
      class="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg"
      :class="toastType === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'"
    >
      {{ toastMessage }}
    </div>

    <!-- 헤더 -->
    <div class="sticky top-16 z-40 bg-white border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <button
            @click="onNavigate('meeting-detail')"
            class="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            ← 뒤로
          </button>
          <h1 class="text-xl font-bold text-gray-900">결제하기</h1>
          <div class="w-12"></div>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 py-6 space-y-4">

      <!-- 모임 정보 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="font-bold text-lg mb-4">모임 정보</h2>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">모임명</span>
            <span class="font-medium text-gray-900">{{ paymentInfo.meetingTitle }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">모임 일시</span>
            <span class="font-medium text-gray-900">{{ paymentInfo.meetingDate }}</span>
          </div>
          <div class="border-t border-gray-200 my-4"></div>
          <div class="flex justify-between items-center">
            <span class="text-gray-900 font-semibold">참가비</span>
            <span class="text-2xl font-bold text-[#4FA8D8]">
              {{ paymentInfo.fee.toLocaleString() }}원
            </span>
          </div>
        </div>
      </div>

      <!-- 결제 방법 선택 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="font-bold text-lg mb-4">결제 방법</h2>

        <!-- 카카오페이 -->
        <button
          @click="handleKakaoPayment"
          :disabled="isProcessing"
          class="w-full mb-3 p-4 border-2 border-gray-200 rounded-lg hover:border-[#FEE500] hover:bg-yellow-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-[#FEE500] rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" class="w-7 h-7">
                  <path
                    fill="#3C1E1E"
                    d="M12 3c-5.799 0-10.5 3.664-10.5 8.185 0 2.75 1.771 5.157 4.418 6.653-.204.746-.756 2.767-.874 3.217-.142.544.198.537.418.39.171-.113 2.715-1.828 3.15-2.121.788.15 1.609.23 2.438.23 5.799 0 10.5-3.664 10.5-8.185S17.799 3 12 3z"
                  />
                </svg>
              </div>
              <div class="text-left">
                <div class="font-bold text-gray-900">카카오페이</div>
                <div class="text-sm text-gray-500">간편하고 빠른 결제</div>
              </div>
            </div>
            <span class="text-gray-400">→</span>
          </div>
        </button>

        <!-- 계좌이체 -->
        <button
          @click="handleBankTransfer"
          class="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#4FA8D8] hover:bg-sky-50 transition-all"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" class="w-6 h-6">
                  <path
                    d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                    stroke="#374151"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M9 22V12H15V22"
                    stroke="#374151"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div class="text-left">
                <div class="font-bold text-gray-900">계좌이체</div>
                <div class="text-sm text-gray-500">계좌번호 복사 후 이체</div>
              </div>
            </div>
            <span class="text-gray-400">→</span>
          </div>
        </button>
      </div>

      <!-- 계좌 정보 -->
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h3 class="font-bold text-amber-900 mb-3">계좌 정보</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-amber-800">은행명</span>
            <span class="font-medium text-amber-900">{{ paymentInfo.bankName }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-amber-800">계좌번호</span>
            <span class="font-medium text-amber-900">{{ paymentInfo.accountNumber }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-amber-800">예금주</span>
            <span class="font-medium text-amber-900">{{ paymentInfo.accountHolder }}</span>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-amber-300">
          <p class="text-xs text-amber-800">
            • 입금자명은 신청자 본인 이름으로 해주세요<br />
            • 입금 확인 후 참가가 최종 승인됩니다<br />
            • 모임 취소 시 환불 정책을 확인해주세요
          </p>
        </div>
      </div>

      <!-- 유료 모임 주의사항 -->
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h3 class="font-bold text-amber-900 mb-3">유료 모임 주의사항</h3>
        <ul class="text-sm text-amber-800 space-y-2">
          <li>• 참가비 결제 전 모임 일정과 장소를 꼭 확인해주세요.</li>
          <li>• <strong>모임 시작 3시간 전</strong>까지만 환불 가능합니다. (정산 전까지)</li>
          <li>• 모임 시작 3시간 이내에는 환불가 불가능합니다.</li>
          <li>• 무단 불참 시 환불되지 않으며 매너점수가 감점될 수 있습니다.</li>
        </ul>
      </div>

      <!-- 환불 정책 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="font-bold text-gray-900 mb-3">환불 정책</h3>
        <ul class="text-sm text-gray-600 space-y-2">
          <li>• <strong>모임 시작 3시간 전까지</strong>: 환불 가능 (정산 전)</li>
          <li>• 모임 시작 3시간 이내: 환불 불가</li>
          <li>• 무단 불참 시: 환불 불가 + 매너점수 감점</li>
        </ul>
      </div>

    </div>

    <!-- 결제 처리 중 오버레이 -->
    <div
      v-if="isProcessing"
      class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg p-8 text-center">
        <div class="w-16 h-16 border-4 border-[#4FA8D8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-900 font-medium">결제 처리 중...</p>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'MeetingPaymentPageComponent',
  props: {
    onNavigate: Function
  },
  data() {
    return {
      isProcessing: false,
      paymentInfo: {
        meetingTitle: '북한산 등산',
        meetingDate: '2026-02-22 09:00',
        fee: 15000,
        bankName: '국민은행',
        accountNumber: '123456-78-901234',
        accountHolder: '김철수',
      },
      toastMessage: '',
      toastType: 'info',
    }
  },
  methods: {
    handleKakaoPayment() {
      this.isProcessing = true
      console.log('카카오페이 결제 진행')
      setTimeout(() => {
        this.isProcessing = false
        this.showToast('결제가 완료되었습니다!', 'success')
        this.onNavigate('meeting-detail')
      }, 2000)
    },
    handleBankTransfer() {
      if (confirm('계좌번호가 복사되었습니다.\n입금 후 참가 신청이 완료됩니다.')) {
        navigator.clipboard.writeText(this.paymentInfo.accountNumber)
        this.showToast('참가 신청이 완료되었습니다.\n입금 확인 후 최종 승인됩니다.', 'success')
        this.onNavigate('meeting-detail')
      }
    },
    showToast(message, type = 'info') {
      this.toastMessage = message
      this.toastType = type
      setTimeout(() => {
        this.toastMessage = ''
      }, 3000)
    },
  }
}
</script>