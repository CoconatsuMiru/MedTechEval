import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)       // the Supabase auth user object (or null)
  const [profile, setProfile] = useState(null) // their row from `profiles` (has `role`, `full_name`)
  const [loading, setLoading] = useState(true) // true while we're figuring out the initial session

  useEffect(() => {
    // On first load, check if there's already an active session (e.g. page refresh)
    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession()
      await handleSessionChange(session)
      setLoading(false)
    }

    loadSession()

    // Listen for future auth changes (login, logout, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSessionChange(session)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleSessionChange(session) {
    if (!session?.user) {
      setUser(null)
      setProfile(null)
      return
    }

    setUser(session.user)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', session.user.id)
      .single()

    setProfile(profileData ?? null)
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const value = { user, profile, loading, logout }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}