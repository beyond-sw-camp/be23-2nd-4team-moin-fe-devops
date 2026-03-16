<template>
  <div class="detail-root">
    <div v-if="loading" class="loading-screen">
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="errorMsg" class="error-screen">{{ errorMsg }}</div>

    <div v-else class="page-body">
      <LnbMenuComponent
        activeMenu="home"
        :categoryOptions="categoryOptions"
        @nav-click="onLnbNavClick"
        @category-toggle="onLnbCategoryToggle"
      />

      <div class="content-area">
        <div class="body-layout">
          <!-- ===== 메인 ===== -->
          <main class="main-col">
            <!-- 모임 헤더 카드 -->
            <div class="meeting-header-card">
              <div class="meeting-img-wrap">
                <img v-if="meetingData.profileImage" :src="meetingData.profileImage" class="meeting-img" alt="모임 이미지" />
                <div v-else class="meeting-img-placeholder"></div>
                <span :class="['meeting-status-badge', statusBadgeClass(meetingData.status)]">
                  {{ statusLabel(meetingData.status) }}
                </span>
              </div>

              <div class="meeting-header-info">
                <!-- 제목 + 액션 -->
                <div class="meeting-name-row">
                  <h1 class="meeting-name">{{ meetingData.title }}</h1>
                  <div class="meeting-name-actions">
                    <!-- 모임장 전용: 모집 상태 변경 버튼들 -->
                    <template v-if="isOwner && !isFinished">
                      <button
                        v-if="meetingData.status !== 'OPEN'"
                        @click="handleStatusChange('OPEN')"
                        class="hbtn hbtn--status hbtn--open"
                      >
                        <svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <circle cx="12" cy="12" r="9"></circle>
                          <path d="M8 12.5l2.5 2.5L16 9.5"></path>
                        </svg>
                        모집재개
                      </button>
                      <button
                        v-if="meetingData.status !== 'CLOSED'"
                        @click="handleStatusChange('CLOSED')"
                        class="hbtn hbtn--status hbtn--close"
                      >모집마감</button>
                      <button
                        @click="openAttendanceModal"
                        class="hbtn hbtn--status hbtn--finish"
                      >모임 종료</button>
                    </template>
                    <!-- ⋯ 신고/수정/삭제 (모임 가입 회원만 표시) -->
                    <div v-if="isParticipating" class="report-wrap" ref="reportDrop">
                      <button @click="reportDropOpen = !reportDropOpen" class="hbtn hbtn--icon" title="더보기">⋯</button>
                      <div v-if="reportDropOpen" class="report-dropdown">
                        <template v-if="isOwner">
  <button @click="handleEdit" class="report-item">
    <svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.1 2.1 0 013 3L8 18l-4 1 1-4 11.5-11.5z"></path>
    </svg>
    모임 수정
  </button>
  <div class="dropdown-divider"></div>
</template>
                        <button v-if="isParticipating" @click="openReport('MEETING', meetingId)" class="report-item report-item--danger">
                          <svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                            <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"></path>
                            <path d="M12 9v4"></path>
                            <circle cx="12" cy="16.5" r="1"></circle>
                          </svg>
                          모임 신고
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 상태 변경 결과 토스트 -->
                <div v-if="statusChangeResult" class="status-toast">{{ statusChangeResult }}</div>

                <!-- 통계 -->
                <div class="modern-stats-container">
                  <div class="msi msi--blue">
                    <div class="msi-body">
                      <span class="msi-label">참여 인원</span>
                      <span class="msi-value">{{ meetingData.currentParticipants }}<em>/ {{ meetingData.maxParticipants }}명</em></span>
                    </div>
                  </div>
                  <div class="msi msi--yellow">
                    <div class="msi-body">
                      <span class="msi-label">참가비</span>
                      <span class="msi-value">{{ meetingData.fee === 0 ? "무료" : Number(meetingData.fee).toLocaleString() + "원" }}</span>
                    </div>
                  </div>
                  <div class="msi msi--purple">
                    <div class="msi-body">
                      <span class="msi-label">모임일시</span>
                      <span class="msi-value">{{ formatDateTime(meetingData.datetime) }}</span>
                    </div>
                  </div>
                  <div class="msi msi--green msi--loc">
                    <div class="msi-body">
                      <span class="msi-label">장소</span>
                      <span class="msi-value">{{ meetingData.location || "장소 미정" }}</span>
                    </div>
                  </div>
                </div>

                <!-- 참여/나가기 버튼 -->
                <div class="action-wrap">
                  <template v-if="!isFinished">
                    <button v-if="isParticipating" @click="handleLeave" :disabled="joinLoading || (isOwnerAlone && meetingData.isSettled)" class="btn btn--primary btn--lg">
                      {{ joinLoading ? "처리 중..." : isOwnerAlone ? (isPaidMeeting ? "환불 후 모임 삭제" : "모임 삭제") : isPaidMeeting ? "환불 후 모임 나가기" : "모임 나가기" }}
                    </button>
                    <button v-else @click="requestJoin" :disabled="joinLoading || isClosedOrFinished || isFull" class="btn btn--primary btn--lg">
                      <span v-if="joinLoading">처리 중...</span>
                      <span v-else-if="isClosedOrFinished">모집이 마감되었습니다</span>
                      <span v-else-if="isFull">정원이 가득 찼습니다</span>
                      <span v-else-if="meetingData.fee > 0">유료 모임 참여 ({{ Number(meetingData.fee).toLocaleString() }}원)</span>
                      <span v-else>모임 참여</span>
                    </button>
                  </template>
                  <div v-if="isFinished && !isParticipating" class="action-hint">종료된 모임입니다</div>
                </div>

                <!-- 모임 소개 -->
                <div class="crew-desc-section">
                  <div class="crew-desc-hd"><span class="crew-desc-title">모임 소개</span></div>
                  <p class="crew-desc-text">{{ meetingData.description || "소개글이 없습니다." }}</p>
                </div>
              </div>
            </div>

            <!-- 참여자 목록 컴포넌트로 분리 -->
            <MeetingMembersComponent
              :participants="participants"
              :loading="memberLoading"
              :myUserId="myUserId"
              :myEmail="myEmail"
            />

            <!-- 모임 종료 후: 기록 (모임장만 표시) -->
            <div v-if="isFinished && isOwner" class="card card--eval">
              <div class="owner-card-hd">
                <div>
                  <span class="crew-desc-title crew-desc-title--with-icon">
                    <svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="M14 10V5a3 3 0 00-3-3l-1 5-3 3v10h10.3a2 2 0 001.9-1.4l1.7-5.1a2 2 0 00-1.9-2.6H14z"></path>
                      <path d="M7 10H4a2 2 0 00-2 2v6a2 2 0 002 2h3"></path>
                    </svg>
                    모임이 어땠는지 기록해주세요
                  </span>
                  <p class="owner-hint">함께한 모임을 기록해주세요.</p>
                </div>
                <span class="eval-progress-badge">{{ myEvaluationCount }}/{{ evaluatableMembers.length }} 기록</span>
              </div>
              <div v-if="evaluatableMembers.length === 0" class="pm-empty">기록할 모임원이 없습니다</div>
              <div v-else class="eval-list">
                <div v-for="p in evaluatableMembers" :key="'eval-' + p.meetingMemberId" class="eval-item" :class="evaluationDoneMap[p.meetingMemberId] ? 'eval-item--done' : ''">
                  <div class="eval-user">
                    <img v-if="p.profileImageUrl" :src="p.profileImageUrl" class="attend-avatar" />
                    <div v-else class="attend-avatar-ph feed-avatar--ph"><svg class="attend-avatar-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path
    fill-rule="evenodd"
    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z
       M3.751 20.105a8.25 8.25 0 0116.498 0
       .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5
       c-2.786 0-5.433-.608-7.812-1.7
       a.75.75 0 01-.437-.695z"
    clip-rule="evenodd"
  />
</svg></div>
                    <div class="eval-user-info">
                      <div class="attend-name">{{ p.nickname || "익명" }}</div>
                    </div>
                    <span v-if="evaluationDoneMap[p.meetingMemberId]" class="eval-done-badge">
                      기록 완료
                      <svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">
                        <path d="M5 12.5l4 4L19 7"></path>
                      </svg>
                    </span>
                  </div>
                  <template v-if="!evaluationDoneMap[p.meetingMemberId]">
                    <div class="eval-btns">
                      <button @click="setEvaluationType(p.meetingMemberId, 'GOOD')" class="eval-type-btn" :class="evaluationTypeMap[p.meetingMemberId] === 'GOOD' ? 'eval-type-btn--good-active' : 'eval-type-btn--inactive'">
                        <svg class="eval-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                          <line x1="9" y1="9" x2="9.01" y2="9" stroke-linecap="round" stroke-width="2.5"></line>
                          <line x1="15" y1="9" x2="15.01" y2="9" stroke-linecap="round" stroke-width="2.5"></line>
                        </svg>
                        <span>좋아요</span>
                      </button>
                      <button @click="setEvaluationType(p.meetingMemberId, 'BAD')" class="eval-type-btn" :class="evaluationTypeMap[p.meetingMemberId] === 'BAD' ? 'eval-type-btn--bad-active' : 'eval-type-btn--inactive'">
                        <svg class="eval-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
                          <line x1="9" y1="9" x2="9.01" y2="9" stroke-linecap="round" stroke-width="2.5"></line>
                          <line x1="15" y1="9" x2="15.01" y2="9" stroke-linecap="round" stroke-width="2.5"></line>
                        </svg>
                        <span>아쉬워요</span>
                      </button>
                    </div>
                    <button @click="submitEvaluation(p)" :disabled="!evaluationTypeMap[p.meetingMemberId] || evaluationLoadingMap[p.meetingMemberId]" class="btn btn--primary btn--no-forbidden" style="width:100%">
                      {{ evaluationLoadingMap[p.meetingMemberId] ? "기록 중..." : "기록하기" }}
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </main>

          <!-- ===== 사이드바 ===== -->
          <aside class="side-col">
            <!-- 길찾기 카드 -->
            <div class="side-card">
              <div class="side-card-hd">
                <span class="side-card-title">경로 안내</span>
                <span v-if="routeMode" class="side-route-mode">{{ routeMode }}</span>
              </div>
              <div v-if="routeSummary" class="route-summary-box">
                <div class="route-summary-label">{{ routeSummaryLabel }}</div>
                <div v-if="routeSummaryDetail" class="route-summary-detail">{{ routeSummaryDetail }}</div>
                <div v-if="routeSummary?.steps?.length" class="route-steps">
                  <template v-if="routeMode === 'TRANSIT'">
                    <div v-for="(s, i) in routeSummary.steps" :key="i" class="route-step">
                      <div class="route-step-main">
                        <div class="route-step-title">
                          {{ i + 1 }}.
                          <span v-if="(s.mode||'').toUpperCase()==='WALK'">도보</span>
                          <span v-else-if="(s.mode||'').toUpperCase()==='BUS'">버스 {{ s.route||'' }}</span>
                          <span v-else-if="(s.mode||'').toUpperCase()==='SUBWAY'">지하철 {{ s.route||'' }}</span>
                          <span v-else>{{ s.mode }} {{ s.route||'' }}</span>
                        </div>
                        <div class="route-step-sub">{{ s.fromName||'출발' }} → {{ s.toName||'도착' }}<span v-if="s.stations!=null"> · {{ s.stations }}정거장</span></div>
                      </div>
                      <div class="route-step-info">
                        <div v-if="s.distance!=null">{{ formatDistance(s.distance) }}</div>
                        <div v-if="s.time!=null">{{ formatTime(s.time) }}</div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div v-for="(s, i) in routeSummary.steps" :key="i" class="route-step">
                      <div class="route-step-main">
                        <div class="route-step-title">{{ i + 1 }}. {{ s.instruction }}</div>
                        <div v-if="s.roadName" class="route-step-sub">{{ s.roadName }}</div>
                      </div>
                      <div class="route-step-info">
                        <div v-if="s.distance!=null">{{ formatDistance(s.distance) }}</div>
                        <div v-if="s.time!=null">{{ formatTime(s.time) }}</div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
              <div class="route-mode-btns">
                <button @click="fetchRouteSummary('CAR')" :disabled="routeLoading" :class="routeMode==='CAR'?'route-btn--active':''" class="route-btn">차량</button>
                <button @click="fetchRouteSummary('TRANSIT')" :disabled="routeLoading" :class="routeMode==='TRANSIT'?'route-btn--active':''" class="route-btn">대중교통</button>
                <button @click="fetchRouteSummary('WALK')" :disabled="routeLoading" :class="routeMode==='WALK'?'route-btn--active':''" class="route-btn">도보</button>
              </div>
              <button @click="openKakaoDirections()" class="kakao-btn">카카오맵에서 길찾기</button>
              <div v-if="routeLoading" class="owner-hint" style="margin-top:8px">경로 불러오는 중...</div>
              <div v-if="routeError" class="result-toast result-toast--red" style="margin-top:8px">{{ routeError }}</div>
              <div class="map-wrap"><div ref="mapEl" class="kakao-map"></div></div>
            </div>
          </aside>
        </div>
      </div>
    </div>

    <!-- 출석체크 & 모임 종료 모달 (다크 테마) -->
    <Transition name="modal-fade">
      <div v-if="showAttendanceModal" class="modal-backdrop" @click.self="showAttendanceModal = false">
        <Transition name="modal-rise">
          <div v-if="showAttendanceModal" class="modal-box modal-box--attendance">

            <!-- 헤더 -->
            <div class="amod-header">
              <div class="amod-header-left">
                <h3 class="amod-title">출석 체크</h3>
                <p class="amod-subtitle">참석한 모임원을 선택해주세요</p>
              </div>
              <div class="amod-header-right">
                <div class="amod-status-info">
                  <span class="amod-status-label">STATUS</span>
                  <span class="amod-status-count">참석자: <b>{{ attendSet.size }}</b> / {{ approvedParticipants.length }}</span>
                </div>
                <button class="amod-close" @click="showAttendanceModal = false">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            <!-- 검색창 -->
            <div class="amod-search-wrap">
              <svg class="amod-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input v-model="attendSearch" class="amod-search" placeholder="모임원 검색..." type="text" />
            </div>

            <!-- 모임원 리스트 -->
            <div class="amod-list">
              <div
                v-for="p in filteredAttendParticipants"
                :key="'a-' + p.meetingMemberId"
                class="amod-item"
                :class="attendSet.has(p.meetingMemberId) ? 'amod-item--attend' : ''"
                @click="toggleAttend(p.meetingMemberId)"
              >
                <div class="amod-user">
                  <div class="amod-avatar-wrap">
                    <img v-if="p.profileImageUrl" :src="p.profileImageUrl" class="amod-avatar" />
                    <div v-else class="amod-avatar-ph feed-avatar--ph"><svg class="amod-avatar-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path
    fill-rule="evenodd"
    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z
       M3.751 20.105a8.25 8.25 0 0116.498 0
       .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5
       c-2.786 0-5.433-.608-7.812-1.7
       a.75.75 0 01-.437-.695z"
    clip-rule="evenodd"
  />
</svg></div>
                  </div>
                  <div class="amod-user-info">
                    <div class="amod-name-row">
                      <span class="amod-name">{{ p.nickname || '익명' }}</span>
                      <span v-if="String(p.role).toUpperCase() === 'OWNER'" class="amod-owner-badge">모임장</span>
                      <span v-if="isMe(p)" class="amod-me-badge">나</span>
                    </div>
                  </div>
                </div>
                <!-- 참석 텍스트 + 체크 -->
                <div class="amod-right">
                  <span v-if="attendSet.has(p.meetingMemberId)" class="amod-attend-label">참석</span>
                  <div class="amod-check" :class="attendSet.has(p.meetingMemberId) ? 'amod-check--on' : ''">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="13" height="13">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div v-if="filteredAttendParticipants.length === 0" class="amod-empty">
                검색 결과가 없습니다
              </div>
            </div>

            <div v-if="attendanceError" class="amod-error">{{ attendanceError }}</div>

            <div class="amod-footer">
              <button @click="showAttendanceModal = false" class="amod-btn-cancel">취소</button>
              <button @click="submitFinish" :disabled="attendanceLoading" class="amod-btn-finish">
                <span v-if="attendanceLoading" class="btn-spinner"></span>
                <span v-else>출석 체크 완료</span>
              </button>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>

    <!-- 신고 모달 -->
    <div v-if="reportModal.open" class="modal-backdrop" @click.self="closeReport">
      <div class="modal-box">
        <template v-if="reportModal.reportId">
          <h3 class="modal-title modal-title--with-icon">
            <svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M8 12.5l2.5 2.5L16 9.5"></path>
            </svg>
            신고 접수 완료
          </h3>
          <p class="modal-sub">신고가 정상적으로 접수되었습니다.<br/>신고를 취소하시겠습니까?</p>
          <div class="modal-footer">
            <button @click="closeReport" class="btn btn--outline">닫기</button>
            <button @click="cancelReport(reportModal.reportId)" :disabled="reportModal.cancelLoading" class="btn btn--danger">
              {{ reportModal.cancelLoading ? "취소 중..." : "신고 취소" }}
            </button>
          </div>
        </template>
        <template v-else>
          <h3 class="modal-title modal-title--with-icon">
            <svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"></path>
              <path d="M12 9v4"></path>
              <circle cx="12" cy="16.5" r="1"></circle>
            </svg>
            신고하기
          </h3>
          <p class="modal-sub">{{ reportTypeLabel }} 신고 사유를 선택해주세요. 같은 대상은 한 번만 신고할 수 있습니다.</p>
          <div class="report-reasons">
            <label v-for="r in reportReasons" :key="r.value" class="report-reason-item" :class="reportModal.reason === r.value && 'report-reason-item--active'">
              <input type="radio" v-model="reportModal.reason" :value="r.value" class="sr-only" />{{ r.label }}
            </label>
          </div>
          <textarea v-model="reportModal.detail" placeholder="추가 내용을 입력하세요 (선택)" class="report-textarea" rows="3" />
          <div class="modal-footer">
            <button @click="closeReport" class="btn btn--outline">취소</button>
            <button @click="submitReport" :disabled="!reportModal.reason || reportModal.loading" class="btn btn--primary">
              {{ reportModal.loading ? "신고 중..." : "신고 제출" }}
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- 신고 토스트 (빨간색) -->
    <div v-if="reportToastMessage" class="toast toast--red">{{ reportToastMessage }}</div>

    <!-- 차기 모임장 모달 -->
    <div v-if="showNextOwnerModal" class="modal-backdrop" @click.self="showNextOwnerModal = false; selectedNextOwner = null;">
      <div class="modal-box">
        <h3 class="modal-title">차기 모임장 지정</h3>
        <p class="modal-sub">모임장 위임 후 나가기가 완료됩니다.</p>
        <div class="next-owner-list">
          <div v-for="p in nextOwnerCandidates" :key="p.meetingMemberId" @click="selectedNextOwner = p.meetingMemberId" class="next-owner-item" :class="selectedNextOwner === p.meetingMemberId ? 'next-owner-item--active' : ''">
            <img v-if="p.profileImageUrl" :src="p.profileImageUrl" class="attend-avatar" />
            <div v-else class="attend-avatar-ph feed-avatar--ph"><svg class="attend-avatar-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path
    fill-rule="evenodd"
    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z
       M3.751 20.105a8.25 8.25 0 0116.498 0
       .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5
       c-2.786 0-5.433-.608-7.812-1.7
       a.75.75 0 01-.437-.695z"
    clip-rule="evenodd"
  />
</svg></div>
            <span class="next-owner-name">{{ p.nickname || "익명" }}</span>
            <span v-if="selectedNextOwner === p.meetingMemberId" class="next-owner-check">
              <svg class="inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">
                <path d="M5 12.5l4 4L19 7"></path>
              </svg>
            </span>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showNextOwnerModal = false; selectedNextOwner = null;" class="btn btn--outline">취소</button>
          <button @click="confirmLeaveAsOwner" :disabled="!selectedNextOwner || joinLoading" class="btn btn--primary">
            {{ joinLoading ? "처리 중..." : "위임 후 나가기" }}
          </button>
        </div>
      </div>
    </div>

    <!-- 유료 모임 주의사항 모달 -->
    <div v-if="showPaidNoticeModal" class="modal-backdrop" @click.self="showPaidNoticeModal = false">
      <div class="modal-box">
        <h3 class="modal-title">유료 모임 주의사항</h3>
        <div class="paid-notice-content">
          <p>• 참가비 결제 전 모임 일정과 장소를 꼭 확인해주세요.</p>
          <p>• 모임 시작 3시간 이내에는 환불이 불가능합니다.</p>
          <p>• 무단 불참 시 환불되지 않으며 매너점수가 감점될 수 있습니다.</p>
        </div>
        <div class="modal-footer">
          <button @click="showPaidNoticeModal = false" class="btn btn--outline">취소</button>
          <button @click="confirmPaidNotice" :disabled="joinLoading" class="btn btn--primary">{{ joinLoading ? "처리 중..." : "동의 후 결제하기" }}</button>
        </div>
      </div>
    </div>

    <!-- 무료 모임 참여 확인 모달 -->
    <div v-if="showFreeJoinConfirmModal" class="modal-backdrop" @click.self="showFreeJoinConfirmModal = false">
      <div class="modal-box">
        <h3 class="modal-title">모임 참여</h3>
        <p class="modal-sub">이 모임에 참여하시겠습니까?</p>
        <div class="modal-footer modal-footer--end">
          <button type="button" @click="showFreeJoinConfirmModal = false" class="btn btn--outline">취소</button>
          <button type="button" @click="confirmFreeJoin" :disabled="joinLoading" class="btn btn--primary">{{ joinLoading ? "처리 중..." : "확인" }}</button>
        </div>
      </div>
    </div>

    <!-- 모임 참여 완료 모달 -->
    <div v-if="showJoinSuccessModal" class="modal-backdrop" @click.self="showJoinSuccessModal = false">
      <div class="modal-box">
        <h3 class="modal-title">모임 참여 완료</h3>
        <p class="modal-sub">모임에 참여되었습니다. 일정과 장소를 확인해 주세요.</p>
        <div class="modal-footer modal-footer--end">
          <button @click="showJoinSuccessModal = false" class="btn btn--primary">확인</button>
        </div>
      </div>
    </div>

    <!-- 모임 나가기/삭제 확인 모달 -->
    <div v-if="showLeaveConfirmModal" class="modal-backdrop" @click.self="showLeaveConfirmModal = false">
      <div class="modal-box">
        <h3 class="modal-title">{{ leaveConfirmIsOwnerAlone ? "모임 삭제" : "모임 나가기" }}</h3>
        <p class="modal-sub">{{ leaveConfirmMessage }}</p>
        <div class="modal-footer modal-footer--end">
          <button @click="showLeaveConfirmModal = false" class="btn btn--outline">취소</button>
          <button @click="confirmLeaveFromModal" :disabled="joinLoading" class="btn btn--primary">{{ joinLoading ? "처리 중..." : "확인" }}</button>
        </div>
      </div>
    </div>

    <!-- 크루 미가입 시 모임 참여 안내 모달 -->
    <div v-if="showCrewJoinRequiredModal" class="modal-backdrop" @click.self="showCrewJoinRequiredModal = false">
      <div class="modal-box">
        <h3 class="modal-title">크루 가입 안내</h3>
        <p class="modal-sub">모임에 참여하려면 크루 가입을 먼저해주세요.</p>
        <div class="modal-footer">
          <button @click="showCrewJoinRequiredModal = false" class="btn btn--outline">취소</button>
          <button @click="goToCrewJoin" class="btn btn--primary">크루 가입신청하기</button>
        </div>
      </div>
    </div>

    <!-- 결제 오버레이 -->
    <div v-if="paymentLoading" class="payment-overlay">
      <div class="loading-spinner"></div>
      <p class="payment-loading-text">결제 처리 중...</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { loadKakaoMaps } from "@/map/kakaoMap";
import LnbMenuComponent from "@/components/common/LnbMenuComponent.vue";
import dayjs from "@/plugins/dayjs";
import MeetingMembersComponent from "@/components/meeting/MeetingMembersComponent.vue";

const API = axios.create({ baseURL: process.env.VUE_APP_API_BASE_URL });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const CATEGORY_OPTIONS = [
  { label: "운동/스포츠", value: "SPORT", color: "#FF6B35" },
  { label: "독서", value: "BOOK", color: "#4C9BE8" },
  { label: "요리/제조", value: "COOK", color: "#F5A623" },
  { label: "취미/DIY", value: "DIY", color: "#7ED321" },
  { label: "여행", value: "TRAVEL", color: "#9B59B6" },
  { label: "어학", value: "LANGUAGE", color: "#1ABC9C" },
  { label: "자동차", value: "CAR", color: "#E74C3C" },
  { label: "게임/오락", value: "GAME", color: "#3498DB" },
  { label: "문화/공연", value: "CULTURE", color: "#E91E63" },
  { label: "반려동물", value: "PET", color: "#795548" },
];

const REPORT_REASONS = [
  { value: "INAPPROPRIATE_CONTENT", label: "불건전한 내용" },
  { value: "SPAM_OR_AD", label: "스팸 및 부적절한 홍보" },
  { value: "DEFAMATION", label: "명예훼손 및 비방" },
  { value: "COPYRIGHT_INFRINGEMENT", label: "초상권 및 저작권 침해" },
  { value: "PRIVACY_VIOLATION", label: "개인정보 도용" },
  { value: "ETC", label: "기타" },
];

function loadPortOneSDK() {
  return new Promise((resolve, reject) => {
    if (window.PortOne) return resolve(window.PortOne);
    const script = document.createElement("script");
    script.src = "https://cdn.portone.io/v2/browser-sdk.js";
    script.onload = () => resolve(window.PortOne);
    script.onerror = () => reject(new Error("포트원 SDK 로드 실패"));
    document.head.appendChild(script);
  });
}

function decodeJwtPayload(token) {
  try {
    const payloadPart = token.split(".")[1];
    const b64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json = decodeURIComponent(escape(atob(padded)));
    return JSON.parse(json);
  } catch { return null; }
}

function getMyIdentity() {
  const token = localStorage.getItem("token");
  if (!token) return { id: null, email: null };
  const payload = decodeJwtPayload(token);
  if (!payload) return { id: null, email: null };
  const rawId = payload.userId ?? payload.id ?? payload.user_id ?? null;
  const rawEmail = payload.email ?? payload.userEmail ?? payload.sub ?? null;
  const n = Number(rawId);
  return { id: Number.isFinite(n) ? n : null, email: rawEmail ? String(rawEmail) : null };
}

export default {
  name: "MeetingDetailComponent",
  components: {
    LnbMenuComponent,
    MeetingMembersComponent,
  },

  data() {
    return {
      categoryOptions: CATEGORY_OPTIONS,
      loading: false,
      errorMsg: "",
      showNextOwnerModal: false,
      selectedNextOwner: null,

      showAttendanceModal: false,
      attendSearch: "",

      meetingId: null,
      crewId: null,
      myUserId: null,
      myEmail: null,
      isOwner: false,

      meetingData: {
        title: "", location: "", description: "", datetime: "",
        currentParticipants: 0, maxParticipants: 0, status: "OPEN",
        fee: 0, latitude: null, longitude: null, profileImage: null,
        isSettled: false,
      },

      memberLoading: false,
      participants: [],
      isParticipating: false,
      joinLoading: false,
      paymentLoading: false,
      statusChangeResult: "",
      showJoinSuccessModal: false,
      showFreeJoinConfirmModal: false,
      showLeaveConfirmModal: false,
      leaveConfirmMessage: "",
      leaveConfirmIsOwnerAlone: false,

      noShowSet: new Set(),
      attendSet: new Set(),
      attendanceLoading: false,
      attendanceResult: "",
      attendanceError: "",

      evaluationTypeMap: {},
      evaluationDoneMap: {},
      evaluationLoadingMap: {},

      routeLoading: false,
      routeError: "",
      routeSummary: null,
      routeMode: null,
      kakaoSdk: null,
      kakaoMap: null,
      kakaoPolyline: null,
      kakaoMarkers: [],

      reportModal: {
        open: false, targetType: "", targetId: null,
        reason: "", detail: "", loading: false, reportId: null, cancelLoading: false,
      },
      reportToastMessage: "",
      reportReasons: REPORT_REASONS,
      reportDropOpen: false,
      showPaidNoticeModal: false,
      isCrewMember: null,
      showCrewJoinRequiredModal: false,
    };
  },

  computed: {
    approvedParticipants() {
      return (this.participants || []).filter((p) => {
        const s = (p.status || "").toString().toUpperCase();
        return s.includes("APPROVED") || s.includes("승인") || s === "";
      });
    },
    filteredAttendParticipants() {
      const q = (this.attendSearch || "").trim().toLowerCase();
      if (!q) return this.approvedParticipants;
      return this.approvedParticipants.filter(p =>
        (p.nickname || "").toLowerCase().includes(q)
      );
    },
    nextOwnerCandidates() {
      return this.approvedParticipants.filter((p) => !this.isMe(p));
    },
    isFinished() {
      return (this.meetingData.status || "").toString().toUpperCase() === "FINISHED";
    },
    isClosedOrFinished() {
      const s = (this.meetingData.status || "").toString().toUpperCase();
      return s === "CLOSED" || s === "FINISHED";
    },
    isFull() {
      const cur = Number(this.meetingData.currentParticipants || 0);
      const max = Number(this.meetingData.maxParticipants || 0);
      return max > 0 && cur >= max;
    },
    routeSummaryLabel() {
      if (!this.routeSummary) return "";
      const mode = this.routeMode === "CAR" ? "차량" : this.routeMode === "WALK" ? "도보" : "대중교통";
      return `${mode} · ${this.formatDistance(this.routeSummary?.distance)} · ${this.formatTime(this.routeSummary?.time)}`;
    },
    routeSummaryDetail() {
      if (!this.routeSummary) return "";
      if (this.routeMode === "TRANSIT") {
        const t = this.routeSummary.transfers ?? 0;
        const f = this.routeSummary.fare ?? 0;
        return `환승 ${t}회 · 요금 ${Number(f).toLocaleString()}원`;
      }
      return this.routeSummary?.summaryText || "";
    },
    reportTypeLabel() {
      return ({ CREW: "크루", USER: "유저", MEETING: "모임", COMMENT: "댓글" }[this.reportModal.targetType] || "");
    },
    evaluatableMembers() {
      return this.approvedParticipants.filter((p) => !this.isMe(p));
    },
    myEvaluationCount() {
      return Object.values(this.evaluationDoneMap).filter(Boolean).length;
    },
    isPaidMeeting() {
      return Number(this.meetingData.fee || 0) > 0;
    },
    myMeetingMemberId() {
      const myRow = (this.participants || []).find((p) => this.isMe(p));
      return myRow?.meetingMemberId ?? null;
    },

    canRefund() {
      const raw = this.meetingData.datetime;
      if (!raw) return false;
      const meetingAt = dayjs.utc(raw).valueOf();
      if (!dayjs.utc(raw).isValid()) return false;
      const threeHoursMs = 3 * 60 * 60 * 1000;
      return meetingAt - dayjs().valueOf() > threeHoursMs;
    },
    // canRefund() {
    //   const raw = this.meetingData.datetime;
    //   if (!raw) return false;
    //   const normalized = typeof raw === "string" && raw.includes(" ") ? raw.replace(" ", "T") : raw;
    //   const meetingAt = new Date(normalized).getTime();
    //   if (isNaN(meetingAt)) return false;
    //   const threeHoursMs = 3 * 60 * 60 * 1000;
    //   return meetingAt - Date.now() > threeHoursMs;
    // },
    isOwnerAlone() {
      return this.isOwner && this.approvedParticipants.length <= 1;
    },
  },

  async mounted() {
    this.meetingId = Number(this.$route.params.id);
    this.crewId = Number(this.$route.query.crewId) || null;
    const me = getMyIdentity();
    this.myUserId = me.id;
    this.myEmail = me.email;

    this.outsideClickHandler = (e) => {
      if (this.$refs.reportDrop && !this.$refs.reportDrop.contains(e.target)) this.reportDropOpen = false;
    };
    document.addEventListener("click", this.outsideClickHandler);

    if (!this.meetingId) { this.errorMsg = "meetingId가 올바르지 않습니다."; return; }
    await this.init();
    await this.initKakaoMap();
    this.renderMeetingMarkerOnly();
  },

  watch: {
    showJoinSuccessModal(val) {
      if (val) {
        this.joinSuccessEnterHandler = (e) => { if (e.key === "Enter") { e.preventDefault(); this.showJoinSuccessModal = false; } };
        document.addEventListener("keydown", this.joinSuccessEnterHandler);
      } else if (this.joinSuccessEnterHandler) {
        document.removeEventListener("keydown", this.joinSuccessEnterHandler);
        this.joinSuccessEnterHandler = null;
      }
    },
    showLeaveConfirmModal(val) {
      if (val) {
        this.leaveConfirmEnterHandler = (e) => {
          if (e.key === "Enter" && !this.joinLoading) {
            e.preventDefault();
            this.confirmLeaveFromModal();
          }
        };
        document.addEventListener("keydown", this.leaveConfirmEnterHandler);
      } else if (this.leaveConfirmEnterHandler) {
        document.removeEventListener("keydown", this.leaveConfirmEnterHandler);
        this.leaveConfirmEnterHandler = null;
      }
    },
    showFreeJoinConfirmModal(val) {
      if (val) {
        this.freeJoinConfirmEnterHandler = (e) => {
          if (e.key === "Enter" && !this.joinLoading) {
            e.preventDefault();
            this.confirmFreeJoin();
          }
        };
        document.addEventListener("keydown", this.freeJoinConfirmEnterHandler);
      } else if (this.freeJoinConfirmEnterHandler) {
        document.removeEventListener("keydown", this.freeJoinConfirmEnterHandler);
        this.freeJoinConfirmEnterHandler = null;
      }
    },
  },

  beforeUnmount() {
    document.removeEventListener("click", this.outsideClickHandler);
    if (this.joinSuccessEnterHandler) document.removeEventListener("keydown", this.joinSuccessEnterHandler);
    if (this.leaveConfirmEnterHandler) document.removeEventListener("keydown", this.leaveConfirmEnterHandler);
    if (this.freeJoinConfirmEnterHandler) document.removeEventListener("keydown", this.freeJoinConfirmEnterHandler);
  },

  methods: {
    onLnbNavClick(key) {
      const map = { home: "/", "my-crews": "/my/crews", meetings: "/my/meetings", recent: "/my/recent", recommendations: "/crew/recommendations", rising: "/crew/rising-crews" };
      if (map[key]) this.$router.push(map[key]);
    },
    onLnbCategoryToggle(val) { this.$router.push({ path: "/crew/search", query: val ? { category: val } : {} }); },

    isMe(p) {
      const matchId = this.myUserId != null && String(p.userId) === String(this.myUserId);
      const matchEmail = this.myEmail != null && String(p.userEmail) === String(this.myEmail);
      return matchId || matchEmail;
    },

    async init() {
      this.loading = true;
      this.errorMsg = "";
      try {
        await this.fetchMeetingDetail();
        await this.fetchMemberList();
        this.computeOwnerFromParticipants();
        await this.fetchCrewMembership();
      } catch (e) {
        console.error(e);
        this.errorMsg = e.response?.data?.message || "모임 정보를 불러오지 못했습니다.";
      } finally {
        this.loading = false;
      }
    },

    async fetchCrewMembership() {
      if (!this.crewId || !localStorage.getItem("token")) {
        this.isCrewMember = false;
        return;
      }
      try {
        const res = await API.get(`/crewMember/${this.crewId}/memberList`);
        const list = Array.isArray(res.data) ? res.data : [];
        const me = list.find((m) => m.me === true || String(m.userId) === String(this.myUserId));
        this.isCrewMember = !!me;
      } catch (e) {
        this.isCrewMember = false;
      }
    },

    goToCrewJoin() {
      this.showCrewJoinRequiredModal = false;
      if (this.crewId) this.$router.push(`/crew/${this.crewId}`);
    },

    isMeetingTimePassed(datetime) {
      const raw = datetime ?? this.meetingData?.datetime;
      if (!raw) return false;
      const d = dayjs.utc(raw);
      return d.isValid() && d.valueOf() <= dayjs().valueOf();
    },

    // isMeetingTimePassed(datetime) {
    //   const raw = datetime ?? this.meetingData?.datetime;
    //   if (!raw) return false;
    //   const normalized = typeof raw === "string" && raw.includes(" ") ? raw.replace(" ", "T") : raw;
    //   const meetingAt = new Date(normalized).getTime();
    //   return !isNaN(meetingAt) && meetingAt <= Date.now();
    // },

    async fetchMeetingDetail() {
      const params = this.crewId ? { crewId: this.crewId } : {};
      const res = await API.get(`/meeting/${this.meetingId}`, { params });
      const d = res.data || {};
      this.crewId = d.crewId ?? this.crewId;
      const status = (d.recruitStatus ?? "OPEN").toString().toUpperCase();
      const datetime = d.meetingAt ?? "";
      const currentParticipants = Number(d.currentMemberCount ?? 0);
      const maxParticipants = Number(d.maxMembers ?? d.maxMemberCount ?? 0);

      const shouldAutoClose =
        this.crewId &&
        status === "OPEN" &&
        (this.isMeetingTimePassed(datetime) ||
          (maxParticipants > 0 && currentParticipants >= maxParticipants));

      if (shouldAutoClose) {
        try {
          await API.patch("/meeting/status", {
            crewId: this.crewId,
            meetingId: this.meetingId,
            status: "CLOSED",
          });
          const res2 = await API.get(`/meeting/${this.meetingId}`, { params: { crewId: this.crewId } });
          const d2 = res2.data || {};
          this.meetingData = {
            title: d2.meetingName ?? "",
            location: d2.place ?? "",
            description: d2.description ?? "",
            datetime: d2.meetingAt ?? "",
            currentParticipants: d2.currentMemberCount ?? 0,
            maxParticipants: d2.maxMembers ?? 0,
            status: d2.recruitStatus ?? "CLOSED",
            fee: d2.fee ?? 0,
            latitude: d2.latitude ?? null,
            longitude: d2.longitude ?? null,
            profileImage: d2.profileImage ?? d2.imageUrl ?? d2.image ?? null,
            isSettled: !!(d2.isSettled ?? d2.is_settled),
          };
          return;
        } catch (e) {
          console.error("모임 상태 자동 마감 처리 실패:", e);
          this.meetingData = {
            title: d.meetingName ?? "",
            location: d.place ?? "",
            description: d.description ?? "",
            datetime: datetime,
            currentParticipants: currentParticipants,
            maxParticipants: maxParticipants,
            status: "CLOSED",
            fee: d.fee ?? 0,
            latitude: d.latitude ?? null,
            longitude: d.longitude ?? null,
            profileImage: d.profileImage ?? d.imageUrl ?? d.image ?? null,
            isSettled: !!(d.isSettled ?? d.is_settled),
          };
          return;
        }
      }

      this.meetingData = {
        title: d.meetingName ?? "",
        location: d.place ?? "",
        description: d.description ?? "",
        datetime: datetime,
        currentParticipants: currentParticipants,
        maxParticipants: maxParticipants,
        status: status,
        fee: d.fee ?? 0,
        latitude: d.latitude ?? null,
        longitude: d.longitude ?? null,
        profileImage: d.profileImage ?? d.imageUrl ?? d.image ?? null,
        isSettled: !!(d.isSettled ?? d.is_settled),
      };
    },

    async fetchMemberList() {
      if (!this.crewId) return;
      this.memberLoading = true;
      try {
        const res = await API.get(`/meetingMember/${this.crewId}/${this.meetingId}/memberList`);
        this.participants = Array.isArray(res.data) ? res.data : [];
        this.isParticipating = this.participants.some((p) => this.isMe(p));
      } catch (e) {
        console.error(e);
        this.participants = [];
      } finally {
        this.memberLoading = false;
      }
    },

    computeOwnerFromParticipants() {
      const myRow = this.participants.find((p) => this.isMe(p));
      this.isOwner = (myRow?.role || "").toString().toUpperCase() === "OWNER";
    },

    requireOwner() {
      if (!this.isOwner) { alert("모임장만 사용할 수 있습니다."); return false; }
      return true;
    },

    openAttendanceModal() {
      if (!this.requireOwner()) return;
      this.attendSet = new Set(this.approvedParticipants.map(p => p.meetingMemberId));
      this.attendSearch = "";
      this.attendanceError = "";
      this.attendanceResult = "";
      this.showAttendanceModal = true;
    },

    toggleAttend(meetingMemberId) {
      const next = new Set(this.attendSet);
      next.has(meetingMemberId) ? next.delete(meetingMemberId) : next.add(meetingMemberId);
      this.attendSet = next;
    },

    toggleNoShow(meetingMemberId) {
      const next = new Set(this.noShowSet);
      next.has(meetingMemberId) ? next.delete(meetingMemberId) : next.add(meetingMemberId);
      this.noShowSet = next;
    },

    async submitFinish() {
      if (!this.requireOwner()) return;
      if (!this.crewId) { alert("crewId가 없습니다."); return; }
      this.attendanceLoading = true;
      this.attendanceError = "";
      try {
        const noShowIds = this.approvedParticipants
          .filter(p => !this.attendSet.has(p.meetingMemberId))
          .map(p => p.meetingMemberId);

        await API.post("/meeting/finish", {
          crewId: this.crewId,
          meetingId: this.meetingId,
          noShowMeetingMemberIds: noShowIds,
        });
        this.showAttendanceModal = false;
        this.attendanceResult = "모임이 종료되었습니다. 매너점수가 반영되었습니다.";
        setTimeout(() => { this.attendanceResult = ""; }, 4000);
        await this.fetchMeetingDetail();
        await this.fetchMemberList();
        this.computeOwnerFromParticipants();
      } catch (e) {
        console.error(e);
        this.attendanceError = e.response?.data?.message || "출석 체크 처리에 실패했습니다.";
      } finally {
        this.attendanceLoading = false;
      }
    },

    async requestRefund(reason) {
      const id = this.myMeetingMemberId;
      if (!id) return false;
      try {
        await API.post(`/fee/refund/${id}`, { reason: reason || "개인 사정" });
        return true;
      } catch (e) {
        console.error(e);
        alert(e.response?.data?.message || "환불 요청에 실패했습니다.");
        return false;
      }
    },

    async handleLeave() {
      if (!localStorage.getItem("token")) { alert("로그인이 필요합니다."); this.$router.push("/login"); return; }
      if (!this.crewId || this.joinLoading) return;
      if (this.isPaidMeeting && !this.canRefund) {
        this.showReportToast("모임 시작 3시간 이내에는 환불이 불가능합니다.");
        return;
      }
      if (this.isOwner) {
        if (this.approvedParticipants.length <= 1) {
          if (this.meetingData.isSettled) {
            this.showReportToast("정산이 완료된 모임은 삭제할 수 없습니다.");
            return;
          }
          this.leaveConfirmMessage = "모임을 삭제하시겠습니까?";
          this.leaveConfirmIsOwnerAlone = true;
          this.showLeaveConfirmModal = true;
          return;
        }
        this.selectedNextOwner = null;
        this.showNextOwnerModal = true;
        return;
      }
      this.leaveConfirmMessage = "정말 모임을 나가시겠습니까?";
      this.leaveConfirmIsOwnerAlone = false;
      this.showLeaveConfirmModal = true;
    },

    async confirmLeaveFromModal() {
      this.showLeaveConfirmModal = false;
      if (this.leaveConfirmIsOwnerAlone) {
        if (this.meetingData.isSettled) return;
        if (this.isPaidMeeting && this.myMeetingMemberId) {
          this.joinLoading = true;
          const ok = await this.requestRefund("개인 사정");
          this.joinLoading = false;
          if (!ok) return;
        }
        await this.doDeleteMeeting();
        return;
      }
      if (this.isPaidMeeting && this.myMeetingMemberId) {
        this.joinLoading = true;
        try {
          const ok = await this.requestRefund("개인 사정");
          if (!ok) { this.joinLoading = false; return; }
          await this.fetchMeetingDetail();
          await this.fetchMemberList();
          this.computeOwnerFromParticipants();
          this.isParticipating = false;
          this.isOwner = false;
        } finally {
          this.joinLoading = false;
        }
      } else {
        await this.doLeave(null);
      }
    },

    async confirmLeaveAsOwner() {
      if (!this.selectedNextOwner) return;
      if (this.isPaidMeeting && !this.canRefund) {
        this.showReportToast("모임 시작 3시간 이내에는 환불이 불가능합니다.");
        return;
      }
      this.showNextOwnerModal = false;
      if (this.isPaidMeeting && this.myMeetingMemberId) {
        this.joinLoading = true;
        const ok = await this.requestRefund("개인 사정");
        this.joinLoading = false;
        if (!ok) return;
      }
      await this.doLeave(this.selectedNextOwner);
    },

    async doLeave(nextOwnerMeetingMemberId) {
      this.joinLoading = true;
      try {
        const payload = { crewId: this.crewId, meetingId: this.meetingId, leftReason: "개인 사정" };
        if (nextOwnerMeetingMemberId != null) payload.nextOwnerMeetingMemberId = nextOwnerMeetingMemberId;
        await API.post("/meetingMember/left", payload);
        this.isParticipating = false; this.isOwner = false; this.selectedNextOwner = null;
        await this.fetchMeetingDetail();
        await this.fetchMemberList();
        this.computeOwnerFromParticipants();
      } catch (e) {
        console.error(e);
        alert(e.response?.data?.message || "모임 나가기에 실패했습니다.");
      } finally { this.joinLoading = false; }
    },

    async doDeleteMeeting() {
      this.joinLoading = true;
      try {
        await API.delete(`/meeting/${this.meetingId}`);
        this.$router.push(this.crewId ? `/crew/${this.crewId}` : "/");
      } catch (e) {
        console.error(e);
        const msg = e.response?.data?.message || e.response?.data?.error_message || "모임 삭제에 실패했습니다.";
        this.showReportToast(msg);
      } finally {
        this.joinLoading = false;
      }
    },

    async requestJoin() {
      if (!localStorage.getItem("token")) { alert("로그인이 필요합니다."); this.$router.push("/login"); return; }
      if (!this.crewId || this.joinLoading) return;
      if (this.isCrewMember === false) {
        this.showCrewJoinRequiredModal = true;
        return;
      }
      if (this.isPaidMeeting) {
        this.showPaidNoticeModal = true;
        return;
      }
      this.showFreeJoinConfirmModal = true;
    },

    confirmFreeJoin() {
      this.showFreeJoinConfirmModal = false;
      this.proceedWithJoin();
    },

    async confirmPaidNotice() {
      this.showPaidNoticeModal = false;
      await this.proceedWithJoin();
    },

    async proceedWithJoin() {
      this.joinLoading = true;
      try {
        const res = await API.post("/meetingMember/request", { crewId: this.crewId, meetingId: this.meetingId, joinMessage: "참여 신청합니다!" });
        const joinRes = res.data;
        if (joinRes.approved) {
          this.isParticipating = true;
          await this.fetchMeetingDetail(); await this.fetchMemberList(); this.computeOwnerFromParticipants();
          this.showJoinSuccessModal = true;
          return;
        }
        if (joinRes.merchantUid) await this.openPayment(joinRes.merchantUid, joinRes.amount);
      } catch (e) {
        console.error(e);
        alert(e.response?.data?.message || "모임 신청에 실패했습니다.");
      } finally { this.joinLoading = false; }
    },

    async openPayment(merchantUid, amount) {
      try {
        const PortOne = await loadPortOneSDK();
        this.paymentLoading = true;
        const response = await PortOne.requestPayment({
          storeId: "store-bf090832-32d2-4ffc-a9ef-b9fa1973a227",
          channelKey: "channel-key-554e6cca-d51c-404c-82a0-be636bb09115",
          paymentId: merchantUid,
          orderName: `${this.meetingData.title} 참가비`,
          totalAmount: amount,
          currency: "KRW",
          payMethod: "EASY_PAY",
        });
        this.paymentLoading = false;
        if (response.code) { console.warn("결제 실패:", response); await this.cancelJoinByMerchantUid(merchantUid); alert(response.message || "결제가 취소되었습니다."); return; }
        await this.confirmPayment(merchantUid, response.paymentId);
      } catch (e) {
        this.paymentLoading = false;
        await this.cancelJoinByMerchantUid(merchantUid);
        alert("결제 중 오류가 발생했습니다.");
      }
    },

    async confirmPayment(merchantUid, impUid) {
      this.paymentLoading = true;
      try {
        await API.post("/meetingMember/payment-success", { crewId: this.crewId, meetingId: this.meetingId, merchantUid, impUid });
        this.isParticipating = true;
        await this.fetchMeetingDetail(); await this.fetchMemberList(); this.computeOwnerFromParticipants();
        alert("결제가 완료되어 모임 참여가 확정되었습니다.");
      } catch (e) {
        alert(e.response?.data?.message || "결제 검증에 실패했습니다. 고객센터에 문의해주세요.");
      } finally { this.paymentLoading = false; }
    },

    async cancelJoinByMerchantUid(merchantUid) {
      try { await API.post("/meetingMember/cancel", { merchantUid }); } catch (e) { console.error(e); }
    },

    async handleStatusChange(newStatus) {
      if (!this.requireOwner()) return;
      try {
        await API.patch("/meeting/status", { crewId: this.crewId, meetingId: this.meetingId, status: newStatus });
        this.statusChangeResult = `상태가 "${this.statusLabel(newStatus)}"으로 변경되었습니다.`;
        setTimeout(() => { this.statusChangeResult = ""; }, 3000);
        await this.fetchMeetingDetail();
      } catch (e) { alert(e.response?.data?.message || "상태 변경에 실패했습니다."); }
    },

    handleEdit() {
      if (!this.requireOwner()) return;
      if (this.isPaidMeeting && !this.canRefund) {
        this.showReportToast("정산이 완료돼 모임 수정이 불가능합니다.");
        return;
      }
      this.reportDropOpen = false;
      this.$router.push(`/meeting/${this.meetingId}/edit`);
    },

    setEvaluationType(meetingMemberId, type) { this.evaluationTypeMap = { ...this.evaluationTypeMap, [meetingMemberId]: type }; },

    async submitEvaluation(participant) {
      const key = participant.meetingMemberId;
      const type = this.evaluationTypeMap[key];
      if (!type) return;
      const targetUserId = participant.userId;
      if (!targetUserId) { alert("평가 대상의 userId를 찾을 수 없습니다."); return; }
      this.evaluationLoadingMap = { ...this.evaluationLoadingMap, [key]: true };
      try {
        await API.post("/meetingMember/evaluate", { crewId: this.crewId, meetingId: this.meetingId, targetUserId, type });
        this.evaluationDoneMap = { ...this.evaluationDoneMap, [key]: true };
      } catch (e) { alert(e.response?.data?.message || "기록에 실패했습니다."); }
      finally { this.evaluationLoadingMap = { ...this.evaluationLoadingMap, [key]: false }; }
    },

    async initKakaoMap() {
      try { this.kakaoSdk = await loadKakaoMaps(); } catch (e) { this.routeError = "카카오맵 SDK 오류"; return; }
      if (!this.$refs.mapEl || !this.kakaoSdk?.maps) return;
      const lat = Number(this.meetingData.latitude);
      const lng = Number(this.meetingData.longitude);
      const center = lat && lng ? new this.kakaoSdk.maps.LatLng(lat, lng) : new this.kakaoSdk.maps.LatLng(37.5665, 126.978);
      this.kakaoMap = new this.kakaoSdk.maps.Map(this.$refs.mapEl, { center, level: 5 });
    },

    clearRouteGraphics() {
      if (this.kakaoPolyline) { this.kakaoPolyline.setMap(null); this.kakaoPolyline = null; }
      if (this.kakaoMarkers?.length) this.kakaoMarkers.forEach((m) => m.setMap(null));
      this.kakaoMarkers = [];
    },

    renderMeetingMarkerOnly() {
      if (!this.kakaoMap || !this.kakaoSdk?.maps) return;
      const lat = Number(this.meetingData.latitude);
      const lng = Number(this.meetingData.longitude);
      if (!lat || !lng) return;
      this.clearRouteGraphics();
      const dest = new this.kakaoSdk.maps.LatLng(lat, lng);
      const marker = new this.kakaoSdk.maps.Marker({ position: dest });
      marker.setMap(this.kakaoMap);
      this.kakaoMarkers.push(marker);
      this.kakaoMap.setCenter(dest);
    },

    async openKakaoDirections() {
      const lat = Number(this.meetingData.latitude);
      const lng = Number(this.meetingData.longitude);
      if (!lat || !lng) { alert("목적지 좌표가 없습니다."); return; }

      const pos = await this.getMyLocationSafe();
      const destName = encodeURIComponent(this.meetingData.title || "목적지");

      if (pos?.lat && pos?.lng) {
        const startName = encodeURIComponent("현재위치");
        window.location.href =
          `https://map.kakao.com/link/from/${startName},${pos.lat},${pos.lng}/to/${destName},${lat},${lng}`;
      } else {
        window.location.href =
          `https://map.kakao.com/link/to/${destName},${lat},${lng}`;
      }
    },

    async fetchRouteSummary(mode) {
      if (!this.crewId || this.routeLoading) return;
      const destLat = Number(this.meetingData.latitude);
      const destLng = Number(this.meetingData.longitude);
      if (!destLat || !destLng) { alert("목적지 좌표가 없습니다."); return; }
      const pos = await this.getMyLocationSafe();
      if (!pos) { alert("현재 위치를 가져오지 못했습니다."); return; }
      this.routeMode = mode; this.routeLoading = true; this.routeError = ""; this.routeSummary = null;
      try {
        const res = await API.post("/meeting/route/summary", { crewId: this.crewId, meetingId: this.meetingId, mode, startLat: pos.lat, startLng: pos.lng });
        this.routeSummary = res.data || {};
        const path = this.normalizePathToLatLng(this.routeSummary.path);
        this.renderRouteOnMap(path, new this.kakaoSdk.maps.LatLng(pos.lat, pos.lng), new this.kakaoSdk.maps.LatLng(destLat, destLng));
      } catch (e) {
        this.routeError = e.response?.data?.message || "경로 조회 실패";
        this.renderMeetingMarkerOnly();
      } finally { this.routeLoading = false; }
    },

    renderRouteOnMap(pathPoints, startLatLng, endLatLng) {
      if (!this.kakaoMap || !this.kakaoSdk?.maps) return;
      this.clearRouteGraphics();
      if (startLatLng) { const m1 = new this.kakaoSdk.maps.Marker({ position: startLatLng }); m1.setMap(this.kakaoMap); this.kakaoMarkers.push(m1); }
      if (endLatLng) { const m2 = new this.kakaoSdk.maps.Marker({ position: endLatLng }); m2.setMap(this.kakaoMap); this.kakaoMarkers.push(m2); }
      if (Array.isArray(pathPoints) && pathPoints.length > 1) {
        this.kakaoPolyline = new this.kakaoSdk.maps.Polyline({ path: pathPoints, strokeWeight: 6, strokeOpacity: 0.9 });
        this.kakaoPolyline.setMap(this.kakaoMap);
        const bounds = new this.kakaoSdk.maps.LatLngBounds();
        pathPoints.forEach((p) => bounds.extend(p));
        this.kakaoMap.setBounds(bounds);
      } else if (endLatLng) { this.kakaoMap.setCenter(endLatLng); }
    },

    normalizePathToLatLng(path) {
      if (!this.kakaoSdk?.maps || !Array.isArray(path)) return [];
      return path.map((pair) => {
        if (!Array.isArray(pair) || pair.length < 2) return null;
        const n1 = Number(pair[0]); const n2 = Number(pair[1]);
        if (!Number.isFinite(n1) || !Number.isFinite(n2)) return null;
        const n1IsLat = n1 >= -90 && n1 <= 90;
        const n2IsLat = n2 >= -90 && n2 <= 90;
        if (n1IsLat && !n2IsLat) return new this.kakaoSdk.maps.LatLng(n1, n2);
        if (!n1IsLat && n2IsLat) return new this.kakaoSdk.maps.LatLng(n2, n1);
        return new this.kakaoSdk.maps.LatLng(n1, n2);
      }).filter(Boolean);
    },

    getMyLocationSafe() {
      return new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      });
    },

    statusLabel(status) {
      const s = (status || "").toString().toUpperCase();
      if (s === "OPEN") return "모집중"; if (s === "CLOSED") return "모집마감"; if (s === "FINISHED") return "종료"; return status;
    },
    statusBadgeClass(status) {
      const s = (status || "").toString().toUpperCase();
      if (s === "OPEN") return "badge--open"; if (s === "CLOSED") return "badge--closed"; return "badge--done";
    },
    formatDateTime(dt) {
      if (!dt) return "";
      const d = dayjs.utc(dt).tz("Asia/Seoul");
      if (!d.isValid()) return String(dt);
      return d.format("YYYY-MM-DD HH:mm");
    },
    // formatDateTime(dt) {
    //   if (!dt) return "";
    //   const s = dt.toString().replace("T", " ");
    //   return s.length >= 16 ? s.slice(0, 16) : s;
    // },
    formatDistance(meters) {
      const m = Number(meters || 0);
      return m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${Math.round(m)}m`;
    },
    formatTime(seconds) {
      const s = Number(seconds || 0);
      if (!s) return "0분";
      const min = Math.round(s / 60);
      return min < 60 ? `${min}분` : `${Math.floor(min / 60)}시간 ${min % 60}분`;
    },

    openReport(targetType, targetId) {
      if (targetType === "MEETING" && !this.isParticipating) {
        this.showReportToast("모임에 가입한 회원만 신고할 수 있습니다.");
        this.reportDropOpen = false;
        return;
      }
      this.reportModal = { open: true, targetType, targetId, reason: "", detail: "", loading: false, reportId: null, cancelLoading: false };
      this.reportDropOpen = false;
    },
    closeReport() { this.reportModal.open = false; },
    showReportToast(msg) {
      this.reportToastMessage = msg;
      setTimeout(() => { this.reportToastMessage = ""; }, 3000);
    },
    async submitReport() {
      if (!this.reportModal.reason) return;
      this.reportModal.loading = true;
      try {
        const targetId = Number(this.reportModal.targetId);
        if (!Number.isFinite(targetId)) { this.showReportToast("신고 대상 정보가 올바르지 않습니다."); this.reportModal.loading = false; return; }
        const res = await API.post("/report/create", {
          targetType: this.reportModal.targetType,
          targetId,
          reasonType: this.reportModal.reason,
          reasonText: (this.reportModal.detail || "").trim() || null,
        });
        this.reportModal.reportId = res.data?.reportId ?? res.data?.id ?? null;
        this.closeReport();
        this.showReportToast("신고가 접수되었습니다.");
      } catch (e) {
        const status = e.response?.status;
        const data = e.response?.data;
        const raw = (data && (data.message ?? data.msg ?? data.error ?? data.error_message)) || (typeof data === "string" ? data : null);
        const rawStr = (raw && String(raw)).toLowerCase();
        const isAlreadyReported = status === 409 || (rawStr && (rawStr.includes("이미") || rawStr.includes("중복") || rawStr.includes("already") || rawStr.includes("duplicate")));
        let msg;
        if (isAlreadyReported) {
          msg = this.reportModal.targetType === "MEETING" ? "이미 신고한 모임입니다." : "이미 신고한 회원입니다.";
        } else {
          msg = (raw && String(raw).trim()) || "신고에 실패했습니다.";
        }
        this.showReportToast(msg);
      } finally { this.reportModal.loading = false; }
    },
    async cancelReport(reportId) {
      if (!reportId) return;
      this.reportModal.cancelLoading = true;
      try {
        await API.patch(`/report/${reportId}/cancel`, {});
        this.reportModal.reportId = null;
        this.closeReport();
        this.showReportToast("신고가 취소되었습니다.");
      } catch (e) { this.showReportToast(e.response?.data?.message || "신고 취소에 실패했습니다."); }
      finally { this.reportModal.cancelLoading = false; }
    },
  },
};
</script>

<style scoped>
*, *::before, *::after { box-sizing: border-box; }

.detail-root {
  min-height: 100vh;
  background: #f7f7f5;
  font-family: "Pretendard", "Apple SD Gothic Neo", -apple-system, sans-serif;
}

.loading-screen { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
.loading-spinner { width: 40px; height: 40px; border: 4px solid #f0f0f0; border-top-color: #4fa8d8; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.error-screen { display: flex; align-items: center; justify-content: center; min-height: 100vh; color: #888; font-size: 14px; }

.page-body { display: flex; align-items: flex-start; }
.content-area { flex: 1; min-width: 0; }
.body-layout { display: flex; gap: 20px; padding: 20px 20px 40px; align-items: flex-start; }
.main-col { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px; }
.side-col { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; position: sticky; top: 20px; }

.meeting-header-card { display: flex; gap: 20px; align-items: center; background: #fff; border: 1px solid #ebebeb; border-radius: 18px; padding: 20px; }
.meeting-img-wrap { position: relative; flex-shrink: 0; width: 280px; height: 280px; border-radius: 14px; overflow: hidden; align-self: center; }
.meeting-img { width: 100%; height: 100%; object-fit: cover; }
.meeting-img-placeholder { width: 100%; height: 100%; background: #E7F3FF; display: flex; align-items: center; justify-content: center; }
.meeting-status-badge { position: absolute; bottom: 8px; left: 8px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.badge--open { background: #dcfce7; color: #16a34a; }
.badge--closed { background: #dbeafe; color: #1d4ed8; }
.badge--done { background: #f3f4f6; color: #6b7280; }
.meeting-header-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 14px; }
.meeting-name-row { display: flex; align-items: flex-start; gap: 8px; flex-wrap: wrap; }
.meeting-name { font-size: 22px; font-weight: 800; color: #111; margin: 0; line-height: 1.3; flex: 1; min-width: 0; }
.meeting-name-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; flex-wrap: wrap; }

.hbtn { display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 20px; font-size: 12.5px; font-weight: 700; cursor: pointer; transition: all 0.15s; border: 1.5px solid; white-space: nowrap; }
.hbtn--status { border-radius: 10px; }
.hbtn--open { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
.hbtn--open:hover { background: #dcfce7; }
.hbtn--close { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.hbtn--close:hover { background: #dbeafe; }
.hbtn--finish { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.hbtn--finish:hover { background: #dbeafe; }
.hbtn--icon { padding: 6px 10px; background: #f5f5f5; color: #666; border-color: #e8e8e8; border-radius: 20px; }
.hbtn--icon:hover { background: #eaeaea; }

.status-toast { padding: 10px 14px; background: #dbeafe; border: 1px solid #bfdbfe; border-radius: 10px; font-size: 13px; color: #1d4ed8; font-weight: 600; text-align: center; }

.report-wrap { position: relative; }
.report-dropdown { position: absolute; top: calc(100% + 6px); right: 0; background: #fff; border: 1px solid #eee; border-radius: 10px; box-shadow: 0 6px 20px rgba(0,0,0,0.12); min-width: 160px; z-index: 100; overflow: hidden; }
.report-item { display: flex; align-items: center; gap: 6px; width: 100%; text-align: left; padding: 10px 16px; font-size: 13px; color: #333; background: none; border: none; cursor: pointer; }
.report-item:hover { background: #f8f8f8; }
.report-item--danger { color: #e53935; }
.report-item--danger:hover { background: #fff5f5; }
.dropdown-divider { border-top: 1px solid #f0f0f0; margin: 4px 0; }

.modern-stats-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.msi--loc { grid-column: 1 / -1; }
.msi { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 12px; }
.msi--blue { background: #e0f2fe; color: #0369a1; }
.msi--yellow { background: #fef9ec; color: #92400e; }
.msi--purple { background: #ede9fe; color: #5b21b6; }
.msi--green { background: #dcfce7; color: #166534; }
.msi-body { display: flex; flex-direction: column; min-width: 0; }
.msi-label { font-size: 10.5px; font-weight: 600; opacity: 0.7; }
.msi-value { font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.msi-value em { font-style: normal; font-size: 11px; font-weight: 500; opacity: 0.75; margin-left: 2px; }

.action-wrap { display: flex; flex-direction: column; gap: 10px; }
.action-hint { font-size: 12px; color: #aaa; text-align: center; padding: 8px 0; }

.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 18px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; }
.btn--primary { background: #4fa8d8; color: #fff; }
.btn--primary:hover { background: #3a8fc0; }
.btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--no-forbidden:disabled { cursor: default; }
.btn--outline { background: #fff; color: #444; border: 1.5px solid #e0e0e0; }
.btn--outline:hover { border-color: #999; }
.btn--danger { background: #fff; color: #e53935; border: 1.5px solid #fca5a5; }
.btn--danger:hover { background: #fff5f5; }
.btn--finish { background: #4FA8D8; color: #fff; border: none; box-shadow: 0 4px 14px rgba(79,168,216,0.3); }
.btn--finish:hover:not(:disabled) { background: #3a95c4; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(79,168,216,0.4); }
.btn--finish:disabled { opacity: 0.6; cursor: not-allowed; }
.btn--lg { padding: 13px 16px; font-size: 15px; width: 100%; }
.btn-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }

.crew-desc-section { margin-top: 4px; padding-top: 16px; border-top: 1px solid #eee; }
.crew-desc-hd { margin-bottom: 10px; }
.crew-desc-title { font-size: 14px; font-weight: 700; color: #333; }
.crew-desc-title--with-icon { display: inline-flex; align-items: center; gap: 6px; }
.crew-desc-text { font-size: 14px; color: #555; line-height: 1.75; margin: 0; }

.card { background: #fff; border-radius: 16px; border: 1px solid #ebebeb; padding: 20px; }
.card--eval { border-color: #bfdbfe; background: #eff6ff; }

.pm-empty { text-align: center; padding: 20px 0; font-size: 13px; color: #aaa; }
.me-badge { display: inline-block; padding: 1px 5px; background: #dbeafe; color: #1d4ed8; border-radius: 4px; font-size: 10px; font-weight: 700; margin-left: 4px; }
.owner-badge { font-size: 11px; color: #4fa8d8; font-weight: 700; margin-left: 4px; }

.owner-card-hd { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.owner-hint { font-size: 12px; color: #666; margin: 4px 0 0; }
.eval-progress-badge { flex-shrink: 0; padding: 3px 10px; background: #dbeafe; color: #1d4ed8; border-radius: 20px; font-size: 11px; font-weight: 700; }
.eval-list { display: flex; flex-direction: column; gap: 16px; }
.eval-item { background: #fff; border: 1.5px solid #e8e8e8; border-radius: 12px; padding: 16px; }
.eval-item--done { opacity: 0.65; }
.eval-user { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.eval-user-info { flex: 1; }
.eval-done-badge { padding: 3px 10px; background: #dcfce7; color: #15803d; border-radius: 20px; font-size: 11px; font-weight: 700; }
.attend-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; }
.attend-avatar-ph { width: 36px; height: 36px; border-radius: 50%; background: #d1d5db; color: #fff; display: flex; align-items: center; justify-content: center; }
.attend-avatar-icon { width: 18px; height: 18px; }
.attend-name { font-size: 13px; font-weight: 600; color: #111; }
.eval-btns { display: flex; gap: 10px; margin-bottom: 12px; }
.eval-type-btn { flex: 1; padding: 12px 8px; border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer; border: 2px solid transparent; transition: all 0.15s; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.eval-icon { width: 24px; height: 24px; }
.eval-type-btn--inactive { background: #fff; color: #555; border-color: #e0e0e0; }
.eval-type-btn--inactive:hover { border-color: #4fa8d8; color: #4fa8d8; }
.eval-type-btn--good-active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
.eval-type-btn--bad-active { background: #ef4444; color: #fff; border-color: #ef4444; }

/* =============================================
   출석 모달
   ============================================= */
.modal-box--attendance {
  max-width: 460px;
  width: 100%;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 20px;
  padding: 0;
  background: #fff;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}
.amod-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 20px 14px;
  flex-shrink: 0;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
}
.amod-header-left { display: flex; flex-direction: column; gap: 2px; }
.amod-header-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.amod-title { font-size: 18px; font-weight: 800; color: #111; margin: 0; letter-spacing: -0.3px; }
.amod-subtitle { font-size: 12px; color: #888; margin: 0; font-weight: 500; }
.amod-status-info { display: flex; flex-direction: column; align-items: flex-end; }
.amod-status-label { font-size: 9.5px; font-weight: 700; color: #aaa; letter-spacing: 0.06em; text-transform: uppercase; }
.amod-status-count { font-size: 18px; font-weight: 900; color: #111; line-height: 1.1; }
.amod-status-count b { color: #4fa8d8; }
.amod-close {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 50%; border: none;
  background: #f5f5f5; cursor: pointer; color: #666;
  flex-shrink: 0; transition: background 0.15s;
}
.amod-close:hover { background: #eaeaea; }
.amod-close svg { width: 14px; height: 14px; }
.amod-search-wrap { position: relative; margin: 14px 18px 8px; flex-shrink: 0; }
.amod-search-icon {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  width: 15px; height: 15px; color: #bbb; pointer-events: none;
}
.amod-search {
  width: 100%; padding: 10px 14px 10px 36px;
  border: 1.5px solid #e8e8e8; border-radius: 12px;
  font-size: 13.5px; color: #222; background: #f9f9f9;
  outline: none; font-family: inherit; transition: border-color 0.15s, background 0.15s;
}
.amod-search:focus { border-color: #4fa8d8; background: #fff; }
.amod-search::placeholder { color: #bbb; }
.amod-list {
  flex: 1; overflow-y: auto; padding: 4px 18px 8px;
  display: flex; flex-direction: column; gap: 7px;
}
.amod-empty { text-align: center; padding: 32px 0; font-size: 13px; color: #bbb; }
.amod-item {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 12px 14px; border-radius: 14px;
  border: 1.5px solid #ebebeb; background: #fff;
  cursor: pointer; transition: all 0.14s; user-select: none;
}
.amod-item:hover { border-color: #c8e6f5; background: #f8fbfe; }
.amod-item--attend { border-color: #7dd3f5; background: #f0f9ff; }
.amod-item--attend:hover { border-color: #4fa8d8; background: #e6f4fb; }
.amod-user { display: flex; align-items: center; gap: 12px; }
.amod-avatar-wrap { position: relative; flex-shrink: 0; }
.amod-avatar { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid #f0f0f0; }
.amod-avatar-ph {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #d1d5db;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.amod-avatar-icon { width: 22px; height: 22px; }
.amod-user-info { display: flex; flex-direction: column; gap: 3px; }
.amod-name-row { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
.amod-name { font-size: 14px; font-weight: 700; color: #111; }
.amod-owner-badge { font-size: 10px; color: #4fa8d8; font-weight: 700; background: #e0f2fe; padding: 1px 7px; border-radius: 20px; }
.amod-me-badge { font-size: 10px; color: #1d4ed8; font-weight: 700; background: #dbeafe; padding: 1px 7px; border-radius: 20px; }
.amod-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.amod-attend-label { font-size: 12px; font-weight: 700; color: #4fa8d8; }
.amod-check {
  width: 28px; height: 28px; border-radius: 50%;
  border: 2px solid #d1d5db; background: #fff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all 0.15s; color: #fff;
}
.amod-check--on { background: #4fa8d8; border-color: #4fa8d8; box-shadow: 0 2px 8px rgba(79,168,216,0.35); }
.amod-error {
  margin: 8px 18px 0; padding: 10px 14px;
  background: #fee2e2; border: 1px solid #fecaca;
  border-radius: 10px; font-size: 13px; color: #b91c1c;
  font-weight: 600; flex-shrink: 0;
}
.amod-footer {
  display: flex; gap: 10px; padding: 12px 18px 18px;
  flex-shrink: 0; border-top: 1px solid #f0f0f0; margin-top: 8px;
}
.amod-btn-cancel {
  flex: 1; padding: 12px; border-radius: 12px;
  border: 1.5px solid #e0e0e0; background: #fff;
  color: #555; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.amod-btn-cancel:hover { border-color: #999; color: #222; }
.amod-btn-finish {
  flex: 2; padding: 12px; border-radius: 12px; border: none;
  background: #4fa8d8; color: #fff; font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  box-shadow: 0 4px 14px rgba(79,168,216,0.3); font-family: inherit;
}
.amod-btn-finish:hover:not(:disabled) { background: #3a95c4; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(79,168,216,0.4); }
.amod-btn-finish:disabled { opacity: 0.5; cursor: not-allowed; }
@media (max-width: 600px) {
  .modal-box--attendance { border-radius: 20px 20px 0 0; max-height: 95vh; }
  .modal-backdrop { align-items: flex-end; padding: 0; }
}

/* =============================================
   기존 스타일 유지
   ============================================= */
.result-toast { padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; text-align: center; }
.result-toast--green { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.result-toast--red { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }

.side-card { background: #fff; border-radius: 14px; border: 1px solid #ebebeb; padding: 16px; }
.side-card-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.side-card-title { font-size: 13.5px; font-weight: 700; color: #222; }
.side-route-mode { font-size: 11px; color: #888; background: #f5f5f5; padding: 2px 8px; border-radius: 10px; }
.route-summary-box { background: #f8f8f8; border: 1px solid #e8e8e8; border-radius: 10px; padding: 12px; margin-bottom: 10px; }
.route-summary-label { font-size: 13px; font-weight: 700; color: #111; margin-bottom: 4px; }
.route-summary-detail { font-size: 12px; color: #666; margin-bottom: 8px; }
.route-steps { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
.route-step { background: #fff; border: 1px solid #ebebeb; border-radius: 8px; padding: 10px 12px; display: flex; justify-content: space-between; gap: 10px; }
.route-step-main { min-width: 0; }
.route-step-title { font-size: 12.5px; font-weight: 700; color: #111; margin-bottom: 3px; }
.route-step-sub { font-size: 11px; color: #888; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.route-step-info { font-size: 11px; font-weight: 700; color: #555; text-align: right; white-space: nowrap; flex-shrink: 0; }
.route-mode-btns { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 10px; }
.route-btn { padding: 8px 4px; font-size: 12px; font-weight: 700; border-radius: 10px; border: 1.5px solid #e8e8e8; background: #fff; color: #555; cursor: pointer; transition: all 0.15s; text-align: center; }
.route-btn:hover { border-color: #4fa8d8; color: #4fa8d8; }
.route-btn--active { background: #4fa8d8; color: #fff; border-color: #4fa8d8; }
.route-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.kakao-btn { width: 100%; padding: 11px; border-radius: 10px; font-size: 13px; font-weight: 700; background: #4FA8D8; color: #fff; border: none; cursor: pointer; transition: background 0.15s; margin-bottom: 10px; }
.kakao-btn:hover { background: #3d96c4; }
.map-wrap { border: 1px solid #e8e8e8; border-radius: 10px; overflow: hidden; }
.kakao-map { width: 100%; height: 280px; }

.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 300; padding: 20px; backdrop-filter: blur(4px); }
.modal-box { background: #fff; border-radius: 18px; padding: 24px; width: 100%; max-width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
.modal-title { font-size: 17px; font-weight: 800; color: #111; margin: 0 0 6px; }
.modal-title--with-icon { display: inline-flex; align-items: center; gap: 6px; }
.modal-sub { font-size: 13px; color: #888; margin: 0 0 18px; }
.paid-notice-content { font-size: 14px; color: #444; margin: 0 0 18px; line-height: 1.6; }
.paid-notice-content p { margin: 0 0 8px; }
.paid-notice-content p:last-child { margin-bottom: 0; }
.modal-footer { display: flex; gap: 10px; margin-top: 18px; }
.modal-footer--end { justify-content: flex-end; }

.report-reasons { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.report-reason-item { padding: 7px 13px; border-radius: 20px; border: 1.5px solid #e0e0e0; font-size: 12.5px; color: #555; cursor: pointer; transition: all 0.12s; }
.report-reason-item:hover { border-color: #4fa8d8; color: #4fa8d8; }
.report-reason-item--active { background: #4fa8d8; color: #fff; border-color: #4fa8d8; }
.report-textarea { width: 100%; border: 1.5px solid #e0e0e0; border-radius: 10px; padding: 10px 12px; font-size: 13.5px; outline: none; resize: vertical; font-family: inherit; color: #222; }
.report-textarea:focus { border-color: #4fa8d8; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }

.next-owner-list { display: flex; flex-direction: column; gap: 8px; max-height: 240px; overflow-y: auto; margin-bottom: 4px; }
.next-owner-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 2px solid #e8e8e8; border-radius: 10px; cursor: pointer; transition: all 0.15s; }
.next-owner-item:hover { border-color: #4fa8d8; }
.next-owner-item--active { border-color: #4fa8d8; background: #eff6ff; }
.next-owner-name { flex: 1; font-size: 13px; font-weight: 600; color: #111; }
.next-owner-check { display: inline-flex; align-items: center; color: #4fa8d8; }
.inline-icon { width: 1em; height: 1em; flex-shrink: 0; }

.payment-overlay { position: fixed; inset: 0; z-index: 500; background: rgba(0,0,0,0.6); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
.payment-loading-text { color: #fff; font-size: 16px; font-weight: 600; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.22s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-rise-enter-active { transition: all 0.28s cubic-bezier(0.34,1.56,0.64,1); }
.modal-rise-leave-active { transition: all 0.18s ease-in; }
.modal-rise-enter-from { opacity: 0; transform: scale(0.94) translateY(18px); }
.modal-rise-leave-to { opacity: 0; transform: scale(0.96) translateY(8px); }

@media (max-width: 940px) { .body-layout { flex-direction: column; } .side-col { width: 100%; position: static; } }
@media (max-width: 760px) { .meeting-header-card { flex-direction: column; } .meeting-img-wrap { width: 100%; height: 220px; } }
@media (max-width: 600px) {
  .modal-box--attendance { border-radius: 24px 24px 0 0; max-height: 95vh; }
  .modal-backdrop { align-items: flex-end; padding: 0; }
}
@media (max-width: 480px) { .modern-stats-container { grid-template-columns: repeat(2, 1fr); } .meeting-name { font-size: 18px; } }

.toast { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; z-index: 600; box-shadow: 0 4px 16px rgba(0,0,0,0.12); animation: toastFadeIn 0.2s ease; }
.toast--red { background: #dc2626; color: #fff; }
@keyframes toastFadeIn { from { opacity: 0; transform: translateX(-50%) translateY(-8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
</style>