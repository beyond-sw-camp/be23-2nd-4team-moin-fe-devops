<template>
  <div class="page-root">

    <!-- 토스트 -->
    <div
      v-if="toastMessage"
      class="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg"
      :class="toastType === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'"
    >
      {{ toastMessage }}
    </div>

    <!-- GNB -->
    <header class="gnb">
      <div class="gnb-inner">
        <div class="gnb-left">
          <span class="gnb-title">크루생성중</span>
          <span class="gnb-divider-v"></span>
          <div class="gnb-steps">
            <span
              v-for="(step, i) in steps"
              :key="i"
              :class="['gnb-step', i < currentStep && 'done', i === currentStep && 'active']"
            >
              <span class="gnb-step-num">{{ i + 1 }}</span>
              <span class="gnb-step-label">{{ step }}</span>
            </span>
          </div>
        </div>
      </div>
    </header>

    <div class="body-wrap">

      <!-- LNB -->
      <aside class="lnb">
        <nav class="lnb-nav">
          <a class="lnb-item" href="#" @click.prevent="doNavigate('home')">
            <svg class="lnb-icon" style="color:#4A90D9" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span class="lnb-txt">홈</span>
          </a>
          <a class="lnb-item" href="#" @click.prevent="doNavigate('my-crews')">
            <svg class="lnb-icon" style="color:#7B8FA6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            <span class="lnb-txt">내 크루</span>
          </a>
          <a class="lnb-item" href="#" @click.prevent="doNavigate('recommendations')">
            <svg class="lnb-icon" style="color:#3DAA7D" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/>
            </svg>
            <span class="lnb-txt">추천 크루</span>
          </a>
          <a class="lnb-item" href="#" @click.prevent="doNavigate('rising')">
            <svg class="lnb-icon" style="color:#E8854A" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
            </svg>
            <span class="lnb-txt">급상승 루키 크루</span>
          </a>
          <a class="lnb-item" href="#" @click.prevent="doNavigate('meetings')">
            <svg class="lnb-icon" style="color:#5B9BD5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
            <span class="lnb-txt">내 모임 일정</span>
          </a>
          <a class="lnb-item" href="#" @click.prevent="doNavigate('recent')">
            <svg class="lnb-icon" style="color:#E86A6A" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
            </svg>
            <span class="lnb-txt">최근 본 크루</span>
          </a>

          <div class="lnb-divider"></div>

          <p class="lnb-section-label">작성 현황</p>
          <div class="lnb-checklist">
            <div v-for="item in checklistItems" :key="item.key" :class="['lnb-check', item.done && 'done']">
              <div class="lnb-check-dot">
                <svg v-if="item.done" fill="currentColor" viewBox="0 0 24 24" style="width:10px;height:10px;color:#fff;">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <span class="lnb-check-txt">{{ item.label }}</span>
            </div>
            <div class="lnb-bar-wrap">
              <div class="lnb-bar">
                <div class="lnb-bar-fill" :style="{width: progressPct+'%'}"></div>
              </div>
              <span class="lnb-bar-txt">{{ doneCount }}/{{ checklistItems.length }}</span>
            </div>
          </div>
        </nav>
      </aside>

      <!-- MAIN -->
      <main class="main">
        <div class="cols">

          <!-- 왼쪽: 폼 -->
          <div class="col-form">
            <div class="page-head">
              <h1 class="page-title">나만의 크루를 만들어보세요 <span class="title-sparkle">✦</span></h1>
            </div>

            <form @submit.prevent="handleSubmit">

              <!-- 01 이미지 -->
              <div class="section">
                <div class="sec-label-row">
                  <span class="sec-num">01</span>
                  <span class="sec-title">대표 이미지</span>
                </div>

                <div v-if="previewImage" class="img-preview-box">
                  <img :src="previewImage" class="img-preview" alt="preview" />
                  <div class="img-overlay">
                    <button type="button" @click="removeImage" class="img-replace">
                      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="width:14px;height:14px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      이미지 교체
                    </button>
                  </div>
                </div>

                <label v-else for="imgInput" class="img-drop">
                  <div class="img-drop-content">
                    <div class="img-drop-icon">
                      <svg fill="currentColor" viewBox="0 0 24 24" style="width:28px;height:28px;color:#4FA8D8;">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                      </svg>
                    </div>
                    <p class="img-drop-title">클릭하여 이미지 업로드</p>
                    <p class="img-drop-hint">JPG · PNG · 최대 10MB</p>
                  </div>
                  <input id="imgInput" type="file" accept="image/*" @change="handleImage" class="sr-only" />
                </label>

                <p v-if="errors.image" class="err">{{ errors.image }}</p>
              </div>

              <!-- 02 크루명 -->
              <div class="section">
                <div class="sec-label-row">
                  <span class="sec-num">02</span>
                  <span class="sec-title">크루명</span>
                </div>

                <div class="input-wrap">
                  <input
                    type="text"
                    maxlength="30"
                    placeholder="크루명을 입력해주세요"
                    v-model.trim="formData.crewName"
                    :class="['styled-input', errors.crewName && 'input-err']"
                  />
                  <span class="input-cnt">{{ formData.crewName.length }}/30</span>
                </div>
                <p v-if="errors.crewName" class="err">{{ errors.crewName }}</p>
              </div>

              <!-- 03 카테고리 -->
              <div class="section">
                <div class="sec-label-row">
                  <span class="sec-num">03</span>
                  <span class="sec-title">카테고리</span>
                </div>

                <div class="cat-grid">
                  <button
                    v-for="cat in CATS"
                    :key="cat.value"
                    type="button"
                    @click="formData.categoryType = cat.value"
                    :class="['cat-btn', formData.categoryType === cat.value && 'cat-on']"
                  >
                    <span class="cat-lbl">{{ cat.label }}</span>
                  </button>
                </div>
                <p v-if="errors.categoryType" class="err">{{ errors.categoryType }}</p>
              </div>

              <!-- 04 지역 -->
              <div class="section">
                <div class="sec-label-row">
                  <span class="sec-num">04</span>
                  <span class="sec-title">활동 지역</span>
                </div>

                <div class="region-wrap">
                  <button
                    v-for="r in REGIONS"
                    :key="r"
                    type="button"
                    @click="selectRegion(r)"
                    :class="['region-btn', formData.region === r && 'region-on']"
                  >
                    {{ r }}
                  </button>
                </div>

                <p v-if="errors.region" class="err">{{ errors.region }}</p>

                <transition name="slide-fade">
                  <div v-if="formData.region" class="district-box">
                    <p class="district-label">
                      <svg fill="currentColor" viewBox="0 0 24 24" style="width:11px;height:11px;color:#4FA8D8;">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      {{ formData.region }} 세부 지역
                      <em class="opt-tag">선택사항</em>
                    </p>

                    <div class="district-pills">
                      <button
                        type="button"
                        @click="formData.district=''"
                        :class="['dist-btn', formData.district==='' && 'dist-on']"
                      >
                        전체
                      </button>
                      <button
                        v-for="d in districtOptions"
                        :key="d"
                        type="button"
                        @click="formData.district=d"
                        :class="['dist-btn', formData.district===d && 'dist-on']"
                      >
                        {{ d }}
                      </button>
                    </div>
                  </div>
                </transition>
              </div>

              <!-- 05 소개 -->
              <div class="section">
                <div class="sec-label-row">
                  <span class="sec-num">05</span>
                  <span class="sec-title">크루 소개</span>
                </div>

                <div class="ta-wrap">
                  <textarea
                    rows="5"
                    maxlength="255"
                    placeholder="크루를 소개해주세요"
                    :value="formData.description"
                    @input="formData.description = ($event.target.value || '').slice(0, 255)"
                    :class="['styled-ta', errors.description && 'input-err']"
                  />
                  <span class="ta-cnt">{{ formData.description.length }}/255</span>
                </div>
                <p v-if="errors.description" class="err">{{ errors.description }}</p>
              </div>

              <!-- 06 정원 -->
              <div class="section">
                <div class="sec-label-row">
                  <span class="sec-num">06</span>
                  <span class="sec-title">최대 정원</span>
                </div>

                <div class="member-row">
                  <div class="stepper">
                    <button type="button" class="step-btn" @click="dec" :disabled="formData.maxMembers<=2">
                      <svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" style="width:13px;height:13px;">
                        <path stroke-linecap="round" d="M5 12h14"/>
                      </svg>
                    </button>

                    <div class="step-display">
                      <input
                        type="number"
                        min="2"
                        max="500"
                        v-model.number="formData.maxMembers"
                        :class="['step-input', errors.maxMembers && 'input-err']"
                      />
                      <span class="step-unit">명</span>
                    </div>

                    <button type="button" class="step-btn" @click="inc" :disabled="formData.maxMembers>=500">
                      <svg fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" style="width:13px;height:13px;">
                        <path stroke-linecap="round" d="M12 5v14M5 12h14"/>
                      </svg>
                    </button>
                  </div>

                  <div class="presets">
                    <button
                      v-for="n in [10,20,30,50,100,200]"
                      :key="n"
                      type="button"
                      @click="formData.maxMembers=n"
                      :class="['preset', formData.maxMembers===n && 'preset-on']"
                    >
                      {{ n }}명
                    </button>
                  </div>
                </div>

                <p v-if="errors.maxMembers" class="err">{{ errors.maxMembers }}</p>
              </div>

              <!-- 액션 -->
              <div class="actions">
                <button type="button" class="btn-cancel" @click="doNavigate('home')" :disabled="submitting">취소</button>
                <button type="submit" class="btn-submit" :disabled="submitting">
                  <span v-if="submitting" class="spinner"></span>
                  <template v-else>
                    크루 생성하기
                  </template>
                </button>
              </div>

            </form>
          </div>

          <!-- 오른쪽: 미리보기 -->
          <div class="col-preview">
            <div class="preview-float">
              <p class="preview-label">
                <svg fill="currentColor" viewBox="0 0 24 24" style="width:13px;height:13px;color:#4FA8D8;">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                미리보기
              </p>

              <!-- 홈 카드와 동일한 구조 -->
              <div class="preview-card">
                <div class="card-thumb-area">
                  <img v-if="previewImage" :src="previewImage" class="card-thumb-img" alt="" />
                  <div v-else class="card-thumb-ph">
                    <svg fill="currentColor" viewBox="0 0 24 24" style="width:52px;height:52px;color:#fff;opacity:.2;">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </svg>
                  </div>

                  <div class="card-top-badges">
                    <span v-if="selectedCat" class="cat-badge">{{ selectedCat.label }}</span>
                    <span v-else class="cat-badge cat-badge--empty">카테고리</span>
                  </div>

                  <div class="fav-preview">
                    <svg fill="none" stroke="#aaa" stroke-width="2" viewBox="0 0 24 24" style="width:16px;height:16px;">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>

                  <div class="card-overlay">
                    <h3 class="card-crew-name">{{ formData.crewName || '크루명을 입력해주세요' }}</h3>
                  </div>
                </div>

                <div class="card-body">
                  <p class="card-region">
                    <svg fill="currentColor" viewBox="0 0 24 24" style="width:12px;height:12px;flex-shrink:0;color:#4FA8D8;">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>

                    <span v-if="formData.region">{{ formData.region }}{{ formData.district ? ' ' + formData.district : '' }}</span>
                    <span v-else class="empty-txt">지역 미설정</span>
                  </p>

                  <div class="card-stats">
                    <span class="stat-item">
                      <svg fill="currentColor" viewBox="0 0 24 24" style="width:12px;height:12px;color:#bbb;vertical-align:middle;">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                      </svg>
                      1/{{ formData.maxMembers }}명
                    </span>
                    <span class="stat-sep">·</span>
                    <span class="stat-item">조회 0</span>
                  </div>

                  
                </div>
              </div>

              <!-- ✅ 요청대로: 미리보기의 작성현황(완성도 카드) 제거 -->
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const API = axios.create({ baseURL: process.env.VUE_APP_API_BASE_URL })
API.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

/* 크루 수정과 동일한 카테고리 */
const CATS = [
  { label: '운동', value: 'SPORT' }, { label: '독서', value: 'BOOK' },
  { label: '요리', value: 'COOK' }, { label: '취미', value: 'DIY' },
  { label: '여행', value: 'TRAVEL' }, { label: '어학', value: 'LANGUAGE' },
  { label: '자동차', value: 'CAR' }, { label: '게임', value: 'GAME' },
  { label: '문화', value: 'CULTURE' }, { label: '펫', value: 'PET' },
]
const REGIONS = ['서울','부산','대구','인천','광주','대전','울산','세종','경기','강원','충북','충남','전북','전남','경북','경남','제주']
const DIST = {
  서울:['강남구','강동구','강북구','강서구','관악구','광진구','구로구','금천구','노원구','도봉구','동대문구','동작구','마포구','서대문구','서초구','성동구','성북구','송파구','양천구','영등포구','용산구','은평구','종로구','중구','중랑구'],
  부산:['강서구','금정구','기장군','남구','동구','동래구','부산진구','북구','사상구','사하구','서구','수영구','연제구','영도구','중구','해운대구'],
  대구:['남구','달서구','달성군','동구','북구','서구','수성구','중구','군위군'],
  인천:['계양구','미추홀구','남동구','동구','부평구','서구','연수구','중구','강화군','옹진군'],
  광주:['광산구','남구','동구','북구','서구'],
  대전:['대덕구','동구','서구','유성구','중구'],
  울산:['남구','동구','북구','중구','울주군'],
  세종:['조치원읍','연기면','연동면','부강면','금남면','장군면','연서면','전의면','전동면','소정면'],
  경기:['수원시','성남시','용인시','고양시','화성시','부천시','남양주시','안산시','안양시','평택시','시흥시','김포시','파주시','의정부시','광주시','하남시','광명시','군포시','오산시','이천시','안성시','구리시','양주시','포천시','의왕시','여주시','동두천시','과천시','가평군','양평군','연천군'],
  강원:['춘천시','원주시','강릉시','동해시','태백시','속초시','삼척시','홍천군','횡성군','영월군','평창군','정선군','철원군','화천군','양구군','인제군','고성군','양양군'],
  충북:['청주시','충주시','제천시','보은군','옥천군','영동군','증평군','진천군','괴산군','음성군','단양군'],
  충남:['천안시','공주시','보령시','아산시','서산시','논산시','계룡시','당진시','금산군','부여군','서천군','청양군','홍성군','예산군','태안군'],
  전북:['전주시','군산시','익산시','정읍시','남원시','김제시','완주군','진안군','무주군','장수군','임실군','순창군','고창군','부안군'],
  전남:['목포시','여수시','순천시','나주시','광양시','담양군','곡성군','구례군','고흥군','보성군','화순군','장흥군','강진군','해남군','영암군','무안군','함평군','영광군','장성군','완도군','진도군','신안군'],
  경북:['포항시','경주시','김천시','안동시','구미시','영주시','영천시','상주시','문경시','경산시','의성군','청송군','영양군','영덕군','청도군','고령군','성주군','칠곡군','예천군','봉화군','울진군','울릉군'],
  경남:['창원시','진주시','통영시','사천시','김해시','밀양시','거제시','양산시','의령군','함안군','창녕군','고성군','남해군','하동군','산청군','함양군','거창군','합천군'],
  제주:['제주시','서귀포시'],
}

export default {
  name: 'CrewCreatePageComponent',
  props: { onNavigate: Function },
  data() {
    return {
      submitting: false,
      CATS,
      REGIONS,
      steps: ['기본 정보', '활동 지역', '크루 소개'],
      currentStep: 0,
      formData: {
        crewName: '',
        categoryType: '',
        region: '',
        district: '',
        description: '',
        maxMembers: 20,
        image: null,
      },
      previewImage: null,
      errors: {},
      toastMessage: '',
      toastType: 'info',
    }
  },
  computed: {
    districtOptions() {
      return DIST[this.formData.region] || []
    },
    selectedCat() {
      return CATS.find(c => c.value === this.formData.categoryType) || null
    },
    checklistItems() {
      return [
        { key: 'image',    label: '대표 이미지', done: !!this.previewImage },
        { key: 'name',     label: '크루명',      done: !!this.formData.crewName },
        { key: 'category', label: '카테고리',    done: !!this.formData.categoryType },
        { key: 'region',   label: '활동 지역',   done: !!this.formData.region },
        { key: 'desc',     label: '크루 소개',   done: !!this.formData.description },
      ]
    },
    doneCount() {
      return this.checklistItems.filter(i => i.done).length
    },
    progressPct() {
      return Math.round((this.doneCount / this.checklistItems.length) * 100)
    },
  },
  watch: {
    'formData.region'() {
      this.formData.district = ''
    },
    doneCount(v) {
      if (v <= 2) this.currentStep = 0
      else if (v <= 3) this.currentStep = 1
      else this.currentStep = 2
    },
  },
  methods: {
    doNavigate(key) {
      if (typeof this.onNavigate === 'function') {
        this.onNavigate(key)
        return
      }
      const routes = {
        home: '/',
        'my-crews': '/my/crews',
        recommendations: '/crew/recommendations',
        rising: '/crew/rising-crews',
        meetings: '/my/meetings',
        recent: '/my/recent',
      }
      const path = routes[key]
      if (path && this.$router) this.$router.push(path)
    },
    selectRegion(v) {
      this.formData.region = v
    },
    inc() {
      if (this.formData.maxMembers < 500) this.formData.maxMembers++
    },
    dec() {
      if (this.formData.maxMembers > 2) this.formData.maxMembers--
    },
    handleImage(e) {
      const file = e.target.files?.[0]
      if (!file) return
      if (file.size > 10 * 1024 * 1024) {
        this.errors = { ...this.errors, image: '10MB 이하 이미지를 선택해주세요' }
        return
      }
      this.formData.image = file
      const r = new FileReader()
      r.onloadend = () => {
        this.previewImage = r.result
      }
      r.readAsDataURL(file)
      const ne = { ...this.errors }
      delete ne.image
      this.errors = ne
    },
    removeImage() {
      this.formData.image = null
      this.previewImage = null
    },
    validate() {
      const e = {}
      if (!this.formData.image) e.image = '이미지를 선택해주세요'
      if (!this.formData.crewName) e.crewName = '크루명을 입력해주세요'
      if (!this.formData.categoryType) e.categoryType = '카테고리를 선택해주세요'
      if (!this.formData.region) e.region = '활동 지역을 선택해주세요'
      if (!this.formData.description) e.description = '크루 소개를 입력해주세요'
      if (!this.formData.maxMembers || this.formData.maxMembers < 2) e.maxMembers = '2명 이상 입력해주세요'
      if (this.formData.maxMembers > 500) e.maxMembers = '최대 500명까지 입력 가능합니다'
      this.errors = e
      return !Object.keys(e).length
    },
    async handleSubmit() {
  if (!this.validate() || this.submitting) return
  this.submitting = true

  try {
    // 1. presigned URL 발급 → S3 업로드 (fetch 사용)
    const file = this.formData.image
    const presignedRes = await API.get('/crew/presigned-url', {
      params: { fileName: file.name }
    })
    const presignedUrl = presignedRes.data

    await fetch(presignedUrl, {
      method: 'PUT',
      body: file
    })

    // 쿼리스트링 제거한 순수 URL
    const crewImageUrl = presignedUrl.split('?')[0]

    // 2. DTO JSON 전송 (@RequestBody) - DB 컬럼 길이 제한으로 data too long 방지
    const dto = {
      crewName:     (this.formData.crewName || '').slice(0, 50),
      categoryType: this.formData.categoryType,
      region:       this.formData.region,
      district:     (this.formData.district || '').slice(0, 50) || null,
      description:  (this.formData.description || '').slice(0, 255),
      maxMembers:   Number(this.formData.maxMembers),
      crewImage:    crewImageUrl   // ← S3 URL
    }

    const res = await API.post('/crew/create', dto)
    const crewId = res.data

    this.showToast('크루가 생성되었습니다!', 'success')
    if (this.$router && crewId) this.$router.push(`/crew/${crewId}`)
    else {
      localStorage.setItem('lastCreatedCrewId', String(crewId))
      this.doNavigate('home')
    }
  } catch (e) {
    this.showToast(e.response?.data?.error_message || e.response?.data?.message || '크루 생성에 실패했습니다.', 'error')
  } finally {
    this.submitting = false
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

<style scoped>
*, *::before, *::after { box-sizing: border-box; }

.page-root {
  display: flex; flex-direction: column; min-height: 100vh;
  background: #f5f7fa;
  font-family: "Pretendard", "Apple SD Gothic Neo", -apple-system, sans-serif;
}

/* GNB */
.gnb { position: sticky; top: 64px; z-index: 100; background: #fff; border-bottom: 1px solid #e8e8e8; height: 56px; }
.gnb-inner { display: flex; align-items: center; height: 100%; padding: 0 24px; }
.gnb-left { display: flex; align-items: center; gap: 12px; }
.gnb-logo { width: 30px; height: 30px; border-radius: 8px; background: linear-gradient(135deg,#38BDF8,#0EA5E9); display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(14,165,233,.28); flex-shrink: 0; }
.gnb-title { font-size: 14.5px; font-weight: 800; color: #1a1a1a; letter-spacing: -.3px; flex-shrink: 0; }
.gnb-divider-v { width: 1px; height: 18px; background: #e8e8e8; }
.gnb-steps { display: flex; align-items: center; }
.gnb-step { display: flex; align-items: center; gap: 6px; padding: 5px 14px; font-size: 12.5px; font-weight: 600; color: #bbb; position: relative; transition: all .2s; }
.gnb-step:not(:last-child)::after { content: ''; position: absolute; right: 0; width: 8px; height: 1px; background: #e0e0e0; }
.gnb-step-num { width: 18px; height: 18px; border-radius: 50%; background: #eee; color: #bbb; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; transition: all .2s; }
.gnb-step.done .gnb-step-num { background: #d1fae5; color: #059669; }
.gnb-step.active .gnb-step-num { background: #0EA5E9; color: #fff; box-shadow: 0 2px 6px rgba(14,165,233,.3); }
.gnb-step.active { color: #0EA5E9; font-weight: 700; }

/* body */
.body-wrap { display: flex; flex: 1; }

/* LNB */
.lnb { width: 240px; flex-shrink: 0; position: sticky; top: 120px; height: calc(100vh - 120px); overflow-y: auto; overflow-x: hidden; border-right: 1px solid #e8e8e8; background: #fff; padding: 16px 0; scrollbar-width: none; }
.lnb::-webkit-scrollbar { display: none; }
.lnb-nav { padding: 0 8px; }
.lnb-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; cursor: pointer; text-decoration: none; transition: all .12s; margin-bottom: 2px; }
.lnb-item:hover { background: #EBF6FC; }
.lnb-icon { width: 20px; height: 20px; flex-shrink: 0; }
.lnb-txt { font-size: 13.5px; color: #444; }
.lnb-item:hover .lnb-txt { color: #4FA8D8; }
.lnb-divider { height: 1px; background: #f0f0f0; margin: 12px 8px; }
.lnb-section-label { font-size: 11px; font-weight: 700; color: #bbb; text-transform: uppercase; letter-spacing: .6px; padding: 4px 12px 8px; margin: 0; }
.lnb-checklist { margin: 0 8px; background: #f8fafc; border-radius: 12px; padding: 12px; border: 1px solid #efefef; }
.lnb-check { display: flex; align-items: center; gap: 8px; padding: 5px 0; }
.lnb-check-dot { width: 18px; height: 18px; border-radius: 50%; background: #fff; border: 1.5px solid #ddd; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .25s; }
.lnb-check.done .lnb-check-dot { background: #4FA8D8; border-color: #4FA8D8; }
.lnb-check-txt { font-size: 12.5px; color: #aaa; }
.lnb-check.done .lnb-check-txt { color: #1a1a1a; font-weight: 600; }
.lnb-bar-wrap { padding-top: 10px; border-top: 1px solid #f0f0f0; margin-top: 4px; }
.lnb-bar { height: 3px; background: #e8e8e8; border-radius: 2px; overflow: hidden; margin-bottom: 5px; }
.lnb-bar-fill { height: 100%; background: linear-gradient(90deg,#4FA8D8,#38BDF8); border-radius: 2px; transition: width .5s; }
.lnb-bar-txt { font-size: 11px; color: #aaa; font-weight: 600; }
@media (max-width: 900px) { .lnb { width: 56px; } .lnb-txt, .lnb-section-label, .lnb-checklist { display: none; } .lnb-item { justify-content: center; padding: 10px 0; } }
@media (max-width: 600px) { .lnb { display: none; } }

/* MAIN */
.main { flex: 1; min-width: 0; padding: 32px 36px 72px; }
/* ✅ 미리보기 폭 키움: 300 -> 360 */
.cols { display: grid; grid-template-columns: 1fr 360px; gap: 24px; max-width: 1080px; margin: 0 auto; }

.col-form { align-self: start; }
/* ✅ 스크롤 따라오게 top 맞춤: 24 -> 120 (헤더+gnb 높이랑 맞춤) */
.preview-float { position: sticky; top: 120px; }

/* 페이지 헤드 */
.page-head { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -.4px; margin: 0 0 6px; }
.title-sparkle { color: #0EA5E9; }

/* 섹션 */
.section { background: #fff; border-radius: 16px; border: 1px solid #e8e8e8; padding: 22px 26px; margin-bottom: 10px; transition: border-color .2s, box-shadow .2s; }
.section:focus-within { border-color: #BAE6FD; box-shadow: 0 0 0 3px rgba(56,189,248,.1), 0 4px 16px rgba(0,0,0,.05); }
.sec-label-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.sec-num { font-size: 11px; font-weight: 900; color: #4FA8D8; background: #EBF6FC; padding: 3px 8px; border-radius: 6px; letter-spacing: .3px; flex-shrink: 0; }
.sec-title { font-size: 14.5px; font-weight: 800; color: #0f172a; flex: 1; }

/* 이미지 */
.img-preview-box { position: relative; aspect-ratio: 16/9; border-radius: 10px; overflow: hidden; border: 2px solid #e8e8e8; }
.img-preview { width: 100%; height: 100%; object-fit: cover; display: block; }
.img-overlay { position: absolute; inset: 0; background: transparent; display: flex; align-items: center; justify-content: center; transition: background .2s; }
.img-preview-box:hover .img-overlay { background: rgba(0,0,0,.4); }
.img-replace { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #fff; border: none; border-radius: 8px; font-size: 12.5px; font-weight: 700; color: #1a1a1a; cursor: pointer; opacity: 0; transform: translateY(4px); transition: all .2s; }
.img-preview-box:hover .img-replace { opacity: 1; transform: translateY(0); }
.img-drop { cursor: pointer; display: block; }
.img-drop-content { border: 2px dashed #BAE6FD; border-radius: 10px; background: linear-gradient(135deg,#f0f9ff,#e0f2fe); padding: 44px 24px; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: all .18s; }
.img-drop:hover .img-drop-content { border-color: #4FA8D8; background: #e0f2fe; transform: translateY(-2px); }
.img-drop-icon { width: 56px; height: 56px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(14,165,233,.15); margin-bottom: 2px; }
.img-drop-title { font-size: 14px; font-weight: 700; color: #0369a1; margin: 0; }
.img-drop-hint { font-size: 12px; color: #7ab8d8; margin: 0; }

/* 인풋 */
.input-wrap { position: relative; }
.styled-input { width: 100%; padding: 11px 46px 11px 13px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: 14px; color: #0f172a; background: #fafbfc; outline: none; transition: border-color .15s, box-shadow .15s; }
.styled-input:focus { border-color: #4FA8D8; box-shadow: 0 0 0 3px rgba(79,168,216,.1); background: #fff; }
.styled-input.input-err { border-color: #F87171; }
.input-cnt { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 11.5px; color: #cbd5e1; pointer-events: none; font-weight: 600; }

/* 카테고리 */
.cat-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 7px; }
.cat-btn { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 11px 4px 9px; border: 1.5px solid #e2e8f0; border-radius: 12px; background: #fafbfc; cursor: pointer; transition: all .15s; }
.cat-btn:hover { border-color: #4FA8D8; background: #f0f9ff; transform: translateY(-2px); }
.cat-on { border-color: var(--cc,#4FA8D8); background: color-mix(in srgb, var(--cc,#4FA8D8) 8%, white); transform: translateY(-2px); box-shadow: 0 4px 12px color-mix(in srgb, var(--cc,#4FA8D8) 20%, transparent); }
.cat-ico { font-size: 20px; line-height: 1; }
.cat-lbl { font-size: 10.5px; font-weight: 700; color: #64748b; text-align: center; line-height: 1.3; }
.cat-on .cat-lbl { color: var(--cc,#4FA8D8); }

/* 지역 */
.region-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
.region-btn { padding: 6px 14px; border-radius: 20px; border: 1.5px solid #e2e8f0; background: #fafbfc; font-size: 12.5px; font-weight: 700; color: #475569; cursor: pointer; transition: all .12s; }
.region-btn:hover { border-color: #4FA8D8; color: #4FA8D8; }
.region-on { background: #1a1a2e; color: #fff; border-color: #1a1a2e; box-shadow: 0 3px 10px rgba(26,26,46,.15); }
.district-box { margin-top: 16px; padding-top: 16px; border-top: 1.5px dashed #e2e8f0; }
.district-label { display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: #475569; margin: 0 0 10px; }
.opt-tag { font-size: 11px; font-weight: 600; color: #94a3b8; background: #f1f5f9; padding: 2px 7px; border-radius: 5px; margin-left: 4px; font-style: normal; }
.district-pills { display: flex; flex-wrap: wrap; gap: 5px; }
.dist-btn { padding: 5px 11px; border-radius: 15px; border: 1.5px solid #e2e8f0; background: #fafbfc; font-size: 11.5px; font-weight: 600; color: #64748b; cursor: pointer; transition: all .12s; }
.dist-btn:hover { border-color: #4FA8D8; color: #4FA8D8; }
.dist-on { background: #4FA8D8; color: #fff; border-color: #4FA8D8; }
.slide-fade-enter-active { transition: all .3s ease; }
.slide-fade-leave-active { transition: all .2s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { opacity: 0; transform: translateY(-8px); }

/* 텍스트에리어 */
.ta-wrap { position: relative; }
.styled-ta { width: 100%; padding: 12px 13px 32px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: 14px; color: #0f172a; background: #fafbfc; resize: none; outline: none; line-height: 1.7; transition: border-color .15s, box-shadow .15s; }
.styled-ta:focus { border-color: #4FA8D8; box-shadow: 0 0 0 3px rgba(79,168,216,.1); background: #fff; }
.styled-ta.input-err { border-color: #F87171; }
.ta-cnt { position: absolute; right: 12px; bottom: 10px; font-size: 11.5px; color: #cbd5e1; pointer-events: none; font-weight: 600; }

/* 정원 */
.member-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.stepper { display: flex; align-items: center; gap: 8px; }
.step-btn { width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid #e2e8f0; background: #fff; display: flex; align-items: center; justify-content: center; color: #475569; cursor: pointer; transition: all .12s; }
.step-btn:hover:not(:disabled) { border-color: #4FA8D8; color: #4FA8D8; background: #f0f9ff; }
.step-btn:disabled { opacity: .3; cursor: not-allowed; }
.step-display { display: flex; align-items: center; gap: 4px; }
.step-input { width: 64px; text-align: center; padding: 6px 4px; border: 1.5px solid #e2e8f0; border-radius: 9px; font-size: 19px; font-weight: 900; color: #0f172a; background: #fafbfc; outline: none; }
.step-input:focus { border-color: #4FA8D8; background: #fff; }
.step-input::-webkit-inner-spin-button, .step-input::-webkit-outer-spin-button { -webkit-appearance: none; }
.step-unit { font-size: 13.5px; font-weight: 700; color: #64748b; }
.presets { display: flex; gap: 5px; flex-wrap: wrap; }
.preset { padding: 5px 12px; border-radius: 18px; border: 1.5px solid #e2e8f0; background: #fafbfc; font-size: 12px; font-weight: 700; color: #475569; cursor: pointer; transition: all .12s; }
.preset:hover { border-color: #4FA8D8; color: #4FA8D8; }
.preset-on { background: #4FA8D8; color: #fff; border-color: #4FA8D8; }

/* 에러 */
.err { display: flex; align-items: center; gap: 4px; margin-top: 7px; font-size: 12.5px; color: #F87171; font-weight: 600; }
.sr-only { display: none; }

/* 액션 */
.actions { display: flex; gap: 10px; padding-top: 4px; padding-bottom: 20px; }
.btn-cancel { flex: 0 0 100px; padding: 13px; border: 1.5px solid #e2e8f0; border-radius: 11px; background: #fff; font-size: 13.5px; font-weight: 700; color: #64748b; cursor: pointer; transition: all .15s; }
.btn-cancel:hover:not(:disabled) { border-color: #94a3b8; color: #334155; }
.btn-cancel:disabled { opacity: .5; cursor: not-allowed; }
.btn-submit { flex: 1; padding: 13px 20px; background: linear-gradient(135deg,#38BDF8,#0EA5E9); color: #fff; border: none; border-radius: 11px; font-size: 14.5px; font-weight: 800; letter-spacing: -.2px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 6px 18px rgba(14,165,233,.32); transition: all .2s; }
.btn-submit:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-2px); box-shadow: 0 10px 26px rgba(14,165,233,.38); }
.btn-submit:active:not(:disabled) { transform: translateY(0); }
.btn-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }
.spinner { width: 17px; height: 17px; border: 2.5px solid rgba(255,255,255,.35); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; flex-shrink: 0; }
@keyframes spin { to { transform: rotate(360deg); } }

/* 미리보기 카드 */
.preview-label { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; margin: 0 0 10px 2px; }
.preview-card { background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e8e8e8; box-shadow: 0 4px 20px rgba(0,0,0,.07); transition: box-shadow .2s; }
.preview-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,.1); }
.card-thumb-area { position: relative; aspect-ratio: 4/3; overflow: hidden; background: #1a1a2e; }
.card-thumb-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .3s; }
.preview-card:hover .card-thumb-img { transform: scale(1.04); }
.card-thumb-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg,#1a1a2e,#16213e,#0f3460); }
.card-top-badges { position: absolute; top: 12px; left: 12px; }
.cat-badge { display: inline-flex; align-items: center; gap: 4px; padding: 5px 14px; border-radius: 999px; font-size: 12px; font-weight: 600; border: 1.5px solid rgba(255,255,255,.5); background: rgba(255,255,255,.18); backdrop-filter: blur(10px); color: #fff; }
.cat-badge--empty { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.2); color: rgba(255,255,255,.35); font-style: italic; }
.fav-preview { position: absolute; top: 10px; right: 10px; width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,.92); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,.15); }
.card-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 44px 14px 14px; background: linear-gradient(to top, rgba(0,0,0,.78) 0%, transparent 100%); }
.card-crew-name { font-size: 18px; font-weight: 800; color: #fff; line-height: 1.3; letter-spacing: -.3px; text-shadow: 0 2px 8px rgba(0,0,0,.4); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0; }
.card-body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 5px; }
.card-region { font-size: 12px; color: #888; display: flex; align-items: center; gap: 3px; margin: 0; }
.empty-txt { color: #ccc; font-style: italic; }
.card-stats { display: flex; align-items: center; gap: 5px; }
.stat-item { font-size: 11.5px; color: #bbb; display: inline-flex; align-items: center; gap: 3px; }
.stat-sep { font-size: 10px; color: #ddd; }
.pc-desc { font-size: 12px; color: #888; line-height: 1.6; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

/* 반응형 */
@media (max-width: 1100px) {
  .main { padding: 24px 24px 60px; }
  .cols { grid-template-columns: 1fr 260px; gap: 18px; }
  .gnb-step-label { display: none; }
}
@media (max-width: 900px) {
  .main { padding: 20px 16px 60px; }
  .cols { grid-template-columns: 1fr; }
  .col-preview { display: none; }
  .gnb-steps { display: none; }
}
@media (max-width: 600px) {
  .main { padding: 14px 10px 60px; }
  .cat-grid { gap: 5px; }
  .cat-ico { font-size: 18px; }
  .cat-lbl { font-size: 10px; }
}
</style>