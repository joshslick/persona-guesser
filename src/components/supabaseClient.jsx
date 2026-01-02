// supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gjnpvsalnyyxzqtatlpa.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_mtMHsyovLnvt_6v4CDCZ-A_svoyJzIX'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
