<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div class="feed-modal-backdrop" @click.self="handleCancel">
        <Transition name="modal-rise">
          <div class="feed-modal">
            <div v-if="isLoading" class="fmod-loading">
              <div class="fmod-spinner"></div>
            </div>

            <template v-else>
              <div class="fmod-header">
                <span class="fmod-title">게시물 수정</span>
                <button type="button" class="fmod-close" @click="handleCancel" aria-label="닫기">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div class="fmod-author">
                <div class="fmod-author-avatar">
                  <div class="feed-avatar feed-avatar--ph">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z M3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5 c-2.786 0-5.433-.608-7.812-1.7 a.75.75 0 01-.437-.695z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                </div>
                <div class="fmod-author-info">
                  <strong>{{ nickname || '나' }}</strong>
                  <span class="fmod-author-meta">{{ crewName || '크루 피드' }}</span>
                </div>
              </div>

              <div class="fmod-body">
                <textarea
                  ref="contentTextarea"
                  v-model="content"
                  class="fmod-textarea"
                  placeholder="크루원들과 공유하고 싶은 이야기를 작성해보세요..."
                  maxlength="1000"
                  rows="4"
                />
                <p class="fmod-hint">기존 사진 삭제·추가 가능 (최대 10장)</p>

                <!-- 이미지 그리드 -->
                <div v-if="existingImages.length > 0 || newImagePreviews.length > 0" class="fmod-img-wrap">
                  <div class="fmod-img-grid" :class="'fmod-grid-' + Math.min(totalImageCount, 4)">
                    <!-- 기존 이미지 -->
                    <div v-for="(url, index) in existingImages" :key="'ex-' + index" class="fmod-img-item">
                      <img :src="url" alt="기존" />
                      <button type="button" class="fmod-img-remove" @click.stop="removeExistingImage(index)">✕</button>
                    </div>
                    <!-- 새로 추가한 이미지 -->
                    <div v-for="(preview, index) in newImagePreviews" :key="'new-' + index" class="fmod-img-item">
                      <img :src="preview" alt="추가" />
                      <span class="fmod-img-badge">NEW</span>
                      <button type="button" class="fmod-img-remove" @click.stop="removeNewImage(index)">✕</button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="fmod-footer">
                <div class="fmod-tools">
                  <label class="fmod-tool-btn" :class="{ disabled: totalImageCount >= 10 }" title="사진 추가">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="3"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <input type="file" accept="image/*" multiple class="sr-only" @change="handleFileChange" :disabled="totalImageCount >= 10" ref="fileInputRef" />
                  </label>
                </div>
                <div class="fmod-right">
                  <span class="fmod-counter">{{ content.length }}/1000</span>
                  <button
                    type="button"
                    class="fmod-submit"
                    :class="{ active: isContentChanged || isImagesChanged }"
                    :disabled="isSubmitting || (!isContentChanged && !isImagesChanged)"
                    @click="handleSubmitAll"
                  >
                    <span v-if="isSubmitting" class="fmod-btn-spinner"></span>
                    <span v-else>수정 완료</span>
                  </button>
                </div>
              </div>
            </template>
          </div>
        </Transition>
      </div>
    </Transition>

    <Transition name="toast">
      <div v-if="showSuccessMessage" class="fmod-toast fmod-toast--success">{{ successMessage }}</div>
    </Transition>
    <Transition name="toast">
      <div v-if="errorMessage" class="fmod-toast fmod-toast--error">{{ errorMessage }}</div>
    </Transition>

    <div v-if="showCancelModal" class="feed-modal-backdrop fmod-confirm-backdrop" @click.self="showCancelModal = false">
      <div class="fmod-confirm-box">
        <h3 class="fmod-confirm-title">수정을 취소할까요?</h3>
        <p class="fmod-confirm-desc">변경된 내용이 저장되지 않습니다.</p>
        <div class="fmod-confirm-actions">
          <button type="button" class="fmod-confirm-btn fmod-confirm-btn--outline" @click="showCancelModal = false">계속 수정</button>
          <button type="button" class="fmod-confirm-btn fmod-confirm-btn--primary" @click="confirmCancel">취소</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import axios from 'axios'

const API = axios.create({ baseURL: process.env.VUE_APP_API_BASE_URL })
API.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

export default {
  name: 'FeedEditPageComponent',

  props: {
    feedId:   { type: Number, required: true },
    initialImageUrls: { type: Array, default: () => [] },
    crewId:   { type: [Number, String], default: null },
    crewName: { type: String, default: '' },
  },

  emits: ['close', 'submitted'],

  data() {
    return {
      token: '',
      nickname: '',

      originalContent: '',
      originalImages: [],

      content: '',
      existingImages: [],
      newImageFiles: [],
      newImagePreviews: [],

      isLoading: true,
      isSubmitting: false,
      showSuccessMessage: false,
      successMessage: '',
      errorMessage: '',
      showCancelModal: false,
    }
  },

  computed: {
    isContentChanged() {
      return this.content !== this.originalContent
    },
    isImagesChanged() {
      return this.newImageFiles.length > 0 || this.existingImages.length !== this.originalImages.length
    },
    isDirty() {
      return this.isContentChanged || this.isImagesChanged
    },
    totalImageCount() {
      return this.existingImages.length + this.newImageFiles.length
    },
  },

  async created() {
    this.token = localStorage.getItem('token') || ''
    if (this.token) {
      try {
        const payload = JSON.parse(atob(this.token.split('.')[1]))
        this.nickname = payload.nickname ?? ''
      } catch { /* noop */ }
    }

    if (!this.feedId || isNaN(this.feedId)) {
      this.showError('피드 정보를 불러올 수 없습니다.')
      this.isLoading = false
      return
    }
    await this.fetchFeedDetail()
  },

  methods: {
    async fetchFeedDetail() {
      this.isLoading = true
      try {
        const { data } = await API.get(`/feed/${this.feedId}`)
        this.content         = data.content ?? ''
        this.originalContent = data.content ?? ''
        this.nickname        = data.nickname ?? this.nickname

        // 기존 이미지: 목록에서 넘긴 URL이 있으면 우선 사용(동일 출처), 없으면 API 응답 사용
        let imageUrls = []
        if (this.initialImageUrls && this.initialImageUrls.length > 0) {
          imageUrls = [...this.initialImageUrls]
        } else {
          const base = (process.env.VUE_APP_API_BASE_URL || '').replace(/\/$/, '')
          const ensureAbsolute = (url) => {
            if (!url || typeof url !== 'string') return url
            if (/^https?:\/\//i.test(url)) return url
            return base ? base + (url.startsWith('/') ? url : `/${url}`) : url
          }
          const raw = data.imageUrls ?? data.images ?? data.imageUrlList ?? (data.feedImages && data.feedImages.map(x => x.url || x)) ?? []
          const arr = Array.isArray(raw) ? raw : (typeof raw === 'string' ? (() => { try { return JSON.parse(raw) } catch { return [] } })() : [])
          imageUrls = arr.map(u => typeof u === 'string' ? ensureAbsolute(u) : (u && (u.url || u.src)) ? ensureAbsolute(u.url || u.src) : '').filter(Boolean)
        }
        this.existingImages = [...imageUrls]
        this.originalImages = [...imageUrls]
      } catch (err) {
        console.error('[FeedEdit] 피드 조회 실패:', err)
        this.showError('피드 정보를 불러오는 데 실패했습니다.')
      } finally {
        this.isLoading = false
      }
    },

    async handleSubmitAll() {
      if (this.isSubmitting || (!this.isContentChanged && !this.isImagesChanged)) return
      this.isSubmitting = true

      try {
        // 1. 텍스트 변경 시
        if (this.isContentChanged) {
          await API.put('/feed/content/update', {
            feedId:  this.feedId,
            content: this.content.trim()
          })
          this.originalContent = this.content
        }

        // 2. 이미지 변경 시
        if (this.isImagesChanged) {
          const newUploadedUrls = []
          for (const file of this.newImageFiles) {
            const presignedRes = await API.get('/feed/presigned-url', {
              params: { fileName: file.name }
            })
            const presignedUrl = presignedRes.data
            await fetch(presignedUrl, { method: 'PUT', body: file })
            newUploadedUrls.push(presignedUrl.split('?')[0])
          }

          // 남은 기존 이미지 + 새로 업로드한 이미지 합쳐서 전송
          const finalImages = [...this.existingImages, ...newUploadedUrls]
          await API.put(`/feed/images/update/${this.feedId}`, finalImages)

          this.originalImages   = [...finalImages]
          this.existingImages   = [...finalImages]
          this.newImageFiles    = []
          this.newImagePreviews = []
        }

        this.showSuccess('수정이 완료되었습니다.')
        setTimeout(() => {
          this.$emit('submitted') // 부모에게 완료 알림
        }, 1200)

      } catch (err) {
        console.error('[FeedEdit] 수정 실패:', err)
        const status = err.response?.status
        if (status === 401)      this.showError('로그인이 필요합니다.')
        else if (status === 403) this.showError('본인의 피드만 수정할 수 있습니다.')
        else if (status === 413) this.showError('이미지 파일이 너무 큽니다.')
        else                     this.showError('수정에 실패했습니다. 다시 시도해주세요.')
      } finally {
        this.isSubmitting = false
      }
    },

    removeExistingImage(index) {
      this.existingImages.splice(index, 1)
    },

    removeNewImage(index) {
      this.newImageFiles.splice(index, 1)
      this.newImagePreviews.splice(index, 1)
    },

    handleFileChange(e) {
      this.addFiles(Array.from(e.target.files))
      e.target.value = ''
    },

    addFiles(files) {
      const remaining = 10 - this.totalImageCount
      if (remaining <= 0) return
      const toAdd = files.slice(0, remaining)
      if (files.length > remaining) {
        this.showError(`최대 10장까지 가능합니다. ${toAdd.length}장만 추가됩니다.`)
      }
      toAdd.forEach(file => {
        if (!file.type.startsWith('image/')) return
        this.newImageFiles.push(file)
        const reader = new FileReader()
        reader.onload = (e) => this.newImagePreviews.push(e.target.result)
        reader.readAsDataURL(file)
      })
    },

    handleCancel() {
      if (this.isDirty) this.showCancelModal = true
      else this.$emit('close')
    },

    confirmCancel() {
      this.showCancelModal = false
      this.$emit('close')
    },

    showSuccess(msg) {
      this.successMessage = msg
      this.showSuccessMessage = true
      setTimeout(() => { this.showSuccessMessage = false }, 2000)
    },
    showError(msg) {
      this.errorMessage = msg
      setTimeout(() => { this.errorMessage = '' }, 3000)
    },
  },
}
</script>

<style scoped>
.feed-modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(8, 18, 28, 0.58);
  backdrop-filter: blur(7px); -webkit-backdrop-filter: blur(7px);
  display: flex; align-items: center; justify-content: center;
  z-index: 500; padding: 24px;
}
.feed-modal {
  position: relative;
  width: 100%; max-width: 520px;
  background: #fff; border-radius: 22px;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.06), 0 28px 72px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.08);
  display: flex; flex-direction: column;
  overflow: hidden; max-height: 88vh;
}
.fmod-loading { display: flex; align-items: center; justify-content: center; min-height: 200px; }
.fmod-spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #4FA8D8; border-radius: 50%; animation: fmod-spin 0.7s linear infinite; }
@keyframes fmod-spin { to { transform: rotate(360deg); } }
.fmod-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px 12px; border-bottom: 1px solid #f2f2f2; }
.fmod-title { font-size: 15px; font-weight: 700; color: #111; }
.fmod-close { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; border: none; background: #f5f5f5; cursor: pointer; color: #666; }
.fmod-close:hover { background: #eaeaea; }
.fmod-close svg { width: 15px; height: 15px; }
.fmod-author { display: flex; align-items: center; gap: 11px; padding: 14px 20px 4px; }
.fmod-author-avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0; background: #d1d5db; display: flex; align-items: center; justify-content: center; border: 2px solid #e8f4fb; }
.feed-avatar--ph { color: #94a3b8; }
.fmod-author-info strong { display: block; font-size: 14px; font-weight: 700; color: #111; }
.fmod-author-meta { font-size: 12px; color: #94a3b8; }
.fmod-body { flex: 1; overflow-y: auto; padding: 10px 20px 14px; display: flex; flex-direction: column; gap: 10px; min-height: 100px; }
.fmod-textarea { width: 100%; min-height: 88px; max-height: 260px; border: none; outline: none; resize: none; font-size: 15px; line-height: 1.7; color: #111; font-family: inherit; background: transparent; }
.fmod-textarea::placeholder { color: #c4c4c4; }
.fmod-hint { font-size: 12px; color: #94a3b8; margin: 0; }
.fmod-img-wrap { display: flex; flex-direction: column; gap: 8px; }
.fmod-img-grid { display: grid; gap: 5px; border-radius: 12px; overflow: hidden; }
.fmod-grid-1 { grid-template-columns: 1fr; }
.fmod-grid-2 { grid-template-columns: 1fr 1fr; }
.fmod-grid-3 { grid-template-columns: 1fr 1fr 1fr; }
.fmod-grid-4 { grid-template-columns: 1fr 1fr; }
.fmod-img-item { position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; background: #f5f5f5; }
.fmod-img-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
.fmod-img-remove { position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.5); border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; color: #fff; font-size: 12px; line-height: 1; z-index: 2; }
.fmod-img-remove:hover { background: rgba(220,38,38,0.85); }
.fmod-img-badge { position: absolute; top: 5px; left: 5px; background: #4FA8D8; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px; z-index: 1; }
.fmod-footer { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px 14px; border-top: 1px solid #f2f2f2; background: #fafafa; }
.fmod-tools { display: flex; align-items: center; gap: 2px; }
.fmod-tool-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; border: none; background: transparent; cursor: pointer; color: #888; }
.fmod-tool-btn:hover { background: #edf6fc; color: #4fa8d8; }
.fmod-tool-btn.disabled { opacity: 0.3; pointer-events: none; }
.fmod-tool-btn svg { width: 18px; height: 18px; }
.fmod-right { display: flex; align-items: center; gap: 10px; }
.fmod-counter { font-size: 12px; color: #94a3b8; }
.fmod-submit { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 20px; border-radius: 20px; border: none; background: #e2e8ed; color: #aab; font-size: 13.5px; font-weight: 700; cursor: not-allowed; min-width: 90px; }
.fmod-submit.active { background: #4FA8D8; color: #fff; cursor: pointer; }
.fmod-submit.active:hover:not(:disabled) { background: #3a95c4; }
.fmod-submit:disabled { cursor: not-allowed; }
.fmod-btn-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: fmod-spin 0.7s linear infinite; }
.fmod-toast { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 501; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; }
.fmod-toast--success { background: #22c55e; color: #fff; }
.fmod-toast--error { background: #ef4444; color: #fff; }
.fmod-confirm-backdrop { z-index: 510; }
.fmod-confirm-box { background: #fff; border-radius: 16px; padding: 24px; max-width: 320px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
.fmod-confirm-title { font-size: 16px; font-weight: 700; color: #111; margin: 0 0 8px; }
.fmod-confirm-desc { font-size: 14px; color: #64748b; margin: 0 0 20px; }
.fmod-confirm-actions { display: flex; gap: 12px; }
.fmod-confirm-btn { flex: 1; padding: 10px 16px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; }
.fmod-confirm-btn--outline { background: #fff; border: 1.5px solid #e2e8f0; color: #64748b; }
.fmod-confirm-btn--outline:hover { background: #f8fafc; }
.fmod-confirm-btn--primary { background: #0f172a; color: #fff; }
.fmod-confirm-btn--primary:hover { background: #334155; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.22s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-rise-enter-active { transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-rise-leave-active { transition: all 0.18s ease; }
.modal-rise-enter-from { opacity: 0; transform: scale(0.94) translateY(18px); }
.modal-rise-leave-to { opacity: 0; transform: scale(0.96) translateY(8px); }
.toast-enter-active, .toast-leave-active { transition: opacity 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; }
</style>