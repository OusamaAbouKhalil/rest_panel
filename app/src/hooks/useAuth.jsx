import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [restId, setRestId] = useState(null)
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (!u) {
        setRestId(null)
        setRestaurant(null)
        setLoading(false)
        return
      }
      try {
        const ownerDoc = await getDoc(doc(db, 'restOwners', u.uid))
        if (ownerDoc.exists()) {
          setRestId(ownerDoc.data().rest_id)
        } else {
          setError('This account is not registered as a restaurant owner.')
          await signOut(auth)
        }
      } catch (e) {
        setError(e.message)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // Live restaurant doc (name, images, isClosed)
  useEffect(() => {
    if (!restId) return
    const unsub = onSnapshot(doc(db, 'restaurants', restId), (snap) => {
      if (snap.exists()) setRestaurant({ id: snap.id, ...snap.data() })
    })
    return unsub
  }, [restId])

  const login = async (email, password) => {
    setError(null)
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
    const ownerDoc = await getDoc(doc(db, 'restOwners', cred.user.uid))
    if (!ownerDoc.exists()) {
      await signOut(auth)
      throw new Error('This account is not registered as a restaurant owner.')
    }
    return cred
  }

  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, restId, restaurant, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
