import { firebase } from '../config/firebase'

export async function getBatchStats(limit = 100, lastUploadedAt?: any) {
  try {
    let query = firebase.collection('CollectionSalesID').orderBy('uploadedAt', 'desc').limit(limit)

    if (lastUploadedAt) {
      query = query.startAfter(lastUploadedAt)
    }

    const snapshot = await query.get()

    const data = snapshot.docs.map((doc: any) => ({
      docId: doc.id,
      ...doc.data(),
    }))

    // Get the uploadedAt value of the last doc for the next batch
    const lastDocUploadedAt = snapshot.docs.length
      ? snapshot.docs[snapshot.docs.length - 1].data().uploadedAt
      : null

    return {
      success: true,
      data,
      lastUploadedAt: lastDocUploadedAt,
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    return { success: false, error }
  }
}
