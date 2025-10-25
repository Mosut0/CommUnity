import React, { useEffect, useState } from 'react'
import { View, Switch, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { ThemedText } from '@/components/ThemedText'
import { supabase } from '../lib/supabase'
import Slider from '@react-native-community/slider'
import { useThemeColor } from '@/hooks/useThemeColor'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Colors } from '@/constants/Colors'

const REPORT_TYPES = [
  { key: 'hazard', label: 'Hazards' },
  { key: 'event', label: 'Events' },
  { key: 'lost', label: 'Lost items' },
  { key: 'found', label: 'Found items' },
]

export default function Settings() {
  const [prefs, setPrefs] = useState<any>({ notify_types: [], notify_radius_m: 1000 })
  const [loading, setLoading] = useState(true)
  const background = useThemeColor({}, 'background')
  const textColor = useThemeColor({}, 'text')
  const tint = useThemeColor({}, 'tint')
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const saveTextColor = isDark ? '#000' : '#fff'

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (error && error.code !== 'PGRST102') {
        console.warn('Error fetching prefs', error)
      }
      if (mounted) setPrefs(data || { notify_types: [], notify_radius_m: 1000 })
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [])

  const toggleType = (type: string) => {
    const types = prefs.notify_types || []
    const exists = types.includes(type)
    const updated = exists ? types.filter((t: string) => t !== type) : [...types, type]
    setPrefs({ ...prefs, notify_types: updated })
  }

  const save = async () => {
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({ user_id: (await supabase.auth.getUser()).data.user?.id, notify_types: prefs.notify_types, notify_radius_m: prefs.notify_radius_m }, { onConflict: 'user_id' })
      .select()
    if (error) {
      Alert.alert('Error', 'Failed to save preferences')
      console.error(error)
      return
    }
    Alert.alert('Saved', 'Notification preferences updated')
  }

  if (loading) return <View style={[styles.container, { backgroundColor: background }]}><ThemedText>Loading...</ThemedText></View>

  return (
    <View style={[styles.container, { backgroundColor: background }]}> 
      <ThemedText style={[styles.heading, { color: textColor }]}>Notification preferences</ThemedText>
      {REPORT_TYPES.map((r) => (
        <View key={r.key} style={styles.row}>
          <ThemedText style={{ color: textColor }}>{r.label}</ThemedText>
          <Switch
            value={(prefs.notify_types || []).includes(r.key)}
            onValueChange={() => toggleType(r.key)}
            trackColor={{ false: '#9CA3AF22', true: tint }}
            thumbColor={(prefs.notify_types || []).includes(r.key) ? tint : undefined}
          />
        </View>
      ))}

      <View style={{ marginTop: 20 }}>
        <ThemedText style={{ color: textColor }}>Radius (meters): {prefs.notify_radius_m || 1000}</ThemedText>
        <Slider
          minimumValue={100}
          maximumValue={50000}
          value={prefs.notify_radius_m || 1000}
          onValueChange={(val) => setPrefs({ ...prefs, notify_radius_m: Math.round(val) })}
          minimumTrackTintColor={tint}
          maximumTrackTintColor={'#CBD5E1'}
          thumbTintColor={tint}
        />
      </View>

      <View style={{ marginTop: 20 }}>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: tint }]} onPress={save}>
          <ThemedText style={[styles.primaryBtnText, { color: saveTextColor }]}>Save</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 18, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  primaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
})
