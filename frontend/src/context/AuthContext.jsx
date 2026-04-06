import { createContext, useContext, useState, useEffect } from 'react'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'
import api from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

/**
 * AuthProvider manages authentication state and Firebase integration.
 * - Listens for Firebase auth state changes
 * - Sends Firebase token to backend for user creation/lookup
 * - Provides login/logout functions and user data to the app
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken()
          setToken(idToken)

          // Send token to backend to get/create user
          const response = await api.post('/auth/google', { idToken })
          const userData = response.data.data

          setUser({
            ...userData,
            firebaseUser,
          })
        } catch (error) {
          console.error('Auth error:', error)
          // If backend is unavailable, still set basic user info from Firebase
          setUser({
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            profilePicture: firebaseUser.photoURL,
            role: 'EMPLOYEE',
            firebaseUser,
          })
        }
      } else {
        setUser(null)
        setToken(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const loginWithGoogle = async () => {
    try {
      setLoading(true)
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      setToken(idToken)

      const response = await api.post('/auth/google', { idToken })
      const userData = response.data.data

      setUser({
        ...userData,
        firebaseUser: result.user,
      })

      toast.success(`Welcome, ${userData.name || result.user.displayName}!`)
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setToken(null)
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed')
    }
  }

  const isAdmin = user?.role === 'ADMIN'

  const value = {
    user,
    token,
    loading,
    isAdmin,
    loginWithGoogle,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
