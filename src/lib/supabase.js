// Supabase client — reads env vars set in .env.local
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn(
    '[PotTrust] Missing Supabase credentials. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
  );
}

export const supabase = createClient(
  SUPABASE_URL  || 'https://placeholder.supabase.co',
  SUPABASE_KEY  || 'placeholder-key',
);

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE HELPERS
// Bucket: pottrust_uploads
// Folder structure:
//   avatars/{userId}.{ext}           ← user profile photos
//   logos/{groupId}.{ext}            ← SACCO / group logos
//   banners/{groupId}.{ext}          ← SACCO banner images
//   proofs/{groupId}/{userId}/{uuid}.{ext}    ← payment proof screenshots
//   repayments/{loanId}/{uuid}.{ext}          ← loan repayment proof
// ─────────────────────────────────────────────────────────────────────────────

const BUCKET = 'pottrust_uploads';

/**
 * Upload a File to Supabase Storage.
 * @param {File}   file      — the browser File object
 * @param {string} storagePath — e.g. "avatars/user123.jpg"
 * @returns {Promise<string>} the public URL of the uploaded file
 */
export async function uploadImage(file, storagePath) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      upsert: true,            // overwrite if same path exists
      contentType: file.type,
      cacheControl: '3600',
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  return getPublicUrl(storagePath);
}

/**
 * Get the public URL for a file already in Storage.
 * @param {string} storagePath — e.g. "avatars/user123.jpg"
 * @returns {string} fully qualified public URL
 */
export function getPublicUrl(storagePath) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Build the storage path for a payment proof screenshot.
 * @param {string} groupId
 * @param {string} userId
 * @param {File}   file
 * @returns {string}
 */
export function proofStoragePath(groupId, userId, file) {
  const ext  = file.name.split('.').pop() || 'jpg';
  const uuid = crypto.randomUUID();
  return `proofs/${groupId}/${userId}/${uuid}.${ext}`;
}

/**
 * Build the storage path for a user avatar.
 */
export function avatarStoragePath(userId, file) {
  const ext = file.name.split('.').pop() || 'jpg';
  return `avatars/${userId}.${ext}`;
}

/**
 * Build the storage path for a group logo.
 */
export function logoStoragePath(groupId, file) {
  const ext = file.name.split('.').pop() || 'jpg';
  return `logos/${groupId}.${ext}`;
}

/**
 * Build the storage path for a group banner.
 */
export function bannerStoragePath(groupId, file) {
  const ext = file.name.split('.').pop() || 'jpg';
  return `banners/${groupId}.${ext}`;
}
