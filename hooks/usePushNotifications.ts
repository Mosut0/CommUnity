import { useEffect } from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Alert } from 'react-native'
// We use require() here and ignore TS so the repo can typecheck even if
// the environment hasn't installed Expo packages yet. When running locally,
// make sure to install these packages: expo-notifications, expo-device, expo-location
// and replace with normal imports if preferred.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Notifications = require('expo-notifications')
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Device = require('expo-device')
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Location = require('expo-location')
import { supabase } from '../lib/supabase'

async function registerForPushNotificationsAsync(projectId?: string) {
  try {
    if (!Device.isDevice) return null

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    if (finalStatus !== 'granted') return null

    let token
    if (projectId) {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data
    } else {
      token = (await Notifications.getExpoPushTokenAsync()).data
    }
    console.log('Push token:', token)
    return token
  } catch (e) {
    // If the error indicates a missing Expo projectId, provide an actionable alert
    try {
      const msg = String(e || '')
      if (msg.includes('projectId') || msg.includes('No "projectId"')) {
        Alert.alert(
          'Push registration failed',
          'No "projectId" found. Add a "projectId" field to the top-level "expo" object in app.json (the value comes from your Expo project settings), or call registerForPushNotificationsAsync(projectId) with your project id.'
        )
      }
    } catch (alertErr) {
      // ignore alert failures in non-UI environments
    }
    console.warn('Push registration failed', e)
    return null
  }
}

// Export helper so other components (e.g. a debug button) can call registration manually
export { registerForPushNotificationsAsync };

// Show an alert for notifications received while app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

async function upsertNotificationPreferences(userId: string, token: string | null) {
  try {
    await supabase
      .from('notification_preferences')
      .upsert({ user_id: userId, expo_push_token: token }, { onConflict: 'user_id' })
  } catch (e) {
    console.warn('Failed to upsert notification_preferences', e)
  }
}

async function updateLastLocation(userId: string) {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return
    const loc = await Location.getCurrentPositionAsync({})
    await supabase
      .from('notification_preferences')
      .upsert(
        {
          user_id: userId,
          last_location_lat: loc.coords.latitude,
          last_location_lon: loc.coords.longitude,
          last_location_updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
  } catch (e) {
    console.warn('Failed to update last location', e)
  }
}

// Hook: call this with a logged-in user's id to register token and update location
export default function usePushNotifications(userId?: string | null) {
  useEffect(() => {
    if (!userId) return

    let mounted = true

    ;(async () => {
      const token = await registerForPushNotificationsAsync()
      if (!mounted) return
      await upsertNotificationPreferences(userId, token)
      // update last known location once on mount
      await updateLastLocation(userId)
    })()

    return () => {
      mounted = false
    }
  }, [userId])
}
