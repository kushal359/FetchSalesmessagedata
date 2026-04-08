// app/api/batch-stats/route.ts
import { NextResponse } from 'next/server'
import { firebase } from '../../config/firebase'

export async function GET() {
  try {
    const collection = firebase.collection('CollectionSalesID')
    let allDocs: any[] = []
    let snapshot = await collection.orderBy('uploadedAt', 'desc').limit(500).get()
    let lastDoc = snapshot.docs[snapshot.docs.length - 1]

    allDocs.push(...snapshot.docs.map((doc) => ({ docId: doc.id, ...doc.data() })))

    while (snapshot.docs.length === 500) {
      snapshot = await collection.orderBy('uploadedAt', 'desc').startAfter(lastDoc).limit(500).get()
      if (snapshot.empty) break
      lastDoc = snapshot.docs[snapshot.docs.length - 1]
      allDocs.push(...snapshot.docs.map((doc) => ({ docId: doc.id, ...doc.data() })))
    }

    return NextResponse.json({ success: true, data: allDocs })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ success: false, error: 'Failed to fetch batches' }, { status: 500 })
  }
}
