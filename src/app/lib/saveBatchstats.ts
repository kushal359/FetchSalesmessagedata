import { firebase } from '../config/firebase'

export async function saveBatchStats(data: any[]) {
  if (!Array.isArray(data)) {
    throw new Error('Invalid data format')
  }

  if (data.length > 0) {
    const chunkSize = 200

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize)

      const batch = firebase.batch()

      chunk.forEach((item: any, index: number) => {
        const rawId = item?.id
        const id = rawId != null ? String(rawId).trim() : ''

        if (id === '') {
          console.warn(`Index ${index} has a missing or empty ID:`, item)
          return
        }

        console.log(`Processing index ${index}: ID = "${id}" (Converted to String)`)

        try {
          const ref = firebase.collection('CollectionSalesID').doc(id)
          batch.set(
            ref,
            {
              ...item,
              id: id,
              uploadedAt: new Date(),
            },
            { merge: true },
          )
        } catch (err: any) {
          console.error(`Firestore Error at index ${index}:`, err.message)
        }
      })

      try {
        await batch.commit()
        console.log('success')
      } catch (error) {
        console.log('firestore error', error)
      }
    }
  }

  return {
    success: true,
    count: data.length,
  }
}
