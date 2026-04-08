import admin from 'firebase-admin'
import serviceAccount from '@/../firebase_config.json'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
  })
}

export const firebase = admin.firestore()
