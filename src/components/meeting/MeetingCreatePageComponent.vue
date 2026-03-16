<template>
  <transition name="slide-down">
    <div
      v-if="visible"
      class="bg-white rounded-xl border border-[#4FA8D8] p-5 space-y-4 mb-2"
    >
      <h3 class="font-bold text-base text-gray-800">새 모임 정보 입력</h3>

      <!-- 모임 이미지 -->
      <div class="meeting-create-image-section">
        <label class="block text-sm font-semibold text-gray-700 mb-2">모임 이미지</label>
        <div v-if="imagePreview" class="img-preview-box">
          <img :src="imagePreview" alt="미리보기" class="img-preview" />
          <div class="img-overlay">
            <button type="button" @click.stop="removeImage" class="img-replace">
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="width:14px;height:14px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              이미지 교체
            </button>
          </div>
        </div>
        <label v-else for="meetingImageInput" class="img-drop">
          <div class="img-drop-content">
            <div class="img-drop-icon">
              <svg fill="currentColor" viewBox="0 0 24 24" style="width:28px;height:28px;color:#4FA8D8;">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
            <p class="img-drop-title">클릭하여 이미지 업로드</p>
            <p class="img-drop-hint">JPG · PNG (선택)</p>
          </div>
          <input
            id="meetingImageInput"
            ref="imageInput"
            type="file"
            accept="image/*"
            class="sr-only"
            @change="onImageChange"
          />
        </label>
      </div>

      <!-- 모임명 -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1">
          모임명 <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.meetingName"
          type="text"
          maxlength="50"
          placeholder="모임 이름을 입력하세요"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4FA8D8]"
          :class="{ 'border-red-400': errors.meetingName }"
        />
        <p class="text-gray-500 text-xs mt-1">{{ (form.meetingName || '').length }}/50</p>
        <p v-if="errors.meetingName" class="text-red-500 text-xs mt-1">{{ errors.meetingName }}</p>
      </div>

      <!-- 장소 -->
      <div class="relative" ref="placeDropdownWrapper">
        <label class="block text-sm font-semibold text-gray-700 mb-1">
          모임 장소 <span class="text-red-500">*</span>
        </label>
        <input
          :value="form.place"
          type="text"
          placeholder="장소 입력"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4FA8D8]"
          :class="{ 'border-red-400': errors.place || placeError }"
          @compositionstart="isComposing = true"
          @compositionend="onPlaceCompositionEnd"
          @input="onPlaceInput"
          @focus="onPlaceFocus"
          @keydown.down.prevent="movePlaceActive(1)"
          @keydown.up.prevent="movePlaceActive(-1)"
          @keydown.enter.prevent="selectActivePlaceCandidate"
          autocomplete="off"
        />
        <!-- ✅ 장소 에러 메시지 input 바로 아래 -->
        <p v-if="placeError || errors.place" class="text-red-500 text-xs mt-1">
          {{ placeError || errors.place }}
        </p>
        <div
          v-if="placeDropdownOpen && placeCandidates.length"
          class="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto"
        >
          <ul>
            <li
              v-for="(c, idx) in placeCandidates"
              :key="idx"
              @mousedown.prevent="selectPlaceCandidate(c)"
              class="px-4 py-2.5 text-sm cursor-pointer"
              :class="idx === placeActiveIndex ? 'bg-sky-50 text-[#4FA8D8] font-semibold' : 'hover:bg-sky-50 hover:text-[#4FA8D8]'"
            >
              <div class="font-semibold text-gray-900">{{ c.name || c.address }}</div>
              <div class="text-xs text-gray-500 mt-0.5">{{ c.address }}</div>
            </li>
          </ul>
        </div>
        <p v-if="placeLoading" class="text-xs text-gray-400 mt-1">장소 검색 중...</p>
        <p
          v-else-if="placeDropdownOpen && !placeCandidates.length && (form.place||'').trim().length >= 2"
          class="text-xs text-gray-400 mt-1"
        >
          검색 결과가 없습니다.
        </p>
      </div>

      <!-- 모임 일시 -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1">
          모임 일시 <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.meetingAt"
          type="datetime-local"
          :min="minDatetime"
          class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4FA8D8]"
          :class="datetimeError ? 'border-red-400' : 'border-gray-300'"
          @change="validateDatetime"
          @blur="clampDatetime"
        />
        <p v-if="datetimeError" class="text-red-500 text-xs mt-1">{{ datetimeError }}</p>
        <p v-else-if="errors.meetingAt" class="text-red-500 text-xs mt-1">{{ errors.meetingAt }}</p>
      </div>

      <!-- 최대 인원 -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1">최대 인원</label>
        <input
          v-model.number="form.maxMembers"
          type="number"
          min="2"
          max="500"
          placeholder="최대 500명"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4FA8D8]"
        />
        <p v-if="errors.maxMembers" class="text-red-500 text-xs mt-1">{{ errors.maxMembers }}</p>
      </div>

      <!-- 설명 -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1">
          모임 설명 <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="form.description"
          rows="3"
          placeholder="모임에 대해 소개해 주세요"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4FA8D8] resize-none"
          :class="{ 'border-red-400': errors.description }"
        />
        <p v-if="errors.description" class="text-red-500 text-xs mt-1">{{ errors.description }}</p>
      </div>

      <!-- 참가비 유형 -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">참가비</label>
        <div class="flex gap-3">
          <button
            type="button"
            @click="form.feeType = 'FREE'"
            :class="[
              'flex-1 py-2 rounded-lg border text-sm font-medium transition-colors',
              form.feeType === 'FREE'
                ? 'bg-[#4FA8D8] text-white border-[#4FA8D8]'
                : 'bg-white text-gray-600 border-gray-300 hover:border-[#4FA8D8]',
            ]"
          >
            무료
          </button>
          <button
            type="button"
            @click="form.feeType = 'PAID'"
            :class="[
              'flex-1 py-2 rounded-lg border text-sm font-medium transition-colors',
              form.feeType === 'PAID'
                ? 'bg-[#4FA8D8] text-white border-[#4FA8D8]'
                : 'bg-white text-gray-600 border-gray-300 hover:border-[#4FA8D8]',
            ]"
          >
            유료
          </button>
        </div>
      </div>

      <!-- 유료 계좌 정보 -->
      <transition name="slide-down">
        <div
          v-if="form.feeType === 'PAID'"
          class="space-y-3 bg-sky-50 border border-sky-200 rounded-xl p-4"
        >
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">
              참가비 <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model.number="form.fee"
                type="number"
                min="0"
                placeholder="0"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:border-[#4FA8D8]"
                :class="{ 'border-red-400': errors.fee }"
              />
              <span class="absolute right-3 top-2 text-sm text-gray-500">원</span>
            </div>
            <p v-if="errors.fee" class="text-red-500 text-xs mt-1">{{ errors.fee }}</p>
          </div>

          <div class="relative" ref="bankDropdownWrapper">
            <label class="block text-sm font-semibold text-gray-700 mb-1">
              은행명 <span class="text-red-500">*</span>
            </label>
            <button
              type="button"
              @click="bankDropdownOpen = !bankDropdownOpen"
              class="w-full border rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between focus:outline-none focus:border-[#4FA8D8] bg-white"
              :class="[
                errors.bankName ? 'border-red-400' : 'border-gray-300',
                form.bankName ? 'text-gray-900' : 'text-gray-400',
              ]"
            >
              <span>{{ form.bankName || "은행을 선택하세요" }}</span>
              <svg
                class="w-4 h-4 text-gray-500 transition-transform"
                :class="{ 'rotate-180': bankDropdownOpen }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              v-if="bankDropdownOpen"
              class="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto"
            >
              <ul>
                <li
                  v-for="bank in bankList"
                  :key="bank"
                  @click="selectBank(bank)"
                  class="px-4 py-2.5 text-sm cursor-pointer hover:bg-sky-50 hover:text-[#4FA8D8]"
                  :class="{ 'bg-sky-50 text-[#4FA8D8] font-semibold': form.bankName === bank }"
                >
                  {{ bank }}
                </li>
              </ul>
            </div>
            <p v-if="errors.bankName" class="text-red-500 text-xs mt-1">{{ errors.bankName }}</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">
              계좌번호 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.accountNumber"
              type="text"
              placeholder="계좌번호"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4FA8D8]"
              :class="{ 'border-red-400': errors.accountNumber }"
            />
            <p v-if="errors.accountNumber" class="text-red-500 text-xs mt-1">{{ errors.accountNumber }}</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">
              예금주 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.accountHolder"
              type="text"
              placeholder="예금주명"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4FA8D8]"
              :class="{ 'border-red-400': errors.accountHolder }"
            />
            <p v-if="errors.accountHolder" class="text-red-500 text-xs mt-1">{{ errors.accountHolder }}</p>
          </div>
        </div>
      </transition>

      <!-- 서버 에러 (주소 외 일반 에러) -->
      <p
        v-if="serverError"
        class="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2"
      >
        {{ serverError }}
      </p>

      <button
        @click="submitForm"
        :disabled="isLoading"
        class="w-full py-2.5 bg-[#4FA8D8] hover:bg-[#3A8FC0] disabled:bg-gray-300 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
      >
        <svg v-if="isLoading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" class="animate-spin">
          <path fill-rule="evenodd" d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918z" clip-rule="evenodd"/>
        </svg>
        {{ isLoading ? "생성 중..." : "모임 생성 완료" }}
      </button>

      <!-- 유료 모임 생성 확인 토스트 -->
      <div v-if="showPaidCreateConfirm" class="paid-create-toast-backdrop" @click.self="showPaidCreateConfirm = false">
        <div class="paid-create-toast">
          <p class="paid-create-toast__text">유료모임은 정산 이후 정보수정이 불가능합니다. 모임 시작 3시간 전 정산이 완료됩니다. 모임을 생성하시겠습니까?</p>
          <div class="paid-create-toast__actions">
            <button type="button" @click="showPaidCreateConfirm = false" class="paid-create-toast__btn paid-create-toast__btn--cancel">취소</button>
            <button type="button" @click="confirmPaidCreate" :disabled="isLoading" class="paid-create-toast__btn paid-create-toast__btn--confirm">{{ isLoading ? "처리 중..." : "확인" }}</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import axios from "axios";
import dayjs from "@/plugins/dayjs";

const API = axios.create({ baseURL: process.env.VUE_APP_API_BASE_URL });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default {
  name: "MeetingCreatePageComponent",

  props: {
    visible: { type: Boolean, default: false },
    crewId: { type: [Number, String], required: true },
  },

  emits: ["close", "created"],

  data() {
    return {
      isLoading: false,
      serverError: "",
      placeError: "", // ✅ 장소 전용 에러
      errors: {},

      nowDatetime: new Date().toISOString().slice(0, 16),
      datetimeError: "",

      bankDropdownOpen: false,
      bankList: [
        "카카오뱅크", "토스뱅크", "KB국민은행", "신한은행", "우리은행",
        "하나은행", "NH농협은행", "IBK기업은행", "케이뱅크", "새마을금고",
        "우체국", "신협", "부산은행", "대구은행", "경남은행", "광주은행",
        "전북은행", "제주은행", "수협은행", "산업은행", "SC제일은행", "한국씨티은행",
      ],

      placeCandidates: [],
      placeDropdownOpen: false,
      placeLoading: false,
      placeActiveIndex: -1,
      placeDebounceTimer: null,
      isComposing: false,

      form: this.emptyForm(),
      imagePreview: null,

      showPaidCreateConfirm: false,
    };
  },

  computed: {
    minDatetime() {
      return this.nowDatetime;
    },
  },

  watch: {
    visible(val) {
      if (!val) this.reset();
    },
  },

  mounted() {
    document.addEventListener("click", this.handleOutsideClick);
    this._nowTimer = setInterval(() => {
      this.nowDatetime = new Date().toISOString().slice(0, 16);
    }, 60_000);
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
    clearTimeout(this.placeDebounceTimer);
    clearInterval(this._nowTimer);
  },

  methods: {
    emptyForm() {
      return {
        meetingName: "",
        place: "",
        meetingAt: "",
        maxMembers: null,
        description: "",
        feeType: "FREE",
        fee: null,
        bankName: "",
        accountNumber: "",
        accountHolder: "",
        profileImage: null,
        latitude: null,
        longitude: null,
      };
    },

    reset() {
      this.form = this.emptyForm();
      this.imagePreview = null;
      this.errors = {};
      this.serverError = "";
      this.placeError = "";
      this.datetimeError = "";
      this.bankDropdownOpen = false;
      this.placeCandidates = [];
      this.placeDropdownOpen = false;
      this.placeActiveIndex = -1;
      this.placeLoading = false;
      this.isComposing = false;
      clearTimeout(this.placeDebounceTimer);
      if (this.$refs.imageInput) this.$refs.imageInput.value = "";
    },

    onImageChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.form.profileImage = file;
      this.imagePreview = URL.createObjectURL(file);
    },

    removeImage() {
      this.form.profileImage = null;
      this.imagePreview = null;
      if (this.$refs.imageInput) this.$refs.imageInput.value = "";
    },

    selectBank(bank) {
      this.form.bankName = bank;
      this.bankDropdownOpen = false;
    },

    validateDatetime() {
      if (!this.form.meetingAt) { this.datetimeError = ""; return; }
      const selected = new Date(this.form.meetingAt);
      if (selected <= new Date()) {
        this.datetimeError = "현재 시간 이후의 날짜와 시간을 선택해주세요.";
      } else {
        this.datetimeError = "";
      }
    },

    clampDatetime() {
      if (!this.form.meetingAt) return;
      if (new Date(this.form.meetingAt) <= new Date()) {
        this.form.meetingAt = this.nowDatetime;
        this.datetimeError = "";
      }
    },

    async fetchPlaceCandidates(query) {
      const q = (query || "").trim();
      if (q.length < 2) {
        this.placeCandidates = [];
        this.placeDropdownOpen = false;
        this.placeActiveIndex = -1;
        return;
      }
      this.placeLoading = true;
      try {
        const res = await API.get("/meeting/place/candidates", { params: { query: q } });
        const list = Array.isArray(res.data) ? res.data : [];
        this.placeCandidates = list;
        this.placeDropdownOpen = true;
        this.placeActiveIndex = -1;
      } catch (e) {
        this.placeCandidates = [];
        this.placeDropdownOpen = false;
        this.placeActiveIndex = -1;
      } finally {
        this.placeLoading = false;
      }
    },

    schedulePlaceSearch() {
      clearTimeout(this.placeDebounceTimer);
      const looksLikeAddr = /(\d+(-\d+)?)/.test(this.form.place) && /(시|도|구|군|동|로|길|대로)/.test(this.form.place);
      if (looksLikeAddr) {
        this.placeCandidates = [];
        this.placeDropdownOpen = false;
        this.placeActiveIndex = -1;
        return;
      }
      this.placeDebounceTimer = setTimeout(() => {
        this.fetchPlaceCandidates(this.form.place);
      }, 800);
    },

    onPlaceInput(e) {
      this.form.place = e.target.value;
      this.form.latitude = null;
      this.form.longitude = null;
      this.placeError = "";
      if (this.isComposing) return;
      this.schedulePlaceSearch();
    },

    onPlaceCompositionEnd(e) {
      this.isComposing = false;
      this.form.place = e.target.value;
      this.form.latitude = null;
      this.form.longitude = null;
      this.placeError = "";
      this.schedulePlaceSearch();
    },

    onPlaceFocus() {
      if (this.placeCandidates.length) this.placeDropdownOpen = true;
    },

    selectPlaceCandidate(c) {
      this.form.place = c?.address || c?.name || this.form.place;
      this.form.latitude = c?.latitude ?? null;
      this.form.longitude = c?.longitude ?? null;
      this.placeDropdownOpen = false;
      this.placeActiveIndex = -1;
      this.placeCandidates = [];
      this.placeError = "";
    },

    movePlaceActive(delta) {
      if (!this.placeDropdownOpen || !this.placeCandidates.length) return;
      const max = this.placeCandidates.length - 1;
      let next = this.placeActiveIndex + delta;
      if (next < 0) next = max;
      if (next > max) next = 0;
      this.placeActiveIndex = next;
    },

    selectActivePlaceCandidate() {
      if (!this.placeDropdownOpen || !this.placeCandidates.length) return;
      const idx = this.placeActiveIndex;
      if (idx < 0) return;
      this.selectPlaceCandidate(this.placeCandidates[idx]);
    },

    handleOutsideClick(e) {
      const bankWrapper = this.$refs.bankDropdownWrapper;
      if (bankWrapper && !bankWrapper.contains(e.target)) {
        this.bankDropdownOpen = false;
      }
      const placeWrapper = this.$refs.placeDropdownWrapper;
      if (placeWrapper && !placeWrapper.contains(e.target)) {
        this.placeDropdownOpen = false;
        this.placeActiveIndex = -1;
      }
    },

    validate() {
      this.placeError = ""; // ✅ 초기화
      const e = {};
      if (!this.form.meetingName.trim()) e.meetingName = "모임명을 입력하세요.";
      if ((this.form.meetingName || "").length > 50) e.meetingName = "모임명은 50자까지 입력 가능합니다.";
      if (!this.form.place.trim()) e.place = "모임 장소를 입력하세요.";
      if (!this.form.description.trim()) e.description = "모임 설명을 입력하세요.";

      if (!this.form.meetingAt) {
        e.meetingAt = "모임 일시를 선택하세요.";
      } else {
        this.validateDatetime();
        if (this.datetimeError) e.meetingAt = this.datetimeError;
      }

      const placeValue = (this.form.place || "").trim();
      const looksLikeAddr = /(\d+(-\d+)?)/.test(placeValue) && /(시|도|구|군|동|로|길|대로)/.test(placeValue);
      if (!e.place && !looksLikeAddr && (this.form.latitude == null || this.form.longitude == null)) {
        e.place = "키워드 장소는 후보에서 선택해주세요.";
      }
      if (this.form.maxMembers != null && this.form.maxMembers !== "" && Number(this.form.maxMembers) > 500) {
        e.maxMembers = "최대 500명까지 입력 가능합니다.";
      }
      if (this.form.feeType === "PAID") {
        if (this.form.fee === null || this.form.fee === "") e.fee = "참가비를 입력하세요.";
        if (!this.form.bankName?.trim()) e.bankName = "은행명을 입력하세요.";
        if (!this.form.accountNumber?.trim()) e.accountNumber = "계좌번호를 입력하세요.";
        if (!this.form.accountHolder?.trim()) e.accountHolder = "예금주를 입력하세요.";
      }
      this.errors = e;
      return Object.keys(e).length === 0;
    },

    formatDatetime(dt) {
      if (!dt) return "";
      const d = dayjs.utc(dt).tz("Asia/Seoul");
      if (!d.isValid()) return String(dt);
      return `${d.month() + 1}/${d.date()} ${String(d.hour()).padStart(2, "0")}:${String(d.minute()).padStart(2, "0")}`;
    },

    // formatDatetime(dt) {
    //   if (!dt) return "";
    //   const normalized = typeof dt === "string" && dt.includes(" ") ? dt.replace(" ", "T") : dt;
    //   const d = new Date(normalized);
    //   if (isNaN(d.getTime())) return String(dt);
    //   return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    // },

    submitForm() {
      this.serverError = "";
      this.placeError = "";
      if (!this.validate()) return;

      if (this.form.feeType === "PAID") {
        this.showPaidCreateConfirm = true;
        return;
      }
      this.doSubmitForm();
    },

    confirmPaidCreate() {
      this.showPaidCreateConfirm = false;
      this.doSubmitForm();
    },

    async doSubmitForm() {
      this.isLoading = true;
      try {
        let profileImageUrl = null;
        if (this.form.profileImage instanceof File) {
          const file = this.form.profileImage;
          const presignedRes = await API.get("/meeting/presigned-url", {
            params: { fileName: file.name || "meeting-image.jpg" },
          });
          const presignedUrl = presignedRes.data;
          await fetch(presignedUrl, { method: "PUT", body: file });
          profileImageUrl = presignedUrl.split("?")[0];
        }

        const dto = {
          crewId: Number(this.crewId),
          meetingName: this.form.meetingName,
          place: this.form.place,
          latitude: this.form.latitude,
          longitude: this.form.longitude,
          meetingAt: this.form.meetingAt,
          maxMembers: this.form.maxMembers || null,
          description: this.form.description,
          feeType: this.form.feeType,
          fee: this.form.feeType === "PAID" ? this.form.fee : 0,
          bankName: this.form.feeType === "PAID" ? this.form.bankName : null,
          accountNumber: this.form.feeType === "PAID" ? this.form.accountNumber : null,
          accountHolder: this.form.feeType === "PAID" ? this.form.accountHolder : null,
          profileImage: profileImageUrl,
        };

        const { data: meetingId } = await API.post("/meeting/create", dto, {
          headers: { "Content-Type": "application/json" },
        });

        this.$emit("created", {
          meetingId,
          title: this.form.meetingName,
          datetime: this.form.meetingAt,
          datetimeDisplay: this.formatDatetime(this.form.meetingAt),
          location: this.form.place,
          fee: this.form.feeType === "PAID" ? this.form.fee : 0,
          status: "모집중",
          profileImage: profileImageUrl ?? this.imagePreview,
        });

        this.$emit("close");
      } catch (err) {
        // ✅ 에러 메시지 파싱
        const data = err.response?.data;
        let msg = "";
        if (data && typeof data === "object" && data.error_message) {
          msg = data.error_message;
        } else if (data && typeof data === "object" && data.message) {
          msg = data.message;
        } else if (typeof data === "string" && data.trim()) {
          msg = data;
        } else {
          msg = "모임 생성에 실패했습니다. 다시 시도해 주세요.";
        }

        // ✅ 주소 관련 에러는 장소 입력창 아래에 표시
        if (msg.includes("후보 선택") || msg.includes("주소를 찾을 수 없습니다")) {
          this.placeError = "정확한 주소를 입력해주세요.";
          this.fetchPlaceCandidates(this.form.place);
          this.placeDropdownOpen = true;
        } else {
          this.serverError = msg;
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease, max-height 0.3s ease;
  overflow: hidden;
  max-height: 1000px;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
}

.meeting-create-image-section { margin-bottom: 1rem; }
.img-preview-box { position: relative; aspect-ratio: 16/9; border-radius: 10px; overflow: hidden; border: 2px solid #e8e8e8; }
.img-preview { width: 100%; height: 100%; object-fit: cover; display: block; }
.img-overlay { position: absolute; inset: 0; background: transparent; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
.img-preview-box:hover .img-overlay { background: rgba(0, 0, 0, 0.4); }
.img-replace { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #fff; border: none; border-radius: 8px; font-size: 12.5px; font-weight: 700; color: #1a1a1a; cursor: pointer; opacity: 0; transform: translateY(4px); transition: all 0.2s; }
.img-preview-box:hover .img-replace { opacity: 1; transform: translateY(0); }
.img-drop { cursor: pointer; display: block; }
.img-drop-content { border: 2px dashed #bae6fd; border-radius: 10px; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 44px 24px; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: all 0.18s; }
.img-drop:hover .img-drop-content { border-color: #4fa8d8; background: #e0f2fe; transform: translateY(-2px); }
.img-drop-icon { width: 56px; height: 56px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15); margin-bottom: 2px; }
.img-drop-title { font-size: 14px; font-weight: 700; color: #0369a1; margin: 0; }
.img-drop-hint { font-size: 12px; color: #7ab8d8; margin: 0; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); }

/* 유료 모임 생성 확인 토스트 */
.paid-create-toast-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}
.paid-create-toast {
  position: relative;
  z-index: 100;
  margin: 1rem;
  min-width: 320px;
  max-width: 90vw;
  padding: 1.25rem 1.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
}
.paid-create-toast__text {
  margin: 0 0 1rem 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: #374151;
}
.paid-create-toast__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.paid-create-toast__btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.paid-create-toast__btn--cancel {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}
.paid-create-toast__btn--cancel:hover {
  background: #e5e7eb;
}
.paid-create-toast__btn--confirm {
  background: #4FA8D8;
  color: #fff;
  border: none;
}
.paid-create-toast__btn--confirm:hover:not(:disabled) {
  background: #3A8FC0;
}
.paid-create-toast__btn--confirm:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>