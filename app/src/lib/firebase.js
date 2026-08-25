import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: 'AIzaSyDM7PY2pGPq_ZlOBqH0Dhq3np8nNmXbVf0',
  appId: '1:232886343826:web:190d1a2a73673dd48bae4b',
  messagingSenderId: '232886343826',
  projectId: 'swift-drive-298cc',
  authDomain: 'swift-drive-298cc.firebaseapp.com',
  databaseURL: 'https://swift-drive-298cc-default-rtdb.firebaseio.com',
  storageBucket: 'swift-drive-298cc.appspot.com',
  measurementId: 'G-7WVKZGYP96',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const rtdb = getDatabase(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)
