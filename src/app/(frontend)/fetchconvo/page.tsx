'use client'

import React, { useEffect, useState, useMemo } from 'react'
import moment from 'moment'
import { fetchmembers } from '@/app/lib/fetchmembers'
import { getBatchStats } from '@/app/services/statsServices'

export default function FetchConvo() {
  const [detailsByType, setDetailsByType] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [lastDoc, setLastDoc] = useState<any>(null)
  const [hasMore, setHasMore] = useState(true)
  const [startDate, setStartDate] = useState(moment().subtract(1, 'days').startOf('day').toDate())
  const [endDate, setEndDate] = useState(moment().subtract(1, 'days').endOf('day').toDate())

  /**  FETCH ALL DATA AUTOMATICALLY */
  useEffect(() => {
    loadAllData()
  }, [])

  async function loadAllData() {
    setLoading(true)
    try {
      const res = await fetch('/api/batch-stats')
      const json = await res.json()
      if (json.success) {
        setDetailsByType(json.data)
        console.log('TOTAL LOADED:', json.data.length)
      }
    } catch (err) {
      console.error(' Error loading all data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function handle() {
      const res = await fetch('/api/webhook/message', { method: 'POST' })
      const data = await res.json()
      console.log(data)
    }
  }, [])

  /** FETCH MEMBERS */
  useEffect(() => {
    fetchmembers().then((res) => setMembers(res || []))
  }, [])

  /** MEMBER MAP */
  const memberMap = useMemo(() => {
    return Object.fromEntries(members.map((m) => [m.id, m.full_name]))
  }, [members])

  /** BUILD MEMBER STATS */
  const buildMemberStats = (details: any[]) => {
    const memberStats: Record<number, { messages: number; calls: number }> = {}
    const processedMessageIds = new Set<number>()

    members.forEach((m) => {
      memberStats[m.id] = { messages: 0, calls: 0 }
    })

    let totalMessages = 0
    let totalCalls = 0

    details.forEach((item: any) => {
      const conv = item.details

      if (!conv?.messages) return

      conv.messages.forEach((msg: any) => {
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

  /** MEMOIZED STATS */
  const stats = useMemo(
    () => buildMemberStats(detailsByType),
    [detailsByType, startDate, endDate, members],
  )

  /**  BACKEND SYNC */
  async function syncBatchStats() {
    try {
      setLoading(true)
      console.log('Starting batch sync...')

      const res = await fetch('/api/batch-stats')

      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`)
      }

      const data = await res.json()

      console.log('Sync result:', data)

      if (data?.sample) {
        console.log('Sample:', data.sample)
      }

      alert(`Synced ${data.count || 0} records`)
    } catch (err) {
      console.error('Sync failed:', err)
      alert('Sync failed. Check console.')
    } finally {
      setLoading(false)
    }
  }

  /** UI */
  return (
    <div style={container}>
      <button onClick={syncBatchStats} disabled={loading}>
        {loading ? 'Syncing...' : 'Sync Batch Stats'}
      </button>

      <div style={header}>
        <div style={dateBox}>
          <input
            type="date"
            value={moment(startDate).format('YYYY-MM-DD')}
            onChange={(e) => setStartDate(moment(e.target.value).startOf('day').toDate())}
            style={input}
          />
          <span>→</span>
          <input
            type="date"
            value={moment(endDate).format('YYYY-MM-DD')}
            onChange={(e) => setEndDate(moment(e.target.value).endOf('day').toDate())}
            style={input}
          />
        </div>
      </div>

      <h2>Conversation Stats</h2>

      {loading && <p>Loading all data... ⏳</p>}

      <div style={summaryGrid}>
        <div style={summaryCard}>
          <h4>Total Messages</h4>
          <p style={bigNumber}>{stats.totalMessages}</p>
        </div>
        <div style={summaryCard}>
          <h4>Total Calls</h4>
          <p style={bigNumber}>{stats.totalCalls}</p>
        </div>
        <div style={summaryCard}>
          <h4>Total Members</h4>
          <p style={bigNumber}>{members.length}</p>
        </div>
      </div>

      <div style={card}>
        <h3>Member Performance</h3>

        {Object.entries(stats.memberStats)
          .filter(([, data]) => data.messages > 0 || data.calls > 0)
          .sort((a, b) => b[1].messages - a[1].messages)
          .map(([id, data], index) => (
            <div key={id} style={tableRow}>
              <span>{memberMap[Number(id)] || id}</span>
              <span>{data.messages}</span>
              <span>{data.calls}</span>
            </div>
          ))}
      </div>
    </div>
  )
}

/** STYLES */
const container = { padding: 20, maxWidth: 900, margin: '0 auto', fontFamily: 'sans-serif' }
const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
}
const dateBox = { display: 'flex', gap: 10, alignItems: 'center' }
const input = { padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc' }
const summaryGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 15,
  marginBottom: 20,
}
const summaryCard = {
  padding: 15,
  borderRadius: 10,
  background: '#f5f7fb',
  textAlign: 'center' as const,
}
const bigNumber = { fontSize: 24, fontWeight: 'bold', marginTop: 5 }
const card = {
  padding: 15,
  borderRadius: 10,
  background: '#ffffff',
  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
}
const tableHeader = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr',
  fontWeight: 'bold',
  padding: '10px 0',
  borderBottom: '1px solid #eee',
}
const tableRow = { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 0' }
