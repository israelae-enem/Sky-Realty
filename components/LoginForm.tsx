'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthContext'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { collection, query, where, getDocs } from 'firebase/firestore'

export default function LoginForm() {
  const { resetPassword } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      // Sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, email, password)

      // After login, fetch user role from Firestore
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('email', '==', email.toLowerCase()))
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        setError('User role not found. Please contact support.')
        setLoading(false)
        return
      }

      const userData = snapshot.docs[0].data()
      const role = userData.role

      setMessage('Logged in successfully!')

      if (role === 'tenant') {
        router.push('/tenantdashboard')
      } else if (role === 'realtor') {
        router.push('/realtordashboard')
      } else {
        router.push('/')
      }
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') setError('Incorrect password.')
      else if (err.code === 'auth/user-not-found') setError('No user found with this email.')
      else setError('Failed to login.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      await resetPassword(email)
      setMessage('Password reset email sent! Check your inbox.')
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') setError('No user found with this email.')
      else setError('Failed to send reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-black text-white rounded-md">
      {!showForgotPassword ? (
        <form onSubmit={handleLogin}>
          <h2 className="text-2xl mb-6 font-semibold">Login</h2>

          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded bg-black border border-gray-300"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded bg-black border border-gray-300"
          />

          {error && <p className="text-red-500 mb-4">{error}</p>}
          {message && <p className="text-green-400 mb-4">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className=" w-full bg-blue-600 hover:bg-blue-500 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p
            onClick={() => {
              setShowForgotPassword(true)
              setError('')
              setMessage('')
            }}
            className="mt-4 text-sm text-blue-400 cursor-pointer hover:underline"
          >
            Forgot password?
          </p>
        </form>
      ) : (
        <form onSubmit={handleReset}>
          <h2 className="text-2xl mb-6 font-semibold">Reset Password</h2>

          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded bg-black border border-gray-300"
          />

          {error && <p className="text-red-500 mb-4">{error}</p>}
          {message && <p className="text-green-400 mb-4">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className=" w-full bg-blue-600 hover:bg-blue-500 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Email'}
          </button>

          <p
            onClick={() => {
              setShowForgotPassword(false)
              setError('')
              setMessage('')
            }}
            className="mt-4 text-sm text-blue-400 cursor-pointer hover:underline"
          >
            Back to login
          </p>
        </form>
      )}
    </div>
  )
}