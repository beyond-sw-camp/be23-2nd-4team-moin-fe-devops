<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="feed-modal-backdrop" @click.self="handleClose">
        <Transition name="modal-rise">
          <div v-if="modelValue" class="feed-modal">

            <div class="fmod-header">
              <span class="fmod-title">새 게시물 작성</span>
              <button class="fmod-close" @click="handleClose">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="fmod-author">
              <div class="fmod-author-avatar">
                <img v-if="myProfileImage" :src="myProfileImage" />
                <div v-else class="feed-avatar feed-avatar--ph">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
  <path
    fill-rule="evenodd"
    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z
       M3.751 20.105a8.25 8.25 0 0116.498 0
       .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5
       c-2.786 0-5.433-.608-7.812-1.7
       a.75.75 0 01-.437-.695z"
    clip-rule="evenodd"
  />
</svg>
                </div>
              </div>
              <div class="fmod-author-info">
                <strong>{{ myNickname || '나' }}</strong>
              </div>
            </div>

            <div class="fmod-body">
              <textarea
                ref="feedTextarea"
                v-model="feedContent"
                class="fmod-textarea"
                :placeholder="feedPlaceholder"
                @input="feedAutoResize"
                maxlength="1000"
              />

              <div v-if="feedImagePreviews.length" class="fmod-img-wrap">
                <div
                  class="fmod-img-grid"
                  :class="imagePreviewExpanded ? 'fmod-grid-expanded' : `fmod-grid-${Math.min(feedImagePreviews.length, 4)}`"
                >
                  <div
                    v-for="(img, i) in (imagePreviewExpanded ? feedImagePreviews : feedImagePreviews.slice(0, 4))"
                    :key="i"
                    class="fmod-img-item"
                  >
                    <img :src="img.url" />
                    <button class="fmod-img-remove" @click.stop="removeFeedImage(i)">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                    <div
                      v-if="!imagePreviewExpanded && i === 3 && feedImagePreviews.length > 4"
                      class="fmod-img-more"
                      role="button"
                      tabindex="0"
                      @click="imagePreviewExpanded = true"
                      @keydown.enter.prevent="imagePreviewExpanded = true"
                    >+{{ feedImagePreviews.length - 4 }}</div>
                  </div>
                </div>
                <button
                  v-if="imagePreviewExpanded && feedImagePreviews.length > 4"
                  type="button"
                  class="fmod-img-collapse"
                  @click="imagePreviewExpanded = false"
                >사진 접기</button>
              </div>

              <div v-if="feedHashtags.length" class="fmod-tags">
                <span v-for="(tag, i) in feedHashtags" :key="i" class="fmod-tag">
                  #{{ tag }}<button @click="removeFeedHashtag(i)">×</button>
                </span>
              </div>

              <div v-if="showFeedHashtagInput" class="fmod-tag-input-row">
                <span class="fmod-tag-hash">#</span>
                <input
                  ref="feedHashtagInput"
                  v-model="feedHashtagDraft"
                  class="fmod-tag-input"
                  placeholder="태그 입력 후 Enter"
                  @keydown.enter.prevent="addFeedHashtag"
                  @keydown.escape="showFeedHashtagInput = false"
                  @blur="addFeedHashtag"
                  maxlength="20"
                />
              </div>
            </div>

            <div class="fmod-footer">
              <div class="fmod-tools">
                <label class="fmod-tool-btn" :class="{ disabled: feedImagePreviews.length >= 10 }" title="사진">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <input type="file" accept="image/*" multiple class="sr-only" @change="handleFeedImageUpload" :disabled="feedImagePreviews.length >= 10" />
                </label>
                <button class="fmod-tool-btn" :class="{ active: showFeedHashtagInput }" title="해시태그" @click="toggleFeedHashtag">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="4" y1="9" x2="20" y2="9"/>
                    <line x1="4" y1="15" x2="20" y2="15"/>
                    <line x1="10" y1="3" x2="8" y2="21"/>
                    <line x1="16" y1="3" x2="14" y2="21"/>
                  </svg>
                </button>
                <div class="fmod-tool-btn fmod-emoji-wrap" ref="feedEmojiWrap" @click.stop="showFeedEmojiPicker = !showFeedEmojiPicker">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 13s1.5 2 4 2 4-2 4-2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                  <div v-if="showFeedEmojiPicker" class="fmod-emoji-picker">
                    <span v-for="e in feedEmojiList" :key="e" class="fmod-emoji" @click.stop="insertFeedEmoji(e)">{{ e }}</span>
                  </div>
                </div>
              </div>
              <div class="fmod-right">
                <span class="fmod-counter" :class="{ warn: feedContent.length > 900 }">{{ feedContent.length }}/1000</span>
                <button
                  class="fmod-submit"
                  :class="{ active: feedCanSubmit }"
                  :disabled="!feedCanSubmit || isFeedSubmitting"
                  @click="handleFeedSubmit"
                >
                  <span v-if="isFeedSubmitting" class="fmod-spinner"></span>
                  <span v-else>게시하기</span>
                </button>
              </div>
            </div>

            <!-- 사진 개수 제한 안내 모달 -->
            <div v-if="showImageLimitModal" class="fmod-alert-overlay" @click.self="showImageLimitModal = false">
              <div class="fmod-alert-box">
                <p class="fmod-alert-msg">사진은 최대 10개까지 업로드 가능합니다.</p>
                <button type="button" class="fmod-alert-btn" @click="showImageLimitModal = false">확인</button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import axios from 'axios'
import { nextTick } from 'vue'

const API = axios.create({ baseURL: process.env.VUE_APP_API_BASE_URL })

const FEED_PLACEHOLDERS = [
  '오늘 운동 어땠나요? 크루원들에게 자랑해봐요 ',
  '이번 주 인상 깊었던 순간을 공유해봐요 ',
  '크루원들에게 하고 싶은 말이 있나요? ',
  '오늘의 기록을 남겨보세요 ',
  '함께해서 더 즐거운 활동 이야기를 들려주세요 ✨',
]

const FEED_EMOJIS = [
  '😄','😎','🔥','💪','🏃','⭐','👏','🎉','❤️','👍',
  '🌟','😊','🤩','💯','🚀','✨','🌈','🎯','🏆','🙌',
]

export default {
  name: 'FeedCreatePageComponent',

  props: {
    modelValue:     { type: Boolean, default: false },
    crewId:         { type: Number, required: true },
    myNickname:     { type: String, default: '' },
    myProfileImage: { type: String, default: null },
    token:          { type: String, default: '' },
  },

  emits: ['update:modelValue', 'submitted', 'error'],

  data() {
    return {
      feedContent: '',
      feedImagePreviews: [],  // [{ url, file }]
      feedHashtags: [],
      feedHashtagDraft: '',
      showFeedHashtagInput: false,
      showFeedEmojiPicker: false,
      showImageLimitModal: false,
      imagePreviewExpanded: false,
      isFeedSubmitting: false,
      feedPlaceholder: FEED_PLACEHOLDERS[0],
      feedEmojiList: FEED_EMOJIS,
    }
  },

  computed: {
    feedCanSubmit() {
      return (
        (this.feedContent.trim().length > 0 || this.feedImagePreviews.length > 0) &&
        !this.isFeedSubmitting
      )
    },
  },

  watch: {
    modelValue(val) {
      if (val) {
        this.feedPlaceholder = FEED_PLACEHOLDERS[Math.floor(Math.random() * FEED_PLACEHOLDERS.length)]
        nextTick(() => this.$refs.feedTextarea?.focus())
      }
    },
  },

  mounted() {
    this.outsideClickHandler = (e) => {
      if (this.$refs.feedEmojiWrap && !this.$refs.feedEmojiWrap.contains(e.target)) {
        this.showFeedEmojiPicker = false
      }
    }
    document.addEventListener('click', this.outsideClickHandler)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.outsideClickHandler)
    this.feedImagePreviews.forEach((p) => URL.revokeObjectURL(p.url))
  },

  methods: {
    handleClose() {
      if (this.feedContent.trim() || this.feedImagePreviews.length) {
        if (!confirm('작성 중인 내용이 있어요. 정말 닫으시겠어요?')) return
      }
      this.resetEditor()
      this.$emit('update:modelValue', false)
    },

    resetEditor() {
      this.feedContent = ''
      this.feedImagePreviews.forEach((p) => URL.revokeObjectURL(p.url))
      this.feedImagePreviews = []
      this.feedHashtags = []
      this.feedHashtagDraft = ''
      this.showFeedHashtagInput = false
      this.showFeedEmojiPicker = false
      this.showImageLimitModal = false
      this.imagePreviewExpanded = false
    },

    feedAutoResize() {
      const el = this.$refs.feedTextarea
      if (!el) return
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 320) + 'px'
    },

    // 이미지 선택 시 미리보기만 저장 — S3 업로드는 제출 시
    handleFeedImageUpload(e) {
      const files = Array.from(e.target.files || [])
      const remaining = 10 - this.feedImagePreviews.length
      if (remaining <= 0) {
        this.showImageLimitModal = true
        e.target.value = ''
        return
      }
      if (files.length > remaining) {
        this.showImageLimitModal = true
        files.slice(0, remaining).forEach((file) => {
          const url = URL.createObjectURL(file)
          this.feedImagePreviews.push({ url, file })
        })
      } else {
        files.forEach((file) => {
          const url = URL.createObjectURL(file)
          this.feedImagePreviews.push({ url, file })
        })
      }
      e.target.value = ''
    },

    removeFeedImage(i) {
      URL.revokeObjectURL(this.feedImagePreviews[i].url)
      this.feedImagePreviews.splice(i, 1)
    },

    toggleFeedHashtag() {
      this.showFeedHashtagInput = !this.showFeedHashtagInput
      if (this.showFeedHashtagInput) {
        nextTick(() => this.$refs.feedHashtagInput?.focus())
      }
    },

    addFeedHashtag() {
      const tag = this.feedHashtagDraft.trim().replace(/^#/, '').replace(/\s+/g, '_')
      if (tag && !this.feedHashtags.includes(tag) && this.feedHashtags.length < 10) {
        this.feedHashtags.push(tag)
      }
      this.feedHashtagDraft = ''
      this.showFeedHashtagInput = false
    },

    removeFeedHashtag(i) {
      this.feedHashtags.splice(i, 1)
    },

    insertFeedEmoji(e) {
      this.feedContent += e
      this.showFeedEmojiPicker = false
      nextTick(() => this.$refs.feedTextarea?.focus())
    },

    async handleFeedSubmit() {
      if (!this.feedCanSubmit) return
      this.isFeedSubmitting = true

      try {
        // 1. 이미지 파일들을 순차적으로 presigned URL → S3 업로드 (fetch 사용)
        const imageUrls = []
        for (const { file } of this.feedImagePreviews) {
          const presignedRes = await API.get('/feed/presigned-url', {
            params: { fileName: file.name },
            headers: { Authorization: `Bearer ${this.token}` }
          })
          const presignedUrl = presignedRes.data

          await fetch(presignedUrl, {
            method: 'PUT',
            body: file
          })

          // 쿼리스트링 제거한 순수 URL
          imageUrls.push(presignedUrl.split('?')[0])
        }

        // 2. 해시태그 content에 포함
        const tagSuffix = this.feedHashtags.length
          ? '\n' + this.feedHashtags.map((t) => `#${t}`).join(' ')
          : ''

        // 3. JSON DTO 전송
        const dto = {
          crewId:  this.crewId,
          content: this.feedContent.trim() + tagSuffix,
          images:  imageUrls   // List<String> — S3 URL 배열
        }

        await API.post('/feed/create', dto, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          }
        })

        this.resetEditor()
        this.$emit('update:modelValue', false)
        this.$emit('submitted')
      } catch (e) {
        this.$emit('error', '게시물 등록에 실패했습니다.')
      } finally {
        this.isFeedSubmitting = false
      }
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
.fmod-alert-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 30; padding: 20px;
}
.fmod-alert-box {
  background: #fff; border-radius: 14px;
  padding: 22px 24px; max-width: 320px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
}
.fmod-alert-msg { margin: 0 0 16px; font-size: 15px; color: #333; line-height: 1.5; text-align: center; }
.fmod-alert-btn {
  display: block; width: 100%;
  padding: 10px 16px; border: none; border-radius: 10px;
  background: #4fa8d8; color: #fff; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: background 0.2s;
}
.fmod-alert-btn:hover { background: #3a95c4; }
.fmod-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px 12px; border-bottom: 1px solid #f2f2f2; }
.fmod-title { font-size: 15px; font-weight: 700; color: #111; letter-spacing: -0.3px; }
.fmod-close { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; border: none; background: #f5f5f5; cursor: pointer; color: #666; transition: background 0.15s; }
.fmod-close:hover { background: #eaeaea; }
.fmod-close svg { width: 15px; height: 15px; }
.fmod-author { display: flex; align-items: center; gap: 11px; padding: 14px 20px 4px; }
.fmod-author-avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0; background: #d1d5db; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 15px; }
.fmod-avatar-icon { width: 18px; height: 18px; }
.fmod-author-info strong { display: block; font-size: 14px; font-weight: 700; color: #111; margin-bottom: 3px; }
.fmod-body { flex: 1; overflow-y: auto; padding: 10px 20px 14px; display: flex; flex-direction: column; gap: 10px; min-height: 110px; }
.fmod-textarea { width: 100%; min-height: 88px; max-height: 300px; border: none; outline: none; resize: none; font-size: 15px; line-height: 1.7; color: #111; font-family: inherit; background: transparent; }
.fmod-textarea::placeholder { color: #c4c4c4; }
.fmod-img-wrap { display: flex; flex-direction: column; gap: 8px; }
.fmod-img-grid { display: grid; gap: 5px; border-radius: 12px; overflow: hidden; }
.fmod-grid-1 { grid-template-columns: 1fr; }
.fmod-grid-2 { grid-template-columns: 1fr 1fr; }
.fmod-grid-3 { grid-template-columns: 1fr 1fr 1fr; }
.fmod-grid-4 { grid-template-columns: 1fr 1fr; }
.fmod-grid-expanded { grid-template-columns: repeat(4, 1fr); max-height: 280px; overflow-y: auto; }
.fmod-img-item { position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; background: #f5f5f5; }
.fmod-img-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
.fmod-img-remove { position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.5); border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; color: #fff; display: flex; align-items: center; justify-content: center; z-index: 2; }
.fmod-img-remove:hover { background: rgba(220,38,38,0.85); }
.fmod-img-remove svg { width: 12px; height: 12px; }
.fmod-img-more {
  position: absolute; inset: 0; background: rgba(0,0,0,0.5); color: #fff;
  display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800;
  cursor: pointer; z-index: 1;
}
.fmod-img-more:hover { background: rgba(0,0,0,0.6); }
.fmod-img-collapse {
  align-self: flex-start;
  padding: 6px 12px; border: 1px solid #e5e7eb; border-radius: 8px;
  background: #f9fafb; color: #6b7280; font-size: 13px; cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.fmod-img-collapse:hover { background: #f3f4f6; color: #374151; }
.fmod-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.fmod-tag { display: inline-flex; align-items: center; gap: 4px; background: #e8f4fb; color: #4fa8d8; border-radius: 20px; padding: 4px 10px; font-size: 12px; font-weight: 600; }
.fmod-tag button { background: none; border: none; color: #4fa8d8; cursor: pointer; font-size: 14px; line-height: 1; opacity: 0.6; padding: 0; }
.fmod-tag button:hover { opacity: 1; }
.fmod-tag-input-row { display: flex; align-items: center; gap: 4px; background: #f6f9fb; border: 1.5px solid #4fa8d8; border-radius: 10px; padding: 7px 12px; }
.fmod-tag-hash { font-size: 15px; font-weight: 700; color: #4fa8d8; }
.fmod-tag-input { flex: 1; border: none; outline: none; background: transparent; font-size: 14px; color: #222; font-family: inherit; }
.fmod-footer { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px 14px; border-top: 1px solid #f2f2f2; background: #fafafa; }
.fmod-tools { display: flex; align-items: center; gap: 2px; }
.fmod-tool-btn { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; border: none; background: transparent; cursor: pointer; color: #888; transition: all 0.15s; position: relative; }
.fmod-tool-btn svg { width: 18px; height: 18px; }
.fmod-tool-btn:hover { background: #edf6fc; color: #4fa8d8; }
.fmod-tool-btn.active { color: #4fa8d8; background: #e0f0fa; }
.fmod-tool-btn.disabled { opacity: 0.3; pointer-events: none; }
.fmod-emoji-wrap { cursor: pointer; }
.fmod-emoji-picker { position: absolute; bottom: calc(100% + 8px); left: 0; background: #fff; border: 1px solid #e8e8e8; border-radius: 14px; box-shadow: 0 10px 36px rgba(0,0,0,0.13); padding: 8px; display: grid; grid-template-columns: repeat(5, 1fr); gap: 2px; z-index: 10; width: 192px; }
.fmod-emoji { font-size: 20px; cursor: pointer; text-align: center; padding: 4px; border-radius: 6px; line-height: 1; }
.fmod-emoji:hover { background: #f0f0f0; }
.fmod-right { display: flex; align-items: center; gap: 10px; }
.fmod-counter { font-size: 12px; color: #ccc; font-weight: 500; }
.fmod-counter.warn { color: #f59e0b; }
.fmod-submit { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 20px; border-radius: 20px; border: none; background: #e2e8ed; color: #aab; font-size: 13.5px; font-weight: 700; cursor: not-allowed; transition: all 0.2s; font-family: inherit; min-width: 86px; }
.fmod-submit.active { background: #4fa8d8; color: #fff; cursor: pointer; box-shadow: 0 3px 12px rgba(79,168,216,0.28); }
.fmod-submit.active:hover { background: #3a95c4; transform: translateY(-1px); box-shadow: 0 5px 16px rgba(79,168,216,0.38); }
.fmod-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.22s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-rise-enter-active { transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-rise-leave-active { transition: all 0.18s ease-in; }
.modal-rise-enter-from { opacity: 0; transform: scale(0.94) translateY(18px); }
.modal-rise-leave-to { opacity: 0; transform: scale(0.96) translateY(8px); }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
@media (max-width: 600px) {
  .feed-modal { border-radius: 20px 20px 0 0; max-height: 95vh; }
  .feed-modal-backdrop { align-items: flex-end; padding: 0; }
  .modal-rise-enter-from { transform: translateY(40px); }
}
</style>