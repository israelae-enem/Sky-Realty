'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (!user) return

      // Check role
      const { data: realtor } = await supabase
        .from('realtors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (realtor) return router.push('/realtordashboard')

      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (tenant) return router.push('/tenantdashboard')
    }
    checkSession()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (loginError) throw loginError

      const user = data.user
      if (!user) throw new Error('Failed to log in')

      // Check role in realtor table
      const { data: realtor } = await supabase
        .from('realtors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (realtor) {
        toast.success('✅ Logged in as Realtor!')
        return router.push('/realtordashboard')
      }

      // Check role in tenant table
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (tenant) {
        toast.success('✅ Logged in as Tenant!')
        return router.push('/tenantdashboard')
      }

      throw new Error('User role not found in system.')
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to log in')
      toast.error(err.message || 'Failed to log in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-black text-white rounded-md">
      <form onSubmit={handleLogin}>
        <h2 className="text-2xl mb-6 font-semibold">Login</h2>

        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded bg-black border border-gray-300 text-white"
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded bg-black border border-gray-300 text-white"
        />

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#302cfc] hover:bg-[#241fd9] py-2 rounded text-white font-semibold disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}