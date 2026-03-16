import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router/index.js'
import './assets/tailwind.css'
import axios from 'axios';
import './plugins/dayjs'

axios.interceptors.request.use(
    config => {
        // 이전에 'token'으로 저장했다면 이름을 맞춰주세요. (여기서는 accessToken 기준)
        const accessToken = localStorage.getItem('token'); 
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// 2. 응답 인터셉터: 401 에러(토큰 만료) 시 재발급 로직
axios.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // 401 에러이고, 재시도한 적이 없는 요청일 때만 실행 (무한 루프 방지)
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error('No refresh token');

                // 주의: 토큰 재발급 요청은 인터셉터가 걸리지 않은 별도의 axios 호출이나 설정을 사용하는게 안전함
                const res = await axios.post(`http://localhost:8080/user/refresh-at`, { 
                    refreshToken: refreshToken 
                });

                const newAccessToken = res.data.accessToken;
                localStorage.setItem("token", newAccessToken); // 'token'으로 통일 권장
                
                // 원래 실패했던 요청의 헤더를 새 토큰으로 교체 후 재요청
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return axios(originalRequest); 
            } catch (refreshError) {
                console.error("토큰 갱신 실패:", refreshError);
                localStorage.clear();
                window.location.href = "/login"; // 경로 확인 필요 (/member/login 인지 /login 인지)
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);
createApp(App).use(router).mount('#app')