<template>
  <div class="min-h-screen bg-gray-50 flex">

    <!-- 권한 없음 -->
    <div v-if="!isAdmin" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <!-- 🚫 → Heroicons NoSymbol Solid (44px) -->
        <div style="display:flex;justify-content:center;margin-bottom:16px;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="44" height="44" style="color:#ef4444;">
            <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd"/>
          </svg>
        </div>
        <p class="text-xl font-bold text-gray-900 mb-2">접근 권한이 없습니다</p>
        <p class="text-gray-500 mb-4">관리자만 접근할 수 있는 페이지입니다.</p>
        <button @click="onNavigate('home')" class="px-4 py-2 bg-[#4FA8D8] text-white rounded-lg text-sm">
          메인으로
        </button>
      </div>
    </div>

    <template v-else>
      <div class="page-root admin-root">
        <LnbMenuComponent
          :active-nav="null"
          :category-options="lnbCategoryOptions"
          :selected-category-values="[]"
          @nav-click="onLnbNavClick"
          @category-click="onLnbCategoryClick"
        />
        <main class="admin-main">
          <div class="admin-wrap">

          <!-- 대시보드 (카드 형식) -->
          <div>
            <div class="page-head">
              <h1 class="page-title">관리자 대시보드 <span class="title-sparkle">✦</span></h1>
            </div>

            <!-- 01 통계 요약 (클릭 시 02에 해당 내역 표시) -->
            <div class="section">
              <div class="sec-label-row">
                <span class="sec-num">01</span>
                <span class="sec-title">통계 요약</span>
              </div>
              <div class="admin-stat-grid">
                <button type="button" class="admin-stat-card admin-stat-card--clickable" :class="{ 'admin-stat-card--active': selectedSection === 'users' }" @click="selectedSection = 'users'; fetchUsers(0)">
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-sm text-gray-500">전체 회원</p>
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style="color:#1d4ed8;">
                        <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z"/>
                      </svg>
                    </div>
                  </div>
                  <p class="text-3xl font-bold text-gray-900">{{ (dashboardStats.totalUsers ?? 0).toLocaleString() }}<span class="text-lg font-semibold text-gray-600">명</span></p>
                </button>
                <button type="button" class="admin-stat-card admin-stat-card--clickable" :class="{ 'admin-stat-card--active': selectedSection === 'reports' && reportTab === 'pending' }" @click="selectedSection = 'reports'; reportTab = 'pending'; fetchPendingReports(); fetchAcceptedReports()">
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-sm text-gray-500">처리 대기 신고</p>
                    <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style="color:#b91c1c;">
                        <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                  <p class="text-3xl font-bold text-gray-900">{{ (dashboardStats.pendingReportCount ?? 0).toLocaleString() }}<span class="text-lg font-semibold text-gray-600">건</span></p>
                  <p class="text-sm text-red-600 font-medium mt-2">즉시 확인 필요</p>
                </button>
                <button type="button" class="admin-stat-card admin-stat-card--clickable" :class="{ 'admin-stat-card--active': selectedSection === 'reports' && reportTab === 'accepted' }" @click="selectedSection = 'reports'; reportTab = 'accepted'; fetchPendingReports(); fetchAcceptedReports()">
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-sm text-gray-500">승인 완료 신고</p>
                    <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style="color:#15803d;">
                        <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                  <p class="text-3xl font-bold text-gray-900">{{ (dashboardStats.acceptedReportCount ?? 0).toLocaleString() }}<span class="text-lg font-semibold text-gray-600">건</span></p>
                </button>
                <button type="button" class="admin-stat-card admin-stat-card--clickable" :class="{ 'admin-stat-card--active': selectedSection === 'settlements' }" @click="selectedSection = 'settlements'; fetchSettlements(0)">
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-sm text-gray-500">정산 내역</p>
                    <div class="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style="color:#0369a1;">
                        <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z"/>
                        <path fill-rule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                  <p class="text-3xl font-bold text-gray-900">{{ (dashboardStats.totalSettlementCount ?? 0).toLocaleString() }}<span class="text-lg font-semibold text-gray-600">건</span></p>
                </button>
              </div>
            </div>

            <!-- 02 내역 보기 (01 카드 클릭 시 해당 테이블 표시) -->
            <div class="section">
              <div class="sec-label-row">
                <span class="sec-num">02</span>
                <span class="sec-title">내역 보기</span>
              </div>
              <div v-if="!selectedSection" class="admin-placeholder">
                <p class="text-gray-500">위 카드를 클릭하여 내역을 확인하세요</p>
              </div>

              <!-- 회원 목록 -->
              <div v-else-if="selectedSection === 'users'" class="admin-table-wrap">
                <div class="p-4 border-b border-gray-200 flex gap-3">
                  <input type="text" placeholder="닉네임, 이메일로 검색..." v-model="userSearch" @keyup.enter="fetchUsers(0)" class="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FA8D8] text-sm" />
                  <button @click="fetchUsers(0)" class="px-4 py-2 bg-[#4FA8D8] text-white rounded-lg text-sm font-medium">검색</button>
                </div>
                <div class="overflow-x-auto">
                  <div v-if="loadingUsers" class="text-center py-8 text-gray-400 text-sm">불러오는 중...</div>
                  <table v-else class="w-full">
                    <thead class="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">닉네임</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">매너점수</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                      <tr v-for="user in userList" :key="user.id" class="hover:bg-gray-50">
                        <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{{ user.nickName }}</td>
                        <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{{ user.email }}</td>
                        <td class="px-6 py-4 whitespace-nowrap"><span :class="['font-medium', user.mannerScore >= 80 ? 'text-green-600' : user.mannerScore >= 60 ? 'text-yellow-600' : 'text-red-600']">{{ user.mannerScore }}점</span></td>
                        <td class="px-6 py-4 whitespace-nowrap"><span :class="['px-2 py-1 rounded-full text-xs font-medium border', user.delYn === 'No' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200']">{{ user.delYn === 'No' ? '정상' : '정지' }}</span></td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <button @click="openMannerModal(user)" class="px-3 py-1 border border-[#4FA8D8] text-[#4FA8D8] hover:bg-sky-50 rounded-lg text-sm font-medium flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z"/><path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z"/></svg>
                            매너점수 변경
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p class="text-sm text-gray-500">총 {{ userPage.totalElements }}명</p>
                  <div class="flex gap-1">
                    <button v-for="p in userPage.totalPages" :key="p" @click="fetchUsers(p - 1)" :class="['px-3 py-1 rounded text-sm', userPage.number === p - 1 ? 'bg-[#4FA8D8] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50']">{{ p }}</button>
                  </div>
                </div>
              </div>

              <!-- 신고 관리 (승인 대기 / 승인 완료) -->
              <div v-else-if="selectedSection === 'reports'" class="admin-table-wrap">
              <div class="flex border-b border-gray-200">
                <button
                  @click="reportTab = 'pending'"
                  :class="['flex-1 px-6 py-4 text-sm font-medium transition-colors',
                    reportTab === 'pending' ? 'text-[#4FA8D8] border-b-2 border-[#4FA8D8]' : 'text-gray-500 hover:text-gray-700']"
                >
                  승인 대기
                  <span v-if="pendingReports.length > 0" class="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {{ pendingReports.length }}
                  </span>
                </button>
                <button
                  @click="reportTab = 'accepted'"
                  :class="['flex-1 px-6 py-4 text-sm font-medium transition-colors',
                    reportTab === 'accepted' ? 'text-[#4FA8D8] border-b-2 border-[#4FA8D8]' : 'text-gray-500 hover:text-gray-700']"
                >
                  승인 완료
                  <span class="ml-2 bg-gray-400 text-white text-xs px-2 py-0.5 rounded-full">{{ acceptedReports.length }}</span>
                </button>
              </div>

              <!-- 승인 대기 -->
              <div v-if="reportTab === 'pending'" class="overflow-x-auto">
                <div v-if="loadingReports" class="text-center py-8 text-gray-400 text-sm">불러오는 중...</div>
                <div v-else-if="pendingReports.length === 0" class="text-center py-8 text-gray-400 text-sm">대기 중인 신고가 없습니다</div>
                <template v-else>
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">신고자</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">피신고 대상</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">신고 내용</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">신고 유형</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr v-for="item in pendingReportsSlice" :key="getPendingReportKey(item)" class="hover:bg-gray-50">
                      <td class="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{{ item.reporterEmail || '-' }}</td>
                      <td class="px-6 py-4 text-sm text-gray-700 max-w-[180px] truncate" :title="item.reportedEmail">{{ item.reportedEmail || '-' }}</td>
                      <td class="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate" :title="item.reportContent">{{ item.reportContent || '-' }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span :class="['px-2 py-1 rounded-full text-xs font-medium border', targetTypeBadge(item.targetType)]">
                          {{ targetTypeLabel(item.targetType) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex gap-2">
                          <button
                            @click="handleAcceptReport(item)"
                            :disabled="reportActionLoading[getReportActionKey(item)]"
                            class="px-3 py-1 border border-green-300 text-green-600 hover:bg-green-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                              <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd"/>
                            </svg>
                            승인
                          </button>
                          <button
                            @click="handleRejectReport(item)"
                            :disabled="reportActionLoading[getReportActionKey(item)]"
                            class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                              <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd"/>
                            </svg>
                            거절
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="pendingReports.length > pendingVisibleCount" class="flex justify-center py-4">
                  <button type="button" @click="loadMorePendingReports" class="px-4 py-2 text-sm font-medium text-[#4FA8D8] border border-[#4FA8D8] rounded-lg hover:bg-[#4FA8D8]/10 transition-colors">
                    더보기 ({{ Math.min(10, pendingReports.length - pendingVisibleCount) }}건)
                  </button>
                </div>
                </template>
              </div>

              <!-- 승인 완료 -->
              <div v-if="reportTab === 'accepted'" class="overflow-x-auto">
                <div v-if="loadingAccepted" class="text-center py-8 text-gray-400 text-sm">불러오는 중...</div>
                <div v-else-if="acceptedReports.length === 0" class="text-center py-8 text-gray-400 text-sm">승인된 신고가 없습니다</div>
                <table v-else class="w-full">
                 <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">신고 사유</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">처리 유형</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">신고 수</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="r in acceptedReports" :key="r.reportId" class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{{ r.reportedEmail || '-' }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{{ r.reasonText || '-' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="['px-2 py-1 rounded-full text-xs font-medium border', targetTypeBadge(r.targetType)]">
                        {{ targetTypeLabel(r.targetType) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-medium">
                        {{ r.reportedCount }}건
                      </span>
                    </td>
                  </tr>
                </tbody>
                </table>
              </div>
              </div>

              <!-- 정산 내역 -->
              <div v-else-if="selectedSection === 'settlements'" class="admin-table-wrap">
              <div class="p-4 border-b border-gray-200 flex items-center justify-between gap-3">
                <div class="flex gap-3 flex-1">
                  <input
                    type="text"
                    placeholder="모임명, 이메일로 검색..."
                    v-model="settlementSearch"
                    @keyup.enter="fetchSettlements(0)"
                    class="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FA8D8] text-sm"
                  />
                  <button @click="fetchSettlements(0)" class="px-4 py-2 bg-[#4FA8D8] text-white rounded-lg text-sm font-medium">검색</button>
                </div>
                <!-- 🔄 수동 정산 실행 → Heroicons ArrowPath Solid (14px) -->
                <button
                  @click="handleForceRun"
                  :disabled="forceRunLoading"
                  class="px-4 py-2 border border-[#4FA8D8] text-[#4FA8D8] hover:bg-sky-50 rounded-lg text-sm font-medium transition-colors whitespace-nowrap disabled:opacity-50 flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                    <path fill-rule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clip-rule="evenodd"/>
                  </svg>
                  {{ forceRunLoading ? '실행중...' : '수동 정산 실행' }}
                </button>
              </div>

              <div class="overflow-x-auto">
                <div v-if="loadingSettlements" class="text-center py-8 text-gray-400 text-sm">불러오는 중...</div>
                <table v-else class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">모임명</th>
                      <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">모임장 이메일</th>
                      <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">정산금액</th>
                      <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">은행</th>
                      <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">계좌번호</th>
                      <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                      <th class="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">정산일시</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr v-for="log in settlementLogs" :key="log.logId" class="hover:bg-gray-50">
                      <td class="px-5 py-4 font-medium text-gray-900 whitespace-nowrap">{{ log.meetingName }}</td>
                      <td class="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{{ log.ownerEmail }}</td>
                      <td class="px-5 py-4 font-medium text-gray-900 whitespace-nowrap">{{ log.amount?.toLocaleString() }}원</td>
                      <td class="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{{ log.bankName }}</td>
                      <td class="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">{{ log.accountNumber }}</td>
                      <td class="px-5 py-4 whitespace-nowrap">
                        <span :class="['px-2 py-1 rounded-full text-xs font-medium border', settlementStatusBadge(log.status)]">
                          {{ settlementStatusLabel(log.status) }}
                        </span>
                      </td>
                      <td class="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{{ formatDate(log.settledAt) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 정산 페이지네이션 -->
              <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p class="text-sm text-gray-500">총 {{ settlementPage.totalElements }}건</p>
                <div class="flex gap-1">
                  <button
                    v-for="p in settlementPage.totalPages"
                    :key="p"
                    @click="fetchSettlements(p - 1)"
                    :class="['px-3 py-1 rounded text-sm',
                      settlementPage.number === p - 1
                        ? 'bg-[#4FA8D8] text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50']"
                  >{{ p }}</button>
                </div>
              </div>
            </div>
            </div>
          </div>

          </div>
        </main>
      </div>

      <!-- 매너점수 변경 모달 -->
      <div v-if="mannerModal.show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
          <h2 class="text-lg font-bold text-gray-900 mb-4">매너점수 변경</h2>
          <p class="text-sm text-gray-600 mb-1">회원: <span class="font-medium text-gray-900">{{ mannerModal.nickName }}</span></p>
          <p class="text-sm text-gray-600 mb-4">현재 점수: <span class="font-medium text-gray-900">{{ mannerModal.currentScore }}점</span></p>
          <label class="block text-sm font-medium text-gray-700 mb-2">조정값 (예: +3.0 → 3.0, -3.0 → -3.0)</label>
          <input
            type="number"
            v-model="mannerModal.delta"
            placeholder="-100 ~ 100"
            step="0.1"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4FA8D8] text-sm mb-1"
          />
          <p class="text-xs text-gray-500 mb-4">양수면 증가, 음수면 감소합니다</p>
          <div class="flex gap-2 justify-end">
            <button @click="mannerModal.show = false" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">취소</button>
            <button
              @click="handleUpdateManner"
              :disabled="mannerModal.loading"
              class="px-4 py-2 bg-[#4FA8D8] hover:bg-[#3A8FC0] text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {{ mannerModal.loading ? '저장중...' : '저장' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import axios from 'axios'
import dayjs from '@/plugins/dayjs'
import LnbMenuComponent from '@/components/common/LnbMenuComponent.vue'

const API = axios.create({ baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080' })
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const LNB_CATEGORY_OPTIONS = [
  { label: '운동/스포츠', value: 'SPORT' }, { label: '독서', value: 'BOOK' },
  { label: '요리/제조', value: 'COOK' }, { label: '취미/DIY', value: 'DIY' },
  { label: '여행', value: 'TRAVEL' }, { label: '어학', value: 'LANGUAGE' },
  { label: '자동차', value: 'CAR' }, { label: '게임/오락', value: 'GAME' },
  { label: '문화/공연', value: 'CULTURE' }, { label: '반려동물', value: 'PET' },
]

function getRoleFromToken() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.role || payload.roles || payload.auth || null
  } catch {
    return null
  }
}

export default {
  name: 'AdminPageComponent',
  components: { LnbMenuComponent },
  props: {
    onNavigate: Function
  },
  data() {
    return {
      lnbCategoryOptions: LNB_CATEGORY_OPTIONS,
      selectedSection: null,
      reportTab: 'pending',
      isAdmin: false,
      pendingReports: [],
      pendingVisibleCount: 10,
      acceptedReports: [],
      loadingReports: false,
      loadingAccepted: false,
      reportActionLoading: {},
      userList: [],
      userSearch: '',
      loadingUsers: false,
      userPage: { totalElements: 0, totalPages: 0, number: 0 },
      settlementLogs: [],
      settlementSearch: '',
      loadingSettlements: false,
      settlementPage: { totalElements: 0, totalPages: 0, number: 0 },
      forceRunLoading: false,
      dashboardStats: {
        totalUsers: 0,
        pendingReportCount: 0,
        acceptedReportCount: 0,
        totalSettlementCount: 0
      },
      mannerModal: {
        show: false,
        userId: null,
        nickName: '',
        currentScore: 0,
        delta: '',
        loading: false
      }
    }
  },
  computed: {
    pendingReportsSlice() {
      return this.pendingReports.slice(0, this.pendingVisibleCount)
    }
  },
  watch: {},
  mounted() {
    this.checkAdmin()
  },
  methods: {
    checkAdmin() {
      const role = getRoleFromToken()
      this.isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN' ||
                     (Array.isArray(role) && role.some(r => r.includes('ADMIN')))
      if (this.isAdmin) {
        this.fetchDashboardStats()
      }
    },
    /** GET /admin/stats → 대시보드 통계 (totalUsers, pendingReportCount, acceptedReportCount, totalSettlementCount) */
    async fetchDashboardStats() {
      try {
        const res = await API.get('/admin/stats')
        const d = res.data || {}
        this.dashboardStats = {
          totalUsers: d.totalUsers ?? 0,
          pendingReportCount: d.pendingReportCount ?? 0,
          acceptedReportCount: d.acceptedReportCount ?? 0,
          totalSettlementCount: d.totalSettlementCount ?? 0
        }
      } catch (e) {
        console.error('[Admin] 대시보드 통계 조회 실패:', e)
      }
    },
    /** API 응답에서 배열 추출 (다양한 백엔드 형식 대응) */
    normalizeReportList(raw) {
      if (Array.isArray(raw)) return raw
      const list = raw?.content ?? raw?.data ?? raw?.list ?? raw?.reports ?? raw?.result
      return Array.isArray(list) ? list : []
    },
    /** GET /admin/pending → List<ReportSummaryResponseDto> (reportId, reporterEmail, reportedEmail, reportContent, targetType) */
    async fetchPendingReports() {
      this.loadingReports = true
      try {
        const res = await API.get('/admin/pending')
        this.pendingReports = this.normalizeReportList(res.data)
        this.pendingVisibleCount = 10
      } catch (e) {
        console.error('[Admin] pending 신고 목록 조회 실패:', e)
        this.pendingReports = []
      } finally {
        this.loadingReports = false
      }
    },
    loadMorePendingReports() {
      this.pendingVisibleCount += 10
    },
    /** GET /admin/accepted → List<ReportHistoryResponseDto> (reportId, targetNickname, reasonText, processedAt, targetType, reportedCount) */
    async fetchAcceptedReports() {
      this.loadingAccepted = true
      try {
        const res = await API.get('/admin/accepted')
        this.acceptedReports = this.normalizeReportList(res.data)
      } catch (e) {
        console.error('[Admin] accepted 신고 목록 조회 실패:', e)
        this.acceptedReports = []
      } finally {
        this.loadingAccepted = false
      }
    },
    getPendingReportKey(item) {
      return item.reportId != null ? `r-${item.reportId}` : `r-${item.reporterEmail}-${item.reportedEmail}-${item.targetType}`
    },
    getReportActionKey(item) {
      return item.reportId != null ? item.reportId : `r-${item.reporterEmail}-${item.reportedEmail}-${item.targetType}`
    },
    async handleAcceptReport(item) {
      const reportId = item.reportId ?? item.targetId
      const key = this.getReportActionKey(item)
      this.reportActionLoading = { ...this.reportActionLoading, [key]: true }
      try {
        await API.patch('/admin/accept', { reportId })
        alert('신고가 승인되었습니다.')
        await this.fetchDashboardStats()
        await this.fetchPendingReports()
        await this.fetchAcceptedReports()
      } catch (e) {
        const msg = e.response?.data?.message ?? e.response?.data?.error_message ?? e.response?.data?.error ?? '처리 중 오류가 발생했습니다.'
        alert(msg)
      } finally {
        this.reportActionLoading = { ...this.reportActionLoading, [key]: false }
      }
    },
    async handleRejectReport(item) {
      const reportId = item.reportId ?? item.targetId
      const key = this.getReportActionKey(item)
      this.reportActionLoading = { ...this.reportActionLoading, [key]: true }
      try {
        await API.patch('/admin/reject', { reportId })
        alert('신고가 거절되었습니다.')
        await this.fetchDashboardStats()
        await this.fetchPendingReports()
      } catch (e) {
        const msg = e.response?.data?.message ?? e.response?.data?.error_message ?? e.response?.data?.error ?? '처리 중 오류가 발생했습니다.'
        alert(msg)
      } finally {
        this.reportActionLoading = { ...this.reportActionLoading, [key]: false }
      }
    },
    async fetchUsers(page = 0) {
      this.loadingUsers = true
      try {
        const res = await API.get('/admin/user/list', {
          params: { page, size: 10, sort: 'id,desc' }
        })
        const data = res.data
        this.userList = data.content
        this.userPage = {
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          number: data.number
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.loadingUsers = false
      }
    },
    openMannerModal(user) {
      this.mannerModal = {
        show: true,
        userId: user.id,
        nickName: user.nickName,
        currentScore: user.mannerScore,
        delta: '',
        loading: false
      }
      
    },
    reportDetailModal: {
  show: false,
  item: null
},
    async handleUpdateManner() {
      const delta = parseFloat(this.mannerModal.delta)
      if (isNaN(delta)) { alert('올바른 숫자를 입력해주세요.'); return }
      this.mannerModal.loading = true
      try {
        await API.patch('/admin/manner', {
          userId: this.mannerModal.userId,
          delta: delta
        })
        alert(`${this.mannerModal.nickName}님의 매너점수가 조정되었습니다.`)
        this.mannerModal.show = false
        await this.fetchUsers(this.userPage.number)
      } catch (e) {
        alert(e.response?.data?.error_message || '처리 중 오류가 발생했습니다.')
      } finally {
        this.mannerModal.loading = false
      }
    },
    async fetchSettlements(page = 0) {
      this.loadingSettlements = true
      try {
        const res = await API.get('/admin/logs', {
          params: { page, size: 10, sort: 'id,desc', search: this.settlementSearch || undefined }
        })
        const data = res.data
        this.settlementLogs = data.content
        this.settlementPage = {
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          number: data.number
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.loadingSettlements = false
      }
    },
    async handleForceRun() {
      if (!confirm('정산 스케줄러를 수동으로 실행하시겠습니까?')) return
      this.forceRunLoading = true
      try {
        const res = await API.post('/admin/run')
        alert(res.data)
        await this.fetchSettlements(0)
      } catch (e) {
        alert(e.response?.data?.error_message || '정산 실행 중 오류가 발생했습니다.')
      } finally {
        this.forceRunLoading = false
      }
    },
    /** 백엔드 ReportTargetType enum (문자열 또는 { name: 'USER' } 형태) 정규화 */
    normalizeTargetType(type) {
      if (type == null) return ''
      if (typeof type === 'string') return type
      return type.name ?? type.value ?? type.code ?? ''
    },
    targetTypeLabel(type) {
      const t = this.normalizeTargetType(type)
      const map = { USER: '사용자', NOSHOW: '노쇼', COMMENT: '댓글', MEETING: '모임', CREW: '크루' }
      return map[t] || t || '-'
    },
    targetTypeBadge(type) {
      const t = this.normalizeTargetType(type)
      const map = {
        USER:    'bg-blue-50 text-blue-700 border-blue-200',
        NOSHOW:  'bg-sky-50 text-sky-700 border-sky-200',
        COMMENT: 'bg-purple-50 text-purple-700 border-purple-200',
        MEETING: 'bg-gray-50 text-gray-700 border-gray-200',
        CREW:    'bg-amber-50 text-amber-700 border-amber-200',
      }
      return map[t] || 'bg-gray-50 text-gray-700 border-gray-200'
    },
    settlementStatusLabel(status) {
      const map = { PENDING: '정산예정', COMPLETED: '정산완료', FAILED: '정산실패' }
      return map[status] || status
    },
    settlementStatusBadge(status) {
      const map = {
        PENDING:   'bg-yellow-50 text-yellow-700 border-yellow-200',
        COMPLETED: 'bg-green-50 text-green-700 border-green-200',
        FAILED:    'bg-red-50 text-red-700 border-red-200',
      }
      return map[status] || 'bg-gray-50 text-gray-700 border-gray-200'
    },
    formatDate(dateStr) {
      if (!dateStr) return ''
      const d = dayjs.utc(dateStr).tz('Asia/Seoul')
      if (!d.isValid()) return ''
      return d.format('YYYY. MM. DD. HH:mm')
    },
    // formatDate(dateStr) {
    //   if (!dateStr) return ''
    //   return new Date(dateStr).toLocaleDateString('ko-KR', {
    //     year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    //   })
    // },
    onLnbNavClick(key) {
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
    onLnbCategoryClick(value) {
      if (this.$router) this.$router.push({ path: '/crew/search', query: value ? { category: value } : {} })
    },
  }
}
</script>

<style scoped>
.page-root.admin-root {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: #f5f7fa;
  font-family: "Pretendard", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
}
.admin-main {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 32px 36px 72px;
}
.admin-wrap {
  max-width: 960px;
  margin: 0 auto;
}

.page-head { margin-bottom: 24px; }
.page-head--with-back { display: flex; flex-direction: column; gap: 8px; }
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #4FA8D8;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.back-link:hover { text-decoration: underline; }
.page-title { font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.4px; margin: 0; }
.title-sparkle { color: #0EA5E9; }

.section {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e8e8e8;
  padding: 22px 26px;
  margin-bottom: 16px;
}
.sec-label-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.sec-num {
  font-size: 11px;
  font-weight: 900;
  color: #4FA8D8;
  background: #EBF6FC;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}
.sec-title { font-size: 14.5px; font-weight: 800; color: #0f172a; flex: 1; }

.admin-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 900px) { .admin-stat-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 500px) { .admin-stat-grid { grid-template-columns: 1fr; } }
.admin-stat-card {
  background: #f8fafc;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 20px;
}
.admin-stat-card--clickable {
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: border-color 0.2s, background 0.2s;
}
.admin-stat-card--clickable:hover {
  border-color: #4FA8D8;
  background: #f0f9ff;
}
.admin-stat-card--active {
  border-color: #4FA8D8;
  background: #e0f2fe;
}
.admin-placeholder {
  text-align: center;
  padding: 48px 24px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px dashed #e2e8f0;
}

.admin-menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 700px) { .admin-menu-grid { grid-template-columns: 1fr; } }
.admin-dash-card {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 20px;
  text-align: left;
  width: 100%;
  transition: border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
}
.admin-dash-card:hover {
  border-color: #4FA8D8;
  box-shadow: 0 4px 12px rgba(79, 168, 216, 0.15);
}

.admin-recent-wrap { margin-top: 8px; }
.admin-table-wrap {
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}
</style>