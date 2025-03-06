import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Auth from '../components/Auth'
import { View } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'expo-router'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      // Redirect to Home if user is logged in
      if (session && session.user) {
        router.push('/home')  // Redirect to '/home'
      }
    })
  }, [router])

  return (
    <View>
      <Auth />
    </View>
  )
}