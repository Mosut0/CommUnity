import React, { useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, TextInput } from 'react-native-paper'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const { data: { session }, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })
    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <TextInput
        label="Email"
        placeholder="email@address.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.verticallySpaced}
      />
      <TextInput
        label="Password"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        style={styles.verticallySpaced}
      />
      <Button
        mode="contained"
        onPress={signInWithEmail}
        disabled={loading}
        style={[styles.verticallySpaced, styles.mt20]}
      >
        Sign in
      </Button>
      <Button
        mode="contained"
        onPress={signUpWithEmail}
        disabled={loading}
        style={styles.verticallySpaced}
      >
        Sign up
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    marginVertical: 8,
  },
  mt20: {
    marginTop: 20,
  },
})