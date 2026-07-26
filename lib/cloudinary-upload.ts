import { compressImageToMaxSize } from './image-compress';

export async function uploadProductImage(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary is not configured (missing cloud name or upload preset)');
  }

  const compressed = await compressImageToMaxSize(file, 50 * 1024);

  const formData = new FormData();
  formData.append('file', compressed);
  formData.append('upload_preset', uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Image upload failed');
  }

  return data.secure_url as string;
}
