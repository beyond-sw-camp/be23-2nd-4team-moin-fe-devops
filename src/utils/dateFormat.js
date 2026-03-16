// src/utils/dateFormat.js
import dayjs from '@/plugins/dayjs'

// 날짜 + 시간
export const toKST = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '-'
  return dayjs.utc(date).tz('Asia/Seoul').format(format)
}

// 날짜만
export const toKSTDate = (date) => toKST(date, 'YYYY-MM-DD')

// 시간만
export const toKSTTime = (date) => toKST(date, 'HH:mm')

// 날짜 + 시간 (초 제외)
export const toKSTDateTime = (date) => toKST(date, 'YYYY-MM-DD HH:mm')

// 채팅용 (오늘이면 시간만, 아니면 날짜만)
export const toKSTChat = (date) => {
  if (!date) return ''
  const d = dayjs.utc(date).tz('Asia/Seoul')
  const isToday = d.isSame(dayjs().tz('Asia/Seoul'), 'day')
  return isToday ? d.format('HH:mm') : d.format('MM/DD HH:mm')
}