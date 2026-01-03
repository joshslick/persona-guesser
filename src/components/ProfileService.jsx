// profileService.js
import { supabase } from './supabaseClient'

/**
 * Get a YYYY-MM-DD string based purely on UTC calendar date.
 * This avoids timezone weirdness between client/server.
 */
function getUTCDateString(offsetDays = 0) {
  const now = new Date()
  const d = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + offsetDays
    )
  )
  return d.toISOString().slice(0, 10)
}

/**
 * Normalize various date inputs into a YYYY-MM-DD string.
 * Returns null if the value is invalid or missing.
 */
function normalizeDateString(value) {
  if (!value) return null

  if (typeof value === 'string') {
    // Assume ISO or date-like string; slice first 10 chars: YYYY-MM-DD
    return value.slice(0, 10)
  }

  const d = new Date(value)
  if (isNaN(d.getTime())) return null

  return d.toISOString().slice(0, 10)
}


async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    console.warn('[getCurrentUser] No user or error:', error)
    return null
  }
  return data.user
}

export async function getOrCreateProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  // Try to fetch existing profile
  const { data: existing, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // If some error other than "no rows", bail out
  // PGRST116 = "Results contain 0 rows" from PostgREST
  if (error && error.code !== 'PGRST116') {
    console.error('[getOrCreateProfile] Error fetching profile', error)
    return null
  }

  // Found an existing profile
  if (existing) return existing

  // No profile yet, create one
  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .insert({ id: user.id })
    .select()
    .single()

  if (insertError) {
    console.error('[getOrCreateProfile] Error creating profile', insertError)
    return null
  }

  return created
}


export async function recordDailyPlay() {
  const today = getUTCDateString(0)
  const yesterday = getUTCDateString(-1)

  console.log('[recordDailyPlay] today:', today, 'yesterday:', yesterday)

  const user = await getCurrentUser()
  if (!user) {
    console.log('[recordDailyPlay] No authenticated user, aborting')
    return null
  }

  const profile = await getOrCreateProfile()
  if (!profile) {
    console.log('[recordDailyPlay] No profile, aborting')
    return null
  }

  const lastPlayed = normalizeDateString(profile.last_played_date)
  const currentStreak = Number(profile.current_streak || 0)

  console.log('[recordDailyPlay] Profile from DB:', {
    id: profile.id,
    last_played_date: lastPlayed,
    current_streak: currentStreak,
  })

  if (lastPlayed === today) {
    console.log(
      '[recordDailyPlay] Already played today, returning existing profile'
    )
    return profile
  }

 
  let newStreak
  if (lastPlayed === yesterday) {
    newStreak = currentStreak + 1
  } else {
    newStreak = 1
  }

  console.log('[recordDailyPlay] Calculated new streak:', {
    lastPlayed,
    today,
    yesterday,
    previousStreak: currentStreak,
    newStreak,
  })

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
    console.error('[recordDailyPlay] Error updating streak', updateError)
    return null
  }

  console.log('[recordDailyPlay] Updated profile:', updated)
  return updated
}


export async function getProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('[getProfile] Error fetching profile', error)
    return null
  }

  return data
}
