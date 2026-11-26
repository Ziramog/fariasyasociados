import imageCompression from 'browser-image-compression';

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.6,
  maxWidthOrHeight: 1600,
  useWebWorker: false,
};

/**
 * Compresses and uploads a property image directly to Farías & Asociados' Cloudinary bucket
 * using NEXT_PUBLIC_CLOUDINARY_* environment configuration.
 */
export async function uploadPropertyImageToCloudinary(file) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const uploadFolder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary no está configurado para Farias. Revisar NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.'
    );
  }

  let fileToUpload = file;
  try {
    fileToUpload = await imageCompression(file, COMPRESSION_OPTIONS);
  } catch (compressError) {
    console.error('Error compressing image:', compressError);
  }

  const uploadData = new FormData();
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e5)}-${file.name}`;
  uploadData.append('file', fileToUpload, uniqueName);
  uploadData.append('upload_preset', uploadPreset);
  if (uploadFolder) uploadData.append('folder', uploadFolder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: uploadData,
  });

  if (!uploadRes.ok) {
    throw new Error('Fallo al subir imagen a Cloudinary');
  }

  const cloudinaryResult = await uploadRes.json();
  return {
    url: cloudinaryResult.secure_url,
    public_id: cloudinaryResult.public_id,
  };
}

/**
 * Resolves the ordered list of gallery image URLs from sorter state and uploaded URL mapping.
 */
export function resolveGalleryOrderUrls(galleryOrderIds, imageItems, idToUrlMap) {
  const effectiveIds =
    galleryOrderIds && galleryOrderIds.length > 0
      ? [
          ...galleryOrderIds.filter((id) => idToUrlMap[id]),
          ...imageItems
            .map((it) => it.id)
            .filter((id) => !galleryOrderIds.includes(id) && idToUrlMap[id]),
        ]
      : imageItems.map((it) => it.id);

  return effectiveIds.map((id) => idToUrlMap[id]).filter(Boolean);
}
