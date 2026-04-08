import { fetchopen } from './fetchopensales'
import { fetchclosed } from './fetchclosedsales'
import { fetchoutbound } from './fetchoutbound'
import { fetchunread } from './fetchunread'
import { fetchpending } from './fetchpending'

export async function fetchBatchData() {
  const [open, closed, outbound, unread, pending] = await Promise.all([
    fetchopen(),
    fetchclosed(),
    fetchoutbound(),
    fetchunread(),
    fetchpending(),
  ])

  const datasets = {
    open: open?.conversations || [],
    closed: closed?.conversations || [],
    outbound: outbound?.conversations || [],
    unread: unread?.conversations || [],
    pending: pending?.conversations || [],
  }

  let res: any[] = []

  Object.entries(datasets).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const mapped = value.map((item) => ({
        ...item,
        teamenoch_type: key,
      }))
      res.push(...mapped)
    }
  })

  return res
}
