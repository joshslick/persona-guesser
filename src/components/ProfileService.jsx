// src/profileService.js
import { supabase } from './supabaseClient'

// Ensure there's a profile row for the current user
export async function getOrCreateProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return null

  // Try to fetch existing profile
  const { data: existing, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile', error)
    return null
  }

  if (existing) return existing

  // No profile -> create one
  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .insert({ id: user.id })
    .select()
    .single()

  if (insertError) {
    console.error('Error creating profile', insertError)
    return null
  }

  return created
}

// Call this when the user finishes the daily puzzle successfully
export async function recordDailyPlay() {
  const today = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return null

  // Ensure profile exists
  const profile = await getOrCreateProfile()
  if (!profile) return null

  // If already recorded today, do nothing
  if (profile.last_played_date === today) {
    return profile
  }

  let newStreak = 1

  if (profile.last_played_date) {
    const last = new Date(profile.last_played_date)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const isYesterday =
      last.getFullYear() === yesterday.getFullYear() &&
      last.getMonth() === yesterday.getMonth() &&
      last.getDate() === yesterday.getDate()

    newStreak = isYesterday ? profile.current_streak + 1 : 1
  }

  const { data: updated, error: updateError } = await supabase
    .from('profiles')
    .update({
      current_streak: newStreak,
      last_played_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single()

  if (updateError) {
    console.error('Error updating streak', updateError)
    return null
  }

  return updated
}
