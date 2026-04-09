import { NextResponse } from 'next/server'
import { firebase } from '../../../config/firebase'
import { fetcheachConvo } from '@/app/lib/fetcheachconvo'
import { env } from 'process'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { event, data } = body
    if (
      event === 'call.inbound_started' ||
      event === 'call.outbound_started' ||
      event === 'call.inbound_ended' ||
      event === 'call.outbound_ended' ||
      event === 'call.recording_available'
    ) {
      console.log(body)
    }
    // const { event, data } = {
    //   event: 'call.recording_available',
    //   data: {
    //     sid: 'CA9ed8f1c13a867c9075a509d70b59173a',
    //     url: '',
    //     status: 'completed',
    //     message: {
    //       id: 623127644,
    //       body: '',
    //       icon: 'icon_inbound_call',
    //       type: 'call',
    //       source: 'call',
    //       status: 'record',
    //       send_at: '',
    //       sent_at: '',
    //       user_id: 0,
    //       automated: false,
    //       failed_at: '',
    //       queued_at: '',
    //       source_id: null,
    //       contact_id: 187817189,
    //       created_at: '2026-04-09 12:46:01',
    //       mms_status: '',
    //       received_at: '2026-04-09 12:46:01',
    //       delivered_at: '',
    //       failed_reason: null,
    //       conversation_id: 100388539,
    //       stop_on_response: false,
    //     },
    //     duration: 632,
    //     is_voicemail: false,
    //   },
    // }
    if (!event) {
      return NextResponse.json({ message: 'Missing event' }, { status: 400 })
    }

    // switch (event) {
    //   case 'message.sent':
    //     await handleOutboundmsg(data)
    //     break

    //   case 'message.received':
    //     await handleInboundmsg(data)
    //     break

    //   case 'call.recording_available':
    //     console.log(data)
    //     if (data.message?.user_id == null || !data.message?.user_id) {
    //       await handleCallIn(data)
    //     } else {
    //       await handleCallOut(data)
    //     }
    //     break

    //   default:
    //     return NextResponse.json({ message: 'Unknown event' }, { status: 400 })
    // }

    return NextResponse.json({ message: 'success' })
  } catch (error) {
    console.error('error', error)
    return NextResponse.json({ message: 'failed' }, { status: 500 })
  }
}
/**
 * OutBound Messages
 */
async function handleOutboundmsg(data: any) {
  const rawId = data?.message?.id
  const id = rawId !== null ? String(rawId).trim() : ''

  if (!id) {
    return NextResponse.json({ message: 'Missing data.id' }, { status: 400 })
  }
  const msgOut = {
    id: id,
    communication_type: 'Message OutBound',
    sender_id: data.message.user_id,
    receiver_id: data.contact.id,
    conversation_id: data.message.conversation_id,
    createdAt: new Date(data.message.created_at),
  }

  await firebase.collection('WebhookSalesmsg').doc(id).set(msgOut, { merge: true })
}
/**
 * Inbound Messages
 */
async function handleInboundmsg(data: any) {
  const rawId = data?.message?.id
  const id = rawId !== null ? String(rawId).trim() : ''

  if (!id) {
    return NextResponse.json({ message: 'Missing data.id' }, { status: 400 })
  }
  const msgIn = {
    id: id,
    communication_type: 'Message InBound',
    sender_id: data.message.contact_id,
    receiver_id: data.contact.owner_id,
    conversation_id: data.message.conversation_id,
    createdAt: new Date(data.message.created_at),
  }

  await firebase.collection('WebhookSalesmsg').doc(id).set(msgIn, { merge: true })
}

/**
 * Call Outbound
 */

async function handleCallOut(data: any) {
  const rawId = data?.message?.id
  const id = rawId !== null ? String(rawId).trim() : ''

  if (!id) {
    return NextResponse.json({ message: 'Missing data.message.id' }, { status: 400 })
  }
  console.log()
  const callOutRecord = {
    id: id,
    communication_type: 'Call OutBound',
    caller_id: data.message.user_id,
    receiver_id: data.message.contact_id,
    conversation_id: data.message.conversation_id,
    createdAt: new Date(data.message.created_at),
  }

  // await firebase.collection('WebhookSalesmsg').doc(id).set(callOutRecord, { merge: true })
}
/**
 * Call Inbound
 */

async function handleCallIn(data: any) {
  const rawId = data?.message?.id
  const id = rawId !== null ? String(rawId).trim() : ''

  if (!id) {
    return NextResponse.json({ message: 'Missing data.message.id' }, { status: 400 })
  }
  const data_id = await fetcheachConvo(data.message.conversation_id)

  if (data_id) {
    const ids = data_id.messages
      .map((m: any) => m.id === data.message.id)
      .filter((id: any) => id !== 0)

    console.log(ids)
    const callInRecord = {
      id: id,
      communication_type: 'Call InBound',
      caller_id: data.message.contact_id,
      receiver_id: ids,
      conversation_id: data.message.conversation_id,
      createdAt: new Date(data.message.created_at),
    }
    console.log(callInRecord)
    // await firebase.collection('WebhookSalesmsg').doc(id).set(callInRecord, { merge: true })
  } else {
    console.log('error')
    return NextResponse.json({ message: 'Missing id in Call InBound' }, { status: 400 })
  }
}
