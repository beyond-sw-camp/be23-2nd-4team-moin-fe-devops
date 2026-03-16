<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-2 mb-2">
          <div class="w-12 h-12 flex items-center justify-center">
            <LogoComponent class-name="w-12 h-12" type="default" />
          </div>
          <h1 class="text-3xl font-bold text-gray-900">모인</h1>
        </div>
        <p class="text-gray-500 font-medium">거의 다 됐어요! 프로필을 완성해주세요.</p>
      </div>

      <div class="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl">
        <form @submit.prevent="handleSubmit" class="space-y-5">

          <!-- 프로필 이미지 -->
          <div class="flex flex-col items-center mb-6">
            <div class="relative group">
              <div class="w-28 h-28 rounded-full overflow-hidden border-4 border-sky-50 bg-gray-100 shadow-inner">
                <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <label for="file-upload" class="absolute bottom-1 right-1 bg-[#4FA8D8] p-2 rounded-full cursor-pointer shadow-lg hover:bg-[#3A8FC0] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
              <!-- 선택 시 미리보기만, S3 업로드는 제출 버튼 클릭 시 -->
              <input id="file-upload" type="file" class="hidden" accept="image/*" @change="handleFileChange" />
            </div>
            <p class="text-xs text-gray-400 mt-3 text-center">나를 표현하는 사진을 올려주세요</p>
          </div>

          <!-- 이메일 / 닉네임 -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">이메일</label>
              <input type="email" v-model="formData.email" disabled
                     class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">
                닉네임 <span class="text-[#4FA8D8]">*</span>
              </label>
              <input type="text" v-model="formData.nickname" placeholder="모인에서 사용할 이름"
                     class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4FA8D8] focus:border-transparent outline-none transition-all" />
            </div>
          </div>

          <!-- 도시 / 구 -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">도시</label>
              <div class="region-wrap" @click="regionDropOpen = !regionDropOpen" ref="regionDrop">
                <span :class="formData.city ? 'text-gray-800' : 'text-gray-400'">
                  {{ formData.city || '도시 선택' }}
                </span>
                <span class="region-arrow" :class="{ 'rotate-180': regionDropOpen }">▾</span>
                <div v-if="regionDropOpen" class="region-dropdown">
                  <div class="region-dropdown-item" :class="{ active: !formData.city }" @click.stop="selectRegion('')">선택 안 함</div>
                  <div
                    v-for="r in regions" :key="r.value"
                    class="region-dropdown-item" :class="{ active: formData.city === r.value }"
                    @click.stop="selectRegion(r.value)"
                  >{{ r.label }}</div>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">구</label>
              <div
                class="region-wrap" :class="{ 'region-wrap--disabled': !formData.city }"
                @click="formData.city && (districtDropOpen = !districtDropOpen)"
                ref="districtDrop"
              >
                <span :class="formData.street ? 'text-gray-800' : 'text-gray-400'">
                  {{ formData.street || (formData.city ? '구 선택' : '도시 먼저 선택') }}
                </span>
                <span class="region-arrow" :class="{ 'rotate-180': districtDropOpen }">▾</span>
                <div v-if="districtDropOpen" class="region-dropdown">
                  <div class="region-dropdown-item" :class="{ active: !formData.street }" @click.stop="selectDistrict('')">선택 안 함</div>
                  <div
                    v-for="d in districtOptions" :key="d"
                    class="region-dropdown-item" :class="{ active: formData.street === d }"
                    @click.stop="selectDistrict(d)"
                  >{{ d }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 동·읍·면 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">동·읍·면을 입력해주세요</label>
            <DongSearchInput
              v-model="formData.dong"
              :city-filter="formData.city"
              :district-filter="formData.street"
              placeholder="예: 역삼동, 서초동"
              @select="onDongSelect"
            />
          </div>

          <!-- 생년월일 / MBTI -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">생년월일</label>
              <input type="date" v-model="formData.birthDate"
                     class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4FA8D8] outline-none" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">
                MBTI <span class="text-[#4FA8D8]">*</span>
              </label>
              <div class="region-wrap" @click="mbtiDropOpen = !mbtiDropOpen" ref="mbtiDrop">
                <span :class="formData.mbti ? 'text-gray-800' : 'text-gray-400'">
                  {{ formData.mbti || 'MBTI 선택' }}
                </span>
                <span class="region-arrow" :class="{ 'rotate-180': mbtiDropOpen }">▾</span>
                <div v-if="mbtiDropOpen" class="region-dropdown">
                  <div
                    v-for="m in mbtiTypes" :key="m"
                    class="region-dropdown-item" :class="{ active: formData.mbti === m }"
                    @click.stop="selectMbti(m)"
                  >{{ m }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 성별 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              성별 <span class="text-[#4FA8D8]">*</span>
            </label>
            <div class="flex gap-3">
              <button type="button" v-for="g in genderOptions" :key="g.value"
                      @click="formData.gender = g.value"
                      :class="['flex-1 py-3 rounded-xl border-2 font-medium transition-all',
                        formData.gender === g.value
                          ? 'border-[#4FA8D8] bg-sky-50 text-[#4FA8D8]'
                          : 'border-gray-100 text-gray-400 hover:border-gray-200']">
                {{ g.label }}
              </button>
            </div>
          </div>

          <!-- 관심사 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              관심사 (복수 선택) <span class="text-[#4FA8D8]">*</span>
            </label>
            <div class="grid grid-cols-4 gap-2">
              <button v-for="cat in categoryOptions" :key="cat.value"
                      type="button" @click="toggleCategory(cat.value)"
                      :class="['py-2 rounded-lg text-xs font-medium border-2 transition-all',
                        formData.categories.includes(cat.value)
                          ? 'border-[#4FA8D8] bg-sky-50 text-[#4FA8D8]'
                          : 'border-gray-100 text-gray-500 hover:border-gray-200']">
                {{ cat.label }}
              </button>
            </div>
          </div>

          <button type="submit" :disabled="submitting"
                  class="w-full py-4 bg-[#4FA8D8] hover:bg-[#3A8FC0] text-white font-bold rounded-2xl shadow-lg shadow-sky-200 transition-all active:scale-95 disabled:opacity-50 mt-4">
            {{ submitting ? '저장 중...' : '모인 시작하기' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import LogoComponent from '@/components/user/LogoComponent.vue';
import DongSearchInput from './DongSearchInput.vue';

const API = axios.create({ baseURL: process.env.VUE_APP_API_BASE_URL });

const DISTRICTS_BY_REGION = {
  '서울': ['강남구','강동구','강북구','강서구','관악구','광진구','구로구','금천구','노원구','도봉구','동대문구','동작구','마포구','서대문구','서초구','성동구','성북구','송파구','양천구','영등포구','용산구','은평구','종로구','중구','중랑구'],
  '부산': ['강서구','금정구','기장군','남구','동구','동래구','부산진구','북구','사상구','사하구','서구','수영구','연제구','영도구','중구','해운대구'],
  '대구': ['남구','달서구','달성군','동구','북구','서구','수성구','중구','군위군'],
  '인천': ['계양구','미추홀구','남동구','동구','부평구','서구','연수구','중구','강화군','옹진군'],
  '광주': ['광산구','남구','동구','북구','서구'],
  '대전': ['대덕구','동구','서구','유성구','중구'],
  '울산': ['남구','동구','북구','중구','울주군'],
  '세종': ['조치원읍','연기면','연동면','부강면','금남면','장군면','연서면','전의면','전동면','소정면'],
  '경기': ['수원시','성남시','용인시','고양시','화성시','부천시','남양주시','안산시','안양시','평택시','시흥시','김포시','파주시','의정부시','광주시','하남시','광명시','군포시','오산시','이천시','안성시','구리시','양주시','포천시','의왕시','여주시','동두천시','과천시','가평군','양평군','연천군'],
  '강원': ['춘천시','원주시','강릉시','동해시','태백시','속초시','삼척시','홍천군','횡성군','영월군','평창군','정선군','철원군','화천군','양구군','인제군','고성군','양양군'],
  '충북': ['청주시','충주시','제천시','보은군','옥천군','영동군','증평군','진천군','괴산군','음성군','단양군'],
  '충남': ['천안시','공주시','보령시','아산시','서산시','논산시','계룡시','당진시','금산군','부여군','서천군','청양군','홍성군','예산군','태안군'],
  '전북': ['전주시','군산시','익산시','정읍시','남원시','김제시','완주군','진안군','무주군','장수군','임실군','순창군','고창군','부안군'],
  '전남': ['목포시','여수시','순천시','나주시','광양시','담양군','곡성군','구례군','고흥군','보성군','화순군','장흥군','강진군','해남군','영암군','무안군','함평군','영광군','장성군','완도군','진도군','신안군'],
  '경북': ['포항시','경주시','김천시','안동시','구미시','영주시','영천시','상주시','문경시','경산시','의성군','청송군','영양군','영덕군','청도군','고령군','성주군','칠곡군','예천군','봉화군','울진군','울릉군'],
  '경남': ['창원시','진주시','통영시','사천시','김해시','밀양시','거제시','양산시','의령군','함안군','창녕군','고성군','남해군','하동군','산청군','함양군','거창군','합천군'],
  '제주': ['제주시','서귀포시'],
};

const REGIONS = [
  { label: '서울', value: '서울' }, { label: '부산', value: '부산' },
  { label: '대구', value: '대구' }, { label: '인천', value: '인천' },
  { label: '광주', value: '광주' }, { label: '대전', value: '대전' },
  { label: '울산', value: '울산' }, { label: '세종', value: '세종' },
  { label: '경기', value: '경기' }, { label: '강원', value: '강원' },
  { label: '충북', value: '충북' }, { label: '충남', value: '충남' },
  { label: '전북', value: '전북' }, { label: '전남', value: '전남' },
  { label: '경북', value: '경북' }, { label: '경남', value: '경남' },
  { label: '제주', value: '제주' },
];

export default {
  name: 'InfoUpdatePageComponent',
  components: { LogoComponent, DongSearchInput },
  inject: ['handleLogin'],
  data() {
    return {
      submitting: false,
      selectedFile: null,
      imagePreview: null,
      regionDropOpen: false,
      districtDropOpen: false,
      mbtiDropOpen: false,
      outsideClickHandler: null,
      regions: REGIONS,
      formData: {
        email: '',
        nickname: '',
        city: '',
        street: '',
        dong: '',
        birthDate: '',
        gender: '',
        mbti: '',
        categories: []
      },
      genderOptions: [
        { label: '남성', value: 'MALE' },
        { label: '여성', value: 'FEMALE' }
      ],
      categoryOptions: [
        { label: '운동', value: 'SPORT' }, { label: '독서', value: 'BOOK' },
        { label: '요리', value: 'COOK' }, { label: '취미', value: 'DIY' },
        { label: '여행', value: 'TRAVEL' }, { label: '어학', value: 'LANGUAGE' },
        { label: '자동차', value: 'CAR' }, { label: '게임', value: 'GAME' },
        { label: '문화', value: 'CULTURE' }, { label: '펫', value: 'PET' }
      ],
      mbtiTypes: ['ISTJ','ISFJ','INFJ','INTJ','ISTP','ISFP','INFP','INTP','ESTP','ESFP','ENFP','ENTP','ESTJ','ESFJ','ENFJ','ENTJ'],
    }
  },
  computed: {
    districtOptions() {
      return DISTRICTS_BY_REGION[this.formData.city] || [];
    }
  },
  watch: {
    'formData.city'() {
      this.formData.street = '';
      this.districtDropOpen = false;
    }
  },
  created() {
    const token = localStorage.getItem('token');
    if (!token) { this.$router.replace('/login'); return; }
    const payload = this.decodeJwtPayload(token);
    this.formData.email = payload?.email || payload?.sub || '';
  },
  mounted() {
    this.outsideClickHandler = (e) => {
      if (this.$refs.regionDrop && !this.$refs.regionDrop.contains(e.target))
        this.regionDropOpen = false;
      if (this.$refs.districtDrop && !this.$refs.districtDrop.contains(e.target))
        this.districtDropOpen = false;
      if (this.$refs.mbtiDrop && !this.$refs.mbtiDrop.contains(e.target))
        this.mbtiDropOpen = false;
    };
    document.addEventListener('click', this.outsideClickHandler);
  },
  beforeUnmount() {
    if (this.outsideClickHandler)
      document.removeEventListener('click', this.outsideClickHandler);
  },
  methods: {
    onDongSelect(item) {
      if (!this.formData.city)   this.formData.city   = item.city;
      if (!this.formData.street) this.formData.street = item.district;
      this.formData.dong = item.dong;
    },
    decodeJwtPayload(token) {
      try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      } catch (e) { return null; }
    },
    selectRegion(value) {
      this.formData.city = value;
      this.formData.street = '';
      this.regionDropOpen = false;
    },
    selectDistrict(value) {
      this.formData.street = value;
      this.districtDropOpen = false;
    },
    selectMbti(value) {
      this.formData.mbti = value;
      this.mbtiDropOpen = false;
    },
    // 이미지 선택 시 미리보기만 저장 — S3 업로드 안 함
    handleFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.imagePreview = URL.createObjectURL(file);
      }
    },
    toggleCategory(val) {
      const idx = this.formData.categories.indexOf(val);
      if (idx > -1) this.formData.categories.splice(idx, 1);
      else this.formData.categories.push(val);
    },

    async handleSubmit() {
      // 필수 검증
      if (!this.formData.nickname?.trim()) { alert('닉네임은 필수 입력값입니다.'); return; }
      if (!this.formData.gender)           { alert('성별은 필수 입력값입니다.'); return; }
      if (!this.formData.mbti)             { alert('MBTI는 필수 입력값입니다.'); return; }
      if (!this.formData.categories?.length) { alert('관심사를 하나 이상 선택해주세요.'); return; }

      this.submitting = true;
      const token = localStorage.getItem('token');

      try {
        // 1. 이미지가 있으면 제출 시 presigned URL 발급 후 S3 업로드 (1회만)
        let profileImageUrl = null;
        if (this.selectedFile) {
          const file = this.selectedFile;

          // presigned URL 발급 (로그인 상태이므로 토큰 포함)
          const presignedRes = await API.get('/user/presigned-url', {
            params: { fileName: file.name },
            headers: { Authorization: `Bearer ${token}` }
          });
          const presignedUrl = presignedRes.data;

            await fetch(presignedUrl, {
            method: 'PUT',
            body: file
          });

          // 쿼리스트링 제거한 순수 파일 URL
          profileImageUrl = presignedUrl.split('?')[0];
        }

        // 2. DTO JSON 전송
        const dto = {
          email:        this.formData.email,
          nickname:     this.formData.nickname,
          city:         this.formData.city     || null,
          district:     this.formData.street   || null,  // DTO: district = 구
          street:       this.formData.dong     || null,   // DTO: street = 동·읍·면
          birthDate:    this.formData.birthDate || null,
          gender:       this.formData.gender,
          mbti:         this.formData.mbti,
          categories:   this.formData.categories,
          profileImage: profileImageUrl
        };

        const res = await API.post('/user/info-update', dto, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        const { accessToken, refreshToken } = res.data;
        if (accessToken) localStorage.setItem('token', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

        if (this.handleLogin) this.handleLogin();
        this.$router.replace('/');
      } catch (e) {
        console.error('업데이트 실패:', e);
        const msg = e.response?.data?.message
          || e.response?.data?.error
          || e.response?.data
          || '저장 중 오류가 발생했습니다.';
        alert(`오류: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
      } finally {
        this.submitting = false;
      }
    }
  }
}
</script>

<style scoped>
.region-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.region-wrap:hover { border-color: #4FA8D8; }
.region-wrap:focus-within {
  border-color: #4FA8D8;
  box-shadow: 0 0 0 2px rgba(79, 168, 216, 0.25);
}
.region-arrow {
  font-size: 11px;
  color: #9ca3af;
  transition: transform 0.2s;
  flex-shrink: 0;
}
.region-arrow.rotate-180 { transform: rotate(180deg); }
.region-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  max-height: 220px;
  overflow-y: auto;
  z-index: 200;
  padding: 6px 0;
}
.region-dropdown-item {
  padding: 9px 16px;
  font-size: 13.5px;
  color: #374151;
  cursor: pointer;
  transition: background 0.1s;
}
.region-dropdown-item:hover { background: #EBF6FC; color: #4FA8D8; }
.region-dropdown-item.active { font-weight: 700; color: #4FA8D8; background: #f0f9ff; }
.region-wrap--disabled { background: #f9fafb; cursor: not-allowed; opacity: 0.6; }
.region-wrap--disabled:hover { border-color: #e5e7eb; }
</style>