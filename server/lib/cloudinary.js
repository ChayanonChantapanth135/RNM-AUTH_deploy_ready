import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

/**
 * Cloudinary Storage for Avatar Uploads
 */
export const cloudinaryAvatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'rnm_avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }],
    public_id: (req, file) => `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}`
  }
});

/**
 * Cloudinary Storage for Task Attachments
 */
export const cloudinaryTaskFileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'rnm_task_files',
    resource_type: 'auto',
    public_id: (req, file) => `taskfile-${Date.now()}-${Math.round(Math.random() * 1e9)}`
  }
});

/**
 * Helper to delete an asset from Cloudinary by its secure URL
 */
export async function deleteFromCloudinary(url) {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return false;

  try {
    // Extract public_id from Cloudinary URL
    // e.g. https://res.cloudinary.com/demo/image/upload/v123456/rnm_avatars/avatar-123.jpg -> rnm_avatars/avatar-123
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
    if (matches && matches[1]) {
      const publicId = matches[1];
      const result = await cloudinary.uploader.destroy(publicId);
      console.log(`[Cloudinary Cleanup] Deleted asset: ${publicId} - result:`, result);
      return true;
    }
  } catch (err) {
    console.error('[Cloudinary Cleanup Error]:', err.message);
  }
  return false;
}

export { cloudinary };
