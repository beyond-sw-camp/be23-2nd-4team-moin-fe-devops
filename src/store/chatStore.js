export const OPEN_DM_CHAT = 'open-dm-chat';

/**
 * 특정 유저와의 DM 채팅 팝업을 열도록 이벤트를 발행합니다.
 * @param {number|string} userId  - 대화 상대방의 userId
 * @param {number|string} crewId  - DM을 시작하는 기준 크루 ID
 */
export function requestOpenDmChat(userId, crewId) {
  window.dispatchEvent(new CustomEvent(OPEN_DM_CHAT, { detail: { userId, crewId } }));
}