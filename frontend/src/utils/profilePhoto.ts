import { supabase } from '../supabaseClient';

const ENV_PROFILE_BUCKET = (import.meta.env.VITE_SUPABASE_PROFILE_BUCKET || '').trim();
const PROFILE_BUCKET_CANDIDATES = [
  ENV_PROFILE_BUCKET,
  'profile-photo',
  'profile-photos',
  'profile_photo',
  'profile_photos',
  'profilephoto',
  'profile',
  'avatars',
  'avatar',
  'profile photos',
  'profile photo',
].filter(Boolean);

export function getProfilePhotoUrlFromExtra(extraData: any): string {
  if (!extraData || typeof extraData !== 'object') return '';
  return (
    extraData.profile_photo_url ||
    extraData.profilePhotoUrl ||
    extraData.avatar_url ||
    ''
  );
}

export async function resizeImageFile(file: File, maxSizePx = 320, quality = 0.8): Promise<Blob> {
  const imageBitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSizePx / Math.max(imageBitmap.width, imageBitmap.height));
  const width = Math.max(1, Math.round(imageBitmap.width * scale));
  const height = Math.max(1, Math.round(imageBitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    imageBitmap.close();
    throw new Error('Could not initialize image canvas');
  }

  ctx.drawImage(imageBitmap, 0, 0, width, height);
  imageBitmap.close();

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (!result) {
        reject(new Error('Failed to compress image'));
        return;
      }
      resolve(result);
    }, 'image/jpeg', quality);
  });

  return blob;
}

export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  const compressedBlob = await resizeImageFile(file, 320, 0.78);
  const filePath = `${userId}/${Date.now()}.jpg`;
  let lastErrorMessage = '';
  for (const bucket of PROFILE_BUCKET_CANDIDATES) {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, compressedBlob, {
        cacheControl: '3600',
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (!error) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    }

    const msg = (error.message || '').toLowerCase();
    lastErrorMessage = error.message || lastErrorMessage;

    if (msg.includes('not found') || msg.includes('does not exist') || msg.includes('bucket') || msg.includes('invalid bucket')) {
      continue;
    }

    throw new Error(error.message || 'Unable to upload profile photo');
  }

  throw new Error(
    `Profile photo bucket not found. Tried: ${PROFILE_BUCKET_CANDIDATES.join(', ')}. ` +
    `Set VITE_SUPABASE_PROFILE_BUCKET to your exact bucket ID.${lastErrorMessage ? ` Last error: ${lastErrorMessage}` : ''}`
  );
}
