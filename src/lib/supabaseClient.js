import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase env vars. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example).'
  )
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export const BUCKET = 'assets'

// Turn a Supabase Storage public URL into a resized/optimized render URL
export function getOptimizedUrl(url, width = 400) {
  if (!url) return ''
  return url.includes('/storage/v1/object/public/')
    ? url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') + '?width=' + width
    : url
}

export async function uploadToStorage(file) {
  const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : ''
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(safeName, file, {
    contentType: file.type,
    upsert: false,
  })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(safeName)
  return data.publicUrl
}

export async function deleteFromStorage(publicUrl) {
  if (!publicUrl) return
  try {
    const url = new URL(publicUrl)
    const parts = url.pathname.split('/')
    const fileName = parts[parts.length - 1]
    await supabase.storage.from(BUCKET).remove([fileName])
  } catch (_) {
    /* best effort */
  }
}
