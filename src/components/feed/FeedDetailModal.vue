<template>
  <div v-if="modelValue" class="border-t border-gray-100 bg-white overflow-x-hidden">
    <!-- 로딩 -->
    <div v-if="isLoading" class="flex justify-center py-6">
      <div
        class="w-6 h-6 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin"
      />
    </div>

    <div v-else>
      <!-- 댓글 목록 -->
      <div class="px-4 py-3 space-y-4" @click="commentMenuOpen = null">
        <!-- 댓글 없음 -->
        <div
          v-if="rootComments.length === 0"
          class="text-center py-6 text-sm text-gray-400"
        >
          첫 번째 댓글을 남겨보세요!
        </div>

        <!-- 댓글 아이템 -->
        <div v-for="comment in rootComments" :key="comment.commentId">
          <div class="flex gap-3 items-start">
            <img
              v-if="comment.profileImageUrl"
              :src="comment.profileImageUrl"
              :alt="comment.nickname"
              class="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
            <div
              v-else
              class="feed-avatar feed-avatar--ph"
            >
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

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-sm font-bold text-gray-900 truncate">{{
                    comment.nickname
                  }}</span>
                  <span class="text-xs text-gray-400 flex-shrink-0">{{
                    formatDate(comment.createdTime)
                  }}</span>
                </div>
                <div class="relative flex-shrink-0">
                  <button
                    @click.stop="commentMenuOpen = commentMenuOpen === 'c-' + comment.commentId ? null : 'c-' + comment.commentId"
                    class="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors text-sm leading-none"
                    aria-label="더보기"
                  >⋯</button>
                  <div
                    v-if="commentMenuOpen === 'c-' + comment.commentId"
                    class="comment-menu-dropdown"
                  >
                    <button
                      v-if="comment.isMyComment"
                      @click.stop="commentMenuOpen = null; deletingCommentId = comment.commentId"
                      class="comment-menu-item"
                    ><svg class="fdm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M7 6l1 14h8l1-14"></path><path d="M10 10v6M14 10v6"></path></svg> 댓글 삭제</button>
                    <button
                      v-if="!comment.isMyComment"
                      @click.stop="commentMenuOpen = null; $emit('report', 'COMMENT', comment.commentId)"
                      class="comment-menu-item comment-menu-item--report"
                    ><svg class="fdm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"></path><path d="M12 9v4"></path><circle cx="12" cy="16.5" r="1"></circle></svg> 댓글 신고하기</button>
                  </div>
                </div>
              </div>

              <p class="text-sm text-gray-800 mt-0.5 break-all">
                {{ comment.content }}
              </p>

              <div class="flex items-center gap-3 mt-1">
                <button
                  @click="handleLikeComment(comment)"
                  class="flex items-center gap-1 hover:opacity-70 transition-opacity"
                >
                  <span
                    class="text-xs"
                    :class="comment.isLiked ? 'text-[#FF6B35]' : 'text-gray-400'"
                  >
                    <svg v-if="comment.isLiked" class="fdm-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7-4.4-9.5-8.3C.5 9.7 2 6 5.6 5.2c2-.4 3.9.3 5.1 1.8 1.2-1.5 3.1-2.2 5.1-1.8C19.4 6 21 9.7 19.5 12.7 17 16.6 12 21 12 21z"></path></svg>
                    <svg v-else class="fdm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-4.4-9.5-8.3C.5 9.7 2 6 5.6 5.2c2-.4 3.9.3 5.1 1.8 1.2-1.5 3.1-2.2 5.1-1.8C19.4 6 21 9.7 19.5 12.7 17 16.6 12 21 12 21z"></path></svg>
                  </span>
                  <span
                    v-if="comment.likeCount > 0"
                    class="text-xs text-gray-400"
                    >{{ comment.likeCount }}</span
                  >
                </button>

                <template v-if="getReplies(comment.commentId).length > 0">
                  <button
                    @click="toggleReplies(comment.commentId)"
                    class="text-xs text-gray-400 hover:text-[#4FA8D8] transition-colors"
                  >
                    {{ isRepliesExpanded(comment.commentId) ? '답글 접기' : '답글 보기' }}
                  </button>
                </template>
                <button
                  v-else
                  @click="setReplyTarget(comment)"
                  class="text-xs text-gray-400 hover:text-[#4FA8D8] transition-colors"
                >
                  답글 달기
                </button>
              </div>

              <!-- 대댓글 -->
              <div
                v-if="getReplies(comment.commentId).length > 0 && (isRepliesExpanded(comment.commentId) || replyingTo === comment.commentId)"
                class="mt-3 space-y-3 border-l-2 border-gray-100 pl-3"
              >
                <div
                  v-for="reply in getReplies(comment.commentId)"
                  :key="reply.commentId"
                  class="flex gap-2 items-start"
                >
                  <img
                    v-if="reply.profileImageUrl"
                    :src="reply.profileImageUrl"
                    :alt="reply.nickname"
                    class="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                  <div
                    v-else
                    class="feed-avatar feed-avatar--ph"
                  >
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

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2 min-w-0">
                        <span class="text-sm font-bold text-gray-900 truncate">{{
                          reply.nickname
                        }}</span>
                        <span class="text-xs text-gray-400 flex-shrink-0">{{
                          formatDate(reply.createdTime)
                        }}</span>
                      </div>
                      <div class="relative flex-shrink-0">
                        <button
                          @click.stop="commentMenuOpen = commentMenuOpen === 'r-' + reply.commentId ? null : 'r-' + reply.commentId"
                          class="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors text-sm leading-none"
                          aria-label="더보기"
                        >⋯</button>
                        <div
                          v-if="commentMenuOpen === 'r-' + reply.commentId"
                          class="comment-menu-dropdown"
                        >
                          <button
                            v-if="reply.isMyComment"
                            @click.stop="commentMenuOpen = null; deletingCommentId = reply.commentId"
                            class="comment-menu-item"
                          ><svg class="fdm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M7 6l1 14h8l1-14"></path><path d="M10 10v6M14 10v6"></path></svg> 댓글 삭제</button>
                          <button
                            v-if="!reply.isMyComment"
                            @click.stop="commentMenuOpen = null; $emit('report', 'COMMENT', reply.commentId)"
                            class="comment-menu-item comment-menu-item--report"
                          ><svg class="fdm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"></path><path d="M12 9v4"></path><circle cx="12" cy="16.5" r="1"></circle></svg> 댓글 신고하기</button>
                        </div>
                      </div>
                    </div>

                    <p class="text-sm text-gray-800 mt-0.5 break-all">
                      {{ reply.content }}
                    </p>

                    <div class="flex items-center gap-3 mt-1">
                      <button
                        @click="handleLikeComment(reply)"
                        class="flex items-center gap-1 hover:opacity-70 transition-opacity"
                      >
                        <span
                          class="text-xs"
                          :class="reply.isLiked ? 'text-[#FF6B35]' : 'text-gray-400'"
                        >
                          <svg v-if="reply.isLiked" class="fdm-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7-4.4-9.5-8.3C.5 9.7 2 6 5.6 5.2c2-.4 3.9.3 5.1 1.8 1.2-1.5 3.1-2.2 5.1-1.8C19.4 6 21 9.7 19.5 12.7 17 16.6 12 21 12 21z"></path></svg>
                          <svg v-else class="fdm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-4.4-9.5-8.3C.5 9.7 2 6 5.6 5.2c2-.4 3.9.3 5.1 1.8 1.2-1.5 3.1-2.2 5.1-1.8C19.4 6 21 9.7 19.5 12.7 17 16.6 12 21 12 21z"></path></svg>
                        </span>
                        <span
                          v-if="reply.likeCount > 0"
                          class="text-xs text-gray-400"
                          >{{ reply.likeCount }}</span
                        >
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- /대댓글 -->
            </div>
          </div>
        </div>

        <!-- 더보기 -->
        <div v-if="hasMoreComments" class="flex justify-center pt-1">
          <button
            @click="loadMoreComments"
            :disabled="commentsLoading"
            class="text-sm text-[#4FA8D8] font-medium hover:opacity-70 disabled:opacity-40"
          >
            {{ commentsLoading ? "불러오는 중..." : "댓글 더 보기" }}
          </button>
        </div>
      </div>

      <!-- 답글 대상 표시 -->
      <div
        v-if="replyingTo"
        class="flex items-center justify-between bg-gray-50 px-4 py-2 border-t border-gray-200"
      >
        <span class="text-sm text-gray-600 font-medium">
          ↩ <strong>{{ replyingToNickname }}</strong>에게 답글 작성 중...
        </span>
        <button
          @click="cancelReply"
          class="text-gray-500 text-sm hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <!-- 에러 메시지 -->
      <div
        v-if="errorMessage"
        class="mx-4 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
      >
        {{ errorMessage }}
      </div>

      <!-- 댓글 입력창 -->
      <div class="flex items-center gap-2 px-4 py-3 border-t border-gray-100">
        <img
          v-if="myProfileImageUrl"
          :src="myProfileImageUrl"
          alt="내 프로필"
          class="feed-avatar feed-avatar--input flex-shrink-0"
        />
        <div
          v-else
          class="feed-avatar feed-avatar--ph flex-shrink-0"
        >
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

        <textarea
          ref="inputRef"
          v-model="newComment"
          :placeholder="replyingTo ? `${replyingToNickname}에게 답글...` : '댓글을 입력하세요'"
          maxlength="500"
          rows="2"
          class="comment-textarea flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 resize-none"
          @input="onCommentInput"
          @keydown.enter="onCommentKeydown"
        />

        <button
          @click="handleAddComment"
          :disabled="!newComment.trim() || commentSubmitting"
          class="px-4 py-2 rounded-lg text-sm font-bold transition-colors flex-shrink-0"
          :class="
            newComment.trim() && !commentSubmitting
              ? 'bg-[#4FA8D8] text-white hover:bg-[#3A8FC0]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          "
        >
          <span
            v-if="commentSubmitting"
            class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          />
          <span v-else>게시</span>
        </button>
      </div>
    </div>

    <!-- 댓글 삭제 확인 모달 -->
    <div
      v-if="deletingCommentId"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white p-6 rounded-2xl shadow-lg max-w-xs w-full">
        <h3 class="text-base font-bold text-gray-900 mb-2">
          댓글을 삭제할까요?
        </h3>
        <p class="text-sm text-gray-500 mb-5">
          삭제된 댓글은 복구할 수 없습니다.
        </p>
        <div class="flex gap-3">
          <button
            @click="deletingCommentId = null"
            class="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            취소
          </button>
          <button
            @click="confirmDeleteComment"
            :disabled="deleteCommentLoading"
            class="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50"
          >
            {{ deleteCommentLoading ? "삭제 중..." : "삭제" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import dayjs from "@/plugins/dayjs";

export default {
  name: "FeedDetailModal",

  props: {
    modelValue: { type: Boolean, required: true },
    feedId: { type: [Number, String], default: null },
    myNickname: { type: String, default: "" },
    myProfileImageUrl: { type: String, default: "" },
  },

  emits: ["update:modelValue", "comment-count-changed", "report"],

  data() {
    return {
      token: "",
      comments: [],
      commentPage: 0,
      commentTotalPages: 1,
      hasMoreComments: false,
      isLoading: false,
      commentsLoading: false,
      commentSubmitting: false,
      deleteCommentLoading: false,
      deletingCommentId: null,
      commentMenuOpen: null,
      replyingTo: null,
      replyingToNickname: "",
      newComment: "",
      errorMessage: "",
      repliesExpanded: {},
    };
  },

  computed: {
    rootComments() {
      return this.comments.filter((c) => !c.parentId);
    },
  },

  watch: {
    modelValue(val) {
      if (val && this.feedId) this.resetAndFetch();
      else if (!val) this.reset();
    },
    feedId(val) {
      if (val && this.modelValue) this.resetAndFetch();
    },
  },

  created() {
    this.token = localStorage.getItem("token") || "";
  },

  methods: {
    onCommentInput() {
      this.autoResizeTextarea();
    },

    onCommentKeydown(e) {
      if (e.key !== "Enter") return;
      if (e.shiftKey) return;
      e.preventDefault();
      this.handleAddComment();
    },

    autoResizeTextarea() {
      this.$nextTick(() => {
        const el = this.$refs.inputRef;
        if (!el || el.scrollHeight === 0) return;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 120) + "px";
      });
    },

    reset() {
      this.comments = [];
      this.commentPage = 0;
      this.commentTotalPages = 1;
      this.hasMoreComments = false;
      this.newComment = "";
      this.replyingTo = null;
      this.replyingToNickname = "";
      this.deletingCommentId = null;
      this.commentMenuOpen = null;
      this.errorMessage = "";
      this.repliesExpanded = {};
    },

    resetAndFetch() {
      this.reset();
      this.fetchComments();
    },

    async fetchComments() {
      if (!this.feedId) return;
      this.isLoading = true;
      try {
        const { data } = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/feed/${this.feedId}`,
          { headers: { Authorization: `Bearer ${this.token}` } },
        );
        const commentPage = data.comments ?? {};
        const rawComments = commentPage.content ?? [];
        this.commentTotalPages = commentPage.totalPages ?? 1;
        this.commentPage = 0;
        this.hasMoreComments = this.commentTotalPages > 1;
        this.comments = this.flattenComments(rawComments);
      } catch (err) {
        console.error("[FeedDetailModal] 댓글 로드 실패:", err);
      } finally {
        this.isLoading = false;
      }
    },

    async silentReload() {
      if (!this.feedId) return;
      try {
        const { data } = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/feed/${this.feedId}`,
          { headers: { Authorization: `Bearer ${this.token}` } },
        );
        const commentPage = data.comments ?? {};
        const rawComments = commentPage.content ?? [];
        this.commentTotalPages = commentPage.totalPages ?? 1;
        this.commentPage = 0;
        this.hasMoreComments = this.commentTotalPages > 1;
        this.comments = this.flattenComments(rawComments);
      } catch (err) {
        console.error("[silentReload] 실패:", err);
      }
    },

    async loadMoreComments() {
      if (this.commentsLoading || !this.hasMoreComments) return;
      const nextPage = this.commentPage + 1;
      this.commentsLoading = true;
      try {
        const { data } = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/feed/${this.feedId}`,
          {
            params: { page: nextPage },
            headers: { Authorization: `Bearer ${this.token}` },
          },
        );
        const commentPage = data.comments ?? {};
        const rawComments = commentPage.content ?? [];
        const newComments = this.flattenComments(rawComments);
        const existingIds = new Set(this.comments.map((c) => c.commentId));
        this.comments = [
          ...this.comments,
          ...newComments.filter((c) => !existingIds.has(c.commentId)),
        ];
        this.commentPage = nextPage;
        this.hasMoreComments = nextPage + 1 < (commentPage.totalPages ?? 1);
      } catch (err) {
        console.error("[FeedDetailModal] 댓글 더보기 실패:", err);
      } finally {
        this.commentsLoading = false;
      }
    },

    flattenComments(rawList) {
      const result = [];
      const pushOne = (c, parentId) => {
        result.push({
          commentId: c.commentId,
          content: c.content,
          nickname: c.nickname,
          profileImageUrl: c.profileImageUrl ?? null,
          createdTime: c.createdTime ?? null,
          likeCount: c.likeCount ?? 0,
          isLiked: c.isLiked ?? c.liked ?? false,
          parentId: parentId ?? c.parentId ?? null,
          isMyComment: c.isMyComment ?? false,
        });
        const replies = Array.isArray(c.replies)
          ? c.replies
          : c.reply
          ? [c.reply]
          : [];
        replies.forEach((r) => pushOne(r, c.commentId));
      };
      (Array.isArray(rawList) ? rawList : []).forEach((c) => pushOne(c, null));
      return result;
    },

    getReplies(commentId) {
      return this.comments.filter((c) => c.parentId === commentId);
    },

    async handleLikeComment(comment) {
      if (!this.token) {
        this.$router.push("/login");
        return;
      }

      const prev = { isLiked: comment.isLiked, likeCount: comment.likeCount };
      comment.isLiked = !prev.isLiked;
      comment.likeCount = prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1;

      try {
        if (prev.isLiked) {
          await axios.delete(
            `${process.env.VUE_APP_API_BASE_URL}/comment/${comment.commentId}/like`,
            { headers: { Authorization: `Bearer ${this.token}` } }
          );
        } else {
          await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/comment/${comment.commentId}/like`,
            null,
            { headers: { Authorization: `Bearer ${this.token}` } }
          );
        }
      } catch {
        comment.isLiked = prev.isLiked;
        comment.likeCount = prev.likeCount;
      }
    },

    isRepliesExpanded(commentId) {
      return !!this.repliesExpanded[commentId];
    },

    toggleReplies(commentId) {
      this.repliesExpanded = {
        ...this.repliesExpanded,
        [commentId]: !this.repliesExpanded[commentId],
      };
    },

    setReplyTarget(comment) {
      const changed = this.replyingTo !== comment.commentId;

      this.replyingTo = comment.commentId;
      this.replyingToNickname = comment.nickname;
      this.repliesExpanded = { ...this.repliesExpanded, [comment.commentId]: true };

      if (changed) this.newComment = "";

      this.$nextTick(() => {
        const el = this.$refs.inputRef;
        if (!el) return;
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        this.autoResizeTextarea();
      });
    },

    cancelReply() {
      this.replyingTo = null;
      this.replyingToNickname = "";
    },

    async handleAddComment() {
      const content = this.newComment.trim();
      if (!content || this.commentSubmitting) return;

      this.commentSubmitting = true;
      const parentId = this.replyingTo ?? null;

      try {
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/comment/create`,
          { feedId: this.feedId, content, parentId },
          { headers: { Authorization: `Bearer ${this.token}` } },
        );

        this.newComment = "";
        this.cancelReply();
        this.$nextTick(() => this.autoResizeTextarea());

        await this.silentReload();

        this.$emit("comment-count-changed", {
          feedId: this.feedId,
          count: this.comments.length,
        });
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) this.showError("로그인이 필요합니다.");
        else if (status === 403) this.showError("댓글 작성 권한이 없습니다.");
        else this.showError("댓글 작성에 실패했습니다.");
      } finally {
        this.commentSubmitting = false;
      }
    },

    async confirmDeleteComment() {
      if (this.deleteCommentLoading) return;
      this.deleteCommentLoading = true;
      try {
        await axios.delete(
          `${process.env.VUE_APP_API_BASE_URL}/comment/delete/${this.deletingCommentId}`,
          { headers: { Authorization: `Bearer ${this.token}` } },
        );
        const id = this.deletingCommentId;
        this.comments = this.comments.filter(
          (c) => c.commentId !== id && c.parentId !== id,
        );
        this.deletingCommentId = null;
        this.$emit("comment-count-changed", {
          feedId: this.feedId,
          count: this.comments.length,
        });
      } catch (err) {
        console.error("[댓글 삭제 실패]", err.response?.status, err.response?.data);
        this.showError("댓글 삭제에 실패했습니다.");
        this.deletingCommentId = null;
      } finally {
        this.deleteCommentLoading = false;
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return "";
      const diff = dayjs().valueOf() - dayjs.utc(dateStr).valueOf();
      const m = Math.floor(diff / 60000);
      if (m < 1) return "방금 전";
      if (m < 60) return `${m}분 전`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h}시간 전`;
      const d = Math.floor(h / 24);
      if (d < 7) return `${d}일 전`;
      return dayjs.utc(dateStr).tz("Asia/Seoul").format("YYYY. M. D.");
    },

    // formatDate(dateStr) {
    //   if (!dateStr) return "";
    //   const diff = Date.now() - new Date(dateStr).getTime();
    //   const m = Math.floor(diff / 60000);
    //   if (m < 1) return "방금 전";
    //   if (m < 60) return `${m}분 전`;
    //   const h = Math.floor(m / 60);
    //   if (h < 24) return `${h}시간 전`;
    //   const d = Math.floor(h / 24);
    //   if (d < 7) return `${d}일 전`;
    //   return new Date(dateStr).toLocaleDateString("ko-KR");
    // },

    showError(msg) {
      this.errorMessage = msg;
      setTimeout(() => {
        this.errorMessage = "";
      }, 3000);
    },
  },
};
</script>

<style scoped>
.comment-menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 140px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  z-index: 20;
  overflow: hidden;
}
.comment-menu-item {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 10px 14px;
  text-align: left;
  font-size: 13px;
  color: #374151;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}
.comment-menu-item:hover {
  background: #f3f4f6;
}
.comment-menu-item--report {
  color: #dc2626;
}
.comment-menu-item--report:hover {
  background: #fef2f2;
}
.fdm-icon {
  width: 1em;
  height: 1em;
  flex-shrink: 0;
}
.fdm-icon--avatar {
  width: 14px;
  height: 14px;
  color: #6b7280;
}
.feed-avatar--input {
  display: block;
  object-fit: cover;
}
.comment-textarea {
  min-height: 2.5rem;
  line-height: 1.4;
  vertical-align: middle;
}
</style>
