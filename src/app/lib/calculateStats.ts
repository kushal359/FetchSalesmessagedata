import moment from 'moment'
import { fetchopen } from './fetchopensales'
import { fetchclosed } from './fetchclosedsales'
import { fetchoutbound } from './fetchoutbound'
import { fetchunread } from './fetchunread'
import { fetchpending } from './fetchpending'
import { fetcheachConvo } from './fetcheachconvo'
import { fetchmembers } from './fetchmembers'

export async function calculateStats(startDate: Date, endDate: Date) {
  const members = await fetchmembers()

  const memberStats: Record<number, { messages: number; calls: number }> = {}
  members.forEach((m: any) => {
    memberStats[m.id] = { messages: 0, calls: 0 }
  })

  const [open, closed, outbound, unread, pending] = await Promise.all([
    fetchopen(),
    fetchclosed(),
    fetchoutbound(),
    fetchunread(),
    fetchpending(),
  ])

  const datasets = [
    ...(open?.conversations || []),
    ...(closed?.conversations || []),
    ...(outbound?.conversations || []),
    ...(unread?.conversations || []),
    ...(pending?.conversations || []),
  ]

  const seen = new Set()
  const unique = datasets.filter((c: any) => {
    if (!c?.id || seen.has(c.id)) return false
    seen.add(c.id)
    return true
  })

  const details = await Promise.all(unique.map((c: any) => fetcheachConvo(c.id)))

  let totalMessages = 0
  let totalCalls = 0
  const processedMessageIds = new Set<number>()

  details.forEach((conv: any) => {
    conv?.messages?.forEach((msg: any) => {
      if (!msg?.created_at || !msg?.user_id) return
      const d = new Date(msg.created_at)
      if (!moment(d).isBetween(startDate, endDate, undefined, '[]')) return
      const userId = msg.user_id
      if (!memberStats[userId]) return

      if (msg.type === 'sms' && !processedMessageIds.has(msg.id)) {
        memberStats[userId].messages++
        totalMessages++
        processedMessageIds.add(msg.id)
      }

      if (msg.type === 'call' && msg.status === 'record' && msg.source === 'call') {
        memberStats[userId].calls++
        totalCalls++
      }
    })
  })

  return { memberStats, totalMessages, totalCalls }
}
