import React, { useEffect, useState, useMemo } from 'react'
import { fetchopen } from './fetchopensales'
import { fetchclosed } from './fetchclosedsales'
import { fetchoutbound } from './fetchoutbound'
import { fetchunread } from './fetchunread'
import { fetchpending } from './fetchpending'

export default function Fetchbatch() {
  const [datasets, setDatasets] = useState<any>({})
  const [newdb, setNewdb] = useState<any>([])

  /** FETCH LISTS */
  useEffect(() => {
    const load = async () => {
      const [open, closed, outbound, unread, pending] = await Promise.all([
        fetchopen(),
        fetchclosed(),
        fetchoutbound(),
        fetchunread(),
        fetchpending(),
      ])

      setDatasets({
        open: open?.conversations || [],
        closed: closed?.conversations || [],
        outbound: outbound?.conversations || [],
        unread: unread?.conversations || [],
        pending: pending?.conversations || [],
      })
    }
    load()
  }, [])

  /**
   * add fetch type in corresponding object and combining all data into one array
   */

  useEffect(() => {
    let res: any[] = []
    Object.entries(datasets).forEach((item) => {
      const first = item[0]

      if (Array.isArray(item[1])) {
        const consa = item[1].map((ss) => {
          return { ...ss, teamenoch_type: first }
        })
        res.push(...consa)
      }
    })
    setNewdb(res)
  }, [datasets])

  return newdb
}
