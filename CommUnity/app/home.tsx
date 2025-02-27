import 'react-native-url-polyfill/auto'
import { View, Text } from 'react-native'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'

export default function Home() {
    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
      })
  
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
      })
    }, [])
  
    return (
      <View>
        {session && session.user && <Text>{session.user.id}</Text>}
      </View>
    )
}
