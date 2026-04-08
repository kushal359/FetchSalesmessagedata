import { NextResponse } from 'next/server'
import { firebase } from '../../../config/firebase'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { event, data } = body

    const res = await firebase
      .collection('CollectionSalesID')
      .doc(data?.id)
      .set(data, { merge: true })
    return NextResponse.json({ message: 'sucess' })
  } catch (error) {
    console.error('error', error)
    return NextResponse.json({ message: 'failed' }, { status: 500 })
  }
}
